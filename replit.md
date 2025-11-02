# Executive Hub - Team Management Platform

A comprehensive team management platform designed for executive teams (3-4 people) and a Virtual PA, integrating multiple productivity tools into a unified dashboard.

## Overview

Executive Hub streamlines workflow management by integrating with:
- **Trello** - Task boards and project management
- **HubSpot** - CRM and sales pipeline management
- **Jira** - Issue tracking and software development
- **NetSuite** - ERP and financial management
- **OneDrive** - Document storage and sharing
- **OneNote** - Note-taking and organization
- **Microsoft Teams** - Team communication
- **Claude AI** - Intelligent task analysis and automation suggestions
- **Email (Resend)** - Automated email sending (PA-only feature)

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS + Shadcn UI + TipTap (Rich Text Editor)
- **Backend**: Express.js + Node.js
- **Database**: PostgreSQL (Neon serverless) with Drizzle ORM
- **Storage**: Database-backed persistence for notes, team lounge posts, and email drafts/logs
- **AI Integration**: Anthropic Claude API
- **Email**: Resend API (using API key stored in secrets)
- **Design System**: Fluent Design System (Microsoft ecosystem familiarity)

## User Roles

### Executive
- View unified dashboard with tasks from all integrations
- Monitor team workload and analytics
- Access AI insights and recommendations
- Create rich-formatted notes with professional editing toolbar
- Participate in Team Lounge (share notes, jokes, suggestions, acknowledgements)
- Manage personal tasks and documents

### Virtual PA
- All executive features plus:
- **Email Center** - Send automated emails to team/clients with templates and automation
- **Bulk Operations** - Manage multiple tasks at once
- **Automation Rules** - Create workflow automations
- **Advanced Task Management** - Assign and redistribute tasks
- **NetSuite Integration** - Manage customers, invoices, and sales orders

## Key Features

### Rich Text Editor (Notes)
- Professional editing toolbar similar to Microsoft Word and Obsidian
- Support for: Bold, Italic, Underline, Strikethrough, Headings, Lists, Links, Images, Tables
- Text alignment and color options
- Highlight and formatting tools
- Auto-save and version history (planned)

### Team Lounge
- Casual team communication space
- Post types: Notes, Jokes, Suggestions, Acknowledgements
- Pin important posts for visibility
- React to posts with thumbs up, hearts, etc.
- Filter by pinned or all posts

### NetSuite Integration
- View customers, invoices, and sales orders
- Real-time sync with NetSuite data
- Dashboard metrics: Active customers, pending invoices, monthly revenue
- Token-Based Authentication (TBA) using OAuth 1.0

### Email Center (PA-Only)
- Compose and send emails with Resend API
- Email templates for common scenarios
- Email history and tracking
- Automation rules: Weekly status emails, overdue task reminders, new task notifications
- **Note**: Uses Resend API with API key authentication (stored as RESEND_API_KEY secret)

## Development

- Dark mode is the default theme
- Responsive design for desktop and mobile
- Accessible navigation with breadcrumbs and ARIA labels
- Real-time integration status monitoring
- **Database Persistence**: All notes, team lounge posts, and email drafts/logs persist across sessions
- React Query for efficient data fetching and caching
- Drizzle ORM for type-safe database operations

## Environment Variables

Required secrets:
- `ANTHROPIC_API_KEY` - For Claude AI features
- `SESSION_SECRET` - For session management
- `RESEND_API_KEY` - For email sending (PA feature)

Optional API keys for integrations:
- Trello API key
- HubSpot API key
- Jira API credentials
- Microsoft Graph API credentials (OneDrive, Teams, OneNote)
- NetSuite credentials: Account ID, Consumer Key, Consumer Secret, Token ID, Token Secret

## User Interface

- **Role Switcher**: Test both Executive and PA experiences with a single click
- **Dark Mode Default**: Professional dark theme optimized for long work sessions
- **Responsive Design**: Optimized for desktop and mobile devices
- **Fluent Design System**: Familiar Microsoft-style interface elements
- **Breadcrumb Navigation**: Always know where you are in the app
- **Collapsible Sidebar**: Access all features and integrations quickly

## Future Enhancements

- Bi-directional sync across all platforms
- AI-powered meeting preparation briefs
- Advanced reporting and custom metrics
- Intelligent task delegation based on workload
- Mobile app for on-the-go access
- Real-time collaboration on notes
- Integration with more enterprise tools (Salesforce, Asana, Monday.com)
