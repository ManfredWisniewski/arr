// Builds the biti design tokens (Terrazzo) and copies the generated
// arr theme CSS into src/css/tokens/ so custom.css can @import it.
// biti/tokens/build/ is generated output (never committed) — when the
// biti submodule or its build is unavailable we warn and continue; the
// site then renders with Infima fallback values (docs dev only).

import {execFileSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(docsDir, '..', 'biti', 'tokens');
const builtDir = join(tokensDir, 'build', 'css');
const outDir = join(docsDir, 'src', 'css', 'tokens');

if (!existsSync(join(tokensDir, 'package.json'))) {
  console.warn('[prepare-tokens] biti/tokens not found — using Infima fallback styles.');
  process.exit(0);
}

if (!existsSync(join(builtDir, 'arr-light.css'))) {
  console.log('[prepare-tokens] building biti tokens…');
  if (!existsSync(join(tokensDir, 'node_modules'))) {
    execFileSync('npm', ['ci'], {cwd: tokensDir, stdio: 'inherit', shell: process.platform === 'win32'});
  }
  execFileSync('npm', ['run', 'build'], {cwd: tokensDir, stdio: 'inherit', shell: process.platform === 'win32'});
}

mkdirSync(outDir, {recursive: true});
for (const file of ['arr-light.css', 'arr-dark.css']) {
  cpSync(join(builtDir, file), join(outDir, file));
}
console.log('[prepare-tokens] copied arr-light/arr-dark token CSS.');
