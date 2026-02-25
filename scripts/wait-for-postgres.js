const net = require('node:net');
const { URL } = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

function loadEnvFile() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator === -1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const parsed = new URL(databaseUrl);
const host = parsed.hostname;
const port = Number(parsed.port || 5432);
const timeoutMs = Number(process.env.DB_WAIT_TIMEOUT_MS || 60000);
const retryEveryMs = Number(process.env.DB_WAIT_RETRY_MS || 1000);

const deadline = Date.now() + timeoutMs;

function waitForPort() {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let done = false;

    const finish = (error) => {
      if (done) return;
      done = true;
      socket.destroy();
      if (error) reject(error);
      else resolve();
    };

    socket.setTimeout(1500);
    socket.once('connect', () => finish());
    socket.once('timeout', () => finish(new Error('timeout')));
    socket.once('error', (error) => finish(error));
    socket.connect(port, host);
  });
}

async function main() {
  while (Date.now() < deadline) {
    try {
      await waitForPort();
      console.log(`PostgreSQL is ready at ${host}:${port}`);
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, retryEveryMs));
    }
  }

  console.error(
    `PostgreSQL did not become ready at ${host}:${port} within ${timeoutMs}ms`,
  );
  process.exit(1);
}

main();
