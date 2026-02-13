/**
 * Local dev error logging. Logs to console with [ERROR] / [WARN] / [INFO] prefix.
 */

const PREFIX = {
  error: "[ERROR]",
  warn: "[WARN]",
  info: "[INFO]",
} as const;

function formatMessage(tag: keyof typeof PREFIX, context: string, message: string, data?: unknown): void {
  const parts = [tag, context, message];
  if (data !== undefined) {
    try {
      parts.push(typeof data === "object" && data !== null ? JSON.stringify(data) : String(data));
    } catch {
      parts.push(String(data));
    }
  }
  const out = parts.join(" ");
  if (tag === "error") {
    console.error(out);
    if (data instanceof Error && data.stack) console.error(data.stack);
  } else if (tag === "warn") {
    console.warn(out);
  } else {
    console.log(out);
  }
}

export const logger = {
  error(context: string, message: string, data?: unknown): void {
    formatMessage("error", context, message, data);
  },
  warn(context: string, message: string, data?: unknown): void {
    formatMessage("warn", context, message, data);
  },
  info(context: string, message: string, data?: unknown): void {
    formatMessage("info", context, message, data);
  },
};
