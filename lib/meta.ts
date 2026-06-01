import { getVerifyToken } from "@/lib/env";

export function verificarWebhook(searchParams: URLSearchParams) {
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === getVerifyToken() && challenge) {
    return challenge;
  }

  return null;
}

export async function enviarWhatsAppTexto(params: {
  telefono: string;
  texto: string;
}) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    return {
      ok: false,
      modo: "simulado",
      detalle: "Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID"
    };
  }

  const response = await fetch(
    `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.telefono,
        type: "text",
        text: { body: params.texto }
      })
    }
  );

  return {
    ok: response.ok,
    modo: "real",
    status: response.status,
    data: await response.json().catch(() => null)
  };
}
