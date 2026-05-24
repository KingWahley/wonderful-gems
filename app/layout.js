import "./globals.css";

import { fetchSettings } from "@/lib/db";

export async function generateMetadata() {
  let seo = null;
  try {
    seo = await fetchSettings("home_seo");
  } catch (error) {
    console.error("Error fetching SEO settings", error);
  }

  return {
    title: seo?.title || "Wanderful | Luxury Travel & Consultancy",
    description: seo?.description || "Curating luxury travel experiences and discovering the world's most breathtaking destinations.",
    openGraph: seo?.socialImage ? {
      images: [{ url: seo.socialImage }]
    } : undefined
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
