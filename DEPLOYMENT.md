# TradeFlow Deployment Guide

This guide provides multiple methods to deploy and run TradeFlow in various environments.

## 📋 Table of Contents

1. [Quick Start (Automatic Setup)](#quick-start-automatic-setup)
2. [Docker Deployment](#docker-deployment)
3. [Manual Setup](#manual-setup)
4. [Production Deployment](#production-deployment)
5. [Environment Variables](#environment-variables)
6. [Database Setup](#database-setup)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (Automatic Setup)

The easiest way to get started is using the automatic setup script:

```bash
# Make the setup script executable
chmod +x setup.sh

# Run the setup script
./setup.sh
```

This script will:
- ✅ Check Node.js and npm installation
- ✅ Install all dependencies
- ✅ Create .env configuration
- ✅ Set up the database
- ✅ Build the application
- ✅ Optionally start the server

**Requirements:**
- Node.js 18+ and npm
- PostgreSQL (optional, will use mock DB if not available)

---

## 🐳 Docker Deployment

For a containerized deployment with PostgreSQL included:

```bash
# Make the Docker setup script executable
chmod +x docker-setup.sh

# Run the Docker setup
./docker-setup.sh
```

This will:
- ✅ Build Docker images
- ✅ Start PostgreSQL container
- ✅ Start TradeFlow application container
- ✅ Run database migrations
- ✅ Set up networking between containers

**Requirements:**
- Docker and Docker Compose

**Useful Docker Commands:**

```bash
# View logs
docker-compose logs -f

# Stop containers
docker-compose stop

# Restart containers
docker-compose restart

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

---

## 🔧 Manual Setup

If you prefer to set up manually:

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and edit it:

```bash
cp .env.example .env
nano .env  # or use your preferred editor
```

### 3. Set Up Database

If using PostgreSQL:

```bash
# Create database
createdb tradeflow

# Or using psql
psql -U postgres -c "CREATE DATABASE tradeflow;"

# Run migrations
npm run db:push
```

### 4. Build the Application

```bash
npm run build
```

### 5. Start the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The application will be available at `http://localhost:5000`

---

## 🌐 Production Deployment

### Render.com Deployment

The project includes a `render.yaml` configuration for easy deployment to Render.com:

1. Push your code to GitHub
2. Connect your repository to Render.com
3. Set the following environment variables in Render dashboard:
   - `DATABASE_URL` (provided by Render PostgreSQL)
   - `JWT_SECRET` (generate a secure random string)
   - `RESEND_API_KEY` (optional)
   - `ANTHROPIC_API_KEY` (optional)

### Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:mini

# Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set RESEND_API_KEY=your_key_here
heroku config:set ANTHROPIC_API_KEY=your_key_here

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:push
```

### VPS/Cloud Server Deployment

```bash
# On your server, clone the repository
git clone https://github.com/your-username/TradeFlow.git
cd TradeFlow

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env

# Build
npm run build

# Set up PM2 for process management
npm install -g pm2
pm2 start npm --name "tradeflow" -- start
pm2 save
pm2 startup
```

### Nginx Reverse Proxy Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/tradeflow` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `RESEND_API_KEY` | Email service API key | _(optional)_ |
| `ANTHROPIC_API_KEY` | Claude AI API key | _(optional)_ |

### Generating Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 💾 Database Setup

### PostgreSQL Setup

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
postgres=# CREATE DATABASE tradeflow;
postgres=# CREATE USER tradeflow WITH PASSWORD 'tradeflow123';
postgres=# GRANT ALL PRIVILEGES ON DATABASE tradeflow TO tradeflow;
postgres=# \q
```

#### macOS (Homebrew)
```bash
brew install postgresql
brew services start postgresql
createdb tradeflow
```

#### Windows
Download and install from [postgresql.org](https://www.postgresql.org/download/windows/)

### Neon Serverless PostgreSQL (Recommended for Cloud)

1. Go to [neon.tech](https://neon.tech)
2. Create a free account
3. Create a new project
4. Copy the connection string
5. Set it as `DATABASE_URL` in your `.env`

### Running Migrations

```bash
npm run db:push
```

---

## 🔍 Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Database Connection Issues

```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -U tradeflow -h localhost -d tradeflow

# Check DATABASE_URL format
echo $DATABASE_URL
```

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

### Permission Errors

```bash
# Make scripts executable
chmod +x setup.sh
chmod +x docker-setup.sh

# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
```

### Docker Issues

```bash
# Clear Docker cache
docker system prune -a

# Rebuild images
docker-compose build --no-cache

# Check logs
docker-compose logs app
docker-compose logs postgres
```

---

## 📊 Health Checks

The application includes health check endpoints:

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Expected response: {"status":"ok"}
```

---

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npm run db:push

# Rebuild
npm run build

# Restart (if using PM2)
pm2 restart tradeflow
```

### Database Backups

```bash
# Backup database
pg_dump -U tradeflow tradeflow > backup.sql

# Restore database
psql -U tradeflow tradeflow < backup.sql
```

---

## 📞 Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/your-username/TradeFlow/issues)
- Review the main [README.md](README.md)
- Check application logs: `docker-compose logs -f` or `pm2 logs tradeflow`

---

## 🎉 Success!

Once deployed, you can:
1. Access the application at `http://localhost:5000` (or your domain)
2. Register a new account
3. Start using TradeFlow features:
   - Task management
   - Email automation (PA role)
   - Notes with AI features
   - Team lounge
   - Integrations
   - Automation rules
   - Analytics

Enjoy your TradeFlow platform! 🚀
