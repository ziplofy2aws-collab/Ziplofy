#!/usr/bin/env node
/**
 * Interactive dev server launcher for the Codiic monorepo.
 *
 * Usage (from repo root):
 *   npm run dev
 *   node dev-launcher.mjs
 */

import { select } from '@inquirer/prompts';
import { spawn, execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

const BACK = '__back__';
const START_ALL = '__start_all__';
const START_ALL_PLUS = '__start_all_plus__';
const START_ALL_PLUS_SERVER = '__start_all_plus_server__';

/** @typedef {Object} AppDef
 * @property {string} id
 * @property {string} label
 * @property {string} dir
 * @property {string} [script]
 * @property {string} [hint]
 */

/** @typedef {Object} WorkspaceGroup
 * @property {string} id
 * @property {string} label
 * @property {string} [description]
 * @property {AppDef[]} apps
 */

/** @type {AppDef[]} */
const WEBPANEL_APPS = [
  {
    id: 'wabapanel-express',
    label: 'Express API',
    hint: 'port 5001',
    dir: 'webpanel/wabapanel-express',
    script: 'dev',
  },
  {
    id: 'wabapanel-frontend',
    label: 'Frontend (Next.js)',
    hint: 'port 3002',
    dir: 'webpanel/wabapanel-frontend',
    script: 'dev',
  },
  {
    id: 'webpanel-store-renderer',
    label: 'Store Renderer',
    hint: 'port 3003',
    dir: 'webpanel/webpanel-store-renderer',
    script: 'dev',
  },
];

/** @type {AppDef[]} */
const CODIIC_APPS = [
  {
    id: 'codiic-server',
    label: 'Codiic Server (API)',
    hint: 'port 5000 — run npm run build first if needed',
    dir: 'codiic-server',
    script: 'dev',
  },
  {
    id: 'codiic',
    label: 'Codiic Frontend',
    hint: 'port 3000',
    dir: 'codiic',
    script: 'dev',
  },
  {
    id: 'admin',
    label: 'Codiic Admin',
    hint: 'Vite dev server',
    dir: 'admin',
    script: 'dev',
  },
  {
    id: 'render-store',
    label: 'Render Store SDK',
    hint: 'port 5180',
    dir: 'render-store',
    script: 'dev',
  },
];

/** Webpanel stack + Codiic Admin (theme uploads, Informatic themes, etc.) */
const WEBPANEL_PLUS_APPS = [
  ...WEBPANEL_APPS,
  CODIIC_APPS.find((a) => a.id === 'admin'),
].filter(Boolean);

/** Webpanel stack + Admin + Codiic Server API (full theme catalog backend) */
const WEBPANEL_PLUS_ADMIN_SERVER_APPS = [
  ...WEBPANEL_APPS,
  CODIIC_APPS.find((a) => a.id === 'admin'),
  CODIIC_APPS.find((a) => a.id === 'codiic-server'),
].filter(Boolean);

/** Default dev ports (+ common Vite fallbacks when primary port is busy). */
const APP_PORTS = {
  'wabapanel-express': [5001],
  'wabapanel-frontend': [3002],
  'webpanel-store-renderer': [3003, 3004],
  'codiic-server': [5000],
  codiic: [3000],
  admin: [5173, 5174],
  'render-store': [5180],
};

const ALL_DEV_PORTS = [5000, 5001, 3000, 3002, 3003, 3004, 5173, 5174, 5180];

/** @type {WorkspaceGroup[]} */
const WORKSPACES = [
  {
    id: 'webpanel',
    label: 'Webpanel',
    description: 'WhatsApp panel — API, frontend, storefront renderer',
    apps: WEBPANEL_APPS,
  },
  {
    id: 'codiic',
    label: 'Codiic Platform',
    description: 'Server API, merchant UI, admin panel, render-store SDK',
    apps: CODIIC_APPS,
  },
];

function color(text, code) {
  return `\x1b[${code}m${text}\x1b[0m`;
}

function banner({ showBackHint = false } = {}) {
  console.clear();
  console.log(color('\n  Codiic Dev Launcher', '1;36'));
  console.log(color('  ────────────────────', '36'));
  console.log('  Use ↑ ↓ to move, Enter to select, Ctrl+C to quit.');
  if (showBackHint) {
    console.log(color('  Backspace — go back to the previous menu', '90'));
  }
  console.log('');
}

function restoreTerminal() {
  if (process.stdin.isTTY) {
    try {
      process.stdin.setRawMode(false);
    } catch {
      /* ignore */
    }
  }
  process.stdout.write('\x1b[?25h\x1b[0m');
}

/**
 * @typedef {Object} MenuChoice
 * @property {string} name
 * @property {string} value
 * @property {string} [description]
 */

/**
 * Lightweight arrow-key menu (used when Backspace back-nav is needed).
 * Avoids fighting @inquirer/prompts over stdin/keypress handling.
 * @param {{ message: string, choices: MenuChoice[], allowBack?: boolean, headerLines?: string[] }} config
 */
function interactiveSelect({ message, choices, allowBack = false, headerLines = [] }) {
  return new Promise((resolve, reject) => {
    let active = 0;
    let closed = false;

    const finish = (fn) => {
      if (closed) return;
      closed = true;
      process.stdin.removeListener('keypress', onKeypress);
      restoreTerminal();
      fn();
    };

    const render = () => {
      console.clear();
      banner({ showBackHint: allowBack });
      for (const line of headerLines) {
        console.log(line);
      }
      if (headerLines.length) console.log('');
      console.log(color(`? ${message}`, '1'));
      choices.forEach((choice, i) => {
        const cursor = i === active ? color('❯', '36') : ' ';
        console.log(` ${cursor} ${choice.name}`);
      });
      const desc = choices[active]?.description;
      if (desc) {
        console.log('');
        console.log(color(`  ${desc}`, '90'));
      }
      console.log('');
      console.log(
        color(
          `  ↑↓ navigate • ⏎ select${allowBack ? ' • ⌫ back' : ''}`,
          '90'
        )
      );
    };

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);
    process.stdin.resume();

    const onKeypress = (_str, key) => {
      if (!key || closed) return;

      if (key.ctrl && key.name === 'c') {
        finish(() => reject(Object.assign(new Error('Exit'), { name: 'ExitPromptError' })));
        return;
      }

      if (allowBack && (key.name === 'backspace' || key.sequence === '\x7f' || key.name === 'escape')) {
        finish(() => resolve(BACK));
        return;
      }

      if (key.name === 'up') {
        active = (active - 1 + choices.length) % choices.length;
        render();
        return;
      }

      if (key.name === 'down') {
        active = (active + 1) % choices.length;
        render();
        return;
      }

      if (key.name === 'return' || key.name === 'enter') {
        finish(() => resolve(choices[active].value));
      }
    };

    process.stdin.on('keypress', onKeypress);
    render();
  });
}

