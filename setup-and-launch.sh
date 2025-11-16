#!/bin/bash

# TradeFlow - Automatic Setup and Launch Script
# This script sets up and launches the TradeFlow application

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

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

# Check if required commands are available
check_dependencies() {
    print_info "Checking required dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js (v18 or higher) first."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm first."
        exit 1
    fi
    
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version is $NODE_VERSION. Version 18 or higher is recommended."
    fi
    
    print_success "All required dependencies are installed!"
}

# Install dependencies if needed
install_dependencies() {
    if [ ! -d "node_modules" ]; then
        print_info "Installing npm dependencies (this may take a few minutes)..."
        npm install --silent
        print_success "Dependencies installed successfully!"
    else
        print_info "Dependencies already installed."
    fi
}

# Create .env file if it doesn't exist
create_env_file() {
    if [ ! -f ".env" ]; then
        print_info "Creating .env file from template..."
        
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env file created from .env.example!"
            print_warning "Please edit .env file to configure your database and API keys if needed."
        else
            cat > .env << 'EOF'
# Database - optional (uses in-memory storage if not set)
DATABASE_URL=

# Optional services
RESEND_API_KEY=
ANTHROPIC_API_KEY=

# Port
PORT=5000
EOF
            print_success ".env file created with defaults!"
        fi
    else
        print_info ".env file already exists."
    fi
}

# Launch the application
launch_app() {
    print_info "Launching TradeFlow application..."
    print_info "The app will be available at: http://localhost:5000"
    print_info ""
    print_info "Press Ctrl+C to stop the server"
    print_info ""
    
    # Start the development server
    npm run dev
}

# Main execution
main() {
    echo ""
    echo "=========================================="
    echo "    TradeFlow - Setup & Launch Script    "
    echo "=========================================="
    echo ""
    
    check_dependencies
    install_dependencies
    create_env_file
    
    echo ""
    print_success "Setup completed successfully!"
    echo ""
    
    launch_app
}

# Run the main function
main
