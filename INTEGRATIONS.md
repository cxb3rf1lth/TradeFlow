# TradeFlow Platform Integrations Guide

This guide covers all available integrations in TradeFlow and how to set them up.

## Table of Contents

1. [Overview](#overview)
2. [Available Integrations](#available-integrations)
3. [Setup Instructions](#setup-instructions)
4. [AI Features (Claude)](#ai-features-claude)
5. [Automation & Workflows](#automation--workflows)
6. [Webhooks](#webhooks)
7. [API Documentation](#api-documentation)

## Overview

TradeFlow now supports comprehensive integrations with multiple platforms, providing a unified interface for:

- **CRM**: HubSpot, Bigin by Zoho
- **Project Management**: Trello
- **Cloud Storage**: Microsoft OneDrive
- **Note Taking**: Microsoft OneNote
- **Email**: Microsoft Outlook
- **Team Collaboration**: Microsoft Teams
- **AI Assistance**: Claude by Anthropic

All integrations feature:
- ✅ OAuth 2.0 authentication
- ✅ Two-way data synchronization
- ✅ Real-time webhook support
- ✅ AI-powered insights
- ✅ Automated workflows

## Available Integrations

### CRM Platforms

#### HubSpot CRM
**Features:**
- Contact synchronization
- Company management
- Deal/opportunity tracking
- Email integration
- Activity tracking

**Capabilities:**
- Import/export contacts, companies, and deals
- Real-time sync via webhooks
- Bi-directional updates
- Custom field mapping

#### Bigin by Zoho CRM
**Features:**
- Contact management
- Company tracking
- Pipeline management
- Activity logging

**Capabilities:**
- Full CRM data sync
- Pipeline stage tracking
- Custom field support
- Automated data updates

### Project Management

#### Trello
**Features:**
- Board synchronization
- List and card management
- Checklist support
- Comment synchronization

**Capabilities:**
- Create and sync boards
- Move cards between lists
- Add comments and attachments
- Webhook notifications

### Microsoft Ecosystem

All Microsoft integrations use a single OAuth connection via Microsoft Graph API.

#### OneDrive (Cloud Storage)
**Features:**
- File storage and retrieval
- Folder management
- File sharing
- Version control

**Capabilities:**
- Upload/download files
- Create folders
- Sync documents
- Share with team members

#### OneNote (Note Taking)
**Features:**
- Notebook synchronization
- Section and page management
- Rich text note support

**Capabilities:**
- Create and sync notes
- Organize in notebooks
- Search across notes
- Share notebooks

#### Outlook (Email)
**Features:**
- Email synchronization
- Contact sync
- Calendar integration
- Email sending

**Capabilities:**
- Read and send emails
- Sync contacts
- Manage calendar events
- Search email history

#### Microsoft Teams
**Features:**
- Team channel access
- Message synchronization
- File sharing
- Notifications

**Capabilities:**
- Send messages to channels
- Access team files
- Get notifications
- Integration with workflows

## Setup Instructions

### Environment Configuration

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Configure the required API keys and secrets:

```env
# AI Integration - Claude
ANTHROPIC_API_KEY=your_api_key_here

# HubSpot CRM
HUBSPOT_CLIENT_ID=your_client_id
HUBSPOT_CLIENT_SECRET=your_client_secret
HUBSPOT_REDIRECT_URI=http://localhost:5000/api/integrations/hubspot/callback

# Bigin by Zoho
BIGIN_CLIENT_ID=your_client_id
BIGIN_CLIENT_SECRET=your_client_secret
BIGIN_REDIRECT_URI=http://localhost:5000/api/integrations/bigin/callback

# Trello
TRELLO_API_KEY=your_api_key
TRELLO_API_SECRET=your_api_secret
TRELLO_REDIRECT_URI=http://localhost:5000/api/integrations/trello/callback

# Microsoft (OneDrive, OneNote, Outlook, Teams)
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/integrations/microsoft/callback

# Webhooks
WEBHOOK_SECRET=your_webhook_secret
```

### Obtaining API Credentials

#### HubSpot
1. Go to [HubSpot Developer Portal](https://developers.hubspot.com/)
2. Create a new app
3. Configure OAuth redirect URI
4. Copy Client ID and Client Secret
5. Required scopes: `crm.objects.contacts.*`, `crm.objects.companies.*`, `crm.objects.deals.*`

#### Bigin by Zoho
1. Visit [Zoho API Console](https://api-console.zoho.com/)
2. Create a new client
3. Set up OAuth redirect
4. Copy credentials
5. Required scopes: `ZohoBigin.modules.ALL`, `ZohoBigin.settings.ALL`

#### Trello
1. Go to [Trello Power-Ups](https://trello.com/power-ups/admin)
2. Create a new Power-Up
3. Get API Key and Secret
4. Configure OAuth settings

#### Microsoft (All Services)
1. Visit [Azure Portal](https://portal.azure.com/)
2. Go to "Azure Active Directory" > "App registrations"
3. Create a new registration
4. Add redirect URI
5. Create a client secret
6. Required scopes:
   - OneDrive: `Files.ReadWrite.All`, `Sites.ReadWrite.All`
   - OneNote: `Notes.ReadWrite.All`
   - Outlook: `Mail.ReadWrite`, `Mail.Send`, `Contacts.ReadWrite`
   - Teams: `Team.ReadBasic.All`, `Channel.ReadBasic.All`, `ChannelMessage.Send`

#### Claude AI (Anthropic)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Create an API key
3. Copy the key to your `.env` file

### Database Migration

Run the migration to create all necessary tables:

```bash
# Using PostgreSQL
psql -U username -d tradeflow -f server/migrations/add-all-integration-tables.sql
```

Or if using the Drizzle ORM:
```bash
npm run db:push
```

### Connecting Integrations

1. Log in to TradeFlow
2. Navigate to **Integrations** page
3. Click **Connect** on the desired integration
4. Authorize the OAuth connection
5. Wait for the initial sync to complete

## AI Features (Claude)

TradeFlow integrates Claude AI for intelligent automation and insights.

### Available AI Features

#### Email Analysis
- Sentiment analysis
- Priority detection
- Action item extraction
- Smart summarization
- Response generation

**API Endpoint:**
```
POST /api/ai/analyze-email
{
  "subject": "Email subject",
  "body": "Email content",
  "from": "sender@example.com",
  "to": "recipient@example.com"
}
```

#### Deal Insights
- Win probability calculation
- Risk factor identification
- Next steps recommendations
- Competitor analysis
- Deal health assessment

**API Endpoint:**
```
POST /api/ai/analyze-deal
{
  "name": "Deal name",
  "value": 50000,
  "stage": "proposal",
  "description": "Deal details"
}
```

#### Contact Intelligence
- Engagement scoring
- Interest identification
- Communication style analysis
- Conversation topic suggestions

**API Endpoint:**
```
POST /api/ai/analyze-contact
{
  "name": "John Doe",
  "email": "john@example.com",
  "notes": "Previous interactions"
}
```

#### Meeting Notes Analysis
- Action item extraction
- Decision tracking
- Follow-up identification
- Summary generation

**API Endpoint:**
```
POST /api/ai/analyze-meeting
{
  "notes": "Meeting transcript or notes"
}
```

#### Smart Automation Suggestions
- Workflow recommendations
- Time-saving automations
- Process optimization

**API Endpoint:**
```
POST /api/ai/suggest-automations
{
  "recentActivities": ["activity1", "activity2"],
  "painPoints": ["manual task", "repetitive work"]
}
```

## Automation & Workflows

TradeFlow includes a powerful automation engine that works across all integrations.

### Creating Automations

Automations consist of:
- **Trigger**: What starts the automation
- **Conditions**: When to execute
- **Actions**: What to do

### Example Automations

#### Auto-sync New Contacts
```json
{
  "name": "Sync new HubSpot contacts",
  "trigger": {
    "type": "webhook",
    "integration": "hubspot",
    "event": "contact.creation"
  },
  "actions": [
    {
      "type": "sync_integration",
      "config": {
        "integration": "hubspot",
        "syncType": "contacts"
      }
    },
    {
      "type": "ai_analysis",
      "config": {
        "analysisType": "contact"
      }
    }
  ]
}
```

#### Email Response Automation
```json
{
  "name": "AI-powered email responses",
  "trigger": {
    "type": "email_received",
    "conditions": [
      {
        "field": "priority",
        "operator": "equals",
        "value": "high"
      }
    ]
  },
  "actions": [
    {
      "type": "ai_analysis",
      "config": {
        "analysisType": "email"
      }
    },
    {
      "type": "send_notification",
      "config": {
        "channel": "teams",
        "message": "High priority email received: {{trigger.subject}}"
      }
    }
  ]
}
```

### Automation API

**Create Automation:**
```
POST /api/automations
```

**List Automations:**
```
GET /api/automations
```

**Execute Automation:**
```
POST /api/automations/:id/execute
```

## Webhooks

Webhooks enable real-time synchronization between TradeFlow and external platforms.

### Setting Up Webhooks

1. Navigate to **Settings** > **Webhooks**
2. Click **Create Webhook**
3. Select the integration
4. Choose events to monitor
5. Set the callback URL
6. Save and test

### Webhook Events

#### HubSpot
- `contact.creation`
- `contact.propertyChange`
- `company.creation`
- `deal.creation`

#### Trello
- `createCard`
- `updateCard`
- `deleteCard`
- `createBoard`

#### Microsoft Services
- `mail.received` (Outlook)
- `file.created` (OneDrive)
- `note.created` (OneNote)
- `message.sent` (Teams)

### Webhook Security

All webhooks are secured with:
- HMAC signature verification
- Secret key validation
- Timestamp verification
- IP whitelist support

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All API requests require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Integration Endpoints

#### List Available Integrations
```
GET /api/integrations/available
```

#### Get Connected Integrations
```
GET /api/integrations
```

#### Authorize Integration
```
GET /api/integrations/:type/authorize
```

#### Sync Integration Data
```
POST /api/integrations/:type/sync
{
  "syncType": "contacts" | "companies" | "deals" | "boards"
}
```

#### Test Integration Connection
```
POST /api/integrations/:type/test
```

### AI Endpoints

All AI endpoints require authentication and are rate-limited.

- `POST /api/ai/analyze-email` - Analyze email content
- `POST /api/ai/analyze-deal` - Get deal insights
- `POST /api/ai/analyze-contact` - Analyze contact
- `POST /api/ai/generate-email` - Generate email response
- `POST /api/ai/analyze-meeting` - Extract meeting insights
- `POST /api/ai/summarize` - Summarize text
- `POST /api/ai/sentiment` - Analyze sentiment
- `POST /api/ai/chat` - AI chat interface

### Document Management

- `GET /api/documents` - List all documents
- `POST /api/documents` - Upload document
- `DELETE /api/documents/:id` - Delete document
- `POST /api/documents/sync/onedrive` - Sync with OneDrive

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/yourusername/tradeflow/issues)
- Review the main [README.md](README.md)
- Contact support team

## License

See [LICENSE](LICENSE) file for details.
