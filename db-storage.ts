import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { eq, desc } from "drizzle-orm";
import * as schema from "@shared/schema";
import ws from "ws";
import type {
  User,
  InsertUser,
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
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(): Promise<EmailLog[]>;
  
  createEmailDraft(draft: InsertEmailDraft): Promise<EmailDraft>;
  getEmailDrafts(): Promise<EmailDraft[]>;
  getEmailDraft(id: string): Promise<EmailDraft | undefined>;
  deleteEmailDraft(id: string): Promise<void>;
  
  createNote(note: InsertNote): Promise<Note>;
  getNotes(): Promise<Note[]>;
  getNote(id: string): Promise<Note | undefined>;
  updateNote(id: string, note: Partial<InsertNote>): Promise<Note | undefined>;
  deleteNote(id: string): Promise<void>;
  
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

  async createNote(insertNote: InsertNote): Promise<Note> {
    const result = await this.db
      .insert(schema.notes)
      .values(insertNote)
      .returning();
    return result[0];
  }

  async getNotes(): Promise<Note[]> {
    return await this.db
      .select()
      .from(schema.notes)
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
