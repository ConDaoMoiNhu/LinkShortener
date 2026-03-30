/**
 * Alert utility — logs critical events with [ALERT] prefix.
 * Ready for webhook integration (Slack/Discord) later.
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
 * Fire an alert. Currently logs at error level with [ALERT] prefix.
 * In the future, this can send webhooks to Slack/Discord/PagerDuty.
 */
export function fireAlert({ type, message, meta }: AlertOptions): void {
  logger.error(`[ALERT][${type}] ${message}`, meta);

  // TODO: Add webhook integration
  // if (process.env.ALERT_WEBHOOK_URL) {
  //   fetch(process.env.ALERT_WEBHOOK_URL, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ type, message, meta, timestamp: new Date().toISOString() }),
  //   }).catch(() => {});
  // }
}
