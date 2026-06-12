import { enviarWhatsAppTexto } from "@/lib/meta";

export async function enviarAlertaOperativa({
  canal,
  nombreCliente,
  ultimoMensaje,
  waToken,
  waPhoneId,
}: {
  canal: string;
  nombreCliente: string;
  ultimoMensaje: string;
  waToken?: string;
  waPhoneId?: string;
}): Promise<void> {
  const numero = process.env.ALERT_PHONE_NUMBER?.trim();
  if (!numero) return;

  const preview = ultimoMensaje.length > 120
    ? `${ultimoMensaje.slice(0, 120)}...`
    : ultimoMensaje;

  const texto = [
    `🔔 *Atención requerida*`,
    `👤 ${nombreCliente} — ${canal}`,
    `💬 "${preview}"`,
    `Responde desde el dashboard de Goup.`,
  ].join("\n");

  await enviarWhatsAppTexto({ telefono: numero, texto, waToken, waPhoneId }).catch(() => null);
}