/**
 * @param {Parameters<typeof select>[0]} config
 * @param {{ allowBack?: boolean, headerLines?: string[] }} [options]
 */
async function selectMenu(config, { allowBack = false, headerLines = [] } = {}) {
  if (allowBack) {
    return interactiveSelect({
      message: config.message,
      choices: config.choices,
      allowBack: true,
      headerLines,
    });
  }
  restoreTerminal();
  return select(config);
}

/** @param {AppDef} app */
function assertAppExists(app) {
  const fullPath = path.join(ROOT, app.dir);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Folder not found: ${app.dir}`);
  }
  const pkgPath = path.join(fullPath, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error(`No package.json in ${app.dir}`);
  }
}

/** Common log lines that mean a dev server is up. */
const READY_PATTERNS = [
  /Server (is )?running on port/i,
  /ready in \d+/i,
  /✓ Ready/i,
  /\bReady in\b/i,
  /Local:\s+https?:\/\//i,
  /started server on/i,
  /\bVITE v\d+/i,
  /listening on/i,
  /Nest application successfully started/i,
  /MongoDB connected/i,
];

/** Lines that usually mean startup failed. */
const FATAL_PATTERNS = [
  /EADDRINUSE/i,
  /Cannot find module/i,
  /\bnpm ERR!/i,
  /Error: listen/i,
  /MODULE_NOT_FOUND/i,
  /command failed/i,
  /uncaughtException/i,
  /Missing parameter name/i,
  /ENOENT/i,
];

const STARTUP_TIMEOUT_MS = 120_000;
const MAX_ERROR_LINES = 24;

/** @param {AppDef} app */
function spawnNpmDev(app, stdio = 'inherit') {
  const cwd = path.join(ROOT, app.dir);
  const script = app.script || 'dev';
  return trackProcess(
    spawn(`npm run ${script}`, {
      cwd,
      stdio,
      shell: true,
      windowsHide: true,
      env: { ...process.env, FORCE_COLOR: '1' },
    })
  );
}

/** @param {string} text */
function stripAnsi(text) {
  return text.replace(/\x1b\[[0-9;]*m/g, '');
}

/** @param {string} buffer */
function tailLines(buffer, max = MAX_ERROR_LINES) {
  return stripAnsi(buffer)
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter(Boolean)
    .slice(-max)
    .join('\n');
}

/** @param {string} chunk */
function isReadyOutput(chunk) {
  const text = stripAnsi(chunk);
  return READY_PATTERNS.some((re) => re.test(text));
}

/** @param {string} chunk */
function isFatalOutput(chunk) {
  const text = stripAnsi(chunk);
  return FATAL_PATTERNS.some((re) => re.test(text));
}

/** @type {Set<number>} */
const trackedPids = new Set();
let groupShutdownHandler = null;

/** Kill a process and all children (Windows: taskkill /T /F). */
function killProcessTree(pid) {
  if (!pid || pid <= 0) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /T /F`, {
        stdio: 'ignore',
        windowsHide: true,
      });
    } else {
      try {
        process.kill(-pid, 'SIGTERM');
      } catch {
        process.kill(pid, 'SIGTERM');
      }
    }
  } catch {
    /* process may already be gone */
  }
}

