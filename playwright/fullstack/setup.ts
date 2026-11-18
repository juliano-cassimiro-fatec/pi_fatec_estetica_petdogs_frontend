import { spawn, type ChildProcess } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:net";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { stripVTControlCharacters } from "node:util";
import { MongoMemoryServer } from "mongodb-memory-server";

async function availablePort(): Promise<number> {
  const server = createServer();
  await new Promise<void>((resolvePromise, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolvePromise);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Não foi possível obter uma porta");
  await new Promise<void>((resolvePromise, reject) =>
    server.close((error) => (error ? reject(error) : resolvePromise())),
  );
  return address.port;
}

async function waitForServer(url: string, child: ChildProcess): Promise<void> {
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) throw new Error(`Servidor terminou com código ${child.exitCode}`);
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // The process may still be starting.
    }
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 250));
  }
  throw new Error(`Servidor não ficou pronto: ${url}`);
}

async function waitForOutput(child: ChildProcess, message: string): Promise<void> {
  if (!child.stdout || !child.stderr) throw new Error("Saída do servidor indisponível");
  const stdout = child.stdout;
  const stderr = child.stderr;
  stderr.on("data", (chunk: Buffer) => process.stderr.write(chunk));
  await new Promise<void>((resolvePromise, reject) => {
    let output = "";
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`Servidor não iniciou: ${message}`));
    }, 60_000);
    const onData = (chunk: Buffer) => {
      process.stdout.write(chunk);
      output += chunk.toString();
      if (stripVTControlCharacters(output).includes(message)) {
        cleanup();
        stdout.pipe(process.stdout);
        resolvePromise();
      }
    };
    const onExit = (code: number | null) => {
      cleanup();
      reject(new Error(`Servidor terminou antes de iniciar: ${code}`));
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    function cleanup() {
      clearTimeout(timer);
      stdout.off("data", onData);
      child.off("exit", onExit);
      child.off("error", onError);
    }
    stdout.on("data", onData);
    child.once("exit", onExit);
    child.once("error", onError);
  });
}

async function stopChild(child: ChildProcess | undefined): Promise<void> {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise<void>((resolvePromise) => {
    child.once("exit", () => resolvePromise());
    child.kill();
  });
}

export default async function setup() {
  const backend = resolve(process.env.BACKEND_DIR ?? "../pi_fatec_estetica_petdogs_backend");
  const temporaryDirectory = await mkdtemp(join(tmpdir(), "petdogs-e2e-"));
  let mongo: MongoMemoryServer | undefined;
  let api: ChildProcess | undefined;
  let frontend: ChildProcess | undefined;

  async function cleanup() {
    delete process.env.PETDOGS_E2E_ADMIN_SESSION;
    await stopChild(frontend);
    await stopChild(api);
    if (mongo) await mongo.stop();
    await rm(temporaryDirectory, { recursive: true, force: true });
  }

  try {
    mongo = await MongoMemoryServer.create({
      binary: { version: "7.0.14" },
      instance: { ip: "127.0.0.1" },
    });
    const port = await availablePort();
    const apiEnvironment = {
      PATH: process.env.PATH,
      SystemRoot: process.env.SystemRoot,
      TEMP: process.env.TEMP,
      TMP: process.env.TMP,
      NODE_ENV: "test",
      PORT: String(port),
      MONGO_URI: mongo.getUri("petdogs_e2e"),
      JWT_SECRET: "isolated-e2e-secret-not-for-production",
      JWT_EXPIRES_IN: "1h",
      JWT_ISSUER: "petdogs-e2e",
      JWT_AUDIENCE: "petdogs-e2e",
      ADMIN_EMAIL: "admin@example.test",
      ADMIN_PASSWORD: "test-password-123",
      ADMIN_NAME: "Admin de teste",
      FRONTEND_URL: "http://127.0.0.1:4174",
      UPLOAD_DIR: join(temporaryDirectory, "uploads"),
    };
    api = spawn(process.execPath, [join(backend, "dist", "server.js")], {
      cwd: temporaryDirectory,
      env: apiEnvironment,
      stdio: ["ignore", "pipe", "pipe"],
    });
    await waitForOutput(api, `Server is running on port ${port}`);
    await waitForServer(`http://127.0.0.1:${port}/api/v1/health`, api);
    const login = await fetch(`http://127.0.0.1:${port}/api/v1/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@example.test", password: "test-password-123" }),
    });
    if (!login.ok) throw new Error(`Não foi possível preparar a sessão de teste: ${login.status}`);
    process.env.PETDOGS_E2E_ADMIN_SESSION = JSON.stringify(await login.json());

    frontend = spawn(
      process.execPath,
      [
        resolve("node_modules/vite/bin/vite.js"),
        "--host",
        "127.0.0.1",
        "--port",
        "4174",
        "--strictPort",
      ],
      {
        env: {
          ...process.env,
          VITE_API_URL: "/api/v1",
          VITE_PROXY_TARGET: `http://127.0.0.1:${port}`,
        },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    await waitForOutput(frontend, "http://127.0.0.1:4174/");
    await waitForServer("http://127.0.0.1:4174", frontend);
    return cleanup;
  } catch (error) {
    await cleanup();
    throw error;
  }
}
