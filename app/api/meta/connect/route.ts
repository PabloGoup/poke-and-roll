import { NextRequest, NextResponse } from "next/server";
import { encodeMetaState, getMetaRedirectUri, getMetaScopes, requireLocalContext } from "@/app/api/meta/_utils";

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.META_APP_ID?.trim();
    if (!appId) {
      return NextResponse.json({ ok: false, error: "Falta META_APP_ID" }, { status: 400 });
    }

    const localContext = await requireLocalContext(request);
    const redirectUri = getMetaRedirectUri(request);
    const state = encodeMetaState(localContext);

    const oauthUrl = new URL("https://www.facebook.com/dialog/oauth");
    oauthUrl.searchParams.set("client_id", appId);
    oauthUrl.searchParams.set("redirect_uri", redirectUri);
    oauthUrl.searchParams.set("state", state);
    oauthUrl.searchParams.set("scope", getMetaScopes());
    oauthUrl.searchParams.set("response_type", "code");

    return NextResponse.redirect(oauthUrl);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error iniciando OAuth Meta" },
      { status: 400 }
    );
  }
}
