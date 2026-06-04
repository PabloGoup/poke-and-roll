import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { decodeMetaState, getAppBaseUrl, getMetaRedirectUri, META_GRAPH_URL } from "@/app/api/meta/_utils";

type MetaTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: { message?: string; type?: string; code?: number };
};

type MetaAccountsResponse = {
  data?: Array<{
    id: string;
    name?: string;
    access_token?: string;
    instagram_business_account?: {
      id: string;
      username?: string;
      profile_picture_url?: string;
    };
  }>;
  error?: { message?: string; type?: string; code?: number };
};

function redirectDashboard(request: NextRequest, params: Record<string, string>) {
  const url = new URL("/dashboard", getAppBaseUrl(request));
  url.searchParams.set("vista", "instagram");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return NextResponse.redirect(url);
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return redirectDashboard(request, { meta: "error", detalle: "no_autenticado" });
  }

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const errorReason = request.nextUrl.searchParams.get("error_reason");

  if (error) {
    return redirectDashboard(request, { meta: "error", detalle: errorReason || error });
  }

  if (!code) {
    return redirectDashboard(request, { meta: "error", detalle: "falta_code" });
  }

  try {
    const appId = process.env.META_APP_ID?.trim();
    const appSecret = process.env.META_APP_SECRET?.trim();

    if (!appId || !appSecret) {
      throw new Error("Faltan META_APP_ID o META_APP_SECRET");
    }

    const state = decodeMetaState(request.nextUrl.searchParams.get("state"));
    const local = await prisma.local.findUnique({
      where: { id: state.localId },
      select: { id: true, slug: true }
    });

    if (!local) throw new Error("Local no encontrado");

    if (session.user.localId && session.user.localId !== local.id) {
      throw new Error("No puedes conectar otro local");
    }

    const tokenUrl = new URL(`${META_GRAPH_URL}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("redirect_uri", getMetaRedirectUri(request));
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl, { cache: "no-store" });
    const tokenData = (await tokenResponse.json().catch(() => null)) as MetaTokenResponse | null;

    if (!tokenResponse.ok || !tokenData?.access_token) {
      throw new Error(tokenData?.error?.message || "Meta no entrego access token");
    }

    const accountsUrl = new URL(`${META_GRAPH_URL}/me/accounts`);
    accountsUrl.searchParams.set(
      "fields",
      "id,name,access_token,instagram_business_account{id,username,profile_picture_url}"
    );
    accountsUrl.searchParams.set("limit", "25");
    accountsUrl.searchParams.set("access_token", tokenData.access_token);

    const accountsResponse = await fetch(accountsUrl, { cache: "no-store" });
    const accountsData = (await accountsResponse.json().catch(() => null)) as MetaAccountsResponse | null;

    if (!accountsResponse.ok || !accountsData?.data) {
      throw new Error(accountsData?.error?.message || "No se pudieron leer las paginas de Meta");
    }

    const pageWithInstagram = accountsData.data.find(
      (page) => page.access_token && page.instagram_business_account?.id
    );

    if (!pageWithInstagram?.access_token || !pageWithInstagram.instagram_business_account?.id) {
      throw new Error("No se encontro una pagina con cuenta profesional de Instagram conectada");
    }

    await prisma.local.update({
      where: { id: local.id },
      data: {
        fbPageId: pageWithInstagram.id,
        fbToken: pageWithInstagram.access_token,
        igPageId: pageWithInstagram.instagram_business_account.id,
        igToken: pageWithInstagram.access_token
      }
    });

    // Suscribir la página al campo messages para que Meta envíe DMs al webhook
    await fetch(`${META_GRAPH_URL}/${pageWithInstagram.id}/subscribed_apps`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        subscribed_fields: "messages,messaging_postbacks",
        access_token: pageWithInstagram.access_token
      })
    }).catch(() => null);

    return redirectDashboard(request, { meta: "conectado", local: local.slug });
  } catch (callbackError) {
    return redirectDashboard(request, {
      meta: "error",
      detalle: callbackError instanceof Error ? callbackError.message : "error_callback"
    });
  }
}