/** @param {import('node:child_process').ChildProcess} child */
function trackProcess(child) {
  if (child?.pid) trackedPids.add(child.pid);
  child?.on?.('exit', () => {
    if (child.pid) trackedPids.delete(child.pid);
  });
  return child;
}

function killAllTrackedProcesses() {
  const pids = [...trackedPids];
  trackedPids.clear();
  for (const pid of pids) {
    killProcessTree(pid);
  }
}

/** @param {import('node:child_process').ChildProcess[]} children */
function killAllChildren(children) {
  for (const child of children) {
    if (child?.pid) killProcessTree(child.pid);
  }
  killAllTrackedProcesses();
}

function stopAllAppsAndExit(code = 0) {
  if (groupShutdownHandler) {
    process.off('SIGINT', groupShutdownHandler);
    process.off('SIGTERM', groupShutdownHandler);
    groupShutdownHandler = null;
  }
  killAllTrackedProcesses();
  restoreTerminal();
  // Brief pause so Windows releases listening ports before the shell prompt returns.
  setTimeout(() => process.exit(code), process.platform === 'win32' ? 1500 : 400);
}

/** @param {number} port */
function findListeningPidsOnPort(port) {
  try {
    let out = '';
    if (process.platform === 'win32') {
      out = execSync(`netstat -ano | findstr ":${port} "`, {
        encoding: 'utf8',
        windowsHide: true,
      });
    } else {
      out = execSync(`lsof -nP -iTCP:${port} -sTCP:LISTEN || true`, {
        encoding: 'utf8',
      });
    }
    const pids = new Set();
    for (const line of out.split(/\r?\n/)) {
      if (process.platform === 'win32') {
        if (!line.includes('LISTENING')) continue;
        const parts = line.trim().split(/\s+/);
        const pid = Number.parseInt(parts[parts.length - 1], 10);
        if (Number.isFinite(pid) && pid > 0 && pid !== process.pid) pids.add(pid);
      } else {
        const match = line.trim().match(/\s(\d+)\s*$/);
        if (match) {
          const pid = Number.parseInt(match[1], 10);
          if (pid > 0 && pid !== process.pid) pids.add(pid);
        }
      }
    }
    return [...pids];
  } catch {
    return [];
  }
}

/** @param {number[]} ports */
function freePorts(ports) {
  /** @type {{ port: number, pid: number }[]} */
  const freed = [];
  const seen = new Set();

  for (const port of ports) {
    for (const pid of findListeningPidsOnPort(port)) {
      const key = `${port}:${pid}`;
      if (seen.has(key)) continue;
      seen.add(key);
      killProcessTree(pid);
      freed.push({ port, pid });
    }
  }

  if (freed.length && process.platform === 'win32') {
    try {
      execSync('powershell -Command "Start-Sleep -Milliseconds 800"', {
        stdio: 'ignore',
        windowsHide: true,
      });
    } catch {
      /* ignore */
    }
  }

  return freed;
}

/** @param {AppDef[]} apps */
function freePortsForApps(apps) {
  const ports = new Set();
  for (const app of apps) {
    for (const port of APP_PORTS[app.id] || []) ports.add(port);
  }
  return freePorts([...ports]);
}

