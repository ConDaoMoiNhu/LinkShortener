/**
 * Structured logger — JSON in production, readable in dev.
 * No external dependencies.
 */

type LogLevel = "info" | "warn" | "error";

interface LogMeta {
  [key: string]: unknown;
}

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function log(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    level,
    message,
  };

  if (meta) {
    for (const [key, value] of Object.entries(meta)) {
      entry[key] = key === "error" ? formatError(value) : value;
    }
  }

  if (process.env.NODE_ENV === "production") {
    // JSON for log aggregators (Vercel, Datadog, etc.)
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
  } else {
    const prefix = { info: "ℹ️", warn: "⚠️", error: "❌" }[level];
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(`${prefix} [${entry.timestamp}] ${message}`, meta ?? "");
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => log("info", message, meta),
  warn: (message: string, meta?: LogMeta) => log("warn", message, meta),
  error: (message: string, meta?: LogMeta) => log("error", message, meta),
};
