# TradeFlow - Quick Setup Guide

This guide provides simple instructions to clone, set up, and launch the TradeFlow application.

## Prerequisites

Before running the setup script, ensure you have the following installed:

- **Git** - [Download Git](https://git-scm.com/downloads)
- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js)

To verify your installations, run:
```bash
git --version
node --version
npm --version
```

## Quick Start (Automated Setup)

### Option 1: Download and Run Script

1. Download the setup script:
   ```bash
   curl -O https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/copilot/perform-code-review-and-fix/setup-and-launch.sh
   ```

2. Make it executable:
   ```bash
   chmod +x setup-and-launch.sh
   ```

3. Run the script:
   ```bash
   ./setup-and-launch.sh
   ```

### Option 2: One-Line Command

Run this single command to download and execute the setup script:

```bash
curl -sL https://raw.githubusercontent.com/cxb3rf1lth/TradeFlow/copilot/perform-code-review-and-fix/setup-and-launch.sh | bash
```

### Option 3: Copy-Paste Script

Copy and paste this entire block into your terminal:

```bash
#!/bin/bash
set -e

# Check dependencies
command -v git >/dev/null 2>&1 || { echo "Error: git is required"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "Error: npm is required"; exit 1; }

# Clone repository
echo "Cloning TradeFlow repository..."
rm -rf TradeFlow
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow
git checkout copilot/perform-code-review-and-fix

# Install dependencies
echo "Installing dependencies..."
npm install

# Create .env file
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Database - optional (uses in-memory storage if not set)
DATABASE_URL=

# Optional services
RESEND_API_KEY=
ANTHROPIC_API_KEY=

# Port
PORT=5000
EOF
fi

# Launch application
echo ""
echo "✅ Setup complete! Launching TradeFlow..."
echo "Access the app at: http://localhost:5000"
echo ""
npm run dev
```

## What the Script Does

The automated setup script performs the following steps:

1. ✅ **Checks Dependencies** - Verifies that Git, Node.js, and npm are installed
2. ✅ **Clones Repository** - Downloads the TradeFlow repository from GitHub
3. ✅ **Checks Out Branch** - Switches to the `copilot/perform-code-review-and-fix` branch
4. ✅ **Installs Dependencies** - Runs `npm install` to install all required packages
5. ✅ **Creates .env File** - Sets up environment configuration (optional settings)
6. ✅ **Launches Application** - Starts the development server on port 5000

## Manual Setup (Alternative)

If you prefer to set up manually:

```bash
# 1. Clone the repository
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow

# 2. Checkout the correct branch
git checkout copilot/perform-code-review-and-fix

# 3. Install dependencies
npm install

# 4. (Optional) Create .env file for custom configuration
# The app works without it using in-memory storage

# 5. Start the development server
npm run dev
```

## Accessing the Application

Once the setup is complete and the server is running:

- **URL**: http://localhost:5000
- **Dashboard**: View KPIs and metrics
- **CRM**: Manage contacts, companies, and deals

## Stopping the Application

Press `Ctrl+C` in the terminal where the server is running.

## Troubleshooting

### Port Already in Use

If port 5000 is already in use, you can change it:

1. Create or edit the `.env` file:
   ```bash
   PORT=3000
   ```

2. Restart the server

### Dependencies Installation Fails

Try clearing npm cache and reinstalling:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Git Clone Fails

If you have SSH issues, use HTTPS:
```bash
git clone https://github.com/cxb3rf1lth/TradeFlow.git
```

## Optional Configuration

The application works out of the box with in-memory storage. For advanced features, you can configure:

- `DATABASE_URL` - PostgreSQL connection string for persistent storage
- `RESEND_API_KEY` - For email sending functionality
- `ANTHROPIC_API_KEY` - For AI-powered features

Edit the `.env` file to add these configurations.

## Features Available

✅ **Dashboard** - Overview with KPI metrics  
✅ **CRM System** - Manage contacts, companies, and deals  
✅ **Search & Filter** - Find data quickly  
✅ **Responsive Design** - Works on all devices  
✅ **Dark Theme** - Professional UI with animations  

## Support

For issues or questions:
- Check the [GitHub repository](https://github.com/cxb3rf1lth/TradeFlow)
- Review the main README.md in the repository
- Check the PR description for detailed documentation

---

**Ready to go?** Run the setup script and start using TradeFlow! 🚀
