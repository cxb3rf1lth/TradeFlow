#!/bin/bash

# TradeFlow Enterprise - Auto Installer
# Run with: bash <(curl -fsSL https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/main/install.sh)

set -e  # Exit on error

# Colors for output
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Repository configuration
REPO_URL="https://github.com/cxb3rf1lth/TradeFlow.git"
TARGET_DIR="TradeFlow"
DEFAULT_BRANCH="main"

# Function to print section headers
print_header() {
    echo ""
    echo -e "${BOLD}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${BOLD}║     TradeFlow Enterprise - Auto Installer     ║${NC}"
    echo -e "${BOLD}╚════════════════════════════════════════════════╝${NC}"
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

    if ! command -v git >/dev/null 2>&1; then
        print_error "git is not installed"
        print_info "Install from: https://git-scm.com"
        errors=$((errors + 1))
    else
        print_success "git is installed"
    fi

    if ! command -v node >/dev/null 2>&1; then
        print_error "Node.js is not installed (v18+ required)"
        print_info "Install from: https://nodejs.org"
        errors=$((errors + 1))
    else
        NODE_VERSION=$(node -v)
        print_success "Node.js $NODE_VERSION is installed"
    fi

    if ! command -v npm >/dev/null 2>&1; then
        print_error "npm is not installed"
        errors=$((errors + 1))
    else
        NPM_VERSION=$(npm -v)
        print_success "npm $NPM_VERSION is installed"
    fi

    if [ $errors -gt 0 ]; then
        print_error "Please install missing prerequisites and try again"
        exit 1
    fi
}

# Setup repository
setup_repository() {
    print_step "2/6" "Setting up repository..."

    if [ -d "$TARGET_DIR" ]; then
        print_info "Directory exists, checking for updates..."
        cd "$TARGET_DIR"
        
        # Check if there are local changes (only if repo is initialized)
        if git rev-parse --verify HEAD >/dev/null 2>&1; then
            if ! git diff-index --quiet HEAD -- 2>/dev/null; then
                print_warning "Local changes detected"
                print_info "Stashing local changes..."
                git stash push -m "Auto-stash before update $(date -Iseconds)" || {
                    print_error "Failed to stash changes"
                    exit 1
                }
            fi
        fi
        
        print_info "Fetching latest changes..."
        git fetch origin || {
            print_error "Failed to fetch from remote"
            exit 1
        }
        
        print_info "Checking out $DEFAULT_BRANCH..."
        git checkout "$DEFAULT_BRANCH" || {
            print_error "Failed to checkout $DEFAULT_BRANCH"
            exit 1
        }
        
        print_info "Pulling latest changes..."
        git pull origin "$DEFAULT_BRANCH" || {
            print_error "Failed to pull changes"
            exit 1
        }
        
        print_success "Repository updated successfully"
    else
        print_info "Cloning repository..."
        git clone -b "$DEFAULT_BRANCH" "$REPO_URL" "$TARGET_DIR" || {
            print_error "Failed to clone repository"
            exit 1
        }
        cd "$TARGET_DIR"
        print_success "Repository cloned successfully"
    fi
}

# Install dependencies
install_dependencies() {
    print_step "3/6" "Installing dependencies..."
    print_warning "This may take 2-3 minutes..."
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Setup environment
setup_environment() {
    print_step "4/6" "Configuring environment..."

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env from .env.example"
        else
            print_warning ".env.example not found, creating basic .env"
            cat > .env << 'EOF'
# TradeFlow Configuration
PORT=5000
NODE_ENV=development

# Optional: PostgreSQL Database URL
# DATABASE_URL=your_database_url_here
# Example: postgresql://username:password@localhost:5432/tradeflow

# Optional: Email service (Resend)
# RESEND_API_KEY=your_resend_key_here

# Optional: Anthropic API
# ANTHROPIC_API_KEY=your_anthropic_key_here
EOF
            print_success "Created basic .env file"
        fi
        print_info "Edit .env to configure your environment variables"
    else
        print_success ".env already exists"
    fi
}

# Check if DATABASE_URL is properly configured
is_database_configured() {
    # Check if DATABASE_URL exists and is not a placeholder
    if [ -f ".env" ]; then
        if grep -q "^DATABASE_URL=[^#]" .env 2>/dev/null; then
            if ! grep -q "^DATABASE_URL=your_database_url_here" .env 2>/dev/null; then
                return 0  # Database is configured
            fi
        fi
    fi
    return 1  # Database is not configured
}

# Setup database
setup_database() {
    print_step "5/6" "Setting up database..."

    if is_database_configured; then
        print_info "Database URL found, running migrations..."
        if npm run db:push; then
            print_success "Database setup complete"
        else
            print_error "Database setup failed"
            print_warning "The app will use in-memory storage"
        fi
    else
        print_warning "DATABASE_URL not configured"
        print_info "Using in-memory storage (data won't persist)"
        print_info "To use a database, set DATABASE_URL in .env and run: npm run db:push"
    fi
}

# Build application
build_application() {
    print_step "6/6" "Building application..."

    if npm run build; then
        print_success "Build completed successfully"
    else
        print_error "Build failed"
        exit 1
    fi
}

# Print final instructions
print_final_instructions() {
    echo ""
    echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║         Installation Complete! 🎉              ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BOLD}Next steps:${NC}"
    echo ""
    echo -e "1. ${BLUE}cd $TARGET_DIR${NC}"
    echo -e "2. ${BLUE}npm run dev${NC}  ${YELLOW}(for development)${NC}"
    echo -e "   ${BLUE}npm start${NC}    ${YELLOW}(for production)${NC}"
    echo ""
    echo -e "The app will be available at: ${GREEN}http://localhost:5000${NC}"
    echo ""
    echo -e "${BOLD}Configuration:${NC}"
    echo -e "- Edit ${BLUE}.env${NC} to configure database and API keys"
    echo -e "- Run ${BLUE}npm run db:push${NC} after setting DATABASE_URL"
    echo ""
    echo -e "For more information, visit:"
    echo -e "${BLUE}https://github.com/cxb3rf1lth/TradeFlow${NC}"
    echo ""
}

# Main installation flow
main() {
    print_header
    check_prerequisites
    setup_repository
    install_dependencies
    setup_environment
    setup_database
    build_application
    print_final_instructions
}

# Run main function
main
