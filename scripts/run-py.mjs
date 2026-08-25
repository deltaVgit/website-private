#!/usr/bin/env node
/**
 * Cross-platform Python launcher for npm/pnpm scripts.
 * Windows often only has the Microsoft Store stub for `python`/`python3`.
 * We probe real interpreters first (including Hermes venv if present).
 */
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

const scriptArgs = process.argv.slice(2);
if (scriptArgs.length === 0) {
  console.error('Usage: node scripts/run-py.mjs <script.py> [args...]');
  process.exit(1);
}

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

/** @returns {string[][]} each entry is [binary, ...prefixArgs, ...scriptArgs] */
function buildCandidates() {
  /** @type {string[][]} */
  const out = [];

  if (process.platform === 'win32') {
    const local = process.env.LOCALAPPDATA || '';
    const home = os.homedir();
    const fixed = [
      path.join(local, 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
      path.join(home, 'AppData', 'Local', 'hermes', 'hermes-agent', 'venv', 'Scripts', 'python.exe'),
      path.join(local, 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(local, 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(local, 'Programs', 'Python', 'Python313', 'python.exe'),
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
    ];
    for (const bin of fixed) {
      if (bin && exists(bin)) out.push([bin, ...scriptArgs]);
    }
    // Avoid WindowsApps store stubs early — they exit 9009 and confuse people
    out.push(['py', '-3', ...scriptArgs]);
    out.push(['python', ...scriptArgs]);
    out.push(['python3', ...scriptArgs]);
  } else {
    out.push(['python3', ...scriptArgs]);
    out.push(['python', ...scriptArgs]);
    const hermes = path.join(os.homedir(), '.local', 'share', 'hermes', 'hermes-agent', 'venv', 'bin', 'python');
    if (exists(hermes)) out.push([hermes, ...scriptArgs]);
  }

  return out;
}

let lastStatus = 1;
for (const cmd of buildCandidates()) {
  const [bin, ...args] = cmd;
  const result = spawnSync(bin, args, {
    stdio: 'inherit',
    shell: false,
    // Force UTF-8 on the child's stdio. Our build scripts print check marks
    // and arrows; on Windows a Python whose stdout defaults to cp1252 dies on
    // the first one with UnicodeEncodeError and takes the whole build down.
    // This is the single place every script in the repo is launched from, so
    // it is the right place to guarantee the encoding.
    // Only the std streams. PYTHONUTF8=1 would also flip the default
    // encoding of every bare open() in scripts/, which is a much larger
    // change than the crash it was added for and would make a build behave
    // differently from running the same script by hand.
    // `:replace` so a lone surrogate cannot kill the build either.
    env: { ...process.env, PYTHONIOENCODING: 'utf-8:replace' },
    windowsHide: true,
  });

  if (result.error) {
    if (result.error.code === 'ENOENT') continue;
    console.error(result.error.message);
    process.exit(1);
  }

  // Windows Store alias when Python is not installed
  if (result.status === 9009) continue;

  if (result.status === 0) process.exit(0);

  lastStatus = result.status ?? 1;
  // Real interpreter ran the script and failed — surface that exit code
  process.exit(lastStatus);
}

console.error(
  [
    'Python 3 not found (or only the Windows Store stub is available).',
    '',
    'Fix one of:',
    '  1) Install Python 3 from https://www.python.org/downloads/  (check "Add to PATH")',
    '  2) Ensure Hermes venv exists: %LOCALAPPDATA%\\hermes\\hermes-agent\\venv\\Scripts\\python.exe',
    '  3) Run:  py -3 --version',
  ].join('\n'),
);
process.exit(lastStatus);
