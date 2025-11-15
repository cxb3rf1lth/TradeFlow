-- Migration: Add all integration, CRM, boards, documents, webhooks, and automation tables
-- This migration adds comprehensive support for all platform integrations

-- ========================================
-- CRM Tables
-- ========================================

CREATE TABLE IF NOT EXISTS contacts (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  position TEXT,
  status TEXT NOT NULL DEFAULT 'lead',
  source TEXT,
  tags TEXT,
  notes TEXT,
  assigned_to VARCHAR,
  external_id TEXT,
  external_source TEXT,
  last_contacted_at TIMESTAMP,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_external ON contacts(external_id, external_source);
CREATE INDEX IF NOT EXISTS idx_contacts_created_by ON contacts(created_by);

CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT,
  industry TEXT,
  size TEXT,
  revenue TEXT,
  location TEXT,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  tags TEXT,
  external_id TEXT,
  external_source TEXT,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_external ON companies(external_id, external_source);

CREATE TABLE IF NOT EXISTS deals (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  value INTEGER NOT NULL,
  stage TEXT NOT NULL DEFAULT 'qualification',
  probability INTEGER NOT NULL DEFAULT 50,
  expected_close_date TIMESTAMP,
  contact_id VARCHAR,
  company_id VARCHAR,
  assigned_to VARCHAR,
  description TEXT,
  tags TEXT,
  external_id TEXT,
  external_source TEXT,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_deals_contact ON deals(contact_id);
CREATE INDEX IF NOT EXISTS idx_deals_company ON deals(company_id);
CREATE INDEX IF NOT EXISTS idx_deals_external ON deals(external_id, external_source);

CREATE TABLE IF NOT EXISTS pipelines (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stages (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  probability INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (pipeline_id) REFERENCES pipelines(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_stages_pipeline ON stages(pipeline_id);

-- ========================================
-- Board Tables
-- ========================================

CREATE TABLE IF NOT EXISTS boards (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL DEFAULT 'blue',
  external_id TEXT,
  external_source TEXT,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_boards_external ON boards(external_id, external_source);

CREATE TABLE IF NOT EXISTS board_lists (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id VARCHAR NOT NULL,
  name TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  external_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_board_lists_board ON board_lists(board_id);

CREATE TABLE IF NOT EXISTS cards (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  due_date TIMESTAMP,
  assigned_to VARCHAR,
  labels TEXT,
  external_id TEXT,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (list_id) REFERENCES board_lists(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_cards_list ON cards(list_id);

CREATE TABLE IF NOT EXISTS checklists (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR NOT NULL,
  title TEXT NOT NULL,
  items TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_checklists_card ON checklists(card_id);

CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id VARCHAR NOT NULL,
  content TEXT NOT NULL,
  author_id VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_card ON comments(card_id);

-- ========================================
-- Document Management Tables
-- ========================================

CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  size INTEGER NOT NULL,
  url TEXT NOT NULL,
  path TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'local',
  external_id TEXT,
  parent_id VARCHAR,
  created_by VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_parent ON documents(parent_id);
CREATE INDEX IF NOT EXISTS idx_documents_external ON documents(external_id);
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);

-- ========================================
-- Integration OAuth Tokens
-- ========================================

CREATE TABLE IF NOT EXISTS integration_tokens (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_integration_tokens_integration ON integration_tokens(integration_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_user ON integration_tokens(user_id);

-- ========================================
-- Webhooks
-- ========================================

CREATE TABLE IF NOT EXISTS webhooks (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id VARCHAR NOT NULL,
  url TEXT NOT NULL,
  events TEXT NOT NULL,
  secret TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  external_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (integration_id) REFERENCES integrations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhooks_integration ON webhooks(integration_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_enabled ON webhooks(enabled);

-- ========================================
-- Add indexes for performance
-- ========================================

CREATE INDEX IF NOT EXISTS idx_automation_rules_enabled ON automation_rules(enabled);
CREATE INDEX IF NOT EXISTS idx_automation_rules_created_by ON automation_rules(created_by);

-- ========================================
-- Comments and Notes
-- ========================================

COMMENT ON TABLE contacts IS 'Contact management for CRM with support for external integrations';
COMMENT ON TABLE companies IS 'Company/account management for CRM';
COMMENT ON TABLE deals IS 'Sales deals and opportunities';
COMMENT ON TABLE pipelines IS 'Sales pipelines for deal management';
COMMENT ON TABLE stages IS 'Pipeline stages with order and probability';
COMMENT ON TABLE boards IS 'Project boards (Trello-like) with external sync support';
COMMENT ON TABLE board_lists IS 'Lists within project boards';
COMMENT ON TABLE cards IS 'Task cards within board lists';
COMMENT ON TABLE documents IS 'Document storage with OneDrive integration support';
COMMENT ON TABLE integration_tokens IS 'OAuth tokens for external integrations';
COMMENT ON TABLE webhooks IS 'Webhook configurations for real-time sync';