function freeAllDevPorts() {
  return freePorts(ALL_DEV_PORTS);
}

/** @param {AppDef[]} apps @param {string} label */
function preflightPortsForApps(apps, label) {
  const freed = freePortsForApps(apps);
  if (freed.length === 0) return;

  console.log(color(`\n  🧹 Cleared ${freed.length} stale process(es) before starting ${label}:`, '33'));
  for (const { port, pid } of freed) {
    console.log(color(`     port ${port} → killed PID ${pid}`, '90'));
  }
  console.log('');
}

/** @param {AppDef} app */
function startSingleApp(app) {
  assertAppExists(app);
  preflightPortsForApps([app], app.label);
  console.log(color(`\n▶ Starting ${app.label}`, '32'));
  console.log(`  Path: ${app.dir}`);
  console.log(`  Command: npm run ${app.script || 'dev'}\n`);

  const child = spawnNpmDev(app);

  const onSigInt = () => {
    console.log(color('\n\nStopping app…', '33'));
    stopAllAppsAndExit(0);
  };
  process.once('SIGINT', onSigInt);
  process.once('SIGTERM', onSigInt);

  child.on('error', (err) => {
    process.off('SIGINT', onSigInt);
    process.off('SIGTERM', onSigInt);
    console.error(color(`\nFailed to start ${app.label}: ${err.message}`, '31'));
    killProcessTree(child.pid);
    process.exit(1);
  });

  child.on('exit', (code, signal) => {
    process.off('SIGINT', onSigInt);
    process.off('SIGTERM', onSigInt);
    if (child.pid) trackedPids.delete(child.pid);
    if (signal) {
      console.log(color(`\n${app.label} stopped (${signal}).`, '33'));
      process.exit(0);
    }
    process.exit(code ?? 0);
  });
}

