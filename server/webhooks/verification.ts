import crypto from "crypto";
import type { VerificationResult } from "@shared/webhooks";

/**
 * Verify GitHub webhook signature using HMAC-SHA256
 * GitHub sends signature in X-Hub-Signature-256 header as "sha256=<hash>"
 * @param payload - Raw Buffer containing the exact bytes GitHub signed
 * @param signature - Value from X-Hub-Signature-256 header
 * @param secret - Webhook secret configured in GitHub
 */
export function verifyGitHubSignature(
  payload: Buffer,
  signature: string | undefined,
  secret: string
): VerificationResult {
  if (!signature) {
    return { valid: false, error: "Missing X-Hub-Signature-256 header" };
  }

  if (!signature.startsWith("sha256=")) {
    return { valid: false, error: "Invalid signature format" };
  }

  // Compute HMAC-SHA256 on the raw bytes
  const hash = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  const expectedSignature = `sha256=${hash}`;

  // Use constant-time comparison to prevent timing attacks
  // First check lengths to avoid timingSafeEqual crash on mismatched lengths
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  
  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: "Signature mismatch" };
  }

  try {
    const valid = crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
    return valid ? { valid: true } : { valid: false, error: "Signature mismatch" };
  } catch (e) {
    return { valid: false, error: "Signature verification failed" };
  }
}

/**
 * Verify Taskade webhook authenticity
 * Taskade uses API token-based authentication
 */
export function verifyTaskadeWebhook(
  payload: any,
  authHeader: string | undefined,
  expectedToken: string
): VerificationResult {
  // Taskade can send auth in header or in payload
  if (authHeader) {
    // Check if Bearer token matches
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (token === expectedToken) {
      return { valid: true };
    }
  }

  // Some Taskade webhooks might include token in payload
  if (payload && payload.auth_token === expectedToken) {
    return { valid: true };
  }

  return { valid: false, error: "Invalid or missing authentication" };
}

/**
 * Extract GitHub event type from headers
 */
export function extractGitHubEvent(headers: Record<string, any>): string | null {
  const eventHeader = headers["x-github-event"];
  if (!eventHeader) {
    return null;
  }

  // Map GitHub event to internal event type
  const eventMap: Record<string, string> = {
    push: "github.push",
    pull_request: "github.pull_request",
    issues: "github.issues",
    ping: "github.ping", // GitHub sends ping event to test webhook
  };

  return eventMap[eventHeader] || `github.${eventHeader}`;
}

/**
 * Extract Taskade event type from payload
 * Taskade sends event type in the payload
 */
export function extractTaskadeEvent(payload: any): string | null {
  if (!payload || !payload.event_type) {
    return null;
  }

  // Map Taskade event types to internal format
  const eventMap: Record<string, string> = {
    task_created: "taskade.task.created",
    task_completed: "taskade.task.completed",
    task_due: "taskade.task.due",
  };

  return eventMap[payload.event_type] || `taskade.${payload.event_type}`;
}
