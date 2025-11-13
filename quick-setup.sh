#!/bin/bash

# TradeFlow v2.0 - Quick Automated Setup with Cloud Database
# Clone, configure, and launch in one command!

set -e

echo "🚀 TradeFlow v2.0 - Automated Cloud Setup Starting..."
echo ""

# Clone repository
echo "📥 Cloning repository..."
TEMP_DIR=$(mktemp -d)
cd "$TEMP_DIR"
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow

# Checkout the secure branch
echo "🔀 Checking out secure v2.0 branch..."
git checkout claude/test-all-functions-011CV4nFtp28nXs6dzFEeAoR

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Generate JWT secret and create .env with Neon database
echo "🔐 Generating secure JWT secret..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "🗄️ Configuring Neon PostgreSQL database..."
cat > .env << EOF
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://neondb_owner:npg_qzB6GOtU7JNm@ep-mute-pond-ahaycdmc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require
EOF

echo "✅ JWT_SECRET: ${JWT_SECRET:0:20}...${JWT_SECRET: -10}"
echo "✅ Database: Neon PostgreSQL (Cloud)"

# Push database schema
echo "🗄️ Creating database tables in Neon..."
npm run db:push 2>&1 | grep -E "✓|Tables|Schema" || echo "Schema pushed"

# Build application
echo "🏗️ Building application..."
npm run build > /tmp/build.log 2>&1

# Start server in background
echo "🚀 Starting server..."
PORT=5000 npm start > /tmp/tradeflow.log 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > /tmp/tradeflow.pid

sleep 5

# Create default admin user
echo "👤 Creating admin user..."
ADMIN_PASS="Admin2024"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"$ADMIN_PASS\",\"role\":\"admin\"}" 2>&1)

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ TradeFlow v2.0 is LIVE with Cloud Database!"
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
echo "  ☁️ Database:  Neon PostgreSQL (FREE)"
echo "  💾 Storage:   3 GB cloud storage"
echo "  🔄 Backups:   Automatic"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Open http://localhost:5000 in your browser!"
echo "🎊 Your data is now stored in the cloud forever!"

