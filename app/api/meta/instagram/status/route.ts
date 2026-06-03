import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { META_GRAPH_URL, requireLocalContext } from "@/app/api/meta/_utils";

type InstagramProfileResponse = {
  id?: string;
  username?: string;
  name?: string;
  profile_picture_url?: string;
  error?: { message?: string };
};

export async function GET(request: NextRequest) {
  try {
    const { localId } = await requireLocalContext(request);
    const local = await prisma.local.findUnique({
      where: { id: localId },
      select: {
        id: true,
        nombre: true,
        slug: true,
        igPageId: true,
        fbPageId: true,
        igToken: true,
        fbToken: true
      }
    });

    if (!local) {
      return NextResponse.json({ ok: false, error: "Local no encontrado" }, { status: 404 });
    }

    const igPageId = local.igPageId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || null;
    const token = local.igToken || process.env.META_ACCESS_TOKEN || null;

    let perfil: InstagramProfileResponse | null = null;
    if (igPageId && token) {
      const profileUrl = new URL(`${META_GRAPH_URL}/${igPageId}`);
      profileUrl.searchParams.set("fields", "id,username,name,profile_picture_url");
      profileUrl.searchParams.set("access_token", token);

      const profileResponse = await fetch(profileUrl, { cache: "no-store" });
      perfil = (await profileResponse.json().catch(() => null)) as InstagramProfileResponse | null;
    }

    return NextResponse.json({
      ok: true,
      conectado: Boolean(local.igPageId && local.igToken),
      modo: local.igPageId && local.igToken ? "local" : igPageId && token ? "env" : "sin_configurar",
      local: {
        id: local.id,
        nombre: local.nombre,
        slug: local.slug
      },
      instagram: {
        id: igPageId,
        username: perfil?.username ?? null,
        nombre: perfil?.name ?? null,
        profilePictureUrl: perfil?.profile_picture_url ?? null,
        error: perfil?.error?.message ?? null
      },
      facebook: {
        pageId: local.fbPageId || process.env.FACEBOOK_PAGE_ID || null
      }
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error leyendo estado Instagram" },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { localId } = await requireLocalContext(request);
    await prisma.local.update({
      where: { id: localId },
      data: {
        igPageId: null,
        igToken: null,
        fbPageId: null,
        fbToken: null
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Error desconectando Instagram" },
      { status: 400 }
    );
  }
}
