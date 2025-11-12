# TradeFlow Self-Hosting Guide

This guide will help you self-host TradeFlow on your own infrastructure.

## Prerequisites

- Node.js 20 or higher
- PostgreSQL database
- Resend API account (for email functionality)

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd TradeFlow
npm install
```

### 2. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure the following variables:

```env
# Database - Get from your PostgreSQL provider (Neon, Supabase, etc.)
DATABASE_URL=postgresql://username:password@hostname:5432/database

# Email - Get from https://resend.com/api-keys
RESEND_API_KEY=re_your_api_key_here

# Server
PORT=5000
NODE_ENV=production
```

### 3. Database Setup

Push the database schema:

```bash
npm run db:push
```

This will create all necessary tables in your PostgreSQL database.

### 4. Build the Application

```bash
npm run build
```

This will:
- Build the React frontend to `dist/public/`
- Bundle the Express server to `dist/index.js`

### 5. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:5000`

## Deployment Options

### Option 1: Render.com (Recommended)

TradeFlow includes a `render.yaml` configuration file for easy deployment:

1. Push your code to GitHub
2. Connect your repository to Render.com
3. Render will automatically detect the `render.yaml` file
4. Add your environment variables in the Render dashboard
5. Deploy!

### Option 2: Docker (Coming Soon)

Docker support will be added in a future update.

### Option 3: VPS (DigitalOcean, Linode, etc.)

1. Install Node.js and PostgreSQL on your VPS
2. Clone the repository
3. Follow the Quick Start steps above
4. Use PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "tradeflow" -- start
pm2 save
pm2 startup
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `RESEND_API_KEY` | Yes | Resend API key for email | `re_xxxxxxxxxxxxx` |
| `PORT` | No | Server port (default: 5000) | `5000` |
| `NODE_ENV` | No | Environment mode | `production` or `development` |

## Database Providers

Compatible PostgreSQL providers:
- [Neon](https://neon.tech/) - Serverless PostgreSQL (Free tier available)
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Railway](https://railway.app/) - Simple deployment platform
- Self-hosted PostgreSQL

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues

Ensure your `DATABASE_URL` is correct and the database is accessible from your server.

Test connection:
```bash
npm run db:push
```

### Port Already in Use

Change the `PORT` in your `.env` file to a different port (e.g., 3000, 8080).

## Support

For issues and questions, please open an issue on the GitHub repository.
