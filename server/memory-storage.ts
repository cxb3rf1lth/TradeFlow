import type {
  User, InsertUser, EmailTemplate, InsertEmailTemplate, EmailLog, InsertEmailLog,
  EmailDraft, InsertEmailDraft, Note, InsertNote, TeamLoungeNote, InsertTeamLoungeNote,
  Contact, InsertContact, Company, InsertCompany, Deal, InsertDeal,
} from "@shared/schema";
import { nanoid } from 'nanoid';

// Secure ID generation using nanoid
function generateId(): string {
  return nanoid();
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
  getContact(id: string): Promise<Contact | undefined>;
  updateContact(id: string, contact: Partial<InsertContact>): Promise<Contact | undefined>;
  deleteContact(id: string): Promise<void>;
  createCompany(company: InsertCompany): Promise<Company>;
  getCompanies(): Promise<Company[]>;
  getCompany(id: string): Promise<Company | undefined>;
  updateCompany(id: string, company: Partial<InsertCompany>): Promise<Company | undefined>;
  deleteCompany(id: string): Promise<void>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<void>;
  // Board management
  createBoard(board: any): Promise<any>;
  getBoards(): Promise<any[]>;
  getBoard(id: string): Promise<any | undefined>;
  updateBoard(id: string, board: any): Promise<any | undefined>;
  deleteBoard(id: string): Promise<void>;
  createBoardList(list: any): Promise<any>;
  getBoardLists(boardId: string): Promise<any[]>;
  updateBoardList(id: string, list: any): Promise<any | undefined>;
  deleteBoardList(id: string): Promise<void>;
  createCard(card: any): Promise<any>;
  getCards(listId: string): Promise<any[]>;
  updateCard(id: string, card: any): Promise<any | undefined>;
  deleteCard(id: string): Promise<void>;
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
  private boards = new Map<string, any>();
  private boardLists = new Map<string, any>();
  private cards = new Map<string, any>();

  async getUser(id: string) { return this.users.get(id); }
  async getUserByUsername(username: string) { return Array.from(this.users.values()).find(u => u.username === username); }
  async createUser(insertUser: InsertUser) {
    const user: User = { 
      id: generateId(), 
      ...insertUser,
      role: insertUser.role || "executive",
      avatar: insertUser.avatar || null
    };
    this.users.set(user.id, user);
    return user;
  }

  async createEmailTemplate(insertTemplate: InsertEmailTemplate) {
    const template: EmailTemplate = { id: generateId(), ...insertTemplate, createdAt: new Date(), updatedAt: new Date() };
    this.emailTemplates.set(template.id, template);
    return template;
  }
  async getEmailTemplates() { return Array.from(this.emailTemplates.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async getEmailTemplate(id: string) { return this.emailTemplates.get(id); }

  async createEmailLog(insertLog: InsertEmailLog) {
    const log: EmailLog = { 
      id: generateId(), 
      ...insertLog, 
      status: insertLog.status || "sent",
      sentAt: new Date() 
    };
    this.emailLogs.set(log.id, log);
    return log;
  }
  async getEmailLogs() { return Array.from(this.emailLogs.values()).sort((a, b) => (b.sentAt?.getTime() || 0) - (a.sentAt?.getTime() || 0)); }

  async createEmailDraft(insertDraft: InsertEmailDraft) {
    const draft: EmailDraft = { id: generateId(), ...insertDraft, createdAt: new Date(), updatedAt: new Date() };
    this.emailDrafts.set(draft.id, draft);
    return draft;
  }
  async getEmailDrafts() { return Array.from(this.emailDrafts.values()).sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)); }
  async getEmailDraft(id: string) { return this.emailDrafts.get(id); }
  async deleteEmailDraft(id: string) { this.emailDrafts.delete(id); }

  async createNote(insertNote: InsertNote) {
    const note: Note = { id: generateId(), ...insertNote, createdAt: new Date(), updatedAt: new Date() };
    this.notes.set(note.id, note);
    return note;
  }
  async getNotes() { return Array.from(this.notes.values()).sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0)); }
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
    const note: TeamLoungeNote = { 
      id: generateId(), 
      ...insertNote,
      type: insertNote.type || "note",
      isPinned: insertNote.isPinned || false,
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.teamLoungeNotes.set(note.id, note);
    return note;
  }
  async getTeamLoungeNotes() { return Array.from(this.teamLoungeNotes.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async togglePinTeamLoungeNote(id: string) {
    const note = this.teamLoungeNotes.get(id);
    if (!note) return undefined;
    const updated: TeamLoungeNote = { ...note, isPinned: !note.isPinned, updatedAt: new Date() };
    this.teamLoungeNotes.set(id, updated);
    return updated;
  }
  async deleteTeamLoungeNote(id: string) { this.teamLoungeNotes.delete(id); }

  async createContact(insertContact: InsertContact) {
    const contact: Contact = {
      id: generateId(),
      ...insertContact,
      email: insertContact.email || null,
      phone: insertContact.phone || null,
      companyId: insertContact.companyId || null,
      status: insertContact.status || "active",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.contacts.set(contact.id, contact);
    return contact;
  }
  async getContacts() { return Array.from(this.contacts.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async getContact(id: string) { return this.contacts.get(id); }
  async updateContact(id: string, update: Partial<InsertContact>) {
    const contact = this.contacts.get(id);
    if (!contact) return undefined;
    const updated: Contact = { ...contact, ...update, updatedAt: new Date() };
    this.contacts.set(id, updated);
    return updated;
  }
  async deleteContact(id: string) { this.contacts.delete(id); }

  async createCompany(insertCompany: InsertCompany) {
    const company: Company = {
      id: generateId(),
      ...insertCompany,
      industry: insertCompany.industry || null,
      website: insertCompany.website || null,
      phone: insertCompany.phone || null,
      address: insertCompany.address || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.companies.set(company.id, company);
    return company;
  }
  async getCompanies() { return Array.from(this.companies.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async getCompany(id: string) { return this.companies.get(id); }
  async updateCompany(id: string, update: Partial<InsertCompany>) {
    const company = this.companies.get(id);
    if (!company) return undefined;
    const updated: Company = { ...company, ...update, updatedAt: new Date() };
    this.companies.set(id, updated);
    return updated;
  }
  async deleteCompany(id: string) { this.companies.delete(id); }

  async createDeal(insertDeal: InsertDeal) {
    const deal: Deal = {
      id: generateId(),
      ...insertDeal,
      value: insertDeal.value || 0,
      stage: insertDeal.stage || "lead",
      contactId: insertDeal.contactId || null,
      companyId: insertDeal.companyId || null,
      closeDate: insertDeal.closeDate || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.deals.set(deal.id, deal);
    return deal;
  }
  async getDeals() { return Array.from(this.deals.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async getDeal(id: string) { return this.deals.get(id); }
  async updateDeal(id: string, update: Partial<InsertDeal>) {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    const updated: Deal = { ...deal, ...update, updatedAt: new Date() };
    this.deals.set(id, updated);
    return updated;
  }
  async deleteDeal(id: string) { this.deals.delete(id); }

  // Board management
  async createBoard(insertBoard: any) {
    const board = { id: generateId(), ...insertBoard, createdAt: new Date(), updatedAt: new Date() };
    this.boards.set(board.id, board);
    return board;
  }
  async getBoards() { return Array.from(this.boards.values()).sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); }
  async getBoard(id: string) { return this.boards.get(id); }
  async updateBoard(id: string, update: any) {
    const board = this.boards.get(id);
    if (!board) return undefined;
    const updated = { ...board, ...update, updatedAt: new Date() };
    this.boards.set(id, updated);
    return updated;
  }
  async deleteBoard(id: string) { this.boards.delete(id); }

  async createBoardList(insertList: any) {
    const list = { id: generateId(), ...insertList, createdAt: new Date(), updatedAt: new Date() };
    this.boardLists.set(list.id, list);
    return list;
  }
  async getBoardLists(boardId: string) {
    return Array.from(this.boardLists.values())
      .filter(list => list.boardId === boardId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }
  async updateBoardList(id: string, update: any) {
    const list = this.boardLists.get(id);
    if (!list) return undefined;
    const updated = { ...list, ...update, updatedAt: new Date() };
    this.boardLists.set(id, updated);
    return updated;
  }
  async deleteBoardList(id: string) { this.boardLists.delete(id); }

  async createCard(insertCard: any) {
    const card = { id: generateId(), ...insertCard, createdAt: new Date(), updatedAt: new Date() };
    this.cards.set(card.id, card);
    return card;
  }
  async getCards(listId: string) {
    return Array.from(this.cards.values())
      .filter(card => card.listId === listId)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  }
  async updateCard(id: string, update: any) {
    const card = this.cards.get(id);
    if (!card) return undefined;
    const updated = { ...card, ...update, updatedAt: new Date() };
    this.cards.set(id, updated);
    return updated;
  }
  async deleteCard(id: string) { this.cards.delete(id); }
}

export const storage = new MemoryStorage();
