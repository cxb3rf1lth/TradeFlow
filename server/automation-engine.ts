import { storage } from "./db-storage";
import type { Task, AutomationRule } from "@shared/schema";
import { sendEmail, formatEmailBody } from "./email";

interface TriggerContext {
  task?: Task;
  [key: string]: any;
}

class AutomationEngine {
  async processTaskCreated(task: Task): Promise<void> {
    const rules = await storage.getAutomationRules();
    const activeRules = rules.filter((r) => r.enabled && r.trigger === "task_created");

    for (const rule of activeRules) {
      await this.executeRule(rule, { task });
    }
  }

  async processTaskUpdated(task: Task): Promise<void> {
    const rules = await storage.getAutomationRules();
    const activeRules = rules.filter((r) => r.enabled && r.trigger === "task_updated");

    for (const rule of activeRules) {
      await this.executeRule(rule, { task });
    }
  }

  async executeRule(rule: AutomationRule, context: TriggerContext): Promise<void> {
    try {
      // Parse action from JSON
      const action = typeof rule.action === "string" ? JSON.parse(rule.action) : rule.action;

      switch (action.type) {
        case "assign_task":
          if (context.task && action.assigneeId) {
            await storage.updateTask(context.task.id, {
              assigneeId: action.assigneeId,
            });
          }
          break;

        case "update_priority":
          if (context.task && action.priority) {
            await storage.updateTask(context.task.id, {
              priority: action.priority,
            });
          }
          break;

        case "update_status":
          if (context.task && action.status) {
            await storage.updateTask(context.task.id, {
              status: action.status,
            });
          }
          break;

        case "send_email":
          if (action.to && action.subject && action.body) {
            await sendEmail({
              to: action.to,
              subject: action.subject,
              html: formatEmailBody(action.body),
            });
          }
          break;

        case "create_task":
          if (action.title) {
            await storage.createTask({
              title: action.title,
              description: action.description || "",
              status: action.status || "todo",
              priority: action.priority || "medium",
              source: "automation",
              sourceId: rule.id,
            });
          }
          break;

        default:
          console.warn(`Unknown automation action type: ${action.type}`);
      }

      console.log(`Automation rule executed: ${rule.name}`);
    } catch (error) {
      console.error(`Error executing automation rule ${rule.name}:`, error);
    }
  }

  async testRule(rule: AutomationRule, testContext: TriggerContext): Promise<{ success: boolean; message: string }> {
    try {
      // Don't actually execute, just validate
      const action = typeof rule.action === "string" ? JSON.parse(rule.action) : rule.action;

      if (!action.type) {
        return {
          success: false,
          message: "Action type is required",
        };
      }

      return {
        success: true,
        message: `Rule validation passed. Would execute: ${action.type}`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Validation failed: ${error.message}`,
      };
    }
  }

  // Schedule-based automation (called periodically)
  async processScheduledRules(): Promise<void> {
    const rules = await storage.getAutomationRules();
    const scheduledRules = rules.filter((r) => r.enabled && r.trigger === "scheduled");

    for (const rule of scheduledRules) {
      await this.executeRule(rule, {});
    }
  }
}

export const automationEngine = new AutomationEngine();
