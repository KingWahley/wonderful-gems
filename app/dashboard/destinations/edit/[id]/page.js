"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchDestinationById } from "@/lib/db";
import DestinationForm from "../../components/DestinationForm";
import { Loader2 } from "lucide-react";

export default function EditDestination() {
  const params = useParams();
  const id = params.id;
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    
    async function load() {
      try {
        const data = await fetchDestinationById(id);
        
        // Parse description_json if it exists to pass as extras
        let extras = {};
        if (data.description_json) {
          try {
            // Check if it looks like a JSON object to prevent parsing plain text
            if (typeof data.description_json === 'string' && data.description_json.trim().startsWith('{')) {
              extras = JSON.parse(data.description_json);
            }
          } catch (e) {
            // Silently ignore if not valid JSON
          }
        }
        
        setDestination({
          ...data,
          extras
        });
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-brand-mustard w-8 h-8" />
        <p className="text-brand-muted text-sm font-medium">Loading destination...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-brand-danger mb-4">Error loading destination: {error || "Not found"}</p>
      </div>
    );
  }

  return <DestinationForm initialData={destination} />;
}
