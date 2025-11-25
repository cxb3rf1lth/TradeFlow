import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import * as schema from "@shared/schema";
import ws from "ws";
import type {
  User, InsertUser,
  Contact, InsertContact,
  Company, InsertCompany,
  Deal, InsertDeal,
  Pipeline, InsertPipeline,
  PipelineStage, InsertPipelineStage,
  Board, InsertBoard,
  BoardList, InsertBoardList,
  Card, InsertCard,
  CardChecklist, InsertCardChecklist,
  CardComment, InsertCardComment,
  EmailTemplate, InsertEmailTemplate,
  EmailLog, InsertEmailLog,
  EmailDraft, InsertEmailDraft,
  Note, InsertNote,
  TeamLoungeNote, InsertTeamLoungeNote,
  OneDriveFile, InsertOneDriveFile,
  OneNoteNotebook, InsertOneNoteNotebook,
  OneNoteSection, InsertOneNoteSection,
  OneNotePage, InsertOneNotePage,
  OutlookCalendar, InsertOutlookCalendar,
  OutlookEvent, InsertOutlookEvent,
  OutlookContact, InsertOutlookContact,
  OutlookEmail, InsertOutlookEmail,
  TeamsChannel, InsertTeamsChannel,
  TeamsMessage, InsertTeamsMessage,
  TeamsChat, InsertTeamsChat,
  TeamsChatMessage, InsertTeamsChatMessage,
  TeamsMeeting, InsertTeamsMeeting,
  AiConversation, InsertAiConversation,
  AiMessage, InsertAiMessage,
  AiInsight, InsertAiInsight,
  Activity, InsertActivity,
  Notification, InsertNotification,
  Integration, InsertIntegration,
  IntegrationCredential, InsertIntegrationCredential,
  IntegrationConfig, InsertIntegrationConfig,
  IntegrationLog, InsertIntegrationLog,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export class DbStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool, { schema });
  }

  // ========== USER METHODS ==========
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // ========== CRM - CONTACTS ==========
  async getContacts(): Promise<Contact[]> {
    return await this.db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt));
  }

  async getContact(id: string): Promise<Contact | undefined> {
    const result = await this.db.select().from(schema.contacts).where(eq(schema.contacts.id, id)).limit(1);
    return result[0];
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const result = await this.db.insert(schema.contacts).values(contact).returning();
    return result[0];
  }

  async updateContact(id: string, updates: Partial<InsertContact>): Promise<Contact | undefined> {
    const result = await this.db.update(schema.contacts).set({ ...updates, updatedAt: new Date() }).where(eq(schema.contacts.id, id)).returning();
    return result[0];
  }

  async deleteContact(id: string): Promise<void> {
    await this.db.delete(schema.contacts).where(eq(schema.contacts.id, id));
  }

  // ========== CRM - COMPANIES ==========
  async getCompanies(): Promise<Company[]> {
    return await this.db.select().from(schema.companies).orderBy(desc(schema.companies.createdAt));
  }

  async getCompany(id: string): Promise<Company | undefined> {
    const result = await this.db.select().from(schema.companies).where(eq(schema.companies.id, id)).limit(1);
    return result[0];
  }

  async createCompany(company: InsertCompany): Promise<Company> {
    const result = await this.db.insert(schema.companies).values(company).returning();
    return result[0];
  }

  async updateCompany(id: string, updates: Partial<InsertCompany>): Promise<Company | undefined> {
    const result = await this.db.update(schema.companies).set({ ...updates, updatedAt: new Date() }).where(eq(schema.companies.id, id)).returning();
    return result[0];
  }

  async deleteCompany(id: string): Promise<void> {
    await this.db.delete(schema.companies).where(eq(schema.companies.id, id));
  }

  // ========== CRM - DEALS ==========
  async getDeals(): Promise<Deal[]> {
    return await this.db.select().from(schema.deals).orderBy(desc(schema.deals.createdAt));
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    const result = await this.db.select().from(schema.deals).where(eq(schema.deals.id, id)).limit(1);
    return result[0];
  }

  async createDeal(deal: InsertDeal): Promise<Deal> {
    const result = await this.db.insert(schema.deals).values(deal).returning();
    return result[0];
  }

  async updateDeal(id: string, updates: Partial<InsertDeal>): Promise<Deal | undefined> {
    const result = await this.db.update(schema.deals).set({ ...updates, updatedAt: new Date() }).where(eq(schema.deals.id, id)).returning();
    return result[0];
  }

  async deleteDeal(id: string): Promise<void> {
    await this.db.delete(schema.deals).where(eq(schema.deals.id, id));
  }

  // ========== CRM - PIPELINES ==========
  async getPipelines(): Promise<Pipeline[]> {
    return await this.db.select().from(schema.pipelines).orderBy(schema.pipelines.order);
  }

  async getPipeline(id: string): Promise<Pipeline | undefined> {
    const result = await this.db.select().from(schema.pipelines).where(eq(schema.pipelines.id, id)).limit(1);
    return result[0];
  }

  async createPipeline(pipeline: InsertPipeline): Promise<Pipeline> {
    const result = await this.db.insert(schema.pipelines).values(pipeline).returning();
    return result[0];
  }

  async updatePipeline(id: string, updates: Partial<InsertPipeline>): Promise<Pipeline | undefined> {
    const result = await this.db.update(schema.pipelines).set({ ...updates, updatedAt: new Date() }).where(eq(schema.pipelines.id, id)).returning();
    return result[0];
  }

  async deletePipeline(id: string): Promise<void> {
    await this.db.delete(schema.pipelines).where(eq(schema.pipelines.id, id));
  }

  // ========== CRM - PIPELINE STAGES ==========
  async getPipelineStages(pipelineId: string): Promise<PipelineStage[]> {
    return await this.db.select().from(schema.pipelineStages).where(eq(schema.pipelineStages.pipelineId, pipelineId)).orderBy(schema.pipelineStages.order);
  }

  async createPipelineStage(stage: InsertPipelineStage): Promise<PipelineStage> {
    const result = await this.db.insert(schema.pipelineStages).values(stage).returning();
    return result[0];
  }

  async updatePipelineStage(id: string, updates: Partial<InsertPipelineStage>): Promise<PipelineStage | undefined> {
    const result = await this.db.update(schema.pipelineStages).set(updates).where(eq(schema.pipelineStages.id, id)).returning();
    return result[0];
  }

  async deletePipelineStage(id: string): Promise<void> {
    await this.db.delete(schema.pipelineStages).where(eq(schema.pipelineStages.id, id));
  }

  // ========== PROJECT MANAGEMENT - BOARDS ==========
  async getBoards(): Promise<Board[]> {
    return await this.db.select().from(schema.boards).orderBy(desc(schema.boards.createdAt));
  }

  async getBoard(id: string): Promise<Board | undefined> {
    const result = await this.db.select().from(schema.boards).where(eq(schema.boards.id, id)).limit(1);
    return result[0];
  }

  async createBoard(board: InsertBoard): Promise<Board> {
    const result = await this.db.insert(schema.boards).values(board).returning();
    return result[0];
  }

  async updateBoard(id: string, updates: Partial<InsertBoard>): Promise<Board | undefined> {
    const result = await this.db.update(schema.boards).set({ ...updates, updatedAt: new Date() }).where(eq(schema.boards.id, id)).returning();
    return result[0];
  }

  async deleteBoard(id: string): Promise<void> {
    await this.db.delete(schema.boards).where(eq(schema.boards.id, id));
  }

  // ========== PROJECT MANAGEMENT - LISTS ==========
  async getBoardLists(boardId: string): Promise<BoardList[]> {
    return await this.db.select().from(schema.boardLists).where(eq(schema.boardLists.boardId, boardId)).orderBy(schema.boardLists.order);
  }

  async createBoardList(list: InsertBoardList): Promise<BoardList> {
    const result = await this.db.insert(schema.boardLists).values(list).returning();
    return result[0];
  }

  async updateBoardList(id: string, updates: Partial<InsertBoardList>): Promise<BoardList | undefined> {
    const result = await this.db.update(schema.boardLists).set(updates).where(eq(schema.boardLists.id, id)).returning();
    return result[0];
  }

  async deleteBoardList(id: string): Promise<void> {
    await this.db.delete(schema.boardLists).where(eq(schema.boardLists.id, id));
  }

  // ========== PROJECT MANAGEMENT - CARDS ==========
  async getBoardCards(boardId: string): Promise<Card[]> {
    return await this.db.select().from(schema.cards).where(eq(schema.cards.boardId, boardId)).orderBy(schema.cards.order);
  }

  async getCard(id: string): Promise<Card | undefined> {
    const result = await this.db.select().from(schema.cards).where(eq(schema.cards.id, id)).limit(1);
    return result[0];
  }

  async createCard(card: InsertCard): Promise<Card> {
    const result = await this.db.insert(schema.cards).values(card).returning();
    return result[0];
  }

  async updateCard(id: string, updates: Partial<InsertCard>): Promise<Card | undefined> {
    const result = await this.db.update(schema.cards).set({ ...updates, updatedAt: new Date() }).where(eq(schema.cards.id, id)).returning();
    return result[0];
  }

  async deleteCard(id: string): Promise<void> {
    await this.db.delete(schema.cards).where(eq(schema.cards.id, id));
  }

  // ========== PROJECT MANAGEMENT - CARD COMMENTS ==========
  async getCardComments(cardId: string): Promise<CardComment[]> {
    return await this.db.select().from(schema.cardComments).where(eq(schema.cardComments.cardId, cardId)).orderBy(desc(schema.cardComments.createdAt));
  }

  async createCardComment(comment: InsertCardComment): Promise<CardComment> {
    const result = await this.db.insert(schema.cardComments).values(comment).returning();
    return result[0];
  }

  async updateCardComment(id: string, updates: Partial<InsertCardComment>): Promise<CardComment | undefined> {
    const result = await this.db.update(schema.cardComments).set({ ...updates, updatedAt: new Date() }).where(eq(schema.cardComments.id, id)).returning();
    return result[0];
  }

  async deleteCardComment(id: string): Promise<void> {
    await this.db.delete(schema.cardComments).where(eq(schema.cardComments.id, id));
  }

  // ========== MICROSOFT 365 - ONEDRIVE ==========
  async getOneDriveFiles(userId: string, path?: string): Promise<OneDriveFile[]> {
    const conditions = [eq(schema.oneDriveFiles.userId, userId)];
    if (path) conditions.push(eq(schema.oneDriveFiles.path, path));
    return await this.db.select().from(schema.oneDriveFiles).where(and(...conditions)).orderBy(schema.oneDriveFiles.name);
  }

  async createOneDriveFile(file: InsertOneDriveFile): Promise<OneDriveFile> {
    const result = await this.db.insert(schema.oneDriveFiles).values(file).returning();
    return result[0];
  }

  async updateOneDriveFile(id: string, updates: Partial<InsertOneDriveFile>): Promise<OneDriveFile | undefined> {
    const result = await this.db.update(schema.oneDriveFiles).set({ ...updates, updatedAt: new Date() }).where(eq(schema.oneDriveFiles.id, id)).returning();
    return result[0];
  }

  async deleteOneDriveFile(id: string): Promise<void> {
    await this.db.delete(schema.oneDriveFiles).where(eq(schema.oneDriveFiles.id, id));
  }

  // ========== MICROSOFT 365 - ONENOTE ==========
  async getOneNoteNotebooks(userId: string): Promise<OneNoteNotebook[]> {
    return await this.db.select().from(schema.oneNoteNotebooks).where(eq(schema.oneNoteNotebooks.userId, userId)).orderBy(schema.oneNoteNotebooks.displayName);
  }

  async createOneNoteNotebook(notebook: InsertOneNoteNotebook): Promise<OneNoteNotebook> {
    const result = await this.db.insert(schema.oneNoteNotebooks).values(notebook).returning();
    return result[0];
  }

  async createOneNoteSection(section: InsertOneNoteSection): Promise<OneNoteSection> {
    const result = await this.db.insert(schema.oneNoteSections).values(section).returning();
    return result[0];
  }

  async getOneNoteSections(notebookId: string): Promise<OneNoteSection[]> {
    return await this.db.select().from(schema.oneNoteSections).where(eq(schema.oneNoteSections.notebookId, notebookId)).orderBy(schema.oneNoteSections.order);
  }

  async createOneNotePage(page: InsertOneNotePage): Promise<OneNotePage> {
    const result = await this.db.insert(schema.oneNotePages).values(page).returning();
    return result[0];
  }

  async getOneNotePages(sectionId: string): Promise<OneNotePage[]> {
    return await this.db.select().from(schema.oneNotePages).where(eq(schema.oneNotePages.sectionId, sectionId)).orderBy(schema.oneNotePages.order);
  }

  // ========== MICROSOFT 365 - OUTLOOK CALENDARS ==========
  async getOutlookCalendars(userId: string): Promise<OutlookCalendar[]> {
    return await this.db.select().from(schema.outlookCalendars).where(eq(schema.outlookCalendars.userId, userId));
  }

  async createOutlookCalendar(calendar: InsertOutlookCalendar): Promise<OutlookCalendar> {
    const result = await this.db.insert(schema.outlookCalendars).values(calendar).returning();
    return result[0];
  }

  // ========== MICROSOFT 365 - OUTLOOK EVENTS ==========
  async getOutlookEvents(calendarId: string, startDate?: Date, endDate?: Date): Promise<OutlookEvent[]> {
    const conditions = [eq(schema.outlookEvents.calendarId, calendarId)];
    if (startDate) conditions.push(gte(schema.outlookEvents.startTime, startDate));
    if (endDate) conditions.push(lte(schema.outlookEvents.endTime, endDate));
    return await this.db.select().from(schema.outlookEvents).where(and(...conditions)).orderBy(schema.outlookEvents.startTime);
  }

  async createOutlookEvent(event: InsertOutlookEvent): Promise<OutlookEvent> {
    const result = await this.db.insert(schema.outlookEvents).values(event).returning();
    return result[0];
  }

  async updateOutlookEvent(id: string, updates: Partial<InsertOutlookEvent>): Promise<OutlookEvent | undefined> {
    const result = await this.db.update(schema.outlookEvents).set({ ...updates, updatedAt: new Date() }).where(eq(schema.outlookEvents.id, id)).returning();
    return result[0];
  }

  async deleteOutlookEvent(id: string): Promise<void> {
    await this.db.delete(schema.outlookEvents).where(eq(schema.outlookEvents.id, id));
  }

  // ========== MICROSOFT 365 - OUTLOOK EMAILS ==========
  async getOutlookEmails(userId: string): Promise<OutlookEmail[]> {
    return await this.db.select().from(schema.outlookEmails).where(eq(schema.outlookEmails.userId, userId)).orderBy(desc(schema.outlookEmails.receivedDateTime));
  }

  async createOutlookEmail(email: InsertOutlookEmail): Promise<OutlookEmail> {
    const result = await this.db.insert(schema.outlookEmails).values(email).returning();
    return result[0];
  }

  async updateOutlookEmail(id: string, updates: Partial<InsertOutlookEmail>): Promise<OutlookEmail | undefined> {
    const result = await this.db.update(schema.outlookEmails).set({ ...updates, updatedAt: new Date() }).where(eq(schema.outlookEmails.id, id)).returning();
    return result[0];
  }

  // ========== MICROSOFT 365 - TEAMS ==========
  async getTeamsChannels(userId: string): Promise<TeamsChannel[]> {
    return await this.db.select().from(schema.teamsChannels).where(eq(schema.teamsChannels.userId, userId));
  }

  async createTeamsChannel(channel: InsertTeamsChannel): Promise<TeamsChannel> {
    const result = await this.db.insert(schema.teamsChannels).values(channel).returning();
    return result[0];
  }

  async getTeamsChats(userId: string): Promise<TeamsChat[]> {
    return await this.db.select().from(schema.teamsChats).where(eq(schema.teamsChats.userId, userId)).orderBy(desc(schema.teamsChats.lastMessageAt));
  }

  async createTeamsChat(chat: InsertTeamsChat): Promise<TeamsChat> {
    const result = await this.db.insert(schema.teamsChats).values(chat).returning();
    return result[0];
  }

  // ========== CLAUDE AI ==========
  async getAiConversations(userId: string): Promise<AiConversation[]> {
    return await this.db.select().from(schema.aiConversations).where(eq(schema.aiConversations.userId, userId)).orderBy(desc(schema.aiConversations.updatedAt));
  }

  async getAiConversation(id: string): Promise<AiConversation | undefined> {
    const result = await this.db.select().from(schema.aiConversations).where(eq(schema.aiConversations.id, id)).limit(1);
    return result[0];
  }

  async createAiConversation(conversation: InsertAiConversation): Promise<AiConversation> {
    const result = await this.db.insert(schema.aiConversations).values(conversation).returning();
    return result[0];
  }

  async getAiMessages(conversationId: string): Promise<AiMessage[]> {
    return await this.db.select().from(schema.aiMessages).where(eq(schema.aiMessages.conversationId, conversationId)).orderBy(schema.aiMessages.createdAt);
  }

  async createAiMessage(message: InsertAiMessage): Promise<AiMessage> {
    const result = await this.db.insert(schema.aiMessages).values(message).returning();
    return result[0];
  }

  async createAiInsight(insight: InsertAiInsight): Promise<AiInsight> {
    const result = await this.db.insert(schema.aiInsights).values(insight).returning();
    return result[0];
  }

  async getAiInsights(userId: string, entityType?: string, entityId?: string): Promise<AiInsight[]> {
    const conditions = [eq(schema.aiInsights.userId, userId)];
    if (entityType) conditions.push(eq(schema.aiInsights.entityType, entityType));
    if (entityId) conditions.push(eq(schema.aiInsights.entityId, entityId));
    return await this.db.select().from(schema.aiInsights).where(and(...conditions)).orderBy(desc(schema.aiInsights.createdAt));
  }

  // ========== ACTIVITIES ==========
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await this.db.insert(schema.activities).values(activity).returning();
    return result[0];
  }

  async getActivities(userId?: string, limit: number = 50): Promise<Activity[]> {
    if (userId) {
      return await this.db.select().from(schema.activities).where(eq(schema.activities.userId, userId)).orderBy(desc(schema.activities.createdAt)).limit(limit);
    }
    return await this.db.select().from(schema.activities).orderBy(desc(schema.activities.createdAt)).limit(limit);
  }

  // ========== NOTIFICATIONS ==========
  async getNotifications(userId: string): Promise<Notification[]> {
    return await this.db.select().from(schema.notifications).where(eq(schema.notifications.userId, userId)).orderBy(desc(schema.notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await this.db.insert(schema.notifications).values(notification).returning();
    return result[0];
  }

  async markNotificationRead(id: string): Promise<void> {
    await this.db.update(schema.notifications).set({ isRead: true, readAt: new Date() }).where(eq(schema.notifications.id, id));
  }

  // ========== INTEGRATIONS ==========
  async createIntegrationLog(log: InsertIntegrationLog): Promise<IntegrationLog> {
    const result = await this.db.insert(schema.integrationLogs).values(log).returning();
    return result[0];
  }

  async getIntegrationLogs(integrationId: string, limit: number = 100): Promise<IntegrationLog[]> {
    return await this.db.select().from(schema.integrationLogs).where(eq(schema.integrationLogs.integrationId, integrationId)).orderBy(desc(schema.integrationLogs.createdAt)).limit(limit);
  }

  // ========== EMAIL METHODS (EXISTING) ==========
  async createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate> {
    const result = await this.db.insert(schema.emailTemplates).values(template).returning();
    return result[0];
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await this.db.select().from(schema.emailTemplates).orderBy(desc(schema.emailTemplates.createdAt));
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const result = await this.db.select().from(schema.emailTemplates).where(eq(schema.emailTemplates.id, id)).limit(1);
    return result[0];
  }

  async createEmailLog(log: InsertEmailLog): Promise<EmailLog> {
    const now = new Date();
    const result = await this.db.insert(schema.emailLogs).values({
      ...log,
      from: log.from || log.sender?.email || null,
      state: log.state || log.status || "sent",
      direction: log.direction || "outbound",
      attachments: log.attachments || [],
      syncStatus: log.syncStatus || "pending",
      retryCount: log.retryCount ?? 0,
      sentAt: log.sentAt || now,
    }).returning();
    return result[0];
  }

  async getEmailLogs(): Promise<EmailLog[]> {
    return await this.db.select().from(schema.emailLogs).orderBy(desc(schema.emailLogs.sentAt));
  }

  async createEmailDraft(draft: InsertEmailDraft): Promise<EmailDraft> {
    const result = await this.db.insert(schema.emailDrafts).values(draft).returning();
    return result[0];
  }

  async getEmailDrafts(): Promise<EmailDraft[]> {
    return await this.db.select().from(schema.emailDrafts).orderBy(desc(schema.emailDrafts.updatedAt));
  }

  async getEmailDraft(id: string): Promise<EmailDraft | undefined> {
    const result = await this.db.select().from(schema.emailDrafts).where(eq(schema.emailDrafts.id, id)).limit(1);
    return result[0];
  }

  async deleteEmailDraft(id: string): Promise<void> {
    await this.db.delete(schema.emailDrafts).where(eq(schema.emailDrafts.id, id));
  }

  // ========== NOTES METHODS (EXISTING) ==========
  async createNote(note: InsertNote): Promise<Note> {
    const result = await this.db.insert(schema.notes).values(note).returning();
    return result[0];
  }

  async getNotes(): Promise<Note[]> {
    return await this.db.select().from(schema.notes).orderBy(desc(schema.notes.updatedAt));
  }

  async getNote(id: string): Promise<Note | undefined> {
    const result = await this.db.select().from(schema.notes).where(eq(schema.notes.id, id)).limit(1);
    return result[0];
  }

  async updateNote(id: string, update: Partial<InsertNote>): Promise<Note | undefined> {
    const result = await this.db.update(schema.notes).set({ ...update, updatedAt: new Date() }).where(eq(schema.notes.id, id)).returning();
    return result[0];
  }

  async deleteNote(id: string): Promise<void> {
    await this.db.delete(schema.notes).where(eq(schema.notes.id, id));
  }

  // ========== TEAM LOUNGE METHODS (EXISTING) ==========
  async createTeamLoungeNote(note: InsertTeamLoungeNote): Promise<TeamLoungeNote> {
    const result = await this.db.insert(schema.teamLoungeNotes).values(note).returning();
    return result[0];
  }

  async getTeamLoungeNotes(): Promise<TeamLoungeNote[]> {
    return await this.db.select().from(schema.teamLoungeNotes).orderBy(desc(schema.teamLoungeNotes.createdAt));
  }

  async updateTeamLoungeNote(id: string, update: Partial<InsertTeamLoungeNote>): Promise<TeamLoungeNote | undefined> {
    const result = await this.db.update(schema.teamLoungeNotes).set({ ...update, updatedAt: new Date() }).where(eq(schema.teamLoungeNotes.id, id)).returning();
    return result[0];
  }

  async togglePinTeamLoungeNote(id: string): Promise<TeamLoungeNote | undefined> {
    const current = await this.db.select().from(schema.teamLoungeNotes).where(eq(schema.teamLoungeNotes.id, id)).limit(1);
    if (!current[0]) return undefined;
    const result = await this.db.update(schema.teamLoungeNotes).set({ isPinned: !current[0].isPinned, updatedAt: new Date() }).where(eq(schema.teamLoungeNotes.id, id)).returning();
    return result[0];
  }

  async deleteTeamLoungeNote(id: string): Promise<void> {
    await this.db.delete(schema.teamLoungeNotes).where(eq(schema.teamLoungeNotes.id, id));
  }
}

export const storage = new DbStorage();
