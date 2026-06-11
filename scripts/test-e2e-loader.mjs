// Loader ESM para ejecutar TypeScript con node puro (sin tsx).
// Uso: node --loader ./scripts/test-e2e-loader.mjs scripts/test-e2e.ts
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function tryTs(base) {
  for (const cand of [base, base + '.ts', base + '.tsx', path.join(base, 'index.ts')]) {
    if (existsSync(cand) && !cand.endsWith(path.sep)) {
      try { if (readFileSync(cand)) return cand; } catch { /* dir */ }
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const base = path.join(ROOT, specifier.slice(2));
    const found = tryTs(base);
    if (found) return { url: pathToFileURL(found).href, format: 'module', shortCircuit: true };
    return nextResolve(pathToFileURL(base).href, context);
  }
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && context.parentURL?.startsWith('file:')) {
    const parentDir = path.dirname(fileURLToPath(context.parentURL));
    const found = tryTs(path.resolve(parentDir, specifier));
    if (found) return { url: pathToFileURL(found).href, format: 'module', shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith('.ts') || url.endsWith('.tsx')) {
    const source = readFileSync(fileURLToPath(url), 'utf8');
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        esModuleInterop: true,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: fileURLToPath(url),
    });
    return { format: 'module', source: outputText, shortCircuit: true };
  }
  return nextLoad(url, context);
}
