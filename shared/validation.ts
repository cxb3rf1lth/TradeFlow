import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  name: z.string().min(1).max(100).trim().optional(),
  password: z.string().min(8).max(100),
  role: z.enum(['user', 'manager', 'admin', 'executive']).optional(),
});

export const loginSchema = z.object({
  username: z.string().min(3).max(50).trim(),
  password: z.string().min(1),
});

// Contact schemas
export const insertContactSchema = z.object({
  firstName: z.string().min(1).max(100).trim(),
  lastName: z.string().min(1).max(100).trim(),
  email: z.string().email().optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
  companyId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive', 'archived']).default('active'),
});

export const updateContactSchema = insertContactSchema.partial();

// Company schemas
export const insertCompanySchema = z.object({
  name: z.string().min(1).max(200).trim(),
  industry: z.string().max(100).optional().nullable(),
  website: z.string().url().optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  ownerId: z.string().optional().nullable(),
});

export const updateCompanySchema = insertCompanySchema.partial();

// Deal schemas
export const insertDealSchema = z.object({
  title: z.string().min(1).max(200).trim(),
  value: z.number().int().min(0).optional().nullable(),
  stage: z.enum(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']).default('lead'),
  contactId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  ownerId: z.string().optional().nullable(),
  closeDate: z.string().datetime().optional().nullable(),
});

export const updateDealSchema = insertDealSchema.partial();

// Board schemas
export const insertBoardSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  description: z.string().max(500).optional().nullable(),
  color: z.string().max(20).optional().nullable(),
  visibility: z.enum(['private', 'team', 'public']).default('private'),
  ownerId: z.string().optional(),
});

export const updateBoardSchema = insertBoardSchema.partial();

// Email schemas
export const sendEmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  sentBy: z.string(),
});

export const insertEmailTemplateSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  category: z.string().max(50).optional().nullable(),
  createdBy: z.string(),
});

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// ID param schema
export const idParamSchema = z.object({
  id: z.string().min(1),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type InsertContactInput = z.infer<typeof insertContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type InsertCompanyInput = z.infer<typeof insertCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type InsertDealInput = z.infer<typeof insertDealSchema>;
export type UpdateDealInput = z.infer<typeof updateDealSchema>;
export type InsertBoardInput = z.infer<typeof insertBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
