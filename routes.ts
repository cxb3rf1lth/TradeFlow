import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage";
import {
  insertEmailLogSchema,
  insertEmailTemplateSchema,
  insertEmailDraftSchema,
  insertNoteSchema,
  insertTeamLoungeNoteSchema,
  insertContactSchema,
  insertCompanySchema,
  insertDealSchema,
  insertPipelineSchema,
  insertPipelineStageSchema,
  insertBoardSchema,
  insertBoardListSchema,
  insertCardSchema,
  insertCardChecklistSchema,
  insertCardCommentSchema,
  insertIntegrationSchema,
  insertIntegrationCredentialSchema,
  insertIntegrationConfigSchema,
  insertWebhookSchema,
  insertNotificationSchema,
  insertDocumentSchema,
  insertActivitySchema,
  insertWorkflowTemplateSchema,
  insertWorkflowStepSchema,
  insertWorkflowExecutionSchema,
  insertAiConversationSchema,
  insertAiMessageSchema,
  insertAiInsightSchema,
  insertOneDriveFileSchema,
  insertOneNoteNotebookSchema,
  insertOneNoteSectionSchema,
  insertOneNotePageSchema,
  insertOutlookCalendarSchema,
  insertOutlookEventSchema,
  insertOutlookContactSchema,
  insertOutlookEmailSchema,
  insertTeamsChannelSchema,
  insertTeamsMessageSchema,
  insertTeamsChatSchema,
  insertTeamsChatMessageSchema,
  insertTeamsMeetingSchema,
} from "./schema";
import { sendEmail, formatEmailBody } from "./email";
import { ClaudeAIService } from "./claude-ai";
import { MicrosoftGraphService } from "./microsoft-graph";
import { ConnectorFactory } from "./connectors";
import {
  SlackConnector,
  GoogleWorkspaceConnector,
  SalesforceConnector,
  ZendeskConnector,
} from "./integrations-extended";

