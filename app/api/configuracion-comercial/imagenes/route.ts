import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";

function supabaseConfig() {
  const url = process.env.SUPABASE_VENTAS_URL?.replace(/\/$/, "");
  const key = process.env.SUPABASE_VENTAS_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_VENTAS_STORAGE_BUCKET || "catalogo-visual";
  if (!url || !key) return null;
  return { url, key, bucket };
}

function storageHeaders(key: string, contentType?: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...(contentType ? { "Content-Type": contentType } : {})
  };
}

async function asegurarBucket(config: { url: string; key: string; bucket: string }) {
  const response = await fetch(`${config.url}/storage/v1/bucket/${config.bucket}`, {
    headers: storageHeaders(config.key),
    cache: "no-store"
  });

  if (response.ok) return;
  if (response.status !== 404) return;

  await fetch(`${config.url}/storage/v1/bucket`, {
    method: "POST",
    headers: storageHeaders(config.key, "application/json"),
    body: JSON.stringify({
      id: config.bucket,
      name: config.bucket,
      public: true,
      file_size_limit: 10 * 1024 * 1024,
      allowed_mime_types: ["image/png", "image/jpeg", "image/webp", "application/pdf"]
    })
  });
}

function normalizarTipo(tipo: string) {
  return tipo === "roll-dia" || tipo === "roll_dia"
    ? "roll_dia"
    : tipo === "menu-dia" || tipo === "menu_dia"
      ? "menu_dia"
      : tipo === "promocion"
        ? "promocion"
        : "catalogo";
}

function extensionSegura(file: File) {
  if (file.type === "image/jpeg") return "jpg";
  if (file.type === "image/webp") return "webp";
  if (file.type === "application/pdf") return "pdf";
  return "png";
}

async function guardarImagenLocal(file: File) {
  const extension = extensionSegura(file);
  const filename = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const relativePath = `/uploads/catalogo-visual/${filename}`;
  const outputDir = path.join(process.cwd(), "public", "uploads", "catalogo-visual");
  const outputPath = path.join(outputDir, filename);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, Buffer.from(await file.arrayBuffer()));

  return {
    publicUrl: relativePath,
    storagePath: `local:${relativePath}`
  };
}

async function subirSupabase(file: File, config: { url: string; key: string; bucket: string }) {
  await asegurarBucket(config);

  const extension = extensionSegura(file);
  const storagePath = `agente/${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const uploadUrl = `${config.url}/storage/v1/object/${config.bucket}/${storagePath}`;

  const upload = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      ...storageHeaders(config.key, file.type),
      "x-upsert": "true"
    },
    body: Buffer.from(await file.arrayBuffer())
  });

  if (!upload.ok) {
    const detail = await upload.text().catch(() => "");
    throw new Error(detail || `Supabase Storage ${upload.status}`);
  }

  return {
    publicUrl: `${config.url}/storage/v1/object/public/${config.bucket}/${storagePath}`,
    storagePath
  };
}

// GET: genera una signed URL para que el browser suba directo a Supabase
export async function GET(request: Request) {
  const config = supabaseConfig();
  if (!config) return NextResponse.json({ ok: false, error: "Supabase no configurado" }, { status: 500 });

  const { searchParams } = new URL(request.url);
  const nombre = searchParams.get("nombre") ?? "imagen";
  const mimeType = searchParams.get("mime") ?? "image/png";

  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType === "image/webp" ? "webp" : mimeType === "application/pdf" ? "pdf" : "png";
  const storagePath = `agente/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  await asegurarBucket(config);

  const signRes = await fetch(`${config.url}/storage/v1/object/sign/upload/${config.bucket}/${storagePath}`, {
    method: "POST",
    headers: storageHeaders(config.key, "application/json"),
    body: JSON.stringify({})
  });

  if (!signRes.ok) {
    const err = await signRes.text().catch(() => "");
    return NextResponse.json({ ok: false, error: err || `Supabase ${signRes.status}` }, { status: 500 });
  }

  const { signedURL, token } = await signRes.json();
  const uploadUrl = `${config.url}${signedURL}`;
  const publicUrl = `${config.url}/storage/v1/object/public/${config.bucket}/${storagePath}`;

  return NextResponse.json({ ok: true, uploadUrl, token, storagePath, publicUrl, nombre });
}

// POST: guarda en DB la imagen ya subida a Supabase (o sube localmente como fallback)
export async function POST(request: Request) {
  const config = supabaseConfig();
  const body = await request.json().catch(() => null);

  // Flujo directo: browser ya subió a Supabase, solo guardamos metadata
  if (body?.publicUrl && body?.storagePath) {
    const { publicUrl, storagePath, nombre, tipo, prioridadEnvio } = body;
    if (prioridadEnvio) await prisma.$executeRawUnsafe('UPDATE "catalogos_visuales_agente" SET "prioridad_envio" = false');
    const imagen = await prisma.catalogoVisualAgente.create({
      data: {
        nombre: nombre ?? "imagen",
        url: publicUrl,
        storagePath,
        tipo: normalizarTipo(tipo ?? "catalogo"),
        prioridadEnvio: Boolean(prioridadEnvio),
        activo: true
      }
    });
    return NextResponse.json({ ok: true, imagen, storageProvider: "supabase" });
  }

  // Flujo legacy: recibe el archivo (solo para compatibilidad local/dev)
  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  const tipo = String(formData?.get("tipo") ?? "catalogo");
  const prioridadEnvio = String(formData?.get("prioridadEnvio") ?? "false") === "true";

  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Archivo requerido" }, { status: 400 });
  }

  if (!["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.type)) {
    return NextResponse.json({ ok: false, error: "Formato no permitido" }, { status: 400 });
  }

  let uploaded: { publicUrl: string; storagePath: string };
  let storageProvider: "supabase" | "local" = "local";

  try {
    if (!config) throw new Error("Supabase Storage no configurado");
    uploaded = await subirSupabase(file, config);
    storageProvider = "supabase";
  } catch (err) {
    console.error("[Catalogo upload] Fallo Supabase, usando local:", err);
    uploaded = await guardarImagenLocal(file);
  }

  if (prioridadEnvio) await prisma.catalogoVisualAgente.updateMany({ data: { prioridadEnvio: false } });

  const imagen = await prisma.catalogoVisualAgente.create({
    data: {
      nombre: file.name,
      url: uploaded.publicUrl,
      storagePath: uploaded.storagePath,
      tipo: normalizarTipo(tipo),
      prioridadEnvio,
      activo: true
    }
  });

  return NextResponse.json({ ok: true, imagen, storageProvider });
}
