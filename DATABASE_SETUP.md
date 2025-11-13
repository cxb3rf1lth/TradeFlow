# Cloud Database Setup Guide - Neon PostgreSQL

TradeFlow v2.0 supports cloud PostgreSQL hosting. This guide shows you how to migrate from in-memory storage to **Neon** (free tier, serverless PostgreSQL).

## Why Neon?

- ✅ **FREE tier** - Perfect for development and small apps
- ✅ **Serverless** - Autoscales, no server management
- ✅ **3 GB storage** on free tier
- ✅ **1 project** with unlimited databases
- ✅ **Instant setup** - No credit card required

## Step 1: Create Free Neon Account

1. Go to https://neon.tech/
2. Click "Sign Up" (use GitHub, Google, or email)
3. Verify your email if needed

## Step 2: Create a New Project

1. Once logged in, click "New Project"
2. Choose:
   - **Name**: TradeFlow
   - **Region**: Choose closest to you (e.g., US East, EU West)
   - **PostgreSQL version**: 16 (latest)
3. Click "Create Project"

## Step 3: Get Your Connection String

After project creation, you'll see a connection string like:

```
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
```

**Copy this entire string!**

## Step 4: Update Your .env File

Open your `.env` file and add the DATABASE_URL:

```env
# 🔒 CRITICAL - Security (REQUIRED)
JWT_SECRET=your-existing-jwt-secret
NODE_ENV=production
PORT=5000

# 🗄️ DATABASE - Neon PostgreSQL (FREE)
DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require

# Optional - Features
# RESEND_API_KEY=re_your_api_key
# ALLOWED_ORIGINS=https://yourdomain.com
```

Replace the DATABASE_URL value with your actual connection string from Neon.

## Step 5: Install Database Dependencies (Already Included)

The required packages are already in package.json:
- `drizzle-orm` - ORM for database operations
- `@neondatabase/serverless` - Neon-specific driver
- `postgres` - PostgreSQL client

## Step 6: Push Database Schema

Run this command to create all tables in your Neon database:

```bash
npm run db:push
```

You should see output like:
```
✓ Database schema pushed successfully
✓ Tables created: users, contacts, companies, deals, boards, notes, etc.
```

## Step 7: Restart Your Application

```bash
# Stop current server
kill $(cat /tmp/tradeflow.pid)

# Rebuild and start
npm run build
npm start
```

## Step 8: Verify Database Connection

Test that your app is now using Neon:

```bash
# Create a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"testdb","password":"Test1234","role":"user"}'

# Login to verify data persistence
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"testdb","password":"Test1234"}'
```

If you get a token back, your database is working! 🎉

## Monitoring Your Database

1. Go to https://console.neon.tech/
2. Select your TradeFlow project
3. Click "Tables" to see your data
4. Click "Monitoring" to see usage stats

## Free Tier Limits

- **Storage**: 3 GB
- **Compute**: 300 compute hours/month
- **Branches**: 10 (great for dev/staging/production)
- **Databases**: Unlimited per project

## Migration from In-Memory to Neon

Data in memory storage is lost on restart. After switching to Neon:

1. ✅ **Data persists** across server restarts
2. ✅ **Better performance** with indexes
3. ✅ **Backup & restore** via Neon dashboard
4. ✅ **Branching** for dev/staging environments

## Troubleshooting

### Error: "Connection timeout"
- Check your DATABASE_URL is correct
- Ensure `?sslmode=require` is at the end
- Verify your IP isn't blocked (Neon free tier allows all IPs)

### Error: "relation does not exist"
- Run `npm run db:push` to create tables
- Check database name in connection string

### Data not persisting
- Verify DATABASE_URL is in .env
- Check server logs: `tail -f /tmp/tradeflow.log`
- Ensure server restarted after adding DATABASE_URL

## Alternative: Supabase (Also Free)

If you prefer Supabase:

1. Go to https://supabase.com/
2. Create project
3. Get connection string from Settings > Database
4. Use format: `postgresql://postgres:password@db.xxx.supabase.co:5432/postgres`
5. Follow same steps above

## Production Deployment

For production with Neon:

1. Create separate Neon project for production
2. Use Neon's "Production" branch
3. Enable connection pooling
4. Set up automated backups
5. Monitor usage via Neon dashboard

## Need Help?

- **Neon Docs**: https://neon.tech/docs/introduction
- **TradeFlow Issues**: https://github.com/cxb3rf1lth/TradeFlow/issues
- **Database Schema**: See `shared/schema.ts`

---

**Status**: Follow this guide to migrate from in-memory to persistent cloud database!
