# TradeFlow - One-Liner Installation

## 🚀 Ultra-Quick Install (Linux/Mac)

### Option 1: Direct Clone & Launch (Recommended)

Copy and paste this **single command** to clone, setup, and launch TradeFlow:

```bash
git clone https://github.com/cxb3rf1lth/TradeFlow.git && cd TradeFlow && chmod +x setup-and-launch.sh && ./setup-and-launch.sh
```

### Option 2: Remote Script Execution

Alternatively, run the installer directly from GitHub:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/main/install.sh)
```

**That's it!** This one command will:
- ✅ Check Node.js and Git
- ✅ Clone the repository
- ✅ Install all 595 dependencies
- ✅ Setup environment file
- ✅ Create database tables (if configured)
- ✅ Start the development server
- ✅ Open on http://localhost:5000

**Total time: ~3 minutes** (mostly npm install)

---

## 📋 Before Running

**You'll need:**
1. **Node.js** (v18+) - [Install here](https://nodejs.org/)
2. **Git** - [Install here](https://git-scm.com/)

**For full functionality, get:**
3. **PostgreSQL Database** - Free at [neon.tech](https://neon.tech)
4. **Claude API Key** - Free tier at [console.anthropic.com](https://console.anthropic.com)

---

## 🎯 What Happens

```
╔════════════════════════════════════════════════╗
║     TradeFlow Enterprise - Auto Installer     ║
╚════════════════════════════════════════════════╝

[1/6] Checking prerequisites...
✓ Node.js v20.11.0 | npm 10.2.4 | git installed

[2/6] Getting TradeFlow...
✓ Repository ready

[3/6] Installing dependencies (this takes 2-3 minutes)...
✓ 595 packages installed

[4/6] Configuring environment...
✓ Created .env file

[5/6] Setting up database...
⚠ DATABASE_URL not configured in .env
→ Please configure .env with your credentials

[6/6] Starting server...
╔════════════════════════════════════════════════╗
║          🚀 TradeFlow is READY! 🚀            ║
╚════════════════════════════════════════════════╝

→ Open: http://localhost:5000
```

---

## 🔧 After Installation

If the script needs you to configure `.env`:

1. **Navigate to the folder:**
   ```bash
   cd TradeFlow
   ```

2. **Edit .env file:**
   ```bash
   nano .env
   ```

3. **Add your credentials:**
   ```env
   DATABASE_URL=postgresql://your-connection-string
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```

4. **Create database tables:**
   ```bash
   npm run db:push
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

6. **Open browser:**
   ```
   http://localhost:5000
   ```

---

## 🌐 All Available Pages

Once running, access:

| Feature | URL |
|---------|-----|
| 📊 Dashboard | http://localhost:5000/ |
| 👥 Contacts | http://localhost:5000/crm/contacts |
| 🏢 Companies | http://localhost:5000/crm/companies |
| 💼 Deals | http://localhost:5000/crm/deals |
| 📋 Projects | http://localhost:5000/projects |
| ☁️ OneDrive | http://localhost:5000/onedrive |
| 📅 Calendar | http://localhost:5000/calendar |
| 💬 Teams | http://localhost:5000/teams |
| 🤖 AI Assistant | http://localhost:5000/ai |

---

## 💡 Alternative: Manual Command

If you can't use curl, clone manually:

```bash
# Clone repository
git clone https://github.com/cxb3rf1lth/TradeFlow.git

# Navigate and install
cd TradeFlow && npm install

# Configure environment
cp .env.example .env
nano .env  # Add your credentials

# Setup and run
npm run db:push
npm run dev
```

---

## 🎁 What You Get

Your one command installs a **complete enterprise platform** with:

### CRM Features (HubSpot-equivalent)
- ✅ Contacts, Companies, Deals
- ✅ Sales Pipeline Management
- ✅ Custom Fields & Tags
- ✅ Activity Tracking

### Project Management (Trello-equivalent)
- ✅ Kanban Boards
- ✅ Cards, Lists, Checklists
- ✅ Labels & Assignees
- ✅ Comments & Attachments

### Microsoft 365 Integration
- ✅ OneDrive (File Management)
- ✅ OneNote (Note Taking)
- ✅ Outlook (Email & Calendar)
- ✅ Teams (Chat & Meetings)

### Claude AI Features
- ✅ Email Analysis & Auto-Reply
- ✅ Contact Intelligence
- ✅ Deal Probability Scoring
- ✅ Conversational Assistant
- ✅ Meeting Summarization

### Integration Sync
- ✅ HubSpot Bidirectional Sync
- ✅ Trello Bidirectional Sync
- ✅ Bigin Bidirectional Sync

### Technical Excellence
- ✅ 50+ Database Tables
- ✅ 100+ API Endpoints
- ✅ Type-Safe (TypeScript)
- ✅ Modern React UI
- ✅ Production-Ready

---

## 🔑 Free Credentials (For Testing)

### Free PostgreSQL Database (Neon.tech)
```bash
# Sign up at: https://neon.tech
# 1. Create account (GitHub login available)
# 2. Create new project
# 3. Copy connection string
# 4. Paste as DATABASE_URL in .env
```

### Free Claude AI API Key
```bash
# Sign up at: https://console.anthropic.com
# 1. Create account
# 2. Go to API Keys
# 3. Create new key
# 4. Paste as ANTHROPIC_API_KEY in .env
```

Both offer **free tiers** perfect for testing!

---

## 🛠️ Troubleshooting

### "command not found: curl"
Install curl:
```bash
# Ubuntu/Debian
sudo apt-get install curl

# macOS (using Homebrew)
brew install curl
```

### "command not found: node"
Install Node.js from [nodejs.org](https://nodejs.org/)

### Port 5000 already in use
Add to `.env`:
```env
PORT=3000
```

### Permission denied
Make script executable:
```bash
chmod +x install.sh
./install.sh
```

---

## 📚 Full Documentation

- **Quick Start**: `QUICK_START.md`
- **Complete Guide**: `COMPLETE_IMPLEMENTATION.md`
- **Technical Details**: `IMPLEMENTATION_STATUS.md`
- **Environment Setup**: `.env.example`

---

## 🎯 Summary

**One command. Three minutes. Complete enterprise platform.**

```bash
git clone https://github.com/cxb3rf1lth/TradeFlow.git && cd TradeFlow && chmod +x setup-and-launch.sh && ./setup-and-launch.sh
```

**That's all you need!** 🚀
