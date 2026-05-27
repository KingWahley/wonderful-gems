import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

// Force Next.js to run this route dynamically on every request instead of pre-rendering it statically.
// This is critical for uptime monitoring endpoints to ensure that actual serverless execution 
// and database pings occur on every request.
export const dynamic = "force-dynamic";

/**
 * Interface representing the success response structure of the ping endpoint.
 */
interface PingResponseSuccess {
  status: "ok";
  message: string;
  timestamp: string;
  database: "connected";
}

/**
 * Interface representing the error response structure of the ping endpoint.
 */
interface PingResponseError {
  status: "error";
  message: string;
  timestamp: string;
  database: "disconnected";
  error?: string;
}

/**
 * GET Handler for /api/ping
 * 
 * --- WHY THIS ROUTE EXISTS ---
 * Supabase free-tier projects are automatically paused after a period of inactivity (typically 1 week of no API calls or database operations).
 * Once paused, any attempt to access the application results in failed database queries until the project is manually restored via the Supabase dashboard.
 * 
 * --- HOW IT PREVENTS INACTIVITY PAUSING ---
 * By scheduling a regular cron ping (e.g., via UptimeRobot every 5-15 minutes) to this endpoint, we trigger:
 * 1. A Vercel serverless function invocation (which keeps the frontend server awake).
 * 2. A lightweight query using the Supabase client (`destinations` table lookup with a limit of 1).
 * This minimal database activity is registered by Supabase as active usage, completely preventing the project from entering the paused/inactive state.
 * 
 * --- WHY LIGHTWEIGHT ENDPOINTS ARE PREFERRED ---
 * 1. Low Resource Consumption: We query a single indexed column with a LIMIT of 1 to keep database execution time sub-millisecond and avoid exhausting free-tier CPU limits or monthly active row limits.
 * 2. Minimal Egress Data: Returning a tiny JSON payload minimizes network bandwidth usage on Vercel and Supabase.
 * 3. Fast Response Times: Keeps the Vercel serverless execution time extremely low, avoiding cold start delays and saving serverless run-time quotas.
 */
export async function GET() {
  const timestamp = new Date().toISOString();

  // Define headers that strictly prevent caching at all levels (browser, Vercel Edge CDN, etc.)
  const headers = {
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    "Pragma": "no-cache",
    "Expires": "0",
    "Surrogate-Control": "no-store",
    "Content-Type": "application/json",
  };

  try {
    // Perform a microscopic query to register database activity on Supabase.
    // We select just the 'id' column from 'destinations' and limit the results to 1.
    // This executes in ~1-5ms and generates virtually zero database overhead while keeping the connection active.
    const { error } = await supabase
      .from("destinations")
      .select("id")
      .limit(1);

    if (error) {
      // If there's a Supabase error (e.g., table doesn't exist, credentials issue), throw it
      throw error;
    }

    const responsePayload: PingResponseSuccess = {
      status: "ok",
      message: "Server is awake",
      timestamp,
      database: "connected",
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    // Log the error internally on the server for debugging (Vercel logs)
    console.error("Keep-alive ping failed database check:", error);

    const isDev = process.env.NODE_ENV === "development";
    
    // Return a 500 error code but structure the response cleanly.
    // To maintain security, we only expose the raw error message in development mode.
    const responsePayload: PingResponseError = {
      status: "error",
      message: "Server is awake but database is unreachable",
      timestamp,
      database: "disconnected",
      ...(isDev && { error: error.message || String(error) }),
    };

    return NextResponse.json(responsePayload, {
      status: 500,
      headers,
    });
  }
}
