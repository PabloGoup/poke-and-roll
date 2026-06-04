import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const META_GRAPH_VERSION = process.env.META_GRAPH_VERSION?.trim() || "v20.0";
export const META_GRAPH_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export type MetaLocalContext = {
  localId: string;
  localSlug: string;
};

export function getAppBaseUrl(request: NextRequest) {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();

  if (configured) return configured.replace(/\/$/, "");

  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host = request.headers.get("host");
  return `${proto}://${host}`;
}

export function getMetaRedirectUri(request: NextRequest) {
  const configured = process.env.META_REDIRECT_URI?.trim();
  if (configured) return configured;
  return `${getAppBaseUrl(request)}/api/meta/callback`;
}

export async function requireLocalContext(request: NextRequest): Promise<MetaLocalContext> {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const requestedLocalId = request.nextUrl.searchParams.get("localId");

  if (session.user.localId) {
    return {
      localId: session.user.localId,
      localSlug: session.user.localSlug || "local"
    };
  }

  if (session.user.rol === "super_admin" && requestedLocalId) {
    const local = await prisma.local.findUnique({
      where: { id: requestedLocalId },
      select: { id: true, slug: true }
    });
    if (!local) throw new Error("Local no encontrado");
    return { localId: local.id, localSlug: local.slug };
  }

  throw new Error("Selecciona un local antes de conectar Meta");
}

export function encodeMetaState(context: MetaLocalContext) {
  return Buffer.from(
    JSON.stringify({
      localId: context.localId,
      localSlug: context.localSlug,
      ts: Date.now()
    })
  ).toString("base64url");
}

export function decodeMetaState(state: string | null): MetaLocalContext {
  if (!state) throw new Error("Falta state de Meta");
  const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8")) as {
    localId?: string;
    localSlug?: string;
    ts?: number;
  };

  if (!parsed.localId || !parsed.localSlug || !parsed.ts) {
    throw new Error("State de Meta invalido");
  }

  const ageMs = Date.now() - parsed.ts;
  if (ageMs > 15 * 60 * 1000) {
    throw new Error("State de Meta expirado");
  }

  return { localId: parsed.localId, localSlug: parsed.localSlug };
}

export function getMetaScopes() {
  return (
    process.env.META_OAUTH_SCOPES?.trim() ||
    "instagram_basic,instagram_manage_messages,pages_show_list,pages_read_engagement,pages_manage_metadata"
  );
}
