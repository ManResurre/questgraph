import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabase = createClient(
    Deno.env.get("SUPABASE_URL"),
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
);

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
};

async function verifySignature(publicKeyPem: string, challenge: string, signatureB64: string) {
    const pemHeader = "-----BEGIN PUBLIC KEY-----";
    const pemFooter = "-----END PUBLIC KEY-----";
    const pemContents = publicKeyPem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s+/g, "");
    const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));

    const publicKey = await crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        { name: "RSA-PSS", hash: "SHA-256" },
        false,
        ["verify"]
    );

    const signature = Uint8Array.from(atob(signatureB64), c => c.charCodeAt(0));
    const encoder = new TextEncoder();

    return await crypto.subtle.verify(
        { name: "RSA-PSS", saltLength: 32 },
        publicKey,
        signature,
        encoder.encode(challenge)
    );
}

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const { user_id, signature } = await req.json();

        const { data: userKey, error: keyErr } = await supabase
            .from("user_keys")
            .select("public_key, challenge")
            .eq("id", user_id)
            .single();

        if (keyErr || !userKey) {
            return new Response(JSON.stringify({ error: "Public key not found" }), {
                status: 404,
                headers: corsHeaders,
            });
        }

        const isValid = await verifySignature(userKey.public_key, userKey.challenge, signature);
        if (!isValid) {
            return new Response(JSON.stringify({ error: "Invalid signature" }), {
                status: 401,
                headers: corsHeaders,
            });
        }

        // Генерируем magic link для "фиктивного" email, привязанного к user_id
        const email = `${user_id}@example.com`;
        const { data: link, error: genErr } = await supabase.auth.admin.generateLink({
            type: "magiclink",
            email,
        });

        if (genErr || !link?.properties?.hashed_token) {
            return new Response(JSON.stringify({ error: genErr?.message || "Failed to generate link" }), {
                status: 500,
                headers: corsHeaders,
            });
        }

        // Обмениваем hashed_token на реальную сессию
        const { data: session, error: verifyErr } = await supabase.auth.verifyOtp({
            type: "magiclink",
            token_hash: link.properties.hashed_token,

        });

        if (verifyErr || !session?.session) {
            return new Response(JSON.stringify({ error: verifyErr?.message || "Failed to verify OTP" }), {
                status: 500,
                headers: corsHeaders,
            });
        }

        const { access_token, refresh_token } = session.session;

        // Можно тут же обнулить challenge, чтобы он стал одноразовым
        await supabase
            .from("user_keys")
            .update({ challenge: null })
            .eq("id", user_id);

        return new Response(JSON.stringify({ access_token, refresh_token }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), {
            status: 500,
            headers: corsHeaders,
        });
    }
});
