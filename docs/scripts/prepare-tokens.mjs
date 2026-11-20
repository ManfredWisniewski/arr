// Refreshes the vendored biti token snapshot in src/css/tokens/.
//
// The theme CSS and the wit webfonts are committed — the image build
// never touches the biti submodule. Run this when biti/tokens change to
// update the docs branding: it builds the DTCG tokens (Terrazzo) and
// copies the generated wit theme CSS plus the Inter/Roboto Serif woff2
// files over the vendored snapshot.

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
for (const file of ['wit-light.css', 'wit-dark.css']) {
  cpSync(join(builtDir, file), join(outDir, file));
}

// wit typefaces (D13): Inter for display/heading, Roboto Serif for body.
// Only the weights docs actually uses are vendored into src/css/fonts —
// the bundler emits them with hashed names and static/ copying is
// skipped, so keep the subset small.
const fontsDir = join(docsDir, 'src', 'css', 'fonts');
mkdirSync(fontsDir, {recursive: true});
const assetsDir = join(docsDir, '..', 'biti', 'assets', 'wit', 'fonts');
for (const file of [
  'inter-v20-latin-regular.woff2',
  'inter-v20-latin-italic.woff2',
  'inter-v20-latin-500.woff2',
  'inter-v20-latin-600.woff2',
  'inter-v20-latin-700.woff2',
  'roboto-serif-v17-latin-regular.woff2',
  'roboto-serif-v17-latin-italic.woff2',
  'roboto-serif-v17-latin-500.woff2',
  'roboto-serif-v17-latin-600.woff2',
  'roboto-serif-v17-latin-700.woff2',
]) {
  cpSync(join(assetsDir, file), join(fontsDir, file));
}
console.log('[tokens] snapshot refreshed — commit src/css/tokens/ and src/css/fonts/ if they changed.');
