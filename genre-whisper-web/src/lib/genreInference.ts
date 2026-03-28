import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";

type PendingRequest = {
  resolve: (value: PredictionResult) => void;
  reject: (reason?: unknown) => void;
};

export type PredictionResult = {
  genre: string;
  confidence: number;
  top3: { genre: string; confidence: number }[];
  clean_tokens: string[];
  token_count: number;
};

let worker: ChildProcessWithoutNullStreams | null = null;
let buffer = "";
let requestId = 0;
let workerReady: Promise<void> | null = null;
let markWorkerReady: (() => void) | null = null;
let markWorkerFailed: ((reason?: unknown) => void) | null = null;
const pending = new Map<number, PendingRequest>();

function getPythonPath() {
  return (
    process.env.GENREWHISPER_PYTHON ||
    "C:\\Users\\zzaou\\AppData\\Local\\Programs\\Python\\Python312\\python.exe"
  );
}

function getScriptPath() {
  return path.join(process.cwd(), "scripts", "genre_server.py");
}

function attachWorkerListeners(proc: ChildProcessWithoutNullStreams) {
  proc.stdout.on("data", (chunk: Buffer) => {
    buffer += chunk.toString("utf8");
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const payload = JSON.parse(line);
        if (payload.status === "ready") {
          markWorkerReady?.();
          markWorkerReady = null;
          markWorkerFailed = null;
          continue;
        }
        const id = Number(payload.id);
        const entry = pending.get(id);
        if (!entry) continue;
        pending.delete(id);
        if (payload.error) {
          entry.reject(new Error(payload.error));
        } else {
          entry.resolve(payload.result as PredictionResult);
        }
      } catch (error) {
        // Ignore malformed partial log lines from the child process.
      }
    }
  });

  proc.stderr.on("data", () => {
    // Errors are surfaced through request timeouts/rejections.
  });

  proc.on("exit", () => {
    markWorkerFailed?.(new Error("Genre inference worker exited during startup."));
    markWorkerReady = null;
    markWorkerFailed = null;
    worker = null;
    workerReady = null;
    const err = new Error("Genre inference worker exited unexpectedly.");
    for (const entry of pending.values()) {
      entry.reject(err);
    }
    pending.clear();
  });
}

async function ensureWorker() {
  if (worker && workerReady) {
    await workerReady;
    return worker;
  }

  worker = spawn(getPythonPath(), [getScriptPath()], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "pipe"],
  });
  attachWorkerListeners(worker);

  workerReady = new Promise<void>((resolve, reject) => {
    markWorkerReady = resolve;
    markWorkerFailed = reject;
    const timeout = setTimeout(() => {
      markWorkerReady = null;
      markWorkerFailed = null;
      reject(new Error("Timed out while starting the GenreWhisper inference worker."));
    }, 30000);

    markWorkerReady = () => {
      clearTimeout(timeout);
      resolve();
    };
    markWorkerFailed = (error) => {
      clearTimeout(timeout);
      reject(error);
    };

    worker?.once("error", (error) => {
      markWorkerFailed?.(error);
    });
  });

  await workerReady;
  return worker;
}

export async function predictGenre(text: string): Promise<PredictionResult> {
  const proc = await ensureWorker();
  const id = ++requestId;

  return new Promise<PredictionResult>((resolve, reject) => {
    pending.set(id, { resolve, reject });
    proc.stdin.write(`${JSON.stringify({ id, text })}\n`, "utf8");
  });
}
