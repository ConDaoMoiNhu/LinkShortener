/**
 * Alert utility — logs critical events and optionally fires webhook.
 * Set ALERT_WEBHOOK_URL env var to enable Slack/Discord notifications.
 */

import { logger } from "./logger";

export type AlertType =
  | "RATE_LIMIT_EXCEEDED"
  | "DB_CONNECTION_FAILURE"
  | "KV_UNAVAILABLE"
  | "AUTH_FAILURE_SPIKE"
  | "UNEXPECTED_ERROR";

interface AlertOptions {
  type: AlertType;
  message: string;
  meta?: Record<string, unknown>;
}

/**
 * Fire an alert. Logs at error level with [ALERT] prefix.
 * If ALERT_WEBHOOK_URL is set, sends a POST to the webhook (fire-and-forget).
 */
export function fireAlert({ type, message, meta }: AlertOptions): void {
  logger.error(`[ALERT][${type}] ${message}`, meta);

  const webhookUrl = process.env.ALERT_WEBHOOK_URL;
  if (webhookUrl) {
    fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        message,
        meta,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Webhook failure must never throw — alerts are best-effort
    });
  }
}
