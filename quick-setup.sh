#!/bin/bash

# TradeFlow v2.0 - Quick Automated Setup
# One command to clone, setup, and launch

set -e

echo "🚀 TradeFlow v2.0 - Automated Setup Starting..."
echo ""

# Clone repository
echo "📥 Cloning repository..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow

# Checkout the correct branch
echo "🔀 Checking out secure branch..."
git checkout claude/test-all-functions-011CV4nFtp28nXs6dzFEeAoR

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Generate JWT secret and create .env
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
cat > .env << EOF
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=5000
EOF

echo "✅ JWT_SECRET: $JWT_SECRET"

# Build application
echo "🏗️  Building application..."
npm run build

# Start server in background
echo "🚀 Starting server..."
PORT=5000 npm start > /tmp/tradeflow.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > /tmp/tradeflow.pid

sleep 5

# Create default admin user
echo "👤 Creating admin user..."
ADMIN_PASS="Admin@$(date +%Y)!"
curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"$ADMIN_PASS\",\"role\":\"admin\"}" | \
  grep -o '"token":"[^"]*' | cut -d'"' -f4 > /tmp/tradeflow.token

TOKEN=$(cat /tmp/tradeflow.token)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ TradeFlow v2.0 is LIVE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  🌐 URL:       http://localhost:5000"
echo "  👤 Username:  admin"
echo "  🔐 Password:  $ADMIN_PASS"
echo "  🔑 Token:     $TOKEN"
echo ""
echo "  📁 Location:  $TEMP_DIR/TradeFlow"
echo "  📋 Logs:      tail -f /tmp/tradeflow.log"
echo "  🛑 Stop:      kill \$(cat /tmp/tradeflow.pid)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Open http://localhost:5000 in your browser!"
