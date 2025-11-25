import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("executive"),
  name: text("name").notNull(),
  avatar: text("avatar"),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("todo"),
  priority: text("priority").notNull().default("medium"),
  assigneeId: varchar("assignee_id"),
  source: text("source").notNull(),
  sourceId: text("source_id"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const integrations = pgTable("integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("disconnected"),
  lastSync: timestamp("last_sync"),
});

export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailLogs = pgTable("email_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  from: text("from"),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentBy: varchar("sent_by").notNull(),
  sender: jsonb("sender").default(sql`'{}'::jsonb`),
  sentAt: timestamp("sent_at").defaultNow(),
  status: text("status").notNull().default("sent"),
  state: text("state").notNull().default("sent"),
  direction: text("direction").notNull().default("outbound"),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  syncStatus: text("sync_status").notNull().default("pending"),
  retryCount: integer("retry_count").notNull().default(0),
});

export const emailDrafts = pgTable("email_drafts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const automationRules = pgTable("automation_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  trigger: text("trigger").notNull(),
  action: text("action").notNull(),
  enabled: boolean("enabled").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notes = pgTable("notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teamLoungeNotes = pgTable("team_lounge_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull().default("note"),
  content: text("content").notNull(),
  author: text("author").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// CRM Models
export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  companyId: varchar("company_id"),
  position: text("position"),
  ownerId: varchar("owner_id"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`),
  source: text("source"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  size: text("size"),
  phone: text("phone"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  country: text("country"),
  postalCode: text("postal_code"),
  ownerId: varchar("owner_id"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pipelines = pgTable("pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull().default("sales"),
  order: integer("order").notNull().default(0),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const pipelineStages = pgTable("pipeline_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pipelineId: varchar("pipeline_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  probability: integer("probability").notNull().default(0),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  value: decimal("value", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  pipelineId: varchar("pipeline_id").notNull(),
  stageId: varchar("stage_id").notNull(),
  contactId: varchar("contact_id"),
  companyId: varchar("company_id"),
  ownerId: varchar("owner_id"),
  expectedCloseDate: timestamp("expected_close_date"),
  closedDate: timestamp("closed_date"),
  status: text("status").notNull().default("open"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  customFields: jsonb("custom_fields").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Project Management (Trello-like)
export const boards = pgTable("boards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  ownerId: varchar("owner_id").notNull(),
  visibility: text("visibility").notNull().default("private"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const boardLists = pgTable("board_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  boardId: varchar("board_id").notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cards = pgTable("cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  listId: varchar("list_id").notNull(),
  boardId: varchar("board_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  order: integer("order").notNull().default(0),
  dueDate: timestamp("due_date"),
  labels: jsonb("labels").default(sql`'[]'::jsonb`),
  assignees: jsonb("assignees").default(sql`'[]'::jsonb`),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  coverImage: text("cover_image"),
  isArchived: boolean("is_archived").notNull().default(false),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cardChecklists = pgTable("card_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull(),
  title: text("title").notNull(),
  items: jsonb("items").notNull().default(sql`'[]'::jsonb`),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cardComments = pgTable("card_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Integration System
export const integrationCredentials = pgTable("integration_credentials", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull(),
  userId: varchar("user_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  credentials: jsonb("credentials").notNull().default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrationConfigs = pgTable("integration_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull(),
  userId: varchar("user_id").notNull(),
  config: jsonb("config").notNull().default(sql`'{}'::jsonb`),
  fieldMappings: jsonb("field_mappings").default(sql`'{}'::jsonb`),
  syncDirection: text("sync_direction").notNull().default("bidirectional"),
  syncFrequency: text("sync_frequency").notNull().default("realtime"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const integrationLogs = pgTable("integration_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  integrationId: varchar("integration_id").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull(),
  message: text("message"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

// Webhooks
export const webhooks = pgTable("webhooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  events: jsonb("events").notNull().default(sql`'[]'::jsonb`),
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const webhookLogs = pgTable("webhook_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  webhookId: varchar("webhook_id").notNull(),
  event: text("event").notNull(),
  payload: jsonb("payload").notNull(),
  response: jsonb("response"),
  status: text("status").notNull(),
  attempts: integer("attempts").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  data: jsonb("data").default(sql`'{}'::jsonb`),
  isRead: boolean("is_read").notNull().default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Documents & Files
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  mimeType: text("mime_type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  folderId: varchar("folder_id"),
  uploadedBy: varchar("uploaded_by").notNull(),
  relatedTo: text("related_to"),
  relatedId: varchar("related_id"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentVersions = pgTable("document_versions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull(),
  version: integer("version").notNull(),
  url: text("url").notNull(),
  size: integer("size").notNull(),
  uploadedBy: varchar("uploaded_by").notNull(),
  changes: text("changes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Custom Fields
export const customFields = pgTable("custom_fields", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entity: text("entity").notNull(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  type: text("type").notNull(),
  options: jsonb("options").default(sql`'[]'::jsonb`),
  isRequired: boolean("is_required").notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activities
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  action: text("action").notNull(),
  userId: varchar("user_id").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Preferences & Theming
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  theme: text("theme").notNull().default("dark"),
  customTheme: jsonb("custom_theme").default(sql`'{}'::jsonb`),
  language: text("language").notNull().default("en"),
  timezone: text("timezone").notNull().default("UTC"),
  dateFormat: text("date_format").notNull().default("MM/DD/YYYY"),
  timeFormat: text("time_format").notNull().default("12h"),
  emailNotifications: boolean("email_notifications").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  preferences: jsonb("preferences").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const themeConfigs = pgTable("theme_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  colors: jsonb("colors").notNull(),
  isPublic: boolean("is_public").notNull().default(false),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Advanced Automation
export const workflowTemplates = pgTable("workflow_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  trigger: jsonb("trigger").notNull(),
  category: text("category"),
  isPublic: boolean("is_public").notNull().default(false),
  usageCount: integer("usage_count").notNull().default(0),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const workflowSteps = pgTable("workflow_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  order: integer("order").notNull(),
  type: text("type").notNull(),
  action: text("action").notNull(),
  config: jsonb("config").notNull(),
  conditions: jsonb("conditions").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workflowId: varchar("workflow_id").notNull(),
  status: text("status").notNull().default("running"),
  input: jsonb("input"),
  output: jsonb("output"),
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Email Automation Enhancement
export const emailThreads = pgTable("email_threads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subject: text("subject").notNull(),
  participants: jsonb("participants").notNull().default(sql`'[]'::jsonb`),
  messageCount: integer("message_count").notNull().default(0),
  lastMessageAt: timestamp("last_message_at"),
  relatedTo: text("related_to"),
  relatedId: varchar("related_id"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailMessages = pgTable("email_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  threadId: varchar("thread_id").notNull(),
  from: text("from").notNull(),
  to: jsonb("to").notNull(),
  cc: jsonb("cc").default(sql`'[]'::jsonb`),
  bcc: jsonb("bcc").default(sql`'[]'::jsonb`),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  htmlBody: text("html_body"),
  summary: text("summary"),
  sentiment: text("sentiment"),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  isRead: boolean("is_read").notNull().default(false),
  isFlagged: boolean("is_flagged").notNull().default(false),
  direction: text("direction").notNull().default("inbound"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const emailRules = pgTable("email_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  conditions: jsonb("conditions").notNull(),
  actions: jsonb("actions").notNull(),
  priority: integer("priority").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: varchar("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Keys
export const apiKeys = pgTable("api_keys", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  key: text("key").notNull().unique(),
  permissions: jsonb("permissions").notNull().default(sql`'[]'::jsonb`),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  changes: jsonb("changes"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Microsoft 365 Integration - OneDrive
export const oneDriveFiles = pgTable("onedrive_files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // file or folder
  mimeType: text("mime_type"),
  size: integer("size"),
  parentId: varchar("parent_id"),
  driveId: text("drive_id").notNull(),
  webUrl: text("web_url"),
  downloadUrl: text("download_url"),
  thumbnailUrl: text("thumbnail_url"),
  sharedWith: jsonb("shared_with").default(sql`'[]'::jsonb`),
  permissions: jsonb("permissions").default(sql`'[]'::jsonb`),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  isShared: boolean("is_shared").notNull().default(false),
  isSynced: boolean("is_synced").notNull().default(true),
  lastModifiedBy: text("last_modified_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const oneDriveSyncQueue = pgTable("onedrive_sync_queue", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  fileId: varchar("file_id").notNull(),
  action: text("action").notNull(), // upload, download, delete, update
  status: text("status").notNull().default("pending"),
  priority: integer("priority").notNull().default(0),
  retryCount: integer("retry_count").notNull().default(0),
  error: text("error"),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

// Microsoft 365 Integration - OneNote
export const oneNoteNotebooks = pgTable("onenote_notebooks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  isShared: boolean("is_shared").notNull().default(false),
  webUrl: text("web_url"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const oneNoteSections = pgTable("onenote_sections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  notebookId: varchar("notebook_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  order: integer("order").notNull().default(0),
  webUrl: text("web_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const oneNotePages = pgTable("onenote_pages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sectionId: varchar("section_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  title: text("title").notNull(),
  content: text("content"),
  contentUrl: text("content_url"),
  level: integer("level").notNull().default(0),
  order: integer("order").notNull().default(0),
  webUrl: text("web_url"),
  tags: jsonb("tags").default(sql`'[]'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

// Microsoft 365 Integration - Outlook
export const outlookCalendars = pgTable("outlook_calendars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  name: text("name").notNull(),
  color: text("color"),
  isDefault: boolean("is_default").notNull().default(false),
  canEdit: boolean("can_edit").notNull().default(true),
  canShare: boolean("can_share").notNull().default(true),
  owner: jsonb("owner").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const outlookEvents = pgTable("outlook_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  calendarId: varchar("calendar_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  subject: text("subject").notNull(),
  body: text("body"),
  bodyPreview: text("body_preview"),
  location: text("location"),
  attendees: jsonb("attendees").default(sql`'[]'::jsonb`),
  organizer: jsonb("organizer").default(sql`'{}'::jsonb`),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isAllDay: boolean("is_all_day").notNull().default(false),
  isCancelled: boolean("is_cancelled").notNull().default(false),
  isOnline: boolean("is_online").notNull().default(false),
  onlineMeetingUrl: text("online_meeting_url"),
  recurrence: jsonb("recurrence"),
  reminder: integer("reminder"), // minutes before
  importance: text("importance").notNull().default("normal"),
  sensitivity: text("sensitivity").notNull().default("normal"),
  showAs: text("show_as").notNull().default("busy"),
  webUrl: text("web_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const outlookContacts = pgTable("outlook_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  displayName: text("display_name").notNull(),
  emailAddresses: jsonb("email_addresses").default(sql`'[]'::jsonb`),
  phoneNumbers: jsonb("phone_numbers").default(sql`'[]'::jsonb`),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  department: text("department"),
  birthday: timestamp("birthday"),
  businessAddress: jsonb("business_address").default(sql`'{}'::jsonb`),
  homeAddress: jsonb("home_address").default(sql`'{}'::jsonb`),
  categories: jsonb("categories").default(sql`'[]'::jsonb`),
  notes: text("notes"),
  linkedContactId: varchar("linked_contact_id"), // Link to CRM contact
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const outlookEmails = pgTable("outlook_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  conversationId: text("conversation_id"),
  subject: text("subject").notNull(),
  bodyPreview: text("body_preview"),
  body: text("body").notNull(),
  from: jsonb("from").notNull(),
  toRecipients: jsonb("to_recipients").default(sql`'[]'::jsonb`),
  ccRecipients: jsonb("cc_recipients").default(sql`'[]'::jsonb`),
  bccRecipients: jsonb("bcc_recipients").default(sql`'[]'::jsonb`),
  replyTo: jsonb("reply_to").default(sql`'[]'::jsonb`),
  hasAttachments: boolean("has_attachments").notNull().default(false),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  importance: text("importance").notNull().default("normal"),
  isRead: boolean("is_read").notNull().default(false),
  isDraft: boolean("is_draft").notNull().default(false),
  flag: jsonb("flag").default(sql`'{}'::jsonb`),
  categories: jsonb("categories").default(sql`'[]'::jsonb`),
  receivedDateTime: timestamp("received_date_time").notNull(),
  sentDateTime: timestamp("sent_date_time"),
  webUrl: text("web_url"),
  linkedThreadId: varchar("linked_thread_id"), // Link to email threads
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

// Microsoft 365 Integration - Teams
export const teamsChannels = pgTable("teams_channels", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  teamId: text("team_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  email: text("email"),
  webUrl: text("web_url"),
  isFavorite: boolean("is_favorite").notNull().default(false),
  membershipType: text("membership_type").notNull().default("standard"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const teamsMessages = pgTable("teams_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  channelId: varchar("channel_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  messageType: text("message_type").notNull().default("message"),
  subject: text("subject"),
  body: text("body").notNull(),
  from: jsonb("from").notNull(),
  mentions: jsonb("mentions").default(sql`'[]'::jsonb`),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  reactions: jsonb("reactions").default(sql`'[]'::jsonb`),
  importance: text("importance").notNull().default("normal"),
  replyToId: varchar("reply_to_id"),
  webUrl: text("web_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const teamsChats = pgTable("teams_chats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  chatType: text("chat_type").notNull(), // oneOnOne, group, meeting
  topic: text("topic"),
  members: jsonb("members").default(sql`'[]'::jsonb`),
  webUrl: text("web_url"),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const teamsChatMessages = pgTable("teams_chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chatId: varchar("chat_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  messageType: text("message_type").notNull().default("message"),
  body: text("body").notNull(),
  from: jsonb("from").notNull(),
  mentions: jsonb("mentions").default(sql`'[]'::jsonb`),
  attachments: jsonb("attachments").default(sql`'[]'::jsonb`),
  reactions: jsonb("reactions").default(sql`'[]'::jsonb`),
  importance: text("importance").notNull().default("normal"),
  replyToId: varchar("reply_to_id"),
  webUrl: text("web_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  deletedAt: timestamp("deleted_at"),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const teamsMeetings = pgTable("teams_meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  microsoftId: text("microsoft_id").notNull().unique(),
  outlookEventId: varchar("outlook_event_id"), // Link to calendar event
  subject: text("subject").notNull(),
  joinUrl: text("join_url"),
  chatId: varchar("chat_id"),
  participants: jsonb("participants").default(sql`'[]'::jsonb`),
  organizer: jsonb("organizer").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isRecurring: boolean("is_recurring").notNull().default(false),
  recordingUrl: text("recording_url"),
  transcriptUrl: text("transcript_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastSyncedAt: timestamp("last_synced_at"),
});

// Claude AI Integration
export const aiConversations = pgTable("ai_conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  context: text("context"), // What the conversation is about
  relatedTo: text("related_to"), // Entity type
  relatedId: varchar("related_id"), // Entity ID
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const aiMessages = pgTable("ai_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  tokens: integer("tokens"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const aiInsights = pgTable("ai_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // email_summary, sentiment_analysis, action_items, etc.
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  insight: text("insight").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  metadata: jsonb("metadata").default(sql`'{}'::jsonb`),
  isApplied: boolean("is_applied").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export const insertIntegrationSchema = createInsertSchema(integrations).omit({ id: true });
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmailLogSchema = createInsertSchema(emailLogs).omit({ id: true, sentAt: true });
export const insertEmailDraftSchema = createInsertSchema(emailDrafts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAutomationRuleSchema = createInsertSchema(automationRules).omit({ id: true, createdAt: true });
export const insertNoteSchema = createInsertSchema(notes).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamLoungeNoteSchema = createInsertSchema(teamLoungeNotes).omit({ id: true, createdAt: true, updatedAt: true });

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCompanySchema = createInsertSchema(companies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPipelineSchema = createInsertSchema(pipelines).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPipelineStageSchema = createInsertSchema(pipelineStages).omit({ id: true, createdAt: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true });

export const insertBoardSchema = createInsertSchema(boards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertBoardListSchema = createInsertSchema(boardLists).omit({ id: true, createdAt: true });
export const insertCardSchema = createInsertSchema(cards).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCardChecklistSchema = createInsertSchema(cardChecklists).omit({ id: true, createdAt: true });
export const insertCardCommentSchema = createInsertSchema(cardComments).omit({ id: true, createdAt: true, updatedAt: true });

export const insertIntegrationCredentialSchema = createInsertSchema(integrationCredentials).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationConfigSchema = createInsertSchema(integrationConfigs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertIntegrationLogSchema = createInsertSchema(integrationLogs).omit({ id: true, createdAt: true });

export const insertWebhookSchema = createInsertSchema(webhooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({ id: true, createdAt: true });

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true });

export const insertDocumentSchema = createInsertSchema(documents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDocumentVersionSchema = createInsertSchema(documentVersions).omit({ id: true, createdAt: true });

export const insertCustomFieldSchema = createInsertSchema(customFields).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).omit({ id: true, createdAt: true, updatedAt: true });
export const insertThemeConfigSchema = createInsertSchema(themeConfigs).omit({ id: true, createdAt: true });

export const insertWorkflowTemplateSchema = createInsertSchema(workflowTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkflowStepSchema = createInsertSchema(workflowSteps).omit({ id: true, createdAt: true });
export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({ id: true, startedAt: true });

export const insertEmailThreadSchema = createInsertSchema(emailThreads).omit({ id: true, createdAt: true });
export const insertEmailMessageSchema = createInsertSchema(emailMessages).omit({ id: true, createdAt: true });
export const insertEmailRuleSchema = createInsertSchema(emailRules).omit({ id: true, createdAt: true, updatedAt: true });

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true });
export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });

export const insertOneDriveFileSchema = createInsertSchema(oneDriveFiles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOneDriveSyncQueueSchema = createInsertSchema(oneDriveSyncQueue).omit({ id: true, createdAt: true });

export const insertOneNoteNotebookSchema = createInsertSchema(oneNoteNotebooks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOneNoteSectionSchema = createInsertSchema(oneNoteSections).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOneNotePageSchema = createInsertSchema(oneNotePages).omit({ id: true, createdAt: true, updatedAt: true });

export const insertOutlookCalendarSchema = createInsertSchema(outlookCalendars).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOutlookEventSchema = createInsertSchema(outlookEvents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOutlookContactSchema = createInsertSchema(outlookContacts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOutlookEmailSchema = createInsertSchema(outlookEmails).omit({ id: true, createdAt: true, updatedAt: true });

export const insertTeamsChannelSchema = createInsertSchema(teamsChannels).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamsMessageSchema = createInsertSchema(teamsMessages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamsChatSchema = createInsertSchema(teamsChats).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamsChatMessageSchema = createInsertSchema(teamsChatMessages).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTeamsMeetingSchema = createInsertSchema(teamsMeetings).omit({ id: true, createdAt: true, updatedAt: true });

export const insertAiConversationSchema = createInsertSchema(aiConversations).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAiMessageSchema = createInsertSchema(aiMessages).omit({ id: true, createdAt: true });
export const insertAiInsightSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });

// Type Exports
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailLog = z.infer<typeof insertEmailLogSchema>;
export type EmailLog = typeof emailLogs.$inferSelect;
export type InsertEmailDraft = z.infer<typeof insertEmailDraftSchema>;
export type EmailDraft = typeof emailDrafts.$inferSelect;
export type InsertAutomationRule = z.infer<typeof insertAutomationRuleSchema>;
export type AutomationRule = typeof automationRules.$inferSelect;
export type InsertNote = z.infer<typeof insertNoteSchema>;
export type Note = typeof notes.$inferSelect;
export type InsertTeamLoungeNote = z.infer<typeof insertTeamLoungeNoteSchema>;
export type TeamLoungeNote = typeof teamLoungeNotes.$inferSelect;

export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;
export type InsertPipeline = z.infer<typeof insertPipelineSchema>;
export type Pipeline = typeof pipelines.$inferSelect;
export type InsertPipelineStage = z.infer<typeof insertPipelineStageSchema>;
export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;

export type InsertBoard = z.infer<typeof insertBoardSchema>;
export type Board = typeof boards.$inferSelect;
export type InsertBoardList = z.infer<typeof insertBoardListSchema>;
export type BoardList = typeof boardLists.$inferSelect;
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cards.$inferSelect;
export type InsertCardChecklist = z.infer<typeof insertCardChecklistSchema>;
export type CardChecklist = typeof cardChecklists.$inferSelect;
export type InsertCardComment = z.infer<typeof insertCardCommentSchema>;
export type CardComment = typeof cardComments.$inferSelect;

export type InsertIntegrationCredential = z.infer<typeof insertIntegrationCredentialSchema>;
export type IntegrationCredential = typeof integrationCredentials.$inferSelect;
export type InsertIntegrationConfig = z.infer<typeof insertIntegrationConfigSchema>;
export type IntegrationConfig = typeof integrationConfigs.$inferSelect;
export type InsertIntegrationLog = z.infer<typeof insertIntegrationLogSchema>;
export type IntegrationLog = typeof integrationLogs.$inferSelect;

export type InsertWebhook = z.infer<typeof insertWebhookSchema>;
export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
export type WebhookLog = typeof webhookLogs.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocumentVersion = z.infer<typeof insertDocumentVersionSchema>;
export type DocumentVersion = typeof documentVersions.$inferSelect;

export type InsertCustomField = z.infer<typeof insertCustomFieldSchema>;
export type CustomField = typeof customFields.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertThemeConfig = z.infer<typeof insertThemeConfigSchema>;
export type ThemeConfig = typeof themeConfigs.$inferSelect;

export type InsertWorkflowTemplate = z.infer<typeof insertWorkflowTemplateSchema>;
export type WorkflowTemplate = typeof workflowTemplates.$inferSelect;
export type InsertWorkflowStep = z.infer<typeof insertWorkflowStepSchema>;
export type WorkflowStep = typeof workflowSteps.$inferSelect;
export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;

export type InsertEmailThread = z.infer<typeof insertEmailThreadSchema>;
export type EmailThread = typeof emailThreads.$inferSelect;
export type InsertEmailMessage = z.infer<typeof insertEmailMessageSchema>;
export type EmailMessage = typeof emailMessages.$inferSelect;
export type InsertEmailRule = z.infer<typeof insertEmailRuleSchema>;
export type EmailRule = typeof emailRules.$inferSelect;

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertOneDriveFile = z.infer<typeof insertOneDriveFileSchema>;
export type OneDriveFile = typeof oneDriveFiles.$inferSelect;
export type InsertOneDriveSyncQueue = z.infer<typeof insertOneDriveSyncQueueSchema>;
export type OneDriveSyncQueue = typeof oneDriveSyncQueue.$inferSelect;

export type InsertOneNoteNotebook = z.infer<typeof insertOneNoteNotebookSchema>;
export type OneNoteNotebook = typeof oneNoteNotebooks.$inferSelect;
export type InsertOneNoteSection = z.infer<typeof insertOneNoteSectionSchema>;
export type OneNoteSection = typeof oneNoteSections.$inferSelect;
export type InsertOneNotePage = z.infer<typeof insertOneNotePageSchema>;
export type OneNotePage = typeof oneNotePages.$inferSelect;

export type InsertOutlookCalendar = z.infer<typeof insertOutlookCalendarSchema>;
export type OutlookCalendar = typeof outlookCalendars.$inferSelect;
export type InsertOutlookEvent = z.infer<typeof insertOutlookEventSchema>;
export type OutlookEvent = typeof outlookEvents.$inferSelect;
export type InsertOutlookContact = z.infer<typeof insertOutlookContactSchema>;
export type OutlookContact = typeof outlookContacts.$inferSelect;
export type InsertOutlookEmail = z.infer<typeof insertOutlookEmailSchema>;
export type OutlookEmail = typeof outlookEmails.$inferSelect;

export type InsertTeamsChannel = z.infer<typeof insertTeamsChannelSchema>;
export type TeamsChannel = typeof teamsChannels.$inferSelect;
export type InsertTeamsMessage = z.infer<typeof insertTeamsMessageSchema>;
export type TeamsMessage = typeof teamsMessages.$inferSelect;
export type InsertTeamsChat = z.infer<typeof insertTeamsChatSchema>;
export type TeamsChat = typeof teamsChats.$inferSelect;
export type InsertTeamsChatMessage = z.infer<typeof insertTeamsChatMessageSchema>;
export type TeamsChatMessage = typeof teamsChatMessages.$inferSelect;
export type InsertTeamsMeeting = z.infer<typeof insertTeamsMeetingSchema>;
export type TeamsMeeting = typeof teamsMeetings.$inferSelect;

export type InsertAiConversation = z.infer<typeof insertAiConversationSchema>;
export type AiConversation = typeof aiConversations.$inferSelect;
export type InsertAiMessage = z.infer<typeof insertAiMessageSchema>;
export type AiMessage = typeof aiMessages.$inferSelect;
export type InsertAiInsight = z.infer<typeof insertAiInsightSchema>;
export type AiInsight = typeof aiInsights.$inferSelect;
