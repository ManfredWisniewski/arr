// Refreshes the vendored biti token snapshot in src/css/tokens/.
//
// The two CSS files are committed — the image build never touches the
// biti submodule. Run this when biti/tokens change to update the docs
// branding: it builds the DTCG tokens (Terrazzo) and copies the
// generated arr theme CSS over the vendored snapshot.

import {execFileSync} from 'node:child_process';
import {cpSync, existsSync, mkdirSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const docsDir = join(dirname(fileURLToPath(import.meta.url)), '..');
const tokensDir = join(docsDir, '..', 'biti', 'tokens');
const builtDir = join(tokensDir, 'build', 'css');
const outDir = join(docsDir, 'src', 'css', 'tokens');

if (!existsSync(join(tokensDir, 'package.json'))) {
  console.error('[tokens] biti/tokens not found — run `git submodule update --init biti` first.');
  process.exit(1);
}

console.log('[tokens] building biti tokens…');
if (!existsSync(join(tokensDir, 'node_modules'))) {
  execFileSync('npm', ['ci'], {cwd: tokensDir, stdio: 'inherit', shell: process.platform === 'win32'});
}
execFileSync('npm', ['run', 'build'], {cwd: tokensDir, stdio: 'inherit', shell: process.platform === 'win32'});

mkdirSync(outDir, {recursive: true});
for (const file of ['arr-light.css', 'arr-dark.css']) {
  cpSync(join(builtDir, file), join(outDir, file));
}
console.log('[tokens] snapshot refreshed — commit src/css/tokens/ if the files changed.');