/** @param {AppDef[]} apps */
function startMultipleApps(apps, groupLabel) {
  for (const app of apps) assertAppExists(app);
  preflightPortsForApps(apps, groupLabel);

  console.log(color(`\n▶ Starting ${apps.length} apps for ${groupLabel}…`, '32'));
  apps.forEach((app, i) => {
    console.log(`  ${i + 1}. ${app.label}  ${color('→', '90')} ${color(app.dir, '36')}`);
  });
  console.log('');

  /** @type {import('node:child_process').ChildProcess[]} */
  const children = [];
  /** @type {Map<string, { app: AppDef, ready: boolean, failed: boolean, output: string, exitCode?: number | null, error?: Error | null }>} */
  const states = new Map();
  let startupComplete = false;
  let shuttingDown = false;

  const markAll = (appsList) => {
    for (const app of appsList) {
      states.set(app.id, {
        app,
        ready: false,
        failed: false,
        output: '',
        exitCode: null,
        error: null,
      });
    }
  };
  markAll(apps);

  /** @param {string} appId @param {string} chunk */
  const appendOutput = (appId, chunk) => {
    const state = states.get(appId);
    if (!state) return;
    state.output += chunk.toString();
    if (state.output.length > 32_000) {
      state.output = state.output.slice(-24_000);
    }
  };

  const printRunningSummary = () => {
    console.log(color(`\n✓ All ${apps.length} applications are running:\n`, '32'));
    apps.forEach((app, i) => {
      console.log(color(`  ${i + 1}. ${app.label} running ✓`, '32'));
      console.log(color(`      → ${app.dir}/`, '90'));
    });
    console.log(color('\n  Press Ctrl+C to stop all.', '90'));
    if (process.platform === 'win32') {
      console.log(color('  (Windows: wait ~2s after Ctrl+C for ports to release)', '90'));
    }
    console.log(color('  ─── logs ───', '90'));
  };

  /** @param {AppDef} failedApp @param {{ reason: string, exitCode?: number | null, detail?: string }} info */
  const failGroup = (failedApp, info) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.error(color(`\n✗ Failed to start ${groupLabel} — stopping all apps.\n`, '31'));
    console.error(color(`✗ ${failedApp.label} failed`, '31'));
    console.error(color(`  Reason: ${info.reason}`, '31'));
    if (info.exitCode != null) {
      console.error(color(`  Exit code: ${info.exitCode}`, '31'));
    }

    const failedState = states.get(failedApp.id);
    const errorText = info.detail || (failedState ? tailLines(failedState.output) : '');
    if (errorText) {
      console.error(color('\n  Error output:', '31'));
      errorText.split('\n').forEach((line) => {
        console.error(color(`  │ ${line}`, '31'));
      });
    }

    console.error('');
    clearTimeout(startupTimer);
    killAllChildren(children);
    stopAllAppsAndExit(1);
  };

  const checkAllReady = () => {
    if (startupComplete || shuttingDown) return;
    const allReady = apps.every((app) => states.get(app.id)?.ready);
    if (!allReady) return;
    startupComplete = true;
    printRunningSummary();
  };

  const shutdownGraceful = () => {
    if (shuttingDown) return;
    shuttingDown = true;
    clearTimeout(startupTimer);
    console.log(color('\n\nStopping all apps…', '33'));
    killAllChildren(children);
    stopAllAppsAndExit(0);
  };

  groupShutdownHandler = shutdownGraceful;
  process.on('SIGINT', shutdownGraceful);
  process.on('SIGTERM', shutdownGraceful);

  const startupTimer = setTimeout(() => {
    const pending = apps.filter((app) => !states.get(app.id)?.ready);
    if (pending.length === 0 || startupComplete || shuttingDown) return;
    const first = pending[0];
    failGroup(first, {
      reason: `Timed out after ${STARTUP_TIMEOUT_MS / 1000}s — "${first.label}" never logged a ready signal (app may still be starting; check logs above)`,
      detail: tailLines(states.get(first.id)?.output || ''),
    });
  }, STARTUP_TIMEOUT_MS);

  for (const app of apps) {
    const prefix = `[${app.id}]`;
    let child;

    try {
      child = spawnNpmDev(app, ['pipe', 'pipe', 'pipe']);
    } catch (err) {
      clearTimeout(startupTimer);
      failGroup(app, {
        reason: 'Could not spawn process',
        detail: err instanceof Error ? err.message : String(err),
      });
      return;
    }

    child.on('error', (err) => {
      clearTimeout(startupTimer);
      const state = states.get(app.id);
      if (state) state.error = err;
      failGroup(app, {
        reason: err.message || 'Process error',
        detail: tailLines(state?.output || ''),
      });
    });

    child.on('exit', (code, signal) => {
      const state = states.get(app.id);
      if (state) state.exitCode = code;

      if (shuttingDown || signal) return;

      if (!startupComplete) {
        clearTimeout(startupTimer);
        failGroup(app, {
          reason: signal ? `Stopped (${signal})` : 'Exited during startup',
          exitCode: code,
          detail: tailLines(state?.output || ''),
        });
        return;
      }

      if (code && code !== 0) {
        failGroup(app, {
          reason: 'Crashed while running',
          exitCode: code,
          detail: tailLines(state?.output || ''),
        });
      }
    });

    const handleStream = (chunk, isStderr = false) => {
      appendOutput(app.id, chunk);
      const state = states.get(app.id);
      if (!state || state.failed) return;

      const text = chunk.toString();

      if (!startupComplete && !state.ready) {
        const recent = state.output.slice(-4000);
        if (isReadyOutput(text) || isReadyOutput(recent)) {
          state.ready = true;
          console.log(color(`  ✓ ${app.label} running`, '32'));
          checkAllReady();
        }
      }

      if (!startupComplete && isFatalOutput(text)) {
        state.failed = true;
        clearTimeout(startupTimer);
        failGroup(app, {
          reason: 'Startup error detected in logs',
          detail: tailLines(state.output),
        });
        return;
      }

      const stream = isStderr ? process.stderr : process.stdout;
      stream.write(`${color(prefix, '90')} ${chunk}`);
    };

    child.stdout?.on('data', (chunk) => handleStream(chunk, false));
    child.stderr?.on('data', (chunk) => handleStream(chunk, true));

    children.push(child);
  }
}

/** @param {AppDef} app */
function formatAppChoiceLabel(app) {
  const folder = color(app.dir, '36');
  const hintPart = app.hint ? ` ${color(`(${app.hint})`, '90')}` : '';
  return `${app.label}  ${color('→', '90')} ${folder}${hintPart}`;
}

