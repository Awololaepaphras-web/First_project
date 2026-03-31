// @ts-nocheck
// Supabase Edge Function: MultCloud Storage Bridge
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const MULTCLOUD_API_KEY = Deno.env.get("MULTCLOUD_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // 1. Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // 2. Validate Request
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Get API Key
    if (!MULTCLOUD_API_KEY) {
      return new Response(JSON.stringify({ error: "MultCloud API Key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Parse Request Body
    const { bucket, path, destination } = await req.json();

    if (!bucket || !path || !destination) {
      return new Response(JSON.stringify({ error: "Missing bucket, path, or destination" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Download File from Supabase Storage (Temporary Bucket)
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path);

    if (downloadError) throw downloadError;

    // 6. Transfer to MultCloud
    // MultCloud API endpoint for direct upload or transfer
    const MULTCLOUD_API_URL = "https://api.multcloud.com/v1/transfer"; 
    
    const formData = new FormData();
    formData.append("file", new Blob([fileData]), path.split('/').pop());
    formData.append("to", destination); // e.g., "google_drive:/uploads"

    const response = await fetch(MULTCLOUD_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MULTCLOUD_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MultCloud API error: ${errorText}`);
    }

    const result = await response.json();

    // 7. Cleanup (Optional: Delete from temporary bucket)
    // await supabase.storage.from(bucket).remove([path]);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "File successfully transferred to MultCloud",
      result 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Storage Bridge Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
