#!/usr/bin/env node
// Eval "typecheck": el proyecto no usa TypeScript, así que verifica la sintaxis de cada .js con node --check.
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SKIP = new Set(['node_modules', '.git', '.vercel']);

function jsFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (SKIP.has(entry.name)) return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(full);
    return entry.name.endsWith('.js') ? [full] : [];
  });
}

const files = jsFiles(ROOT);
const errores = [];
for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
  } catch (e) {
    errores.push(`${path.relative(ROOT, file)}\n${String(e.stderr || e.message).trim()}`);
  }
}
if (errores.length) {
  console.error(`Errores de sintaxis en ${errores.length} archivo(s):\n\n${errores.join('\n\n')}`);
  process.exit(1);
}
console.log(`typecheck: ${files.length} archivos .js sin errores de sintaxis`);
