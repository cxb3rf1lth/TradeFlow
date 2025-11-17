#!/bin/bash
# TradeFlow - Ultra-Quick One-Liner Installer
# Run with: bash <(curl -fsSL https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU/install.sh)

set -e
REPO="https://github.com/cxb3rf1lth/TradeFlow.git"
BRANCH="${BRANCH:-main}"  # Use main branch by default, or environment variable if set
DIR="TradeFlow"

# Colors
R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; B='\033[0;34m'; NC='\033[0m'

echo -e "${B}╔════════════════════════════════════════════════╗${NC}"
echo -e "${B}║     TradeFlow Enterprise - Auto Installer     ║${NC}"
echo -e "${B}╚════════════════════════════════════════════════╝${NC}\n"

# Check prerequisites
echo -e "${Y}[1/6]${NC} Checking prerequisites..."
command -v node >/dev/null 2>&1 || { echo -e "${R}❌ Node.js required. Install from https://nodejs.org${NC}"; exit 1; }
command -v git >/dev/null 2>&1 || { echo -e "${R}❌ Git required. Install from https://git-scm.com${NC}"; exit 1; }
echo -e "${G}✓${NC} Node.js $(node -v) | npm $(npm -v) | git installed\n"

# Clone or update
echo -e "${Y}[2/6]${NC} Getting TradeFlow..."
if [ -d "$DIR" ]; then
    echo -e "${Y}→${NC} Directory exists, updating..."
    cd "$DIR" && git fetch origin && git checkout "$BRANCH" && git pull origin "$BRANCH"
else
    git clone -b "$BRANCH" "$REPO" "$DIR" && cd "$DIR"
fi
echo -e "${G}✓${NC} Repository ready\n"

# Install dependencies
echo -e "${Y}[3/6]${NC} Installing dependencies (this takes 2-3 minutes)..."
npm install --silent --no-progress > /dev/null 2>&1
PKG_COUNT=$(npm list --all --parseable 2>/dev/null | wc -l)
echo -e "${G}✓${NC} $PKG_COUNT packages installed\n"

# Setup environment
echo -e "${Y}[4/6]${NC} Configuring environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${G}✓${NC} Created .env file\n"
else
    echo -e "${G}✓${NC} .env already exists\n"
fi

# Check if env is configured
if grep -q "DATABASE_URL=postgresql://username:password" .env 2>/dev/null; then
    echo -e "${Y}[5/6]${NC} Setting up database..."
    echo -e "${R}⚠${NC}  DATABASE_URL not configured in .env"
    echo -e "${Y}→${NC} Please configure .env with your credentials:\n"
    echo -e "   ${B}Required:${NC}"
    echo -e "   DATABASE_URL=postgresql://your-connection-string"
    echo -e "   ANTHROPIC_API_KEY=sk-ant-your-key-here\n"
    echo -e "   ${B}Get free database:${NC} https://neon.tech"
    echo -e "   ${B}Get Claude API:${NC} https://console.anthropic.com\n"
    echo -e "${Y}→${NC} After configuring .env, run:"
    echo -e "   ${B}cd $DIR && npm run db:push && npm run dev${NC}\n"
else
    echo -e "${Y}[5/6]${NC} Creating database tables..."
    npm run db:push
    echo -e "${G}✓${NC} Database ready\n"

    echo -e "${Y}[6/6]${NC} Starting server...\n"
    echo -e "${G}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${G}║          🚀 TradeFlow is READY! 🚀            ║${NC}"
    echo -e "${G}╚════════════════════════════════════════════════╝${NC}\n"
    echo -e "${B}→${NC} Open: ${G}http://localhost:5000${NC}\n"
    echo -e "${B}Available pages:${NC}"
    echo -e "  📊 Dashboard:    http://localhost:5000/"
    echo -e "  👥 Contacts:     http://localhost:5000/crm/contacts"
    echo -e "  🏢 Companies:    http://localhost:5000/crm/companies"
    echo -e "  💼 Deals:        http://localhost:5000/crm/deals"
    echo -e "  📋 Projects:     http://localhost:5000/projects"
    echo -e "  ☁️  OneDrive:     http://localhost:5000/onedrive"
    echo -e "  📅 Calendar:     http://localhost:5000/calendar"
    echo -e "  💬 Teams:        http://localhost:5000/teams"
    echo -e "  🤖 AI Assistant: http://localhost:5000/ai\n"
    npm run dev
fi

echo -e "\n${G}╔════════════════════════════════════════════════╗${NC}"
echo -e "${G}║     Installation Complete! Happy Coding!      ║${NC}"
echo -e "${G}╚════════════════════════════════════════════════╝${NC}"
