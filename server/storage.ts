import { 
  type User, 
  type InsertUser,
  type EmailTemplate,
  type InsertEmailTemplate,
  type EmailLog,
  type InsertEmailLog,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email templates
  createEmailTemplate(template: InsertEmailTemplate): Promise<EmailTemplate>;
  getEmailTemplates(): Promise<EmailTemplate[]>;
  getEmailTemplate(id: string): Promise<EmailTemplate | undefined>;
  
  // Email logs
  createEmailLog(log: InsertEmailLog): Promise<EmailLog>;
  getEmailLogs(): Promise<EmailLog[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private emailTemplates: Map<string, EmailTemplate>;
  private emailLogs: Map<string, EmailLog>;

  constructor() {
    this.users = new Map();
    this.emailTemplates = new Map();
    this.emailLogs = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "executive",
      avatar: insertUser.avatar || null
    };
    this.users.set(id, user);
    return user;
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate): Promise<EmailTemplate> {
    const id = randomUUID();
    const now = new Date();
    const template: EmailTemplate = {
      ...insertTemplate,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.emailTemplates.set(id, template);
    return template;
  }

  async getEmailTemplates(): Promise<EmailTemplate[]> {
    return Array.from(this.emailTemplates.values());
  }

  async getEmailTemplate(id: string): Promise<EmailTemplate | undefined> {
    return this.emailTemplates.get(id);
  }

  async createEmailLog(insertLog: InsertEmailLog): Promise<EmailLog> {
    const id = randomUUID();
    const log: EmailLog = {
      ...insertLog,
      id,
      status: insertLog.status || "sent",
      sentAt: new Date(),
    };
    this.emailLogs.set(id, log);
    return log;
  }

  async getEmailLogs(): Promise<EmailLog[]> {
    return Array.from(this.emailLogs.values());
  }
}

export const storage = new MemStorage();
