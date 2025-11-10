import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import { 
  insertEmailLogSchema, 
  insertEmailTemplateSchema, 
  insertEmailDraftSchema,
  insertNoteSchema,
  insertTeamLoungeNoteSchema 
} from "@shared/schema";
import { sendEmail, formatEmailBody } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      // Mock registration - in production, hash password and save to DB
      const { username, email, password, name, role } = req.body;
      const user = {
        id: Date.now(),
        username,
        email,
        name,
        role: role || "Team Member",
        avatar: null,
      };
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      // Mock login - in production, verify credentials
      const { username, password } = req.body;
      const user = {
        id: 1,
        username,
        email: `${username}@example.com`,
        name: "Demo User",
        role: "Executive",
        avatar: null,
      };
      res.json({ success: true, user });
    } catch (error: any) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/logout", async (req, res) => {
    res.json({ success: true });
  });

  app.get("/api/user", async (req, res) => {
    // Mock user check - in production, check session/token
    const user = {
      id: 1,
      username: "demo",
      email: "demo@example.com",
      name: "Demo User",
      role: "Executive",
      avatar: null,
    };
    res.json(user);
  });

  // CRM - Contacts routes
  app.get("/api/contacts", async (req, res) => {
    try {
      // Mock data - in production, fetch from storage
      const contacts: any[] = [];
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/contacts/:id", async (req, res) => {
    try {
      // Mock single contact
      const contact = { id: req.params.id, ...req.body };
      res.json(contact);
    } catch (error: any) {
      res.status(404).json({ error: "Contact not found" });
    }
  });

  app.patch("/api/contacts/:id", async (req, res) => {
    try {
      const contact = { id: req.params.id, ...req.body, updatedAt: new Date() };
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CRM - Companies routes
  app.get("/api/companies", async (req, res) => {
    try {
      const companies: any[] = [];
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const company = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/companies/:id", async (req, res) => {
    try {
      const company = { id: req.params.id };
      res.json(company);
    } catch (error: any) {
      res.status(404).json({ error: "Company not found" });
    }
  });

  app.delete("/api/companies/:id", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CRM - Deals routes
  app.get("/api/deals", async (req, res) => {
    try {
      const deals: any[] = [];
      res.json(deals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const deal = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const deal = { id: req.params.id };
      res.json(deal);
    } catch (error: any) {
      res.status(404).json({ error: "Deal not found" });
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const deal = { id: req.params.id, ...req.body, updatedAt: new Date() };
      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/pipeline-stages", async (req, res) => {
    try {
      const stages = [
        { id: 1, name: "Prospecting", probability: 10 },
        { id: 2, name: "Qualification", probability: 25 },
        { id: 3, name: "Proposal", probability: 50 },
        { id: 4, name: "Negotiation", probability: 75 },
        { id: 5, name: "Closed Won", probability: 100 },
      ];
      res.json(stages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Project Management - Boards routes
  app.get("/api/boards", async (req, res) => {
    try {
      const boards: any[] = [];
      res.json(boards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/boards", async (req, res) => {
    try {
      const board = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(board);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/boards/:id", async (req, res) => {
    try {
      const board = { id: req.params.id, lists: [] };
      res.json(board);
    } catch (error: any) {
      res.status(404).json({ error: "Board not found" });
    }
  });

  app.patch("/api/boards/:id", async (req, res) => {
    try {
      const board = { id: req.params.id, ...req.body };
      res.json(board);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/boards/:id", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/boards/:id/star", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Project Management - Tasks routes
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks: any[] = [];
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = { id: req.params.id };
      res.json(task);
    } catch (error: any) {
      res.status(404).json({ error: "Task not found" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const task = { id: req.params.id, ...req.body };
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft 365 OAuth routes
  app.get("/api/microsoft/oauth/status", async (req, res) => {
    try {
      // Mock OAuth status
      res.json({ connected: false });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/oauth/connect", async (req, res) => {
    try {
      // Mock OAuth connect - redirect to Microsoft
      res.json({ authUrl: "https://login.microsoftonline.com/..." });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft 365 - OneDrive routes
  app.get("/api/microsoft/onedrive/files", async (req, res) => {
    try {
      const files: any[] = [];
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft 365 - OneNote routes
  app.get("/api/microsoft/onenote/notebooks", async (req, res) => {
    try {
      const notebooks: any[] = [];
      res.json(notebooks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft 365 - Outlook routes
  app.get("/api/microsoft/outlook/messages", async (req, res) => {
    try {
      const messages: any[] = [];
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/outlook/calendar/events", async (req, res) => {
    try {
      const events: any[] = [];
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft 365 - Teams routes
  app.get("/api/microsoft/teams/teams", async (req, res) => {
    try {
      const teams: any[] = [];
      res.json(teams);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/teams/chats", async (req, res) => {
    try {
      const chats: any[] = [];
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/microsoft/teams/chats/:id/messages", async (req, res) => {
    try {
      const messages: any[] = [];
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Assistant routes
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      // Mock AI response - in production, call Anthropic Claude API
      const response = {
        message: "This is a mock AI response. In production, this would be powered by Claude AI.",
        conversationId: Date.now(),
      };
      res.json(response);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai/conversations", async (req, res) => {
    try {
      const conversations: any[] = [];
      res.json(conversations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team routes
  app.get("/api/team/members", async (req, res) => {
    try {
      const members: any[] = [];
      res.json(members);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Automation - Workflows routes
  app.get("/api/workflows", async (req, res) => {
    try {
      const workflows: any[] = [];
      res.json(workflows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/workflows", async (req, res) => {
    try {
      const workflow = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(workflow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/workflows/:id", async (req, res) => {
    try {
      const workflow = { id: req.params.id, ...req.body };
      res.json(workflow);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/workflows/:id", async (req, res) => {
    try {
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Automation - Rules routes
  app.get("/api/automation/rules", async (req, res) => {
    try {
      const rules: any[] = [];
      res.json(rules);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/automation/rules", async (req, res) => {
    try {
      const rule = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Integrations routes
  app.get("/api/integrations", async (req, res) => {
    try {
      const integrations = [
        { id: 1, provider: "hubspot", name: "HubSpot", connected: false },
        { id: 2, provider: "trello", name: "Trello", connected: false },
        { id: 3, provider: "jira", name: "Jira", connected: false },
        { id: 4, provider: "slack", name: "Slack", connected: false },
      ];
      res.json(integrations);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/:provider/connect", async (req, res) => {
    try {
      res.json({ success: true, message: "Integration connected" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/integrations/:provider/disconnect", async (req, res) => {
    try {
      res.json({ success: true, message: "Integration disconnected" });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Documents routes
  app.get("/api/documents", async (req, res) => {
    try {
      const documents: any[] = [];
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/documents", async (req, res) => {
    try {
      const document = { id: Date.now(), ...req.body, createdAt: new Date() };
      res.json(document);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Analytics routes
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const data = {
        revenue: 0,
        deals: 0,
        conversionRate: 0,
        avgDealSize: 0,
      };
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/analytics/revenue-trend", async (req, res) => {
    try {
      const data: any[] = [];
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Email routes - PA only
  app.post("/api/email/send", async (req, res) => {
    try {
      const { to, subject, body, sentBy } = req.body;
      
      // TODO: Verify user is PA role
      
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
        sentBy,
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
        sentBy: req.body.sentBy,
        status: "failed",
      });
      
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/email/logs", async (req, res) => {
    try {
      const logs = await storage.getEmailLogs();
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/email/templates", async (req, res) => {
    try {
      const data = insertEmailTemplateSchema.parse(req.body);
      const template = await storage.createEmailTemplate(data);
      res.json(template);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/email/templates", async (req, res) => {
    try {
      const templates = await storage.getEmailTemplates();
      res.json(templates);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Email draft routes
  app.post("/api/email/drafts", async (req, res) => {
    try {
      const data = insertEmailDraftSchema.parse(req.body);
      const draft = await storage.createEmailDraft(data);
      res.json(draft);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/email/drafts", async (req, res) => {
    try {
      const drafts = await storage.getEmailDrafts();
      res.json(drafts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/email/drafts/:id", async (req, res) => {
    try {
      await storage.deleteEmailDraft(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Notes routes
  app.post("/api/notes", async (req, res) => {
    try {
      const data = insertNoteSchema.parse(req.body);
      const note = await storage.createNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/notes", async (req, res) => {
    try {
      const notes = await storage.getNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notes/:id", async (req, res) => {
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

  app.delete("/api/notes/:id", async (req, res) => {
    try {
      await storage.deleteNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team Lounge routes
  app.post("/api/team-lounge", async (req, res) => {
    try {
      const data = insertTeamLoungeNoteSchema.parse(req.body);
      const note = await storage.createTeamLoungeNote(data);
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/team-lounge", async (req, res) => {
    try {
      const notes = await storage.getTeamLoungeNotes();
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/team-lounge/:id/pin", async (req, res) => {
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

  app.delete("/api/team-lounge/:id", async (req, res) => {
    try {
      await storage.deleteTeamLoungeNote(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
