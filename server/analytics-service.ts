import { storage } from "./db-storage";
import type { Task } from "@shared/schema";

interface TaskAnalytics {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  completionRate: number;
  overdueTasks: number;
}

interface WorkloadDistribution {
  byUser: Array<{ userId: string; userName: string; taskCount: number; }>;
  unassigned: number;
  totalTasks: number;
}

interface ProductivityMetrics {
  tasksCompleted: number;
  averageCompletionTime: number;
  activeTasksCount: number;
  productivityScore: number;
}

class AnalyticsService {
  async getTaskAnalytics(userId?: string): Promise<TaskAnalytics> {
    const tasks = userId ? await storage.getTasks(userId) : await storage.getAllTasks();

    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};
    let completedCount = 0;
    let overdueCount = 0;

    for (const task of tasks) {
      // Count by status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;

      // Count by priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;

      // Count completed
      if (task.status === "done" || task.status === "completed") {
        completedCount++;
      }

      // Count overdue
      if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done") {
        overdueCount++;
      }
    }

    return {
      total: tasks.length,
      byStatus,
      byPriority,
      completionRate: tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0,
      overdueTasks: overdueCount,
    };
  }

  async getWorkloadDistribution(): Promise<WorkloadDistribution> {
    const tasks = await storage.getAllTasks();
    const users = await storage.getUsers();

    const userTaskCounts: Record<string, number> = {};
    let unassignedCount = 0;

    for (const task of tasks) {
      if (task.assigneeId) {
        userTaskCounts[task.assigneeId] = (userTaskCounts[task.assigneeId] || 0) + 1;
      } else {
        unassignedCount++;
      }
    }

    const byUser = Object.entries(userTaskCounts).map(([userId, count]) => {
      const user = users.find((u) => u.id === userId);
      return {
        userId,
        userName: user?.name || "Unknown",
        taskCount: count,
      };
    });

    return {
      byUser,
      unassigned: unassignedCount,
      totalTasks: tasks.length,
    };
  }

  async getIntegrationAnalytics(): Promise<{
    total: number;
    connected: number;
    disconnected: number;
    byType: Record<string, number>;
  }> {
    const integrations = await storage.getIntegrations();

    const connected = integrations.filter((i) => i.status === "connected").length;
    const byType: Record<string, number> = {};

    for (const integration of integrations) {
      byType[integration.type] = (byType[integration.type] || 0) + 1;
    }

    return {
      total: integrations.length,
      connected,
      disconnected: integrations.length - connected,
      byType,
    };
  }

  async getProductivityMetrics(userId: string): Promise<ProductivityMetrics> {
    const tasks = await storage.getTasks(userId);

    const completedTasks = tasks.filter((t) => t.status === "done" || t.status === "completed");
    const activeTasks = tasks.filter((t) => t.status === "in_progress" || t.status === "in progress");

    // Calculate average completion time (mock for now)
    const averageCompletionTime = 0; // Would need task completion timestamps

    // Calculate productivity score (0-100)
    const totalTasks = tasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
    const overdueCount = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "done"
    ).length;

    const productivityScore = Math.max(
      0,
      Math.min(100, completionRate - (overdueCount * 10))
    );

    return {
      tasksCompleted: completedTasks.length,
      averageCompletionTime,
      activeTasksCount: activeTasks.length,
      productivityScore,
    };
  }
}

export const analyticsService = new AnalyticsService();
