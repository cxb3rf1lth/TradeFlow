#!/bin/bash

# TradeFlow Docker Setup Script
# This script sets up and launches TradeFlow using Docker

set -e

echo "=========================================="
echo "  TradeFlow Docker Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

# Check if Docker is installed
print_info "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker and try again."
    exit 1
fi
print_success "Docker $(docker --version) detected"

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose and try again."
    exit 1
fi
print_success "Docker Compose detected"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_info "Creating .env file..."
    JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)

    cat > .env << EOF
JWT_SECRET=${JWT_SECRET}
RESEND_API_KEY=
ANTHROPIC_API_KEY=
EOF
    print_success ".env file created"
fi

# Stop any existing containers
print_info "Stopping existing containers..."
docker-compose down 2>/dev/null || true
print_success "Existing containers stopped"

# Build and start containers
print_info "Building Docker images..."
docker-compose build

print_success "Docker images built"

print_info "Starting containers..."
docker-compose up -d

print_success "Containers started"

# Wait for database to be ready
print_info "Waiting for database to be ready..."
sleep 5

# Run database migrations
print_info "Running database migrations..."
docker-compose exec -T app npm run db:push || print_warning "Migration may have failed (this is ok if tables already exist)"

echo ""
echo "=========================================="
print_success "TradeFlow is now running!"
echo "=========================================="
echo ""
echo "Access the application at: http://localhost:5000"
echo ""
echo "Useful commands:"
echo "  docker-compose logs -f       # View logs"
echo "  docker-compose stop          # Stop containers"
echo "  docker-compose down          # Stop and remove containers"
echo "  docker-compose restart       # Restart containers"
echo ""
