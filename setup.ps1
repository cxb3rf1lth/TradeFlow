# TradeFlow - Complete Setup and Launch Script (Windows PowerShell)
# This script will clone, setup, and launch the TradeFlow application

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "   TradeFlow - Enterprise Platform Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$RepoURL = "https://github.com/cxb3rf1lth/TradeFlow.git"
$Branch = "claude/integrate-multi-app-features-011CUzgAwjXsFutQ1i3qj4JU"
$ProjectDir = "TradeFlow"

# Function to print colored messages
function Write-Info {
    param($Message)
    Write-Host "[INFO] " -ForegroundColor Blue -NoNewline
    Write-Host $Message
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] " -ForegroundColor Green -NoNewline
    Write-Host $Message
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] " -ForegroundColor Yellow -NoNewline
    Write-Host $Message
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] " -ForegroundColor Red -NoNewline
    Write-Host $Message
}

# Check if Node.js is installed
Write-Info "Checking for Node.js..."
try {
    $nodeVersion = node -v
    Write-Success "Node.js $nodeVersion found"
} catch {
    Write-Error "Node.js is not installed!"
    Write-Host "Please install Node.js from: https://nodejs.org/"
    exit 1
}

# Check if npm is installed
Write-Info "Checking for npm..."
try {
    $npmVersion = npm -v
    Write-Success "npm $npmVersion found"
} catch {
    Write-Error "npm is not installed!"
    exit 1
}

# Check if git is installed
Write-Info "Checking for git..."
try {
    $gitVersion = git --version
    Write-Success "$gitVersion found"
} catch {
    Write-Error "git is not installed!"
    Write-Host "Please install git from: https://git-scm.com/"
    exit 1
}

Write-Host ""
Write-Info "All prerequisites met!"
Write-Host ""

# Step 1: Clone the repository
if (Test-Path $ProjectDir) {
    Write-Warning "Directory '$ProjectDir' already exists!"
    $response = Read-Host "Do you want to remove it and start fresh? (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Info "Removing existing directory..."
        Remove-Item -Recurse -Force $ProjectDir
        Write-Info "Cloning TradeFlow repository..."
        git clone $RepoURL $ProjectDir
        Set-Location $ProjectDir
        Write-Success "Repository cloned successfully"
    } else {
        Write-Info "Using existing directory..."
        Set-Location $ProjectDir
        git fetch origin
        git checkout $Branch
        git pull origin $Branch
    }
} else {
    Write-Info "Cloning TradeFlow repository..."
    git clone $RepoURL $ProjectDir
    Set-Location $ProjectDir
    Write-Success "Repository cloned successfully"
}

# Step 2: Checkout the correct branch
Write-Info "Checking out branch: $Branch..."
git checkout $Branch
Write-Success "On branch: $Branch"

Write-Host ""
Write-Info "Repository setup complete!"
Write-Host ""

# Step 3: Install dependencies
Write-Info "Installing npm dependencies (this may take a few minutes)..."
npm install
Write-Success "Dependencies installed successfully"

Write-Host ""

# Step 4: Setup environment file
Write-Info "Setting up environment configuration..."
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Success "Created .env file from .env.example"
        Write-Warning "IMPORTANT: You need to configure .env with your credentials!"
        Write-Host ""
        Write-Host "Required environment variables:"
        Write-Host "  - DATABASE_URL (PostgreSQL connection string)"
        Write-Host "  - ANTHROPIC_API_KEY (for Claude AI)"
        Write-Host ""
        Write-Host "Optional (for integrations):"
        Write-Host "  - Microsoft 365 OAuth credentials"
        Write-Host "  - HubSpot OAuth credentials"
        Write-Host "  - Trello API credentials"
        Write-Host "  - Bigin OAuth credentials"
        Write-Host ""
        $response = Read-Host "Do you want to edit .env now? (y/N)"
        if ($response -eq "y" -or $response -eq "Y") {
            notepad .env
        } else {
            Write-Warning "Remember to edit .env before running the application!"
        }
    } else {
        Write-Error ".env.example file not found!"
        exit 1
    }
} else {
    Write-Info ".env file already exists"
}

Write-Host ""

# Step 5: Check if database is configured
$envContent = Get-Content ".env" -Raw
if ($envContent -match "DATABASE_URL=postgresql://username:password") {
    Write-Warning "DATABASE_URL appears to be using example values!"
    Write-Warning "Please update .env with your actual PostgreSQL connection string"
    Write-Host ""
    $response = Read-Host "Do you want to continue anyway? (y/N)"
    if ($response -ne "y" -and $response -ne "Y") {
        Write-Info "Please configure .env and run this script again, or run 'npm run db:push' manually"
        exit 0
    }
}

# Step 6: Create database tables
Write-Info "Setting up database tables..."
$response = Read-Host "Do you want to create database tables now? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Info "Running database migration..."
    npm run db:push
    Write-Success "Database tables created successfully"
} else {
    Write-Warning "Skipping database setup. Run 'npm run db:push' manually when ready."
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Success "TradeFlow Setup Complete!"
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Ensure .env is configured with your credentials:"
Write-Host "   cd $ProjectDir"
Write-Host "   notepad .env"
Write-Host ""
Write-Host "2. If you haven't already, create database tables:"
Write-Host "   npm run db:push"
Write-Host ""
Write-Host "3. Start the development server:"
Write-Host "   npm run dev"
Write-Host ""
Write-Host "4. Open your browser to:"
Write-Host "   http://localhost:5000" -ForegroundColor Green
Write-Host ""
Write-Host "Available pages:"
Write-Host "   - Dashboard:     http://localhost:5000/"
Write-Host "   - Contacts:      http://localhost:5000/crm/contacts"
Write-Host "   - Companies:     http://localhost:5000/crm/companies"
Write-Host "   - Deals:         http://localhost:5000/crm/deals"
Write-Host "   - Projects:      http://localhost:5000/projects"
Write-Host "   - OneDrive:      http://localhost:5000/onedrive"
Write-Host "   - Calendar:      http://localhost:5000/calendar"
Write-Host "   - Teams:         http://localhost:5000/teams"
Write-Host "   - AI Assistant:  http://localhost:5000/ai"
Write-Host ""
Write-Host "Documentation:"
Write-Host "   - Complete Guide:     COMPLETE_IMPLEMENTATION.md"
Write-Host "   - Technical Details:  IMPLEMENTATION_STATUS.md"
Write-Host "   - Environment Setup:  .env.example"
Write-Host ""

# Ask if user wants to start the server now
$response = Read-Host "Do you want to start the development server now? (y/N)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Info "Starting TradeFlow development server..."
    Write-Host ""
    Write-Success "TradeFlow is starting..."
    Write-Host ""
    npm run dev
} else {
    Write-Info "Setup complete! Run 'npm run dev' when you're ready to start."
}
