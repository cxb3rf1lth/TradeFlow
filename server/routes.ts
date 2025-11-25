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
  insertBoardListSchema,
  updateBoardListSchema,
  insertCardSchema,
  updateCardSchema,
  sendEmailSchema,
  insertEmailTemplateSchema,
  paginationSchema,
  idParamSchema,
} from "@shared/validation";
import { sendEmail, formatEmailBody } from "./email";
import {
  insertNoteSchema,
  insertTeamLoungeNoteSchema,
  insertEmailDraftSchema,
  type InsertNote,
  type InsertTeamLoungeNote,
} from "@shared/schema";
import { sanitizeHtml, stripHtml } from "./utils/sanitize";

const sanitizeNoteInput = (note: InsertNote): InsertNote => ({
  ...note,
  title: stripHtml(note.title).trim(),
  content: sanitizeHtml(note.content),
});

const sanitizeNoteUpdate = (update: Partial<InsertNote>): Partial<InsertNote> => {
  const sanitized: Partial<InsertNote> = { ...update };

  if (typeof update.title === "string") {
    sanitized.title = stripHtml(update.title).trim();
  }

  if (typeof update.content === "string") {
    sanitized.content = sanitizeHtml(update.content);
  }

  return sanitized;
};

const sanitizeTeamLoungeInput = (note: InsertTeamLoungeNote): InsertTeamLoungeNote => ({
  ...note,
  author: stripHtml(note.author).trim(),
  type: stripHtml(note.type || "note").trim() || "note",
  content: sanitizeHtml(note.content),
});

