const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const clientDir = path.join(rootDir, 'client');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const children = [];

function startProcess(name, command, args, cwd, extraEnv = {}) {
  const child = spawn(command, args, {
    cwd,
    shell: true,
    stdio: 'pipe',
    env: {
      ...process.env,
      ...extraEnv,
    },
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code !== 0) {
      process.exitCode = code || 1;
    }
  });

  children.push(child);
  return child;
}

const backend = startProcess('backend', 'node', ['server.js'], rootDir);
const frontend = startProcess('frontend', npmCommand, ['run', 'dev'], clientDir);

function shutdown(signal) {
  for (const child of children) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
}

process.on('SIGINT', () => {
  shutdown('SIGINT');
  process.exit();
});

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
  process.exit();
});

backend.on('exit', () => {
  if (!frontend.killed) {
    frontend.kill('SIGTERM');
  }
});

frontend.on('exit', () => {
  if (!backend.killed) {
    backend.kill('SIGTERM');
  }
});
