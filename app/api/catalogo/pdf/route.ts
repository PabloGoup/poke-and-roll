import { NextResponse } from "next/server";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

async function buscarCatalogoPdf() {
  const docsDir = path.join(process.cwd(), "docs");
  const archivos = await readdir(docsDir);
  const pdf = archivos
    .filter((archivo) => archivo.toLowerCase().endsWith(".pdf"))
    .sort((a, b) => {
      const prioridadA = /catalogo|catalog|menu|men[uú]/i.test(a) ? 0 : 1;
      const prioridadB = /catalogo|catalog|menu|men[uú]/i.test(b) ? 0 : 1;
      return prioridadA - prioridadB || a.localeCompare(b);
    })[0];

  return pdf ? path.join(docsDir, pdf) : null;
}

export async function GET() {
  const catalogoPath = await buscarCatalogoPdf();

  if (!catalogoPath) {
    return NextResponse.json({ ok: false, error: "Catalogo PDF no encontrado" }, { status: 404 });
  }

  const data = await readFile(catalogoPath);

  return new Response(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="catalogo.pdf"; filename*=UTF-8''${encodeURIComponent(path.basename(catalogoPath))}`,
      "Cache-Control": "public, max-age=300"
    }
  });
}
