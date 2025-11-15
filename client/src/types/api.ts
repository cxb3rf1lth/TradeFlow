// API response types

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  position?: string;
  companyId?: string;
  ownerId: string;
  createdAt: Date;
}

export interface Company {
  id: string;
  name: string;
  industry?: string;
  city?: string;
  country?: string;
  size?: number;
  ownerId: string;
  createdAt: Date;
}

export interface Deal {
  id: string;
  title: string;
  value?: string;
  currency?: string;
  status: string;
  expectedCloseDate?: Date;
  contactId?: string;
  companyId?: string;
  ownerId: string;
  createdAt: Date;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  ownerId: string;
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
}

export interface TeamLoungeNote {
  id: string;
  content: string;
  author: string;
  isPinned: boolean;
  createdAt: Date;
}