export async function registerRoutes(app: Express): Promise<Server> {

  app.get("/api/system/health", async (_req, res) => {
    let storageHealthy = true;

    try {
      await storage.getEmailLogs();
    } catch (error) {
      console.error("Storage health check failed:", error);
      storageHealthy = false;
    }

    res.json({
      status: storageHealthy ? "ok" : "degraded",
      uptimeInSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
      environment: {
        node: process.version,
        region: process.env.AWS_REGION || null,
        commit: process.env.VERCEL_GIT_COMMIT_SHA || process.env.RENDER_GIT_COMMIT || null,
      },
      services: {
        storage: storageHealthy ? "ok" : "error",
      },
    });
  });

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
        const logs = (await storage.getEmailLogs()).filter(
          (log) => log.sentBy === req.user!.id
        );
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
        const templates = (await storage.getEmailTemplates()).filter(
          (template) => template.createdBy === req.user!.id
        );
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
        const draftData = insertEmailDraftSchema.parse({
          ...req.body,
          createdBy: req.user!.id,
        });
        const draft = await storage.createEmailDraft(draftData);
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
        const drafts = (await storage.getEmailDrafts()).filter(
          (draft) => draft.createdBy === req.user!.id
        );
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
        const draft = await storage.getEmailDraft(req.params.id);
        if (!draft) {
          return res.status(404).json({ error: "Draft not found" });
        }
        if (draft.createdBy !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        if (!req.user) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const parsed = insertNoteSchema.parse({
          ...req.body,
          createdBy: req.user.id,
        });
        const note = await storage.createNote(sanitizeNoteInput(parsed));
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
        const notes = (await storage.getNotes()).filter(
          (note) => note.createdBy === req.user!.id
        );
        res.json(notes);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  const updateNoteSchema = insertNoteSchema.partial();

  app.patch("/api/notes/:id",
    requireAuth,
    validateParams(idParamSchema),
    async (req, res) => {
      try {
        const parsed = updateNoteSchema.parse(req.body);
        const existing = await storage.getNote(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Note not found" });
        }
        if (existing.createdBy !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const note = await storage.updateNote(req.params.id, sanitizeNoteUpdate(parsed));
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
        const existing = await storage.getNote(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Note not found" });
        }
        if (existing.createdBy !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        if (!req.user) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const parsed = insertTeamLoungeNoteSchema.parse({
          ...req.body,
          author: req.user.username || req.user.id,
        });
        const note = await storage.createTeamLoungeNote(sanitizeTeamLoungeInput(parsed));
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
        const username = req.user?.username || req.user!.id;
        const notes = (await storage.getTeamLoungeNotes()).filter(
          (note) => note.author === username
        );
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
        const username = req.user?.username || req.user!.id;
        const existing = await storage.getTeamLoungeNote(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Note not found" });
        }
        if (existing.author !== username) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const note = await storage.togglePinTeamLoungeNote(req.params.id);
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
        const username = req.user?.username || req.user!.id;
        const existing = await storage.getTeamLoungeNote(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Note not found" });
        }
        if (existing.author !== username) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        const contacts = (await storage.getContacts()).filter(
          (contact) => contact.ownerId === req.user!.id
        );
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
        const existing = await storage.getContact(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Contact not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const contact = await storage.updateContact(req.params.id, {
          ...req.body,
          ownerId: req.user!.id,
        });
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
        const existing = await storage.getContact(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Contact not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        const companies = (await storage.getCompanies()).filter(
          (company) => company.ownerId === req.user!.id
        );
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
        const existing = await storage.getCompany(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Company not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const company = await storage.updateCompany(req.params.id, {
          ...req.body,
          ownerId: req.user!.id,
        });
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
        const existing = await storage.getCompany(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Company not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        const deals = (await storage.getDeals()).filter(
          (deal) => deal.ownerId === req.user!.id
        );
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
        const existing = await storage.getDeal(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Deal not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const deal = await storage.updateDeal(req.params.id, {
          ...req.body,
          ownerId: req.user!.id,
        });
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
        const existing = await storage.getDeal(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Deal not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        const boards = (await storage.getBoards()).filter(
          (board) => board.ownerId === req.user!.id
        );
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
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
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
        const existing = await storage.getBoard(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const board = await storage.updateBoard(req.params.id, req.body);
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
        const existing = await storage.getBoard(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (existing.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
        const board = await storage.getBoard(req.params.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const lists = await storage.getBoardLists(req.params.boardId);
        res.json(lists);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/boards/:boardId/lists",
    requireAuth,
    validateParams(z.object({ boardId: z.string() })),
    validateRequest(insertBoardListSchema),
    async (req, res) => {
      try {
        const board = await storage.getBoard(req.params.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const list = await storage.createBoardList({
          ...req.body,
          boardId: req.params.boardId,
        });
        res.status(201).json(list);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/lists/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateRequest(updateBoardListSchema),
    async (req, res) => {
      try {
        const existing = await storage.getBoardList(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "List not found" });
        }
        const board = await storage.getBoard(existing.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const list = await storage.updateBoardList(req.params.id, req.body);
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
        const existing = await storage.getBoardList(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "List not found" });
        }
        const board = await storage.getBoard(existing.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
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
    validateParams(z.object({ listId: z.string() })),
    async (req, res) => {
      try {
        const list = await storage.getBoardList(req.params.listId);
        if (!list) {
          return res.status(404).json({ error: "List not found" });
        }
        const board = await storage.getBoard(list.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const cards = await storage.getCards(req.params.listId);
        res.json(cards);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post("/api/lists/:listId/cards",
    requireAuth,
    validateParams(z.object({ listId: z.string() })),
    validateRequest(insertCardSchema),
    async (req, res) => {
      try {
        const list = await storage.getBoardList(req.params.listId);
        if (!list) {
          return res.status(404).json({ error: "List not found" });
        }
        const board = await storage.getBoard(list.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const card = await storage.createCard({
          ...req.body,
          listId: req.params.listId,
          boardId: list.boardId,
        });
        res.status(201).json(card);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    }
  );

  app.patch("/api/cards/:id",
    requireAuth,
    validateParams(idParamSchema),
    validateRequest(updateCardSchema),
    async (req, res) => {
      try {
        const existing = await storage.getCard(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Card not found" });
        }
        const board = await storage.getBoard(existing.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        const card = await storage.updateCard(req.params.id, req.body);
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
        const existing = await storage.getCard(req.params.id);
        if (!existing) {
          return res.status(404).json({ error: "Card not found" });
        }
        const board = await storage.getBoard(existing.boardId);
        if (!board) {
          return res.status(404).json({ error: "Board not found" });
        }
        if (board.ownerId !== req.user!.id) {
          return res.status(403).json({ error: "Forbidden" });
        }
        await storage.deleteCard(req.params.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  const httpServer = createServer(app);

  return httpServer;
}
