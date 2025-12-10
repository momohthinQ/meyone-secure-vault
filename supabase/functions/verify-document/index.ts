import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return new Response(JSON.stringify({ error: "Token is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const verifierIp = req.headers.get("x-forwarded-for") || "unknown";
    const verifierUserAgent = req.headers.get("user-agent") || "unknown";

    // Try user documents
    const { data: userDoc } = await supabase
      .from("documents")
      .select("id, name, document_type, status, created_at, digital_signature, qr_token, user_id")
      .eq("qr_token", token)
      .maybeSingle();

    if (userDoc) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", userDoc.user_id)
        .maybeSingle();

      const { data: hashes } = await supabase
        .from("document_hashes")
        .select("hash")
        .eq("document_id", userDoc.id)
        .limit(1);

      await supabase.from("verification_logs").insert({
        document_id: userDoc.id,
        verification_result: "valid",
        verifier_ip: verifierIp,
        verifier_user_agent: verifierUserAgent,
        document_hash_at_verification: hashes?.[0]?.hash,
      });

      return new Response(JSON.stringify({
        valid: true,
        document: {
          title: userDoc.name,
          type: userDoc.document_type,
          owner: profile?.full_name || "Unknown",
          issuer: "Personal Document",
          status: userDoc.status,
          createdAt: userDoc.created_at,
          hash: hashes?.[0]?.hash,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Try institution documents
    const { data: instDoc } = await supabase
      .from("institution_documents")
      .select("id, document_type, recipient_name, recipient_identifier, status, created_at, issued_at, digital_signature, qr_token, file_hash, institution_id")
      .eq("qr_token", token)
      .maybeSingle();

    if (instDoc) {
      const { data: institution } = await supabase
        .from("institutions")
        .select("id, name, institution_type, logo_url")
        .eq("id", instDoc.institution_id)
        .maybeSingle();

      await supabase.from("verification_logs").insert({
        institution_document_id: instDoc.id,
        verification_result: "valid",
        verifier_ip: verifierIp,
        verifier_user_agent: verifierUserAgent,
        document_hash_at_verification: instDoc.file_hash,
      });

      if (institution) {
        await supabase.from("institution_analytics").insert({
          institution_id: institution.id,
          event_type: "document_verification",
          document_id: instDoc.id,
        });
      }

      return new Response(JSON.stringify({
        valid: true,
        document: {
          title: `${instDoc.document_type} - ${instDoc.recipient_name}`,
          type: instDoc.document_type,
          owner: instDoc.recipient_name,
          recipientId: instDoc.recipient_identifier,
          issuer: institution?.name || "Unknown Institution",
          issuerType: institution?.institution_type,
          status: instDoc.status,
          issuedAt: instDoc.issued_at,
          createdAt: instDoc.created_at,
          hash: instDoc.file_hash,
        },
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ valid: false, error: "Document not found" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return new Response(JSON.stringify({ error: "Verification failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
