# TradeFlow - Quick Setup Guide

This guide provides scripts to quickly clone and launch the TradeFlow application.

## 🚀 Single-Line Command (Fastest!)

Clone, setup, and launch TradeFlow with just one command:

```bash
git clone https://github.com/cxb3rf1lth/TradeFlow.git && cd TradeFlow && chmod +x setup-and-launch.sh && ./setup-and-launch.sh
```

This single command will:
- ✅ Clone the repository
- ✅ Install all dependencies (npm install)
- ✅ Create .env configuration file
- ✅ Launch the development server

**Open your browser to http://localhost:5000 when ready!**

---

## Prerequisites

Before running the setup scripts, ensure you have:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)
- **PostgreSQL database** (e.g., Neon, Supabase, or local PostgreSQL)
- **API Keys** (optional for full functionality):
  - Anthropic Claude API key
  - Microsoft 365 OAuth credentials
  - HubSpot, Trello, Bigin credentials (if using those integrations)

---

## Option 1: Automated Setup (Recommended)

### For Linux/Mac:

```bash
# Download and run the setup script
curl -O https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU/setup.sh
chmod +x setup.sh
./setup.sh
```

Or if you already have the repository:

```bash
cd TradeFlow
chmod +x setup.sh
./setup.sh
```

### For Windows (PowerShell):

```powershell
# Download and run the setup script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU/setup.ps1" -OutFile "setup.ps1"
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

Or if you already have the repository:

```powershell
cd TradeFlow
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

The script will:
1. ✅ Check for Node.js, npm, and git
2. ✅ Clone the repository (or update if exists)
3. ✅ Checkout the correct branch
4. ✅ Install all dependencies
5. ✅ Create .env from .env.example
6. ✅ Optionally create database tables
7. ✅ Optionally start the development server

---

## Option 2: Manual Setup

If you prefer to do it manually:

### Step 1: Clone Repository

```bash
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow
git checkout claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your credentials
nano .env  # or use your preferred editor
```

**Required Configuration:**

```env
# Minimum required for basic functionality
DATABASE_URL=postgresql://your-connection-string
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

**Optional Configuration:**

See `.env.example` for Microsoft 365, HubSpot, Trello, and Bigin credentials.

### Step 4: Create Database Tables

```bash
npm run db:push
```

### Step 5: Start the Application

```bash
npm run dev
```

### Step 6: Access the Application

Open your browser to: **http://localhost:5000**

---

## Quick Start Commands

Once setup is complete, use these commands:

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run check

# Update database schema
npm run db:push
```

---

## Access Points

After starting the server, access these pages:

| Feature | URL |
|---------|-----|
| Dashboard | http://localhost:5000/ |
| Contacts | http://localhost:5000/crm/contacts |
| Companies | http://localhost:5000/crm/companies |
| Deals | http://localhost:5000/crm/deals |
| Project Boards | http://localhost:5000/projects |
| OneDrive | http://localhost:5000/onedrive |
| Calendar | http://localhost:5000/calendar |
| Teams | http://localhost:5000/teams |
| AI Assistant | http://localhost:5000/ai |

---

## Environment Variables Quick Reference

### Required (Minimum)

```env
DATABASE_URL=postgresql://user:password@host:5432/database
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Optional (Full Features)

```env
# Microsoft 365
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-secret
MICROSOFT_TENANT_ID=your-tenant-id

# HubSpot
HUBSPOT_CLIENT_ID=your-client-id
HUBSPOT_CLIENT_SECRET=your-secret

# Trello
TRELLO_API_KEY=your-api-key
TRELLO_API_TOKEN=your-token

# Bigin
BIGIN_CLIENT_ID=your-client-id
BIGIN_CLIENT_SECRET=your-secret
```

---

## Troubleshooting

### Port Already in Use

If port 5000 is in use, modify the PORT in your `.env`:

```env
PORT=3000
```

### Database Connection Issues

Ensure your DATABASE_URL is correct and the database is accessible:

```bash
# Test connection
psql "your-database-url"
```

### Missing Dependencies

If you see import errors, reinstall dependencies:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Permission Denied (Linux/Mac)

Make the setup script executable:

```bash
chmod +x setup.sh
```

### Script Execution Policy (Windows)

If PowerShell blocks the script:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

---

## Getting API Keys

### Anthropic Claude API
1. Visit: https://console.anthropic.com/
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Add to `.env` as `ANTHROPIC_API_KEY`

### PostgreSQL Database (Neon - Free)
1. Visit: https://neon.tech/
2. Sign up for free account
3. Create a new project
4. Copy the connection string
5. Add to `.env` as `DATABASE_URL`

### Microsoft 365 OAuth
1. Visit: https://portal.azure.com/
2. Go to "App registrations"
3. Create new registration
4. Add required API permissions
5. Create client secret
6. Add credentials to `.env`

### HubSpot
1. Visit: https://developers.hubspot.com/
2. Create developer account
3. Create app
4. Get client ID and secret
5. Add to `.env`

### Trello
1. Visit: https://trello.com/power-ups/admin
2. Create new Power-Up
3. Get API key and token
4. Add to `.env`

### Bigin (Zoho)
1. Visit: https://api-console.zoho.com/
2. Create client ID
3. Get credentials
4. Add to `.env`

---

## Next Steps After Setup

1. **Configure OAuth Apps** for Microsoft 365, HubSpot, Trello, Bigin
2. **Add Authentication** (user login/signup system)
3. **Deploy to Production** (Vercel, Render, AWS, etc.)
4. **Set up Webhooks** for real-time sync
5. **Configure Email Service** (Resend, SendGrid, etc.)

---

## Documentation

- **Complete Guide**: `COMPLETE_IMPLEMENTATION.md`
- **Technical Details**: `IMPLEMENTATION_STATUS.md`
- **Environment Setup**: `.env.example`

---

## Support

If you encounter issues:

1. Check the documentation files
2. Ensure all prerequisites are installed
3. Verify .env configuration
4. Check database connection
5. Review error messages in terminal

---

## What You Get

✅ Complete CRM (HubSpot-equivalent)
✅ Project Management (Trello-equivalent)
✅ Microsoft 365 Integration (OneDrive, OneNote, Outlook, Teams)
✅ AI-Powered Features (Claude AI)
✅ Bidirectional Sync (HubSpot, Trello, Bigin)
✅ Modern React UI
✅ 50+ Database Tables
✅ 100+ API Endpoints
✅ Type-Safe Throughout
✅ Production-Ready

**Happy coding!** 🚀
