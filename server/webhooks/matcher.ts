import { db } from "../db";
import { workflows, type Workflow } from "@shared/schema";
import { eq, and } from "drizzle-orm";

/**
 * Find all active workflows that should be triggered by a webhook event
 */
export async function findMatchingWorkflows(
  service: string,
  eventType: string
): Promise<Workflow[]> {
  try {
    // Find workflows where:
    // 1. Source service matches
    // 2. Status is "active"
    // 3. Trigger type is "webhook"
    // 4. Trigger event matches
    const results = await db
      .select()
      .from(workflows)
      .where(
        and(
          eq(workflows.sourceService, service),
          eq(workflows.status, "active")
        )
      );

    // Filter in-memory for webhook trigger type and event match
    // This is necessary because config.trigger is JSONB
    const matchingWorkflows = results.filter((workflow) => {
      const trigger = workflow.config?.trigger;
      if (!trigger || trigger.type !== "webhook") {
        return false;
      }

      // Check if event type matches
      return trigger.event === eventType;
    });

    return matchingWorkflows;
  } catch (error) {
    console.error("Error finding matching workflows:", error);
    return [];
  }
}

/**
 * Check if workflow filters match the event payload
 */
export function matchesFilters(
  workflow: Workflow,
  payload: any
): boolean {
  const filters = workflow.config?.filters;
  if (!filters || filters.length === 0) {
    return true; // No filters means all events pass
  }

  // Apply each filter
  for (const filter of filters) {
    const field = filter.field;
    const operator = filter.operator;
    const value = filter.value;

    // Get the field value from payload (supports nested paths like "repository.name")
    const fieldValue = getNestedValue(payload, field);

    // Check if filter matches
    if (!matchesCondition(fieldValue, operator, value)) {
      return false;
    }
  }

  return true;
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: any, path: string): any {
  return path.split(".").reduce((current, key) => current?.[key], obj);
}

/**
 * Check if a value matches a filter condition
 */
function matchesCondition(
  actual: any,
  operator: string,
  expected: any
): boolean {
  switch (operator) {
    case "equals":
      return actual === expected;
    case "not_equals":
      return actual !== expected;
    case "contains":
      return typeof actual === "string" && actual.includes(expected);
    case "starts_with":
      return typeof actual === "string" && actual.startsWith(expected);
    case "ends_with":
      return typeof actual === "string" && actual.endsWith(expected);
    case "greater_than":
      return actual > expected;
    case "less_than":
      return actual < expected;
    default:
      return false;
  }
}
