import type {
  User, InsertUser, EmailTemplate, InsertEmailTemplate, EmailLog, InsertEmailLog,
  EmailDraft, InsertEmailDraft, Note, InsertNote, TeamLoungeNote, InsertTeamLoungeNote,
  Contact, InsertContact, Company, InsertCompany, Deal, InsertDeal,
} from "@shared/schema";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

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
  createContact(contact: InsertContact): Promise<Contact>;
  getContacts(): Promise<Contact[]>;
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanies(): Promise<Company[]>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeals(): Promise<Deal[]>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<string, User>();
  private emailTemplates = new Map<string, EmailTemplate>();
  private emailLogs = new Map<string, EmailLog>();
  private emailDrafts = new Map<string, EmailDraft>();
  private notes = new Map<string, Note>();
  private teamLoungeNotes = new Map<string, TeamLoungeNote>();
  private contacts = new Map<string, Contact>();
  private companies = new Map<string, Company>();
  private deals = new Map<string, Deal>();

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }
  async createUser(insertUser: InsertUser) {
    const user: User = { id: generateId(), ...insertUser };
    this.users.set(user.id, user);
    return user;
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate) {
    const template: EmailTemplate = { id: generateId(), ...insertTemplate, createdAt: new Date(), updatedAt: new Date() };
    this.emailTemplates.set(template.id, template);
    return template;
  }
  async getEmailTemplates() { return Array.from(this.emailTemplates.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }
  async getEmailTemplate(id: string) { return this.emailTemplates.get(id); }

  async createEmailLog(insertLog: InsertEmailLog) {
    const log: EmailLog = { id: generateId(), ...insertLog, sentAt: new Date() };
    this.emailLogs.set(log.id, log);
    return log;
  }
  async getEmailLogs() { return Array.from(this.emailLogs.values()).sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime()); }

  async createEmailDraft(insertDraft: InsertEmailDraft) {
    const draft: EmailDraft = { id: generateId(), ...insertDraft, createdAt: new Date(), updatedAt: new Date() };
    this.emailDrafts.set(draft.id, draft);
    return draft;
  }
  async getEmailDrafts() { return Array.from(this.emailDrafts.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); }
  async getEmailDraft(id: string) { return this.emailDrafts.get(id); }
  async deleteEmailDraft(id: string) { this.emailDrafts.delete(id); }

  async createNote(insertNote: InsertNote) {
    const note: Note = { id: generateId(), ...insertNote, createdAt: new Date(), updatedAt: new Date() };
    this.notes.set(note.id, note);
    return note;
  }
  async getNotes() { return Array.from(this.notes.values()).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()); }
  async getNote(id: string) { return this.notes.get(id); }
  async updateNote(id: string, update: Partial<InsertNote>) {
    const note = this.notes.get(id);
    if (!note) return undefined;
    const updated: Note = { ...note, ...update, updatedAt: new Date() };
    this.notes.set(id, updated);
    return updated;
  }
  async deleteNote(id: string) { this.notes.delete(id); }

  async createTeamLoungeNote(insertNote: InsertTeamLoungeNote) {
    const note: TeamLoungeNote = { id: generateId(), ...insertNote, createdAt: new Date(), updatedAt: new Date() };
    this.teamLoungeNotes.set(note.id, note);
    return note;
  }
  async getTeamLoungeNotes() { return Array.from(this.teamLoungeNotes.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }
  async togglePinTeamLoungeNote(id: string) {
    const note = this.teamLoungeNotes.get(id);
    if (!note) return undefined;
    const updated: TeamLoungeNote = { ...note, isPinned: !note.isPinned, updatedAt: new Date() };
    this.teamLoungeNotes.set(id, updated);
    return updated;
  }
  async deleteTeamLoungeNote(id: string) { this.teamLoungeNotes.delete(id); }

  async createContact(insertContact: InsertContact) {
    const contact: Contact = { id: generateId(), ...insertContact, createdAt: new Date(), updatedAt: new Date() };
    this.contacts.set(contact.id, contact);
    return contact;
  }
  async getContacts() { return Array.from(this.contacts.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }

  async createCompany(insertCompany: InsertCompany) {
    const company: Company = { id: generateId(), ...insertCompany, createdAt: new Date(), updatedAt: new Date() };
    this.companies.set(company.id, company);
    return company;
  }
  async getCompanies() { return Array.from(this.companies.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }

  async createDeal(insertDeal: InsertDeal) {
    const deal: Deal = { id: generateId(), ...insertDeal, createdAt: new Date(), updatedAt: new Date() };
    this.deals.set(deal.id, deal);
    return deal;
  }
  async getDeals() { return Array.from(this.deals.values()).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); }
}

export const storage = new MemoryStorage();
