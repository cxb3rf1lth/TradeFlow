#!/bin/bash

# TradeFlow - Complete Setup and Launch Script
# This script will clone, setup, and launch the TradeFlow application

set -e  # Exit on any error

echo "=================================================="
echo "   TradeFlow - Enterprise Platform Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_URL="https://github.com/cxb3rf1lth/TradeFlow.git"
BRANCH="claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU"
PROJECT_DIR="TradeFlow"

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
print_info "Checking for Node.js..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION found"

# Check if npm is installed
print_info "Checking for npm..."
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed!"
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION found"

# Check if git is installed
print_info "Checking for git..."
if ! command -v git &> /dev/null; then
    print_error "git is not installed!"
    echo "Please install git from: https://git-scm.com/"
    exit 1
fi
GIT_VERSION=$(git --version)
print_success "$GIT_VERSION found"

echo ""
print_info "All prerequisites met!"
echo ""

# Step 1: Clone the repository
if [ -d "$PROJECT_DIR" ]; then
    print_warning "Directory '$PROJECT_DIR' already exists!"
    read -p "Do you want to remove it and start fresh? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Removing existing directory..."
        rm -rf "$PROJECT_DIR"
    else
        print_info "Using existing directory..."
        cd "$PROJECT_DIR"
        git fetch origin
        git checkout "$BRANCH"
        git pull origin "$BRANCH"
    fi
else
    print_info "Cloning TradeFlow repository..."
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    print_success "Repository cloned successfully"
fi

# Ensure we're in the project directory
if [ ! -d "$PROJECT_DIR" ]; then
    cd "$PROJECT_DIR"
fi

# Step 2: Checkout the correct branch
print_info "Checking out branch: $BRANCH..."
git checkout "$BRANCH"
print_success "On branch: $BRANCH"

echo ""
print_info "Repository setup complete!"
echo ""

# Step 3: Install dependencies
print_info "Installing npm dependencies (this may take a few minutes)..."
npm install
print_success "Dependencies installed successfully"

echo ""

# Step 4: Setup environment file
print_info "Setting up environment configuration..."
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Created .env file from .env.example"
        print_warning "IMPORTANT: You need to configure .env with your credentials!"
        echo ""
        echo "Required environment variables:"
        echo "  - DATABASE_URL (PostgreSQL connection string)"
        echo "  - ANTHROPIC_API_KEY (for Claude AI)"
        echo ""
        echo "Optional (for integrations):"
        echo "  - Microsoft 365 OAuth credentials"
        echo "  - HubSpot OAuth credentials"
        echo "  - Trello API credentials"
        echo "  - Bigin OAuth credentials"
        echo ""
        read -p "Do you want to edit .env now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            if command -v nano &> /dev/null; then
                nano .env
            elif command -v vim &> /dev/null; then
                vim .env
            elif command -v vi &> /dev/null; then
                vi .env
            else
                print_warning "No text editor found. Please edit .env manually."
            fi
        else
            print_warning "Remember to edit .env before running the application!"
        fi
    else
        print_error ".env.example file not found!"
        exit 1
    fi
else
    print_info ".env file already exists"
fi

echo ""

# Step 5: Check if database is configured
if grep -q "DATABASE_URL=postgresql://username:password" .env; then
    print_warning "DATABASE_URL appears to be using example values!"
    print_warning "Please update .env with your actual PostgreSQL connection string"
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Please configure .env and run this script again, or run 'npm run db:push' manually"
        exit 0
    fi
fi

# Step 6: Create database tables
print_info "Setting up database tables..."
read -p "Do you want to create database tables now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Running database migration..."
    npm run db:push
    print_success "Database tables created successfully"
else
    print_warning "Skipping database setup. Run 'npm run db:push' manually when ready."
fi

echo ""
echo "=================================================="
print_success "TradeFlow Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Ensure .env is configured with your credentials:"
echo "   cd $PROJECT_DIR"
echo "   nano .env  # or use your preferred editor"
echo ""
echo "2. If you haven't already, create database tables:"
echo "   npm run db:push"
echo ""
echo "3. Start the development server:"
echo "   npm run dev"
echo ""
echo "4. Open your browser to:"
echo "   http://localhost:5000"
echo ""
echo "Available pages:"
echo "   - Dashboard:     http://localhost:5000/"
echo "   - Contacts:      http://localhost:5000/crm/contacts"
echo "   - Companies:     http://localhost:5000/crm/companies"
echo "   - Deals:         http://localhost:5000/crm/deals"
echo "   - Projects:      http://localhost:5000/projects"
echo "   - OneDrive:      http://localhost:5000/onedrive"
echo "   - Calendar:      http://localhost:5000/calendar"
echo "   - Teams:         http://localhost:5000/teams"
echo "   - AI Assistant:  http://localhost:5000/ai"
echo ""
echo "Documentation:"
echo "   - Complete Guide:     COMPLETE_IMPLEMENTATION.md"
echo "   - Technical Details:  IMPLEMENTATION_STATUS.md"
echo "   - Environment Setup:  .env.example"
echo ""

# Ask if user wants to start the server now
read -p "Do you want to start the development server now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Starting TradeFlow development server..."
    echo ""
    print_success "TradeFlow is starting..."
    echo ""
    npm run dev
else
    print_info "Setup complete! Run 'npm run dev' when you're ready to start."
fi
