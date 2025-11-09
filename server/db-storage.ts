import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc, inArray } from "drizzle-orm";
import * as schema from "@shared/schema";
import ws from "ws";
import type {
  User,
  InsertUser,
  Task,
  InsertTask,
  Integration,
  InsertIntegration,
  AutomationRule,
  InsertAutomationRule,
  EmailTemplate,
  InsertEmailTemplate,
  EmailLog,
  InsertEmailLog,
  EmailDraft,
  InsertEmailDraft,
  Note,
  InsertNote,
  TeamLoungeNote,
  InsertTeamLoungeNote,
} from "@shared/schema";

neonConfig.webSocketConstructor = ws;

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUsers(): Promise<User[]>;

  // Task methods
  getTasks(userId: string): Promise<Task[]>;
  getAllTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  bulkAssignTasks(taskIds: string[], assigneeId: string): Promise<Task[]>;
  bulkUpdateTaskStatus(taskIds: string[], status: string): Promise<Task[]>;

  // Integration methods
  getIntegrations(): Promise<Integration[]>;
  getIntegration(id: string): Promise<Integration | undefined>;
  getIntegrationByType(type: string): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: string, integration: Partial<InsertIntegration>): Promise<Integration | undefined>;

  // Automation methods
  getAutomationRules(): Promise<AutomationRule[]>;
  getAutomationRule(id: string): Promise<AutomationRule | undefined>;
  createAutomationRule(rule: InsertAutomationRule): Promise<AutomationRule>;
  updateAutomationRule(id: string, rule: Partial<InsertAutomationRule>): Promise<AutomationRule | undefined>;
  deleteAutomationRule(id: string): Promise<void>;
  toggleAutomationRule(id: string): Promise<AutomationRule | undefined>;

  // Email methods
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;

  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(): Promise<EmailLog[]>;

  createEmailDraft(draft: InsertEmailDraft): Promise<EmailDraft>;
  getEmailDrafts(): Promise<EmailDraft[]>;
  getEmailDraft(id: string): Promise<EmailDraft | undefined>;
  deleteEmailDraft(id: string): Promise<void>;

  // Note methods
  createNote(note: InsertNote): Promise<Note>;
  getNotes(userId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  updateNote(id: string, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<void>;

  // Team lounge methods
  createTeamLoungeNote(note: InsertTeamLoungeNote): Promise<TeamLoungeNote>;
  getTeamLoungeNotes(): Promise<TeamLoungeNote[]>;
  togglePinTeamLoungeNote(id: string): Promise<TeamLoungeNote | undefined>;
  deleteTeamLoungeNote(id: string): Promise<void>;
}

export class DbStorage implements IStorage {
  private db;

  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    this.db = drizzle(pool, { schema });
  }

  // ============= USER METHODS =============

  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db
      .insert(schema.users)
      .values(insertUser)
      .returning();
    return result[0];
  }

  async getUsers(): Promise<User[]> {
    return await this.db.select().from(schema.users);
  }

  // ============= TASK METHODS =============

  async getTasks(userId: string): Promise<Task[]> {
    return await this.db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.assigneeId, userId))
      .orderBy(desc(schema.tasks.createdAt));
  }

  async getAllTasks(): Promise<Task[]> {
    return await this.db
      .select()
      .from(schema.tasks)
      .orderBy(desc(schema.tasks.createdAt));
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const result = await this.db
      .insert(schema.tasks)
      .values(insertTask)
      .returning();
    return result[0];
  }

  async updateTask(id: string, update: Partial<InsertTask>): Promise<Task | undefined> {
    const result = await this.db
      .update(schema.tasks)
      .set(update)
      .where(eq(schema.tasks.id, id))
      .returning();
    return result[0];
  }

  async deleteTask(id: string): Promise<void> {
    await this.db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  }

  async bulkAssignTasks(taskIds: string[], assigneeId: string): Promise<Task[]> {
    const result = await this.db
      .update(schema.tasks)
      .set({ assigneeId })
      .where(inArray(schema.tasks.id, taskIds))
      .returning();
    return result;
  }

  async bulkUpdateTaskStatus(taskIds: string[], status: string): Promise<Task[]> {
    const result = await this.db
      .update(schema.tasks)
      .set({ status })
      .where(inArray(schema.tasks.id, taskIds))
      .returning();
    return result;
  }

  // ============= INTEGRATION METHODS =============

  async getIntegrations(): Promise<Integration[]> {
    return await this.db.select().from(schema.integrations);
  }

  async getIntegration(id: string): Promise<Integration | undefined> {
    const result = await this.db
      .select()
      .from(schema.integrations)
      .where(eq(schema.integrations.id, id))
      .limit(1);
    return result[0];
  }

  async getIntegrationByType(type: string): Promise<Integration | undefined> {
    const result = await this.db
      .select()
      .from(schema.integrations)
      .where(eq(schema.integrations.type, type))
      .limit(1);
    return result[0];
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const result = await this.db
      .insert(schema.integrations)
      .values(insertIntegration)
      .returning();
    return result[0];
  }

  async updateIntegration(id: string, update: Partial<InsertIntegration>): Promise<Integration | undefined> {
    const result = await this.db
      .update(schema.integrations)
      .set(update)
      .where(eq(schema.integrations.id, id))
      .returning();
    return result[0];
  }

  // ============= AUTOMATION METHODS =============

  async getAutomationRules(): Promise<AutomationRule[]> {
    return await this.db
      .select()
      .from(schema.automationRules)
      .orderBy(desc(schema.automationRules.createdAt));
  }

  async getAutomationRule(id: string): Promise<AutomationRule | undefined> {
    const result = await this.db
      .select()
      .from(schema.automationRules)
      .where(eq(schema.automationRules.id, id))
      .limit(1);
    return result[0];
  }

  async createAutomationRule(insertRule: InsertAutomationRule): Promise<AutomationRule> {
    const result = await this.db
      .insert(schema.automationRules)
      .values(insertRule)
      .returning();
    return result[0];
  }

  async updateAutomationRule(id: string, update: Partial<InsertAutomationRule>): Promise<AutomationRule | undefined> {
    const result = await this.db
      .update(schema.automationRules)
      .set(update)
      .where(eq(schema.automationRules.id, id))
      .returning();
    return result[0];
  }

  async deleteAutomationRule(id: string): Promise<void> {
    await this.db.delete(schema.automationRules).where(eq(schema.automationRules.id, id));
  }

  async toggleAutomationRule(id: string): Promise<AutomationRule | undefined> {
    const current = await this.getAutomationRule(id);
    if (!current) return undefined;

    const result = await this.db
      .update(schema.automationRules)
      .set({ enabled: !current.enabled })
      .where(eq(schema.automationRules.id, id))
      .returning();
    return result[0];
  }

  // ============= EMAIL TEMPLATE METHODS =============

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const result = await this.db
      .insert(schema.emailTemplates)
      .values(insertTemplate)
      .returning();
    return result[0];
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return await this.db
      .select()
      .from(schema.emailTemplates)
      .orderBy(desc(schema.emailTemplates.createdAt));
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    const result = await this.db
      .select()
      .from(schema.emailTemplates)
      .where(eq(schema.emailTemplates.id, id))
      .limit(1);
    return result[0];
  }

  // ============= EMAIL LOG METHODS =============

  async createEmailLog(insertLog: InsertEmailLog): Promise<EmailLog> {
    const result = await this.db
      .insert(schema.emailLogs)
      .values(insertLog)
      .returning();
    return result[0];
  }

  async getEmailLogs(): Promise<EmailLog[]> {
    return await this.db
      .select()
      .from(schema.emailLogs)
      .orderBy(desc(schema.emailLogs.sentAt));
  }

  // ============= EMAIL DRAFT METHODS =============

  async createEmailDraft(insertDraft: InsertEmailDraft): Promise<EmailDraft> {
    const result = await this.db
      .insert(schema.emailDrafts)
      .values(insertDraft)
      .returning();
    return result[0];
  }

  async getEmailDrafts(): Promise<EmailDraft[]> {
    return await this.db
      .select()
      .from(schema.emailDrafts)
      .orderBy(desc(schema.emailDrafts.updatedAt));
  }

  async getEmailDraft(id: string): Promise<EmailDraft | undefined> {
    const result = await this.db
      .select()
      .from(schema.emailDrafts)
      .where(eq(schema.emailDrafts.id, id))
      .limit(1);
    return result[0];
  }

  async deleteEmailDraft(id: string): Promise<void> {
    await this.db
      .delete(schema.emailDrafts)
      .where(eq(schema.emailDrafts.id, id));
  }

  // ============= NOTE METHODS =============

  async createNote(insertNote: InsertNote): Promise<Note> {
    const result = await this.db
      .insert(schema.notes)
      .values(insertNote)
      .returning();
    return result[0];
  }

  async getNotes(userId: string): Promise<Note[]> {
    return await this.db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.createdBy, userId))
      .orderBy(desc(schema.notes.updatedAt));
  }

  async getNote(id: string): Promise<Note | undefined> {
    const result = await this.db
      .select()
      .from(schema.notes)
      .where(eq(schema.notes.id, id))
      .limit(1);
    return result[0];
  }

  async updateNote(id: string, update: Partial<InsertNote>): Promise<Note | undefined> {
    const result = await this.db
      .update(schema.notes)
      .set({ ...update, updatedAt: new Date() })
      .where(eq(schema.notes.id, id))
      .returning();
    return result[0];
  }

  async deleteNote(id: string): Promise<void> {
    await this.db
      .delete(schema.notes)
      .where(eq(schema.notes.id, id));
  }

  // ============= TEAM LOUNGE METHODS =============

  async createTeamLoungeNote(insertNote: InsertTeamLoungeNote): Promise<TeamLoungeNote> {
    const result = await this.db
      .insert(schema.teamLoungeNotes)
      .values(insertNote)
      .returning();
    return result[0];
  }

  async getTeamLoungeNotes(): Promise<TeamLoungeNote[]> {
    return await this.db
      .select()
      .from(schema.teamLoungeNotes)
      .orderBy(desc(schema.teamLoungeNotes.createdAt));
  }

  async togglePinTeamLoungeNote(id: string): Promise<TeamLoungeNote | undefined> {
    const current = await this.db
      .select()
      .from(schema.teamLoungeNotes)
      .where(eq(schema.teamLoungeNotes.id, id))
      .limit(1);

    if (!current[0]) return undefined;

    const result = await this.db
      .update(schema.teamLoungeNotes)
      .set({ isPinned: !current[0].isPinned, updatedAt: new Date() })
      .where(eq(schema.teamLoungeNotes.id, id))
      .returning();
    return result[0];
  }

  async deleteTeamLoungeNote(id: string): Promise<void> {
    await this.db
      .delete(schema.teamLoungeNotes)
      .where(eq(schema.teamLoungeNotes.id, id));
  }
}

export const storage = new DbStorage();
