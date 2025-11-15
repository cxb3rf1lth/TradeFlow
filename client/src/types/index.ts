/**
 * Common TypeScript interfaces for TradeFlow application
 */

// ========== CRM Types ==========

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  jobTitle?: string;
  company?: string;
  companyId?: string;
  ownerId?: string;
  status?: string;
  source?: string;
  tags?: string[];
  notes?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  domain?: string;
  industry?: string;
  size?: string;
  description?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  ownerId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Deal {
  id: string;
  name: string;
  value?: number;
  stage?: string;
  status?: "open" | "won" | "lost";
  probability?: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  description?: string;
  companyId?: string;
  contactId?: string;
  ownerId?: string;
  pipelineId?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

// ========== Project Management Types ==========

export interface Board {
  id: string;
  name: string;
  description?: string;
  color?: string;
  ownerId?: string;
  visibility?: "public" | "private" | "team";
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId?: string;
  boardId?: string;
  assigneeId?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  position?: number;
  labels?: string[];
  createdAt: string;
  updatedAt: string;
}

// ========== Activity Types ==========

export interface Activity {
  id: string;
  type: string;
  action: string;
  userId: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any> | string;
  createdAt: string;
}

// ========== Analytics Types ==========

export interface KPIMetric {
  title: string;
  value: string | number;
  change: string;
  trend: "up" | "down";
  icon: any; // Lucide icon component
  color: string;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface DealStageData {
  name: string;
  value: number;
  color: string;
}

// ========== Search Types ==========

export interface SearchResult {
  id: string;
  type: "contact" | "company" | "deal" | "board" | "card" | "activity";
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
}

// ========== Export Types ==========

export interface ExportOptions {
  data: any[];
  filename?: string;
  columns?: string[];
}

// ========== File Upload Types ==========

export interface UploadFileItem {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
}

export interface FileUploadOptions {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  className?: string;
}

// ========== Integration Types ==========

export interface IntegrationConfig {
  accessToken: string;
  [key: string]: any;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors?: string[];
}

// ========== Microsoft 365 Types ==========

export interface OneDriveFile {
  id: string;
  name: string;
  type: "document" | "image" | "video" | "audio" | "folder" | "other";
  size: string;
  modified: string;
  createdAt?: string;
  modifiedAt?: string;
  mimeType?: string;
}

// ========== Toast/Notification Types ==========

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

// ========== API Response Types ==========

export interface ApiError {
  error: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
