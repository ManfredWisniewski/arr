// Builds the Docusaurus docs site and syncs the static export to
// public/docs/ so the arr image serves it at /docs (FR-002).

import {execFileSync} from 'node:child_process';
import {cpSync, rmSync} from 'node:fs';

const shell = process.platform === 'win32';
const run = (args, opts = {}) =>
  execFileSync('npm', args, {stdio: 'inherit', shell, ...opts});

run(['--prefix', 'docs', 'run', 'build']);
rmSync('public/docs', {recursive: true, force: true});
cpSync('docs/build', 'public/docs', {recursive: true});
console.log('[build-docs] docs/build → public/docs');
