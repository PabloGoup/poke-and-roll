import { getVerifyToken } from "@/lib/env";

const GRAPH_URL = "https://graph.facebook.com/v20.0";

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
    return { ok: false, modo: "simulado", detalle: "Faltan WHATSAPP_ACCESS_TOKEN o WHATSAPP_PHONE_NUMBER_ID" };
  }

  const response = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
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
  });

  return {
    ok: response.ok,
    modo: "real",
    status: response.status,
    data: await response.json().catch(() => null)
  };
}

export async function enviarInstagramTexto(params: {
  recipientId: string;
  texto: string;
}) {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const igBusinessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!accessToken || !igBusinessId) {
    return { ok: false, modo: "simulado", detalle: "Faltan META_ACCESS_TOKEN o INSTAGRAM_BUSINESS_ACCOUNT_ID" };
  }

  const response = await fetch(`${GRAPH_URL}/${igBusinessId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recipient: { id: params.recipientId },
      message: { text: params.texto }
    })
  });

  return {
    ok: response.ok,
    modo: "real",
    status: response.status,
    data: await response.json().catch(() => null)
  };
}

export async function enviarFacebookTexto(params: {
  recipientId: string;
  texto: string;
}) {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageAccessToken) {
    return { ok: false, modo: "simulado", detalle: "Falta FACEBOOK_PAGE_ACCESS_TOKEN" };
  }

  const response = await fetch(`${GRAPH_URL}/me/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${pageAccessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recipient: { id: params.recipientId },
      message: { text: params.texto }
    })
  });

  return {
    ok: response.ok,
    modo: "real",
    status: response.status,
    data: await response.json().catch(() => null)
  };
}
