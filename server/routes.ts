import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./memory-storage";
import { 
  insertEmailLogSchema, 
  insertEmailTemplateSchema, 
  insertEmailDraftSchema,
  insertNoteSchema,
  insertTeamLoungeNoteSchema 
} from "@shared/schema";
import { sendEmail, formatEmailBody } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  
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

  // CRM Routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/contacts", async (req, res) => {
    try {
      const contact = await storage.createContact(req.body);
      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/companies", async (req, res) => {
    try {
      const company = await storage.createCompany(req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const deal = await storage.createDeal(req.body);
      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
