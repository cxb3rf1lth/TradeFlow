#!/bin/bash

# TradeFlow v2.0 - Complete Setup and Launch Script
# This script will set up and launch your TradeFlow application with full security

set -e  # Exit on error

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "   TradeFlow v2.0 - Secure Enterprise Edition Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to print info message
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Function to print section header
section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Check if Node.js is installed
section "1. Checking Prerequisites"
if ! command -v node &> /dev/null; then
    error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi
NODE_VERSION=$(node -v)
success "Node.js $NODE_VERSION detected"

if ! command -v npm &> /dev/null; then
    error "npm is not installed. Please install npm first."
    exit 1
fi
NPM_VERSION=$(npm -v)
success "npm $NPM_VERSION detected"

# Install dependencies
section "2. Installing Dependencies"
info "This may take a few minutes..."
npm install
success "All dependencies installed successfully"

# Generate JWT secret
section "3. Setting Up Environment Variables"
if [ -f .env ]; then
    warning ".env file already exists"
    read -p "Do you want to regenerate it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        success "Using existing .env file"
    else
        rm .env
    fi
fi

if [ ! -f .env ]; then
    info "Generating secure JWT secret..."
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

    cat > .env << EOF
# TradeFlow v2.0 Environment Variables
# Generated on $(date)

# 🔒 CRITICAL - Security (REQUIRED)
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=5000

# Optional - Features
# RESEND_API_KEY=re_your_api_key_here
# DATABASE_URL=postgresql://user:pass@host:5432/db
# ALLOWED_ORIGINS=https://yourdomain.com
EOF

    success ".env file created with secure JWT_SECRET"
    info "JWT Secret: $JWT_SECRET"
else
    # Check if JWT_SECRET exists in .env
    if ! grep -q "JWT_SECRET=" .env; then
        warning "JWT_SECRET not found in .env, adding it..."
        JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        echo "JWT_SECRET=$JWT_SECRET" >> .env
        success "JWT_SECRET added to .env"
    else
        success "JWT_SECRET found in .env"
    fi
fi

# Build the application
section "4. Building Application"
info "Building production bundle..."
npm run build
success "Application built successfully"

# Ask about database setup
section "5. Database Setup (Optional)"
if grep -q "^DATABASE_URL=.\+" .env 2>/dev/null; then
    warning "PostgreSQL database URL detected"
    read -p "Do you want to push database schema? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm run db:push
        success "Database schema pushed"
    fi
else
    success "Using in-memory storage (data will not persist between restarts)"
fi

# Start the server in background
section "6. Starting Server"
info "Starting TradeFlow server on port 5000..."
PORT=5000 npm start > /tmp/tradeflow.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > /tmp/tradeflow.pid

# Wait for server to start
info "Waiting for server to initialize..."
sleep 5

# Check if server is running
if ps -p $SERVER_PID > /dev/null 2>&1; then
    success "Server started successfully (PID: $SERVER_PID)"
else
    error "Server failed to start. Check /tmp/tradeflow.log for details"
    cat /tmp/tradeflow.log
    exit 1
fi

# Create admin user
section "7. Creating Admin User"
warning "You need to create an admin user to access the application"
echo ""

# Default values
DEFAULT_USERNAME="admin"
DEFAULT_PASSWORD="Admin@2024!"

read -p "Enter admin username (default: admin): " ADMIN_USERNAME
ADMIN_USERNAME=${ADMIN_USERNAME:-$DEFAULT_USERNAME}

read -s -p "Enter admin password (min 8 chars): " ADMIN_PASSWORD
echo ""
if [ -z "$ADMIN_PASSWORD" ]; then
    ADMIN_PASSWORD=$DEFAULT_PASSWORD
    warning "Using default password: $DEFAULT_PASSWORD"
fi

read -p "Enter admin name (optional): " ADMIN_NAME

# Create the admin user
echo ""
info "Creating admin user..."

# Build JSON payload
if [ -z "$ADMIN_NAME" ]; then
    JSON_PAYLOAD=$(cat <<EOF
{
  "username": "$ADMIN_USERNAME",
  "password": "$ADMIN_PASSWORD",
  "role": "admin"
}
EOF
)
else
    JSON_PAYLOAD=$(cat <<EOF
{
  "username": "$ADMIN_USERNAME",
  "password": "$ADMIN_PASSWORD",
  "name": "$ADMIN_NAME",
  "role": "admin"
}
EOF
)
fi

# Register admin user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "$JSON_PAYLOAD")

if echo "$REGISTER_RESPONSE" | grep -q "token"; then
    success "Admin user created successfully!"

    # Extract and display token
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo ""
    echo "Your JWT Token (save this):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$TOKEN"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
else
    warning "Admin user may already exist or registration failed"
    echo "Response: $REGISTER_RESPONSE"
fi

# Final information
section "8. Setup Complete! 🎉"
echo ""
success "TradeFlow is now running!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Access Information"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 Application URL:     http://localhost:5000"
echo "  👤 Admin Username:      $ADMIN_USERNAME"
echo "  🔐 Admin Password:      [hidden]"
echo "  🔑 JWT Token:           [saved above]"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Useful Commands"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  View logs:              tail -f /tmp/tradeflow.log"
echo "  Stop server:            kill \$(cat /tmp/tradeflow.pid)"
echo "  Restart:                npm start"
echo "  Check status:           ps -p \$(cat /tmp/tradeflow.pid)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  API Test Examples"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "# Login:"
echo "curl -X POST http://localhost:5000/api/auth/login \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"username\":\"$ADMIN_USERNAME\",\"password\":\"YOUR_PASSWORD\"}'"
echo ""
echo "# Get contacts (use your token):"
echo "curl -H 'Authorization: Bearer YOUR_TOKEN' \\"
echo "  http://localhost:5000/api/contacts"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Documentation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📖 README.md                 - Quick start & API docs"
echo "  📋 IMPLEMENTATION_SUMMARY.md - Security implementation"
echo "  🔍 CODE_REVIEW.md            - Code review report"
echo "  ✅ TESTING.md                - Testing checklist"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
success "Open your browser and navigate to http://localhost:5000"
echo ""
warning "Server is running in the background. Use 'kill \$(cat /tmp/tradeflow.pid)' to stop it."
echo ""
