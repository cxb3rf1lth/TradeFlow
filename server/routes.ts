import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import {
  insertEmailLogSchema,
  insertEmailTemplateSchema,
  insertEmailDraftSchema,
  insertNoteSchema,
  insertTeamLoungeNoteSchema,
  insertTaskSchema,
  insertAutomationRuleSchema,
  insertIntegrationSchema
} from "@shared/schema";
import { sendEmail, formatEmailBody } from "./email";
import { authenticate, authorize, login, register, getCurrentUser, logout, type AuthRequest } from "./auth";
import { aiService } from "./ai-service";
import { automationEngine } from "./automation-engine";
import { integrationManager } from "./integration-manager";
import { analyticsService } from "./analytics-service";

export async function registerRoutes(app: Express): Promise<Server> {

  // ============= PUBLIC ROUTES =============

  // Authentication routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.post("/api/auth/logout", logout);

  // ============= PROTECTED ROUTES =============

  // Get current user
  app.get("/api/auth/me", authenticate, getCurrentUser);

  // ============= TASK ROUTES =============

  app.get("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getTasks(req.user!.id);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertTaskSchema.parse(req.body);

      // AI categorization and priority suggestion
      if (data.description) {
        const aiSuggestions = await aiService.categorizeTask(data.description);
        data.priority = data.priority || aiSuggestions.priority;
      }

      const task = await storage.createTask(data);

      // Trigger automation rules
      await automationEngine.processTaskCreated(task);

      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertTaskSchema.partial().parse(req.body);
      const task = await storage.updateTask(req.params.id, data);

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      // Trigger automation rules
      await automationEngine.processTaskUpdated(task);

      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      await storage.deleteTask(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks/:id/assign", authenticate, async (req: AuthRequest, res) => {
    try {
      const { assigneeId } = req.body;
      const task = await storage.updateTask(req.params.id, { assigneeId });

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Bulk task operations
  app.post("/api/tasks/bulk/assign", authenticate, async (req: AuthRequest, res) => {
    try {
      const { taskIds, assigneeId } = req.body;
      const tasks = await storage.bulkAssignTasks(taskIds, assigneeId);
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/tasks/bulk/status", authenticate, async (req: AuthRequest, res) => {
    try {
      const { taskIds, status } = req.body;
      const tasks = await storage.bulkUpdateTaskStatus(taskIds, status);
      res.json(tasks);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // AI-powered task suggestions
  app.post("/api/tasks/ai/suggest-priority", authenticate, async (req: AuthRequest, res) => {
    try {
      const { description } = req.body;
      const suggestion = await aiService.suggestPriority(description);
      res.json(suggestion);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks/ai/extract-from-text", authenticate, async (req: AuthRequest, res) => {
    try {
      const { text } = req.body;
      const tasks = await aiService.extractTasksFromText(text);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= EMAIL ROUTES - PA ONLY =============

  app.post("/api/email/send", authenticate, authorize("virtual_pa"), async (req: AuthRequest, res) => {
    try {
      const { to, subject, body } = req.body;

      // Send email via Resend
      const htmlBody = formatEmailBody(body);
      const result = await sendEmail({
        to,
        subject,
        html: htmlBody,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }

      // Log the email
      const emailLog = await storage.createEmailLog({
        to,
        subject,
        body,
        sentBy: req.user!.id,
        status: "sent",
      });

      res.json({ success: true, emailLog, resendData: result.data });
    } catch (error: any) {
      console.error("Email sending error:", error);

      // Log failed email attempt
      await storage.createEmailLog({
        to: req.body.to,
        subject: req.body.subject,
        body: req.body.body,
        sentBy: req.user!.id,
        status: "failed",
      });

      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/email/logs", authenticate, async (req: AuthRequest, res) => {
    try {
      const logs = await storage.getEmailLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/email/templates", authenticate, authorize("virtual_pa"), async (req: AuthRequest, res) => {
    try {
      const data = insertEmailTemplateSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      const template = await storage.createEmailTemplate(data);
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/email/templates", authenticate, async (req: AuthRequest, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Email draft routes
  app.post("/api/email/drafts", authenticate, authorize("virtual_pa"), async (req: AuthRequest, res) => {
    try {
      const data = insertEmailDraftSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      const draft = await storage.createEmailDraft(data);
      res.json(draft);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/email/drafts", authenticate, async (req: AuthRequest, res) => {
    try {
      const drafts = await storage.getEmailDrafts();
      res.json(drafts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/email/drafts/:id", authenticate, authorize("virtual_pa"), async (req: AuthRequest, res) => {
    try {
      await storage.deleteEmailDraft(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered email drafting
  app.post("/api/email/ai/draft", authenticate, authorize("virtual_pa"), async (req: AuthRequest, res) => {
    try {
      const { context, recipient, purpose } = req.body;
      const draft = await aiService.generateEmailDraft(context, recipient, purpose);
      res.json(draft);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/email/ai/improve", authenticate, authorize("virtual_pa"), async (req: AuthRequest, res) => {
    try {
      const { body } = req.body;
      const improved = await aiService.improveEmail(body);
      res.json({ improvedBody: improved });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= NOTES ROUTES =============

  app.post("/api/notes", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertNoteSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/notes", authenticate, async (req: AuthRequest, res) => {
    try {
      const notes = await storage.getNotes(req.user!.id);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notes/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertNoteSchema.partial().parse(req.body);
      const note = await storage.updateNote(req.params.id, data);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/notes/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered note features
  app.post("/api/notes/:id/ai/summarize", authenticate, async (req: AuthRequest, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      const summary = await aiService.summarizeNote(note.content);
      res.json({ summary });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notes/:id/ai/extract-action-items", authenticate, async (req: AuthRequest, res) => {
    try {
      const note = await storage.getNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      const actionItems = await aiService.extractActionItems(note.content);
      res.json({ actionItems });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= TEAM LOUNGE ROUTES =============

  app.post("/api/team-lounge", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertTeamLoungeNoteSchema.parse({
        ...req.body,
        author: req.user!.name
      });
      const note = await storage.createTeamLoungeNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/team-lounge", authenticate, async (req: AuthRequest, res) => {
    try {
      const notes = await storage.getTeamLoungeNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/team-lounge/:id/pin", authenticate, async (req: AuthRequest, res) => {
    try {
      const note = await storage.togglePinTeamLoungeNote(req.params.id);
      if (!note) {
        return res.status(404).json({ error: "Note not found" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/team-lounge/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      await storage.deleteTeamLoungeNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= AUTOMATION ROUTES =============

  app.get("/api/automation/rules", authenticate, async (req: AuthRequest, res) => {
    try {
      const rules = await storage.getAutomationRules();
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/automation/rules", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertAutomationRuleSchema.parse({
        ...req.body,
        createdBy: req.user!.id
      });
      const rule = await storage.createAutomationRule(data);
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/automation/rules/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const data = insertAutomationRuleSchema.partial().parse(req.body);
      const rule = await storage.updateAutomationRule(req.params.id, data);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/automation/rules/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      await storage.deleteAutomationRule(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/automation/rules/:id/toggle", authenticate, async (req: AuthRequest, res) => {
    try {
      const rule = await storage.toggleAutomationRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      res.json(rule);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Test automation rule
  app.post("/api/automation/rules/:id/test", authenticate, async (req: AuthRequest, res) => {
    try {
      const rule = await storage.getAutomationRule(req.params.id);
      if (!rule) {
        return res.status(404).json({ error: "Rule not found" });
      }
      const result = await automationEngine.testRule(rule, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= INTEGRATION ROUTES =============

  app.get("/api/integrations", authenticate, async (req: AuthRequest, res) => {
    try {
      const integrations = await storage.getIntegrations();
      res.json(integrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/:type/connect", authenticate, async (req: AuthRequest, res) => {
    try {
      const { type } = req.params;
      const { credentials } = req.body;
      const integration = await integrationManager.connect(type, credentials);
      res.json(integration);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/integrations/:id/disconnect", authenticate, async (req: AuthRequest, res) => {
    try {
      await integrationManager.disconnect(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/:id/sync", authenticate, async (req: AuthRequest, res) => {
    try {
      const result = await integrationManager.sync(req.params.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/integrations/:id/status", authenticate, async (req: AuthRequest, res) => {
    try {
      const status = await integrationManager.getStatus(req.params.id);
      res.json(status);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= ANALYTICS ROUTES =============

  app.get("/api/analytics/tasks", authenticate, async (req: AuthRequest, res) => {
    try {
      const analytics = await analyticsService.getTaskAnalytics(req.user!.id);
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/workload", authenticate, async (req: AuthRequest, res) => {
    try {
      const workload = await analyticsService.getWorkloadDistribution();
      res.json(workload);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/integrations", authenticate, async (req: AuthRequest, res) => {
    try {
      const analytics = await analyticsService.getIntegrationAnalytics();
      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/productivity", authenticate, async (req: AuthRequest, res) => {
    try {
      const productivity = await analyticsService.getProductivityMetrics(req.user!.id);
      res.json(productivity);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI-powered insights
  app.get("/api/analytics/ai/insights", authenticate, async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getTasks(req.user!.id);
      const insights = await aiService.generateInsights(tasks);
      res.json(insights);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/ai/recommendations", authenticate, async (req: AuthRequest, res) => {
    try {
      const tasks = await storage.getTasks(req.user!.id);
      const recommendations = await aiService.generateRecommendations(tasks);
      res.json(recommendations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============= USERS ROUTES =============

  app.get("/api/users", authenticate, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getUsers();
      // Don't send passwords
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
