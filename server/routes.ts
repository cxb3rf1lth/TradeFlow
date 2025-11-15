import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./memory-storage";
import { authService } from "./services/auth";
import { requireAuth, requireRole } from "./middleware/auth";
import { validateRequest, validateQuery, validateParams } from "./middleware/validation";
import { authLimiter, emailLimiter, apiLimiter } from "./middleware/rateLimit";
import {
  registerSchema,
  loginSchema,
  insertContactSchema,
  updateContactSchema,
  insertCompanySchema,
  updateCompanySchema,
  insertDealSchema,
  updateDealSchema,
  insertBoardSchema,
  updateBoardSchema,
  sendEmailSchema,
  insertEmailTemplateSchema,
  paginationSchema,
  idParamSchema,
} from "@shared/validation";
import { sendEmail, formatEmailBody } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {

  // ==================== AUTH ROUTES ====================

  app.post("/api/auth/register",
    authLimiter,
    validateRequest(registerSchema),
    async (req, res, next) => {
      try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.post("/api/auth/login",
    authLimiter,
    validateRequest(loginSchema),
    async (req, res, next) => {
      try {
        const { username, password } = req.body;
        const result = await authService.login(username, password);
        res.json(result);
      } catch (error: any) {
        res.status(401).json({ error: error.message });
      }
    }
  );

  app.get("/api/auth/me",
    requireAuth,
    async (req, res) => {
      res.json({ user: req.user });
    }
  );

  // ==================== EMAIL ROUTES ====================

  app.post("/api/email/send",
    requireAuth,
    emailLimiter,
    validateRequest(sendEmailSchema),
    async (req, res, next) => {
      try {
        const { to, subject, body } = req.body;

        // Format and sanitize email body
        const htmlBody = formatEmailBody(body);

        // Send email
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

        res.json({ success: true, emailLog });
      } catch (error: any) {
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
    }
  );

  app.get("/api/email/logs",
    requireAuth,
    async (req, res) => {
      try {
        const logs = await storage.getEmailLogs();
        res.json(logs);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/email/templates",
    requireAuth,
    validateRequest(insertEmailTemplateSchema),
    async (req, res) => {
      try {
        const template = await storage.createEmailTemplate({
          ...req.body,
          createdBy: req.user!.id,
        });
        res.status(201).json(template);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.get("/api/email/templates",
    requireAuth,
    async (req, res) => {
      try {
        const templates = await storage.getEmailTemplates();
        res.json(templates);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/email/drafts",
    requireAuth,
    async (req, res) => {
      try {
        const draft = await storage.createEmailDraft(req.body);
        res.status(201).json(draft);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.get("/api/email/drafts",
    requireAuth,
    async (req, res) => {
      try {
        const drafts = await storage.getEmailDrafts();
        res.json(drafts);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.delete("/api/email/drafts/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteEmailDraft(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== NOTES ROUTES ====================

  app.post("/api/notes",
    requireAuth,
    async (req, res) => {
      try {
        const note = await storage.createNote(req.body);
        res.status(201).json(note);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.get("/api/notes",
    requireAuth,
    async (req, res) => {
      try {
        const notes = await storage.getNotes();
        res.json(notes);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.patch("/api/notes/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const note = await storage.updateNote(req.params.id, req.body);
        if (!note) {
          return res.status(404).json({ error: "Note not found" });
        }
        res.json(note);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/notes/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteNote(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== TEAM LOUNGE ROUTES ====================

  app.post("/api/team-lounge",
    requireAuth,
    async (req, res) => {
      try {
        const note = await storage.createTeamLoungeNote(req.body);
        res.status(201).json(note);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.get("/api/team-lounge",
    requireAuth,
    async (req, res) => {
      try {
        const notes = await storage.getTeamLoungeNotes();
        res.json(notes);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.patch("/api/team-lounge/:id/pin",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const note = await storage.togglePinTeamLoungeNote(req.params.id);
        if (!note) {
          return res.status(404).json({ error: "Note not found" });
        }
        res.json(note);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.delete("/api/team-lounge/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteTeamLoungeNote(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== CRM ROUTES ====================

  // Contacts
  app.get("/api/contacts",
    requireAuth,
    async (req, res) => {
      try {
        const contacts = await storage.getContacts();
        res.json(contacts);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/contacts",
    requireAuth,
    validateRequest(insertContactSchema),
    async (req, res) => {
      try {
        const contact = await storage.createContact({
          ...req.body,
          ownerId: req.user!.id,
        });
        res.status(201).json(contact);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/contacts/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateRequest(updateContactSchema),
    async (req, res) => {
      try {
        const contact = await storage.updateContact(req.params.id, req.body);
        if (!contact) {
          return res.status(404).json({ error: "Contact not found" });
        }
        res.json(contact);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/contacts/:id",
    requireAuth,
    requireRole(['admin', 'manager']),
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteContact(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Companies
  app.get("/api/companies",
    requireAuth,
    async (req, res) => {
      try {
        const companies = await storage.getCompanies();
        res.json(companies);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/companies",
    requireAuth,
    validateRequest(insertCompanySchema),
    async (req, res) => {
      try {
        const company = await storage.createCompany({
          ...req.body,
          ownerId: req.user!.id,
        });
        res.status(201).json(company);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/companies/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateRequest(updateCompanySchema),
    async (req, res) => {
      try {
        const company = await storage.updateCompany(req.params.id, req.body);
        if (!company) {
          return res.status(404).json({ error: "Company not found" });
        }
        res.json(company);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/companies/:id",
    requireAuth,
    requireRole(['admin', 'manager']),
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteCompany(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Deals
  app.get("/api/deals",
    requireAuth,
    async (req, res) => {
      try {
        const deals = await storage.getDeals();
        res.json(deals);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/deals",
    requireAuth,
    validateRequest(insertDealSchema),
    async (req, res) => {
      try {
        const deal = await storage.createDeal({
          ...req.body,
          ownerId: req.user!.id,
        });
        res.status(201).json(deal);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/deals/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateRequest(updateDealSchema),
    async (req, res) => {
      try {
        const deal = await storage.updateDeal(req.params.id, req.body);
        if (!deal) {
          return res.status(404).json({ error: "Deal not found" });
        }
        res.json(deal);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/deals/:id",
    requireAuth,
    requireRole(['admin', 'manager']),
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteDeal(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== BOARD MANAGEMENT ROUTES ====================

  app.get("/api/boards",
    requireAuth,
    async (req, res) => {
      try {
        const boards = await storage.getBoards();
        res.json(boards);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/boards",
    requireAuth,
    validateRequest(insertBoardSchema),
    async (req, res) => {
      try {
        const board = await storage.createBoard({
          ...req.body,
          ownerId: req.user!.id,
        });
        res.status(201).json(board);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.get("/api/boards/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const board = await storage.getBoard(req.params.id);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        res.json(board);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.patch("/api/boards/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateRequest(updateBoardSchema),
    async (req, res) => {
      try {
        const board = await storage.updateBoard(req.params.id, req.body);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        res.json(board);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/boards/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteBoard(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Board lists
  app.get("/api/boards/:boardId/lists",
    requireAuth,
    validateParams(z.object({ boardId: z.string() })),
    async (req, res) => {
      try {
        const lists = await storage.getBoardLists(req.params.boardId);
        res.json(lists);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/boards/:boardId/lists",
    requireAuth,
    async (req, res) => {
      try {
        const list = await storage.createBoardList({ ...req.body, boardId: req.params.boardId });
        res.status(201).json(list);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/lists/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const list = await storage.updateBoardList(req.params.id, req.body);
        if (!list) {
          return res.status(404).json({ error: "List not found" });
        }
        res.json(list);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/lists/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteBoardList(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Cards
  app.get("/api/lists/:listId/cards",
    requireAuth,
    async (req, res) => {
      try {
        const cards = await storage.getCards(req.params.listId);
        res.json(cards);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/lists/:listId/cards",
    requireAuth,
    async (req, res) => {
      try {
        const card = await storage.createCard({ ...req.body, listId: req.params.listId });
        res.status(201).json(card);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/cards/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const card = await storage.updateCard(req.params.id, req.body);
        if (!card) {
          return res.status(404).json({ error: "Card not found" });
        }
        res.json(card);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.delete("/api/cards/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteCard(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== INTEGRATION ROUTES ====================

  // Get all available integrations
  app.get("/api/integrations/available",
    requireAuth,
    async (req, res) => {
      try {
        const { IntegrationFactory } = await import("./integrations/integration-factory");
        const integrations = IntegrationFactory.getAvailableIntegrations();
        res.json(integrations);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Get user's connected integrations
  app.get("/api/integrations",
    requireAuth,
    async (req, res) => {
      try {
        const integrations = await storage.getIntegrations();
        res.json(integrations);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // OAuth: Initiate authorization for an integration
  app.get("/api/integrations/:type/authorize",
    requireAuth,
    async (req, res) => {
      try {
        const { type } = req.params;
        const { IntegrationFactory } = await import("./integrations/integration-factory");
        const { OAuthHelper, OAuthStateStore } = await import("./integrations/oauth-helper");

        const connector = IntegrationFactory.createConnector(type as any);
        const state = OAuthHelper.generateState();

        // Store state with user info
        OAuthStateStore.set(state, req.user!.id, type);

        const authUrl = connector.getAuthorizationUrl(state);
        res.json({ authUrl });
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // OAuth: Callback handler for all integrations
  app.get("/api/integrations/:type/callback",
    async (req, res) => {
      try {
        const { type } = req.params;
        const { code, state } = req.query;

        if (!code || !state) {
          return res.status(400).json({ error: "Missing code or state parameter" });
        }

        const { IntegrationFactory } = await import("./integrations/integration-factory");
        const { OAuthHelper, OAuthStateStore } = await import("./integrations/oauth-helper");

        // Verify state
        const stateData = OAuthStateStore.get(state as string);
        if (!stateData) {
          return res.status(400).json({ error: "Invalid or expired state" });
        }

        // Exchange code for token
        const connector = IntegrationFactory.createConnector(type as any);
        const tokenData = await connector.exchangeCodeForToken(code as string);

        // Store token in database
        const integration = await storage.createIntegration({
          name: type,
          type: type,
          status: "connected",
        });

        // In a real implementation, store the token securely
        console.log("Integration connected:", { type, userId: stateData.userId });

        // Redirect to success page
        res.redirect(`/integrations?status=success&integration=${type}`);
      } catch (error: any) {
        console.error("OAuth callback error:", error);
        res.redirect(`/integrations?status=error&message=${encodeURIComponent(error.message)}`);
      }
    }
  );

  // Sync integration data
  app.post("/api/integrations/:type/sync",
    requireAuth,
    async (req, res) => {
      try {
        const { type } = req.params;
        const { syncType } = req.body; // contacts, companies, deals, boards, etc.

        const { IntegrationFactory } = await import("./integrations/integration-factory");
        const connector = IntegrationFactory.createConnector(type as any);

        let result;
        switch (syncType) {
          case "contacts":
            result = await connector.syncContacts();
            break;
          case "companies":
            result = await connector.syncCompanies();
            break;
          case "deals":
            result = await connector.syncDeals();
            break;
          default:
            return res.status(400).json({ error: "Invalid sync type" });
        }

        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Test integration connection
  app.post("/api/integrations/:type/test",
    requireAuth,
    async (req, res) => {
      try {
        const { type } = req.params;
        const { IntegrationFactory } = await import("./integrations/integration-factory");
        const connector = IntegrationFactory.createConnector(type as any);

        const isConnected = await connector.testConnection();
        res.json({ success: isConnected });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Disconnect integration
  app.delete("/api/integrations/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteIntegration(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== AI ROUTES (Claude) ====================

  // Analyze email
  app.post("/api/ai/analyze-email",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { subject, body, from, to } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const analysis = await claudeAI.analyzeEmail({ subject, body, from, to });
        res.json(analysis);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Analyze deal
  app.post("/api/ai/analyze-deal",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { claudeAI } = await import("./services/claude-ai");
        const insights = await claudeAI.analyzeDeal(req.body);
        res.json(insights);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Analyze contact
  app.post("/api/ai/analyze-contact",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { claudeAI } = await import("./services/claude-ai");
        const insights = await claudeAI.analyzeContact(req.body);
        res.json(insights);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Generate email response
  app.post("/api/ai/generate-email",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { originalEmail, tone, purpose, keyPoints } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const response = await claudeAI.generateEmailResponse({
          originalEmail,
          tone,
          purpose,
          keyPoints,
        });
        res.json({ response });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Analyze meeting notes
  app.post("/api/ai/analyze-meeting",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { notes } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const analysis = await claudeAI.analyzeMeetingNotes(notes);
        res.json(analysis);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Summarize text
  app.post("/api/ai/summarize",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { text, maxLength } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const summary = await claudeAI.summarizeText(text, maxLength);
        res.json({ summary });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Sentiment analysis
  app.post("/api/ai/sentiment",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { text } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const sentiment = await claudeAI.analyzeSentiment(text);
        res.json(sentiment);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Get automation suggestions
  app.post("/api/ai/suggest-automations",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { recentActivities, painPoints } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const suggestions = await claudeAI.suggestAutomations({
          userRole: req.user!.role,
          recentActivities,
          painPoints,
        });
        res.json(suggestions);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // AI Chat
  app.post("/api/ai/chat",
    requireAuth,
    apiLimiter,
    async (req, res) => {
      try {
        const { message, conversationHistory } = req.body;
        const { claudeAI } = await import("./services/claude-ai");

        const response = await claudeAI.chat(message, conversationHistory);
        res.json({ response });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== AUTOMATION ROUTES ====================

  // Get all automation rules
  app.get("/api/automations",
    requireAuth,
    async (req, res) => {
      try {
        const automations = await storage.getAutomationRules();
        res.json(automations);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Create automation rule
  app.post("/api/automations",
    requireAuth,
    async (req, res) => {
      try {
        const automation = await storage.createAutomationRule({
          ...req.body,
          createdBy: req.user!.id,
        });
        res.status(201).json(automation);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Update automation rule
  app.patch("/api/automations/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const automation = await storage.updateAutomationRule(req.params.id, req.body);
        if (!automation) {
          return res.status(404).json({ error: "Automation not found" });
        }
        res.json(automation);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Delete automation rule
  app.delete("/api/automations/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteAutomationRule(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Execute automation (manual trigger)
  app.post("/api/automations/:id/execute",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const automation = await storage.getAutomationRule(req.params.id);
        if (!automation) {
          return res.status(404).json({ error: "Automation not found" });
        }

        const { automationEngine } = await import("./services/automation-engine");
        const result = await automationEngine.executeAutomation(automation, {
          trigger: { type: "manual", data: req.body },
          user: { id: req.user!.id, role: req.user!.role },
        });

        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== WEBHOOK ROUTES ====================

  // Get all webhooks
  app.get("/api/webhooks",
    requireAuth,
    async (req, res) => {
      try {
        const webhooks = await storage.getWebhooks();
        res.json(webhooks);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Create webhook
  app.post("/api/webhooks",
    requireAuth,
    async (req, res) => {
      try {
        const { integrationId, url, events } = req.body;
        const { webhookService } = await import("./services/webhook-service");

        // Generate secret
        const secret = require("crypto").randomBytes(32).toString("hex");

        // Register webhook with external service
        const result = await webhookService.registerWebhook(
          req.body.integrationType,
          url,
          events,
          secret
        );

        if (!result.success) {
          return res.status(400).json({ error: result.message });
        }

        // Store webhook in database
        const webhook = await storage.createWebhook({
          integrationId,
          url,
          events: JSON.stringify(events),
          secret,
          externalId: result.webhookId,
        });

        res.status(201).json(webhook);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Delete webhook
  app.delete("/api/webhooks/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteWebhook(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Test webhook
  app.post("/api/webhooks/:id/test",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const webhook = await storage.getWebhook(req.params.id);
        if (!webhook) {
          return res.status(404).json({ error: "Webhook not found" });
        }

        const { webhookService } = await import("./services/webhook-service");
        const result = await webhookService.testWebhook(
          webhook.url,
          req.body.integrationType
        );

        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Webhook receiver endpoint (called by external services)
  app.post("/api/webhooks/receive/:integrationId",
    async (req, res) => {
      try {
        const { integrationId } = req.params;
        const signature = req.headers["x-webhook-signature"] as string;

        // Get webhook config from database
        const webhooks = await storage.getWebhooks();
        const webhook = webhooks.find(w => w.integrationId === integrationId);

        if (!webhook) {
          return res.status(404).json({ error: "Webhook not found" });
        }

        const { webhookService } = await import("./services/webhook-service");
        const result = await webhookService.processWebhook(
          {
            integrationId,
            integrationType: req.body.integrationType,
            event: req.body.event || "unknown",
            data: req.body,
            timestamp: new Date(),
            signature,
          },
          webhook
        );

        res.json(result);
      } catch (error: any) {
        console.error("Webhook receive error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ==================== DOCUMENT MANAGEMENT ROUTES ====================

  // Get all documents
  app.get("/api/documents",
    requireAuth,
    async (req, res) => {
      try {
        const documents = await storage.getDocuments();
        res.json(documents);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Upload document
  app.post("/api/documents",
    requireAuth,
    async (req, res) => {
      try {
        const document = await storage.createDocument({
          ...req.body,
          createdBy: req.user!.id,
        });
        res.status(201).json(document);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  // Delete document
  app.delete("/api/documents/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        await storage.deleteDocument(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Sync with OneDrive
  app.post("/api/documents/sync/onedrive",
    requireAuth,
    async (req, res) => {
      try {
        const { OneDriveConnector } = await import("./integrations/microsoft-connector");
        const connector = new OneDriveConnector();

        const result = await connector.syncFiles();
        res.json(result);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  const httpServer = createServer(app);

  return httpServer;
}
