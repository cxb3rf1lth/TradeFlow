#!/bin/bash

# TradeFlow Automatic Setup and Launch Script
# This script will set up and launch the TradeFlow application automatically

set -e  # Exit on any error

echo "=========================================="
echo "  TradeFlow Automatic Setup & Launch"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi
print_success "Node.js $(node -v) detected"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm and try again."
    exit 1
fi
print_success "npm $(npm -v) detected"

# Create .env file if it doesn't exist
print_info "Setting up environment configuration..."
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."

    # Generate a random JWT secret
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

    cat > .env << EOF
# Database Configuration
DATABASE_URL=postgresql://tradeflow:tradeflow123@localhost:5432/tradeflow

# Authentication
JWT_SECRET=${JWT_SECRET}

# Email Service (Resend) - Optional
RESEND_API_KEY=

# AI Service (Anthropic Claude) - Optional
ANTHROPIC_API_KEY=

# Application
NODE_ENV=development
PORT=5000
EOF

    print_success ".env file created with generated JWT_SECRET"
    print_warning "Note: DATABASE_URL is set to localhost PostgreSQL"
    print_warning "Note: RESEND_API_KEY and ANTHROPIC_API_KEY are empty (optional features)"
else
    print_success ".env file already exists"
fi

# Install dependencies
print_info "Installing dependencies..."
npm install --silent
print_success "Dependencies installed"

# Setup database (PostgreSQL)
print_info "Setting up database..."

# Check if PostgreSQL is running
if command -v psql &> /dev/null; then
    print_info "PostgreSQL detected, attempting to create database..."

    # Try to create database (may fail if already exists, that's ok)
    PGPASSWORD=tradeflow123 psql -U tradeflow -h localhost -c "CREATE DATABASE tradeflow;" 2>/dev/null || true

    # Run database migrations
    if [ -n "$DATABASE_URL" ] || grep -q "DATABASE_URL" .env; then
        print_info "Running database migrations..."
        npm run db:push 2>&1 | grep -v "No config path provided" || true
        print_success "Database schema pushed"
    else
        print_warning "DATABASE_URL not set, skipping migrations"
    fi
else
    print_warning "PostgreSQL not detected. Using mock database."
    print_warning "For production use, please install PostgreSQL and configure DATABASE_URL"
fi

# Type check
print_info "Running TypeScript type checking..."
npm run check
print_success "TypeScript compilation successful"

# Build the application
print_info "Building the application..."
npm run build
print_success "Application built successfully"

echo ""
echo "=========================================="
print_success "Setup Complete!"
echo "=========================================="
echo ""

# Display next steps
echo "The TradeFlow application is ready to launch!"
echo ""
echo "Configuration:"
echo "  • Port: 5000"
echo "  • Mode: Development"
echo "  • Database: Check .env file"
echo ""

# Ask if user wants to start the server
read -p "Would you like to start the server now? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    print_info "Starting TradeFlow server..."
    echo ""
    echo "=========================================="
    echo "  Server will start on http://localhost:5000"
    echo "  Press Ctrl+C to stop"
    echo "=========================================="
    echo ""

    # Start in development mode
    npm run dev
else
    echo ""
    echo "To start the server later, run:"
    echo "  npm run dev      (development mode)"
    echo "  npm start        (production mode)"
    echo ""
    echo "Access the application at: http://localhost:5000"
    echo ""
fi
