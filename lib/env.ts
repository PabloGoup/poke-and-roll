export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar ${name}`);
  }

  return value;
}

export function getVerifyToken() {
  // || en vez de ?? para cubrir string vacío en Vercel env
  return process.env.META_VERIFY_TOKEN?.trim() || "poke-roll-webhook";
}