export async function registerRoutes(app: Express): Promise<Server> {

  // Initialize AI service
  const aiService = process.env.ANTHROPIC_API_KEY
    ? new ClaudeAIService(process.env.ANTHROPIC_API_KEY)
    : null;

  // ========== CRM ROUTES ==========

  // Contacts
  app.get("/api/crm/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crm/contacts", async (req, res) => {
    try {
      const data = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(data);

      // Log activity
      await storage.createActivity({
        type: "crm",
        action: "create",
        userId: req.body.ownerId || "system",
        entityType: "contact",
        entityId: contact.id,
        metadata: { name: `${data.firstName} ${data.lastName}` },
      });

      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/crm/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.getContact(req.params.id);
      res.json(contact);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.patch("/api/crm/contacts/:id", async (req, res) => {
    try {
      const contact = await storage.updateContact(req.params.id, req.body);

      await storage.createActivity({
        type: "crm",
        action: "update",
        userId: req.body.userId || "system",
        entityType: "contact",
        entityId: req.params.id,
        metadata: req.body,
      });

      res.json(contact);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/crm/contacts/:id", async (req, res) => {
    try {
      await storage.deleteContact(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Companies
  app.get("/api/crm/companies", async (req, res) => {
    try {
      const companies = await storage.getCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crm/companies", async (req, res) => {
    try {
      const data = insertCompanySchema.parse(req.body);
      const company = await storage.createCompany(data);

      await storage.createActivity({
        type: "crm",
        action: "create",
        userId: req.body.ownerId || "system",
        entityType: "company",
        entityId: company.id,
        metadata: { name: data.name },
      });

      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/crm/companies/:id", async (req, res) => {
    try {
      const company = await storage.getCompany(req.params.id);
      res.json(company);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.patch("/api/crm/companies/:id", async (req, res) => {
    try {
      const company = await storage.updateCompany(req.params.id, req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/crm/companies/:id", async (req, res) => {
    try {
      await storage.deleteCompany(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deals
  app.get("/api/crm/deals", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crm/deals", async (req, res) => {
    try {
      const data = insertDealSchema.parse(req.body);
      const deal = await storage.createDeal(data);

      await storage.createActivity({
        type: "crm",
        action: "create",
        userId: req.body.ownerId || "system",
        entityType: "deal",
        entityId: deal.id,
        metadata: { title: data.title, value: data.value },
      });

      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/crm/deals/:id", async (req, res) => {
    try {
      const deal = await storage.getDeal(req.params.id);
      res.json(deal);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.patch("/api/crm/deals/:id", async (req, res) => {
    try {
      const deal = await storage.updateDeal(req.params.id, req.body);
      res.json(deal);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/crm/deals/:id", async (req, res) => {
    try {
      await storage.deleteDeal(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Pipelines
  app.get("/api/crm/pipelines", async (req, res) => {
    try {
      const pipelines = await storage.getPipelines();
      res.json(pipelines);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crm/pipelines", async (req, res) => {
    try {
      const data = insertPipelineSchema.parse(req.body);
      const pipeline = await storage.createPipeline(data);
      res.json(pipeline);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/crm/pipelines/:id/stages", async (req, res) => {
    try {
      const stages = await storage.getPipelineStages(req.params.id);
      res.json(stages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/crm/pipelines/:id/stages", async (req, res) => {
    try {
      const data = insertPipelineStageSchema.parse({
        ...req.body,
        pipelineId: req.params.id,
      });
      const stage = await storage.createPipelineStage(data);
      res.json(stage);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== PROJECT MANAGEMENT ROUTES ==========

  // Boards
  app.get("/api/boards", async (req, res) => {
    try {
      const boards = await storage.getBoards();
      res.json(boards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/boards", async (req, res) => {
    try {
      const data = insertBoardSchema.parse(req.body);
      const board = await storage.createBoard(data);

      await storage.createActivity({
        type: "project",
        action: "create",
        userId: req.body.ownerId,
        entityType: "board",
        entityId: board.id,
        metadata: { name: data.name },
      });

      res.json(board);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/boards/:id", async (req, res) => {
    try {
      const board = await storage.getBoard(req.params.id);
      res.json(board);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.patch("/api/boards/:id", async (req, res) => {
    try {
      const board = await storage.updateBoard(req.params.id, req.body);
      res.json(board);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/boards/:id", async (req, res) => {
    try {
      await storage.deleteBoard(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Board Lists
  app.get("/api/boards/:id/lists", async (req, res) => {
    try {
      const lists = await storage.getBoardLists(req.params.id);
      res.json(lists);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/boards/:id/lists", async (req, res) => {
    try {
      const data = insertBoardListSchema.parse({
        ...req.body,
        boardId: req.params.id,
      });
      const list = await storage.createBoardList(data);
      res.json(list);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Cards
  app.get("/api/boards/:id/cards", async (req, res) => {
    try {
      const cards = await storage.getBoardCards(req.params.id);
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cards", async (req, res) => {
    try {
      const data = insertCardSchema.parse(req.body);
      const card = await storage.createCard(data);

      await storage.createActivity({
        type: "project",
        action: "create",
        userId: req.body.createdBy,
        entityType: "card",
        entityId: card.id,
        metadata: { title: data.title },
      });

      res.json(card);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/cards/:id", async (req, res) => {
    try {
      const card = await storage.getCard(req.params.id);
      res.json(card);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.patch("/api/cards/:id", async (req, res) => {
    try {
      const card = await storage.updateCard(req.params.id, req.body);
      res.json(card);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/cards/:id", async (req, res) => {
    try {
      await storage.deleteCard(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Card Comments
  app.get("/api/cards/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getCardComments(req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/cards/:id/comments", async (req, res) => {
    try {
      const data = insertCardCommentSchema.parse({
        ...req.body,
        cardId: req.params.id,
      });
      const comment = await storage.createCardComment(data);
      res.json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ========== MICROSOFT 365 INTEGRATION ROUTES ==========

  // OneDrive
  app.get("/api/onedrive/files", async (req, res) => {
    try {
      const { userId, path } = req.query;
      const files = await storage.getOneDriveFiles(userId as string, path as string);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/onedrive/sync", async (req, res) => {
    try {
      const { userId, accessToken } = req.body;

      const graphService = new MicrosoftGraphService({
        getAccessToken: async () => accessToken,
      });

      const driveItems = await graphService.listDriveItems("/");

      // Store files in database
      for (const item of driveItems) {
        await storage.createOneDriveFile({
          userId,
          microsoftId: item.id,
          name: item.name,
          path: item.parentReference?.path || "/",
          type: item.folder ? "folder" : "file",
          mimeType: item.file?.mimeType,
          size: item.size,
          driveId: item.parentReference?.driveId,
          webUrl: item.webUrl,
          downloadUrl: item["@microsoft.graph.downloadUrl"],
          isSynced: true,
        });
      }

      res.json({ success: true, synced: driveItems.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // OneNote
  app.get("/api/onenote/notebooks", async (req, res) => {
    try {
      const { userId } = req.query;
      const notebooks = await storage.getOneNoteNotebooks(userId as string);
      res.json(notebooks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/onenote/sync", async (req, res) => {
    try {
      const { userId, accessToken } = req.body;

      const graphService = new MicrosoftGraphService({
        getAccessToken: async () => accessToken,
      });

      const notebooks = await graphService.listNotebooks();

      for (const notebook of notebooks) {
        await storage.createOneNoteNotebook({
          userId,
          microsoftId: notebook.id,
          displayName: notebook.displayName,
          isDefault: notebook.isDefault || false,
          isShared: notebook.isShared || false,
          webUrl: notebook.links?.oneNoteWebUrl?.href,
        });

        // Sync sections
        const sections = await graphService.listSections(notebook.id);
        for (const section of sections) {
          await storage.createOneNoteSection({
            notebookId: notebook.id,
            microsoftId: section.id,
            displayName: section.displayName,
            webUrl: section.links?.oneNoteWebUrl?.href,
          });
        }
      }

      res.json({ success: true, synced: notebooks.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Outlook Calendar
  app.get("/api/outlook/calendars", async (req, res) => {
    try {
      const { userId } = req.query;
      const calendars = await storage.getOutlookCalendars(userId as string);
      res.json(calendars);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/outlook/events", async (req, res) => {
    try {
      const { calendarId, startDate, endDate } = req.query;
      const events = await storage.getOutlookEvents(
        calendarId as string,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/outlook/events", async (req, res) => {
    try {
      const data = insertOutlookEventSchema.parse(req.body);
      const event = await storage.createOutlookEvent(data);
      res.json(event);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Outlook Mail
  app.get("/api/outlook/emails", async (req, res) => {
    try {
      const { userId } = req.query;
      const emails = await storage.getOutlookEmails(userId as string);
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/outlook/sync", async (req, res) => {
    try {
      const { userId, accessToken } = req.body;

      const graphService = new MicrosoftGraphService({
        getAccessToken: async () => accessToken,
      });

      const emails = await graphService.listEmails("inbox", 50);

      for (const email of emails) {
        await storage.createOutlookEmail({
          userId,
          microsoftId: email.id,
          conversationId: email.conversationId,
          subject: email.subject,
          bodyPreview: email.bodyPreview,
          body: email.body?.content || "",
          from: email.from,
          toRecipients: email.toRecipients,
          ccRecipients: email.ccRecipients || [],
          bccRecipients: email.bccRecipients || [],
          hasAttachments: email.hasAttachments,
          attachments: email.attachments || [],
          importance: email.importance,
          isRead: email.isRead,
          isDraft: email.isDraft,
          receivedDateTime: new Date(email.receivedDateTime),
          sentDateTime: email.sentDateTime ? new Date(email.sentDateTime) : null,
          webUrl: email.webUrl,
        });
      }

      res.json({ success: true, synced: emails.length });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Microsoft Teams
  app.get("/api/teams/channels", async (req, res) => {
    try {
      const { userId } = req.query;
      const channels = await storage.getTeamsChannels(userId as string);
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/teams/chats", async (req, res) => {
    try {
      const { userId } = req.query;
      const chats = await storage.getTeamsChats(userId as string);
      res.json(chats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/teams/sync", async (req, res) => {
    try {
      const { userId, accessToken } = req.body;

      const graphService = new MicrosoftGraphService({
        getAccessToken: async () => accessToken,
      });

      const teams = await graphService.listJoinedTeams();

      let syncedCount = 0;
      for (const team of teams) {
        const channels = await graphService.listChannels(team.id);

        for (const channel of channels) {
          await storage.createTeamsChannel({
            userId,
            teamId: team.id,
            microsoftId: channel.id,
            displayName: channel.displayName,
            description: channel.description,
            email: channel.email,
            webUrl: channel.webUrl,
          });
          syncedCount++;
        }
      }

      res.json({ success: true, synced: syncedCount });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== CLAUDE AI ROUTES ==========

  app.post("/api/ai/analyze-email", async (req, res) => {
    try {
      if (!aiService) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { emailContent, subject } = req.body;
      const analysis = await aiService.analyzeEmail(emailContent, subject);

      // Store insight
      await storage.createAiInsight({
        userId: req.body.userId || "system",
        type: "email_analysis",
        entityType: "email",
        entityId: req.body.emailId,
        insight: JSON.stringify(analysis),
        confidence: analysis.confidence,
      });

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/generate-reply", async (req, res) => {
    try {
      if (!aiService) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { emailContent, subject, context } = req.body;
      const reply = await aiService.generateEmailReply(emailContent, subject, context);

      res.json({ reply });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      if (!aiService) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { conversationId, message, userId } = req.body;

      // Get conversation history
      let conversation;
      if (conversationId) {
        conversation = await storage.getAiConversation(conversationId);
      } else {
        // Create new conversation
        conversation = await storage.createAiConversation({
          userId,
          title: message.substring(0, 50),
        });
      }

      const messages = await storage.getAiMessages(conversation.id);

      // Add user message
      await storage.createAiMessage({
        conversationId: conversation.id,
        role: "user",
        content: message,
      });

      // Get AI response
      const response = await aiService.chat([
        ...messages.map(m => ({ role: m.role as any, content: m.content })),
        { role: "user", content: message },
      ]);

      // Save AI response
      await storage.createAiMessage({
        conversationId: conversation.id,
        role: "assistant",
        content: response.content,
        tokens: response.tokens?.total_tokens,
      });

      res.json({
        conversationId: conversation.id,
        response: response.content
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze-contact", async (req, res) => {
    try {
      if (!aiService) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { contact, interactions } = req.body;
      const analysis = await aiService.analyzeContact({
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.email,
        company: contact.company,
        interactions,
      });

      await storage.createAiInsight({
        userId: req.body.userId || "system",
        type: "contact_analysis",
        entityType: "contact",
        entityId: contact.id,
        insight: JSON.stringify(analysis),
      });

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze-deal", async (req, res) => {
    try {
      if (!aiService) {
        return res.status(503).json({ error: "AI service not configured" });
      }

      const { deal, contactHistory } = req.body;
      const analysis = await aiService.suggestDealProbability({
        title: deal.title,
        value: parseFloat(deal.value),
        stage: deal.stage,
        age: deal.age,
        contactHistory,
      });

      await storage.createAiInsight({
        userId: req.body.userId || "system",
        type: "deal_probability",
        entityType: "deal",
        entityId: deal.id,
        insight: JSON.stringify(analysis),
      });

      res.json(analysis);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== INTEGRATION CONNECTOR ROUTES ==========

  app.post("/api/integrations/hubspot/sync", async (req, res) => {
    try {
      const { accessToken, userId } = req.body;

      const connector = ConnectorFactory.createConnector("hubspot", { accessToken });
      const result = await connector.syncToTradeFlow();

      await storage.createIntegrationLog({
        integrationId: "hubspot",
        action: "sync",
        status: result.success ? "success" : "error",
        message: `Synced ${result.synced} items`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/trello/sync", async (req, res) => {
    try {
      const { apiKey, accessToken, userId } = req.body;

      const connector = ConnectorFactory.createConnector("trello", { apiKey, accessToken });
      const result = await connector.syncToTradeFlow();

      await storage.createIntegrationLog({
        integrationId: "trello",
        action: "sync",
        status: result.success ? "success" : "error",
        message: `Synced ${result.synced} items`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/bigin/sync", async (req, res) => {
    try {
      const { accessToken, userId } = req.body;

      const connector = ConnectorFactory.createConnector("bigin", { accessToken });
      const result = await connector.syncToTradeFlow();

      await storage.createIntegrationLog({
        integrationId: "bigin",
        action: "sync",
        status: result.success ? "success" : "error",
        message: `Synced ${result.synced} items`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Slack Integration
  app.post("/api/integrations/slack/send-message", async (req, res) => {
    try {
      const { token, channel, text, attachments } = req.body;
      const connector = new SlackConnector(token);
      const result = await connector.sendMessage(channel, text, attachments);

      await storage.createIntegrationLog({
        integrationId: "slack",
        action: "send_message",
        status: "success",
        message: `Message sent to ${channel}`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/integrations/slack/channels", async (req, res) => {
    try {
      const { token } = req.query;
      const connector = new SlackConnector(token as string);
      const channels = await connector.listChannels();
      res.json(channels);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Google Workspace Integration
  app.get("/api/integrations/google/emails", async (req, res) => {
    try {
      const { accessToken, maxResults } = req.query;
      const connector = new GoogleWorkspaceConnector(accessToken as string);
      const emails = await connector.listEmails(maxResults ? parseInt(maxResults as string) : 10);
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/google/send-email", async (req, res) => {
    try {
      const { accessToken, to, subject, body } = req.body;
      const connector = new GoogleWorkspaceConnector(accessToken);
      const result = await connector.sendEmail(to, subject, body);

      await storage.createIntegrationLog({
        integrationId: "google",
        action: "send_email",
        status: "success",
        message: `Email sent to ${to}`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/integrations/google/drive/files", async (req, res) => {
    try {
      const { accessToken } = req.query;
      const connector = new GoogleWorkspaceConnector(accessToken as string);
      const files = await connector.listDriveFiles();
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Salesforce Integration
  app.get("/api/integrations/salesforce/accounts", async (req, res) => {
    try {
      const { instanceUrl, accessToken } = req.query;
      const connector = new SalesforceConnector(instanceUrl as string, accessToken as string);
      const accounts = await connector.getAccounts();
      res.json(accounts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/salesforce/sync", async (req, res) => {
    try {
      const { instanceUrl, accessToken, userId } = req.body;
      const connector = new SalesforceConnector(instanceUrl, accessToken);
      const result = await connector.syncToTradeFlow();

      await storage.createIntegrationLog({
        integrationId: "salesforce",
        action: "sync",
        status: result.success ? "success" : "error",
        message: `Synced ${result.synced} items`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/integrations/salesforce/opportunities", async (req, res) => {
    try {
      const { instanceUrl, accessToken } = req.query;
      const connector = new SalesforceConnector(instanceUrl as string, accessToken as string);
      const opportunities = await connector.getOpportunities();
      res.json(opportunities);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Zendesk Integration
  app.get("/api/integrations/zendesk/tickets", async (req, res) => {
    try {
      const { subdomain, email, apiToken } = req.query;
      const connector = new ZendeskConnector(subdomain as string, email as string, apiToken as string);
      const tickets = await connector.getTickets();
      res.json(tickets);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/zendesk/tickets", async (req, res) => {
    try {
      const { subdomain, email, apiToken, subject, description, priority, requester } = req.body;
      const connector = new ZendeskConnector(subdomain, email, apiToken);
      const ticket = await connector.createTicket({ subject, description, priority }, requester);

      await storage.createIntegrationLog({
        integrationId: "zendesk",
        action: "create_ticket",
        status: "success",
        message: `Ticket created: ${subject}`,
        metadata: ticket,
      });

      res.json(ticket);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/integrations/zendesk/sync", async (req, res) => {
    try {
      const { subdomain, email, apiToken, userId } = req.body;
      const connector = new ZendeskConnector(subdomain, email, apiToken);
      const result = await connector.syncToTradeFlow();

      await storage.createIntegrationLog({
        integrationId: "zendesk",
        action: "sync",
        status: result.success ? "success" : "error",
        message: `Synced ${result.synced} items`,
        metadata: result,
      });

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== ORIGINAL EMAIL & NOTES ROUTES ==========

  app.post("/api/email/send", async (req, res) => {
    try {
      const { to, subject, body, sentBy } = req.body;

      const htmlBody = formatEmailBody(body);
      const result = await sendEmail({
        to,
        subject,
        html: htmlBody,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }

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
      const note = await storage.updateNote(req.params.id, req.body);
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
      const note = await storage.updateTeamLoungeNote(req.params.id, {
        isPinned: req.body.isPinned,
      });
      res.json(note);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

  // ========== NOTIFICATIONS & WEBHOOKS ==========

  app.get("/api/notifications", async (req, res) => {
    try {
      const { userId } = req.query;
      const notifications = await storage.getNotifications(userId as string);
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/notifications/:id/read", async (req, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