/** @param {AppDef[]} apps @param {string} [workspaceId] */
function appChoices(apps, workspaceId) {
  const choices = [
    ...apps.map((app) => ({
      name: formatAppChoiceLabel(app),
      value: app.id,
      description: `npm run ${app.script || 'dev'} in ${app.dir}/`,
    })),
    {
      name: color('⚡  Start all in this group', '33'),
      value: START_ALL,
      description: `Starts all ${apps.length} apps listed above`,
    },
  ];

  if (workspaceId === 'webpanel') {
    choices.push({
      name: color('⚡  Start all in this group + Admin', '33'),
      value: START_ALL_PLUS,
      description:
        'Webpanel (express + frontend + renderer) + Codiic Admin → admin/',
    });
    choices.push({
      name: color('⚡  Start all in this group + Admin + Codiic Server', '33'),
      value: START_ALL_PLUS_SERVER,
      description:
        'Webpanel + admin/ + codiic-server/ (Informatic themes API on :5000)',
    });
  }

  choices.push({
    name: color('↩  Back', '90'),
    value: BACK,
  });

  return choices;
}

/** @param {WorkspaceGroup} workspace */
async function pickAppInWorkspace(workspace) {
  while (true) {
    const choice = await selectMenu(
      {
        message: `Which ${workspace.label} app do you want to start?`,
        choices: appChoices(workspace.apps, workspace.id),
      },
      {
        allowBack: true,
        headerLines: [
          color(`  ${workspace.label}`, '1'),
          ...(workspace.description ? [color(`  ${workspace.description}`, '90')] : []),
        ],
      }
    );

    if (choice === BACK) return;

    if (choice === START_ALL) {
      startMultipleApps(workspace.apps, workspace.label);
      return;
    }

    if (choice === START_ALL_PLUS && workspace.id === 'webpanel') {
      startMultipleApps(WEBPANEL_PLUS_APPS, `${workspace.label} + Admin`);
      return;
    }

    if (choice === START_ALL_PLUS_SERVER && workspace.id === 'webpanel') {
      startMultipleApps(
        WEBPANEL_PLUS_ADMIN_SERVER_APPS,
        `${workspace.label} + Admin + Codiic Server`
      );
      return;
    }

    const app = workspace.apps.find((a) => a.id === choice);
    if (!app) continue;
    startSingleApp(app);
    return;
  }
}

async function pickWorkspace() {
  while (true) {
    restoreTerminal();
    banner();

    const choice = await select({
      message: 'Which workspace do you want to start?',
      choices: [
        ...WORKSPACES.map((ws) => ({
          name: ws.label,
          value: ws.id,
          description: ws.description,
        })),
        {
          name: color('⚡  Webpanel full stack (express + frontend + renderer)', '33'),
          value: 'webpanel-all',
          description: 'Starts all three webpanel dev servers',
        },
        {
          name: color('⚡  Codiic full stack (server + frontend + admin + render-store)', '33'),
          value: 'codiic-all',
          description: 'Starts all four Codiic platform dev servers',
        },
        {
          name: color('🧹  Free stuck dev ports', '33'),
          value: 'free-ports',
          description: 'Kill orphan listeners on 5000, 5001, 3000–3004, 5173–5174, 5180',
        },
        {
          name: color('✕  Exit', '90'),
          value: '__exit__',
        },
      ],
      pageSize: 14,
    });

    if (choice === '__exit__') {
      console.log('\nBye.\n');
      process.exit(0);
    }

    if (choice === 'free-ports') {
      restoreTerminal();
      const freed = freeAllDevPorts();
      console.log('');
      if (freed.length === 0) {
        console.log(color('  ✓ No stuck dev ports found — all clear.', '32'));
      } else {
        console.log(color(`  ✓ Freed ${freed.length} stuck process(es):`, '32'));
        for (const { port, pid } of freed) {
          console.log(color(`     port ${port} → PID ${pid}`, '90'));
        }
      }
      console.log(color('\n  Press Enter to return to the menu…', '90'));
      await new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        rl.question('', () => {
          rl.close();
          resolve(undefined);
        });
      });
      continue;
    }

    if (choice === 'webpanel-all') {
      startMultipleApps(WEBPANEL_APPS, 'Webpanel');
      return;
    }

    if (choice === 'codiic-all') {
      startMultipleApps(CODIIC_APPS, 'Codiic Platform');
      return;
    }

    const workspace = WORKSPACES.find((ws) => ws.id === choice);
    if (workspace) {
      await pickAppInWorkspace(workspace);
    }
  }
}

pickWorkspace().catch((err) => {
  if (err?.name === 'ExitPromptError') {
    console.log('\nBye.\n');
    process.exit(0);
  }
  console.error(color(`\nLauncher error: ${err.message}`, '31'));
  process.exit(1);
});
