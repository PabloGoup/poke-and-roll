export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Falta configurar ${name}`);
  }

  return value;
}

export function getVerifyToken() {
  return process.env.META_VERIFY_TOKEN ?? "poke-roll-webhook";
}
