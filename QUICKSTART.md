# TradeFlow Quick Start Guide

Get your TradeFlow platform up and running in minutes!

## 📥 Download Options

### Option 1: Clone from GitHub (Recommended)
```bash
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow
```

### Option 2: Download Archive
If you have the `TradeFlow-complete.tar.gz` file:
```bash
tar -xzf TradeFlow-complete.tar.gz
cd TradeFlow
```

## 🚀 Launch Methods

### Method 1: Automatic Setup (Easiest)

**One command to set up everything:**

```bash
chmod +x setup.sh
./setup.sh
```

This script will:
- ✅ Check your Node.js installation
- ✅ Install all dependencies
- ✅ Create environment configuration
- ✅ Set up the database
- ✅ Build the application
- ✅ Optionally start the server

**Requirements:**
- Node.js 18+
- PostgreSQL (optional - will use mock DB if not available)

---

### Method 2: Docker Setup (Most Reliable)

**Includes PostgreSQL database:**

```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

This will:
- ✅ Build Docker images
- ✅ Start PostgreSQL container
- ✅ Start TradeFlow container
- ✅ Run database migrations
- ✅ Everything ready to use!

**Requirements:**
- Docker and Docker Compose

**Useful Docker Commands:**
```bash
docker-compose logs -f        # View logs
docker-compose stop           # Stop containers
docker-compose restart        # Restart
docker-compose down           # Remove containers
```

---

### Method 3: Manual Setup

**Step-by-step manual installation:**

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env
# Edit .env and add your configuration

# 3. Set up database (if using PostgreSQL)
npm run db:push

# 4. Build the application
npm run build

# 5. Start the server
npm run dev        # Development mode
# or
npm start          # Production mode
```

---

## 🌐 Access the Application

Once started, open your browser and go to:

```
http://localhost:5000
```

### First Time Setup

1. **Register an account**
   - Click "Register" tab
   - Fill in your details
   - Choose role: Executive or Virtual PA

2. **Login**
   - Use your credentials
   - You'll be redirected to the dashboard

3. **Explore features**
   - Dashboard: Overview and quick actions
   - Tasks: Manage tasks with AI assistance
   - Email: Send emails (PA role only)
   - Notes: Create notes with AI features
   - Team Lounge: Team communication
   - Integrations: Connect external services
   - Automation: Set up workflow rules
   - Analytics: View metrics and insights

---

## 🔧 Configuration

### Environment Variables

Edit the `.env` file:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/tradeflow
JWT_SECRET=your-secret-key-here

# Optional (for AI and email features)
ANTHROPIC_API_KEY=your-anthropic-key
RESEND_API_KEY=your-resend-key

# Application
NODE_ENV=development
PORT=5000
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### Database Options

**Option A: Use Docker (Easiest)**
```bash
./docker-setup.sh
# PostgreSQL included automatically
```

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
sudo apt install postgresql  # Ubuntu/Debian
brew install postgresql      # macOS

# Create database
createdb tradeflow

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://user:password@localhost:5432/tradeflow
```

**Option C: Cloud Database (Production)**
- Use [Neon](https://neon.tech) (free tier available)
- Use [Render PostgreSQL](https://render.com) (free tier available)
- Copy connection string to DATABASE_URL

---

## 🎯 Quick Feature Guide

### Creating Your First Task
1. Go to Tasks page
2. Click "Create Task"
3. Fill in title, description, priority
4. Click "Create" - AI will suggest priority!

### Using AI Features
1. **Email Drafting** (PA role): Click "AI Draft" in email composer
2. **Note Summarization**: Create a note, click "AI Summarize"
3. **Action Items**: In notes, click "Extract Action Items"
4. **Task Priority**: When creating tasks, AI suggests priority

### Setting Up Automation
1. Go to Automation page
2. Click "Create Rule"
3. Choose trigger (e.g., "Task Created")
4. Choose action (e.g., "Send Email")
5. Configure and enable

### Connecting Integrations
1. Go to Integrations page
2. Find the service (Trello, Jira, etc.)
3. Click "Connect"
4. Enter API credentials
5. Click "Sync" to import data

---

## 🆘 Troubleshooting

### Port 5000 Already in Use
```bash
# Find and kill process using port 5000
lsof -i :5000           # macOS/Linux
netstat -ano | findstr :5000  # Windows
kill -9 <PID>
```

### Database Connection Failed
```bash
# Check if PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Build Errors
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Docker Issues
```bash
# Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Next Steps

### Learn More
- Read [README.md](README.md) for full feature list
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Review API documentation in README.md

### Get API Keys (Optional)

**For AI Features:**
1. Go to [Anthropic](https://www.anthropic.com/)
2. Sign up and get API key
3. Add to `.env` as `ANTHROPIC_API_KEY`

**For Email Features:**
1. Go to [Resend](https://resend.com/)
2. Sign up and get API key
3. Add to `.env` as `RESEND_API_KEY`

### Deploy to Production
See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Render.com deployment
- Heroku deployment
- VPS/Cloud server setup
- Domain configuration
- SSL certificates

---

## 📞 Getting Help

- **Issues**: [GitHub Issues](https://github.com/cxb3rf1lth/TradeFlow/issues)
- **Documentation**: Check README.md and DEPLOYMENT.md
- **Logs**:
  - Development: Check console output
  - Docker: `docker-compose logs -f`

---

## ✅ Success Checklist

- [ ] Repository cloned or archive extracted
- [ ] Setup script executed successfully
- [ ] Application accessible at http://localhost:5000
- [ ] Account registered and logged in
- [ ] Dashboard visible with features
- [ ] Database connected (if using PostgreSQL)
- [ ] Optional: API keys configured for AI/Email

**You're all set! Start managing your team efficiently with TradeFlow!** 🎉

---

## 🔄 Updating TradeFlow

```bash
# Pull latest changes
git pull origin main

# Reinstall dependencies
npm install

# Run migrations
npm run db:push

# Rebuild
npm run build

# Restart
npm run dev  # or npm start
```

---

**Need more help? Check the full [README.md](README.md) or [DEPLOYMENT.md](DEPLOYMENT.md)**
