#!/bin/bash

# TradeFlow Enterprise - Auto Installer
# Handles both fresh installs and updates

set -euo pipefail  # Exit on error, treat undefined variables as errors, and fail on pipeline errors

# Colors for output
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Repository configuration
DEFAULT_REPO_URL="https://github.com/cxb3rf1lth/TradeFlow.git"
REPO_URL="${1:-$DEFAULT_REPO_URL}"
TARGET_DIR="TradeFlow"
DEFAULT_BRANCH="main"

# Usage/help message
if [[ "$#" -gt 0 ]] && [[ "$1" == "-h" || "$1" == "--help" ]]; then
    echo -e "${BOLD}Usage:${NC} $0 [REPO_URL]"
    echo "If REPO_URL is not provided, defaults to $DEFAULT_REPO_URL"
    exit 0
fi

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║     TradeFlow Enterprise - Auto Installer     ║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════╝${NC}"
    echo -e "${BOLD}Repository:${NC} $REPO_URL"
    echo ""
}

# Function to print step
print_step() {
    echo -e "\n${BLUE}[$1] $2${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error
print_error() {
    echo -e "${RED}✘${NC} $1"
}

# Function to print info
print_info() {
    echo -e "${BLUE}→${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_step "1/6" "Checking prerequisites..."

    local errors=0

    if ! command -v git &> /dev/null; then
        print_error "git is not installed"
        errors=$((errors + 1))
    fi

    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed (v18+ required)"
        errors=$((errors + 1))
    else
        NODE_MAJOR_VERSION=$(node -v | cut -d. -f1 | sed 's/v//')
        if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
            print_error "Node.js v18 or higher is required (found v${NODE_MAJOR_VERSION})"
            errors=$((errors + 1))
        fi
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        errors=$((errors + 1))
    fi

    if [ $errors -gt 0 ]; then
        print_error "Please install missing prerequisites"
        exit 1
    fi

    NODE_VERSION=$(node -v)
    NPM_VERSION=$(npm -v)
    print_success "Node.js $NODE_VERSION | npm $NPM_VERSION | git installed"
}

# Get or update repository
setup_repository() {
    print_step "2/6" "Getting TradeFlow..."

    if [ -d "$TARGET_DIR" ]; then
        print_info "Directory exists, updating..."
        cd "$TARGET_DIR"

        # Stash any local changes to avoid conflicts
        if ! git diff-index --quiet HEAD --; then
            print_info "Stashing local changes..."
            git stash push -m "Auto-stash by install script $(date)"
        fi

        # Fetch latest changes
        git fetch origin

        # Try to checkout the default branch
        if ! git checkout "$DEFAULT_BRANCH"; then
            print_error "Failed to checkout branch '$DEFAULT_BRANCH'. Please check that the branch exists and you have the correct permissions."
            exit 1
        fi

        # Pull latest changes
        if ! git pull origin "$DEFAULT_BRANCH" --rebase; then
            print_error "Failed to pull latest changes from '$DEFAULT_BRANCH'. Please check your network connection and permissions."
            exit 1
        fi

    else
        # Fresh clone
        git clone "$REPO_URL" "$TARGET_DIR"
        cd "$TARGET_DIR"
        git checkout "$DEFAULT_BRANCH"
    fi

    print_success "Repository ready"
}

# Install dependencies
install_dependencies() {
    print_step "3/6" "Installing dependencies (this takes 2-3 minutes)..."

    # Install with npm
    npm install --silent 2>&1 || true

    # Count installed packages
    PACKAGE_COUNT=$(npm list --depth=0 --json 2>/dev/null | jq '.dependencies | length' 2>/dev/null || echo "0")
    print_success "$PACKAGE_COUNT packages installed"
}

# Configure environment
setup_environment() {
    print_step "4/6" "Configuring environment..."

    if [ -f ".env" ]; then
        print_success ".env already exists"
    else
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env created from .env.example"
        else
            cat > .env << 'EOF'
# Database configuration is not currently supported; the application always uses in-memory storage.
# (The following DATABASE_URL setting is reserved for future use.)
# DATABASE_URL=postgresql://user:password@host:port/database

# Optional API Keys
RESEND_API_KEY=
ANTHROPIC_API_KEY=

# Server Configuration
PORT=5000
NODE_ENV=development
EOF
            print_success ".env created with defaults"
        fi
    fi
}

# Setup database (only if DATABASE_URL is set)
setup_database() {
    print_step "5/6" "Creating database tables..."

    # Source the .env file to check for DATABASE_URL
    if [ -f ".env" ]; then
        set -a
        source .env
        set +a
    fi

    # Check if DATABASE_URL is set and not empty
    if [ -z "${DATABASE_URL:-}" ]; then
        print_warning "DATABASE_URL not set, skipping database setup"
        print_info "App currently only supports in-memory storage"
        print_info "Database persistence is not yet implemented"
    else
        # Run database migrations
        npm run db:push
        print_success "Database tables created"
    fi
}

# Build the application
build_application() {
    print_step "6/6" "Building application..."

    npm run build
    print_success "Application built successfully"
}

# Print completion message
print_completion() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║         Installation Complete! 🎉              ║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓${NC} TradeFlow is ready to use!"
    echo ""
    echo -e "${BOLD}Quick Start:${NC}"
    echo -e "  cd $TARGET_DIR"
    echo -e "  npm run dev"
    echo ""
    echo -e "${BOLD}Access the app:${NC}"
    echo -e "  http://localhost:5000"
    echo ""

    if [ -z "${DATABASE_URL:-}" ]; then
        echo -e "${YELLOW}Note:${NC} Application uses in-memory storage only."
        echo -e "  Database persistence is not yet implemented."
        echo ""
    fi
}

# Main execution
main() {
    print_header

    check_prerequisites
    setup_repository
    install_dependencies
    setup_environment
    setup_database
    build_application

    print_completion
}

# Run main function
main
