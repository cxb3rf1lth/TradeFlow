# TradeFlow Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Render.com (Recommended - Easiest)

TradeFlow is pre-configured for Render.com deployment:

1. **Push to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Create Web Service"

3. **Set Environment Variables** in Render Dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   RESEND_API_KEY=your_resend_api_key
   NODE_ENV=production
   PORT=5000
   ```

4. **Get your live URL**: Render provides a URL like `https://tradeflow.onrender.com`

### Option 2: Vercel (Frontend + Serverless Functions)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables** in Vercel Dashboard:
   - DATABASE_URL
   - RESEND_API_KEY
   - NODE_ENV=production

4. **Your app will be live** at `https://your-project.vercel.app`

### Option 3: Railway.app

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**:
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**:
   ```bash
   railway variables set DATABASE_URL="your_db_url"
   railway variables set RESEND_API_KEY="your_key"
   ```

4. **Generate Domain**:
   ```bash
   railway domain
   ```

### Option 4: Self-Hosted VPS (DigitalOcean, Linode, AWS EC2)

1. **SSH into your server**:
   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js 20+**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and Setup**:
   ```bash
   git clone https://github.com/your-username/TradeFlow.git
   cd TradeFlow
   npm install
   ```

4. **Configure Environment** (create `.env`):
   ```bash
   DATABASE_URL=your_postgresql_url
   RESEND_API_KEY=your_api_key
   NODE_ENV=production
   PORT=5000
   ```

5. **Build and Start**:
   ```bash
   npm run build
   npm run db:push  # Setup database
   ```

6. **Use PM2 for Process Management**:
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "tradeflow" -- start
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx Reverse Proxy**:
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
       }
   }
   ```

8. **Enable HTTPS with Let's Encrypt**:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

## 📊 Database Setup

### Using Neon (Recommended - Free PostgreSQL)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add to your environment variables as `DATABASE_URL`

### Using Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection String
4. Copy the connection pooler URL
5. Add as `DATABASE_URL`

### Using Railway PostgreSQL

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will auto-generate `DATABASE_URL`
3. Link to your web service

## 📧 Email Service Setup (Resend)

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Generate an API key
4. Add to environment as `RESEND_API_KEY`

## 🔧 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `RESEND_API_KEY` | Yes | Resend API key for emails | `re_xxxxxxxxxxxxx` |
| `NODE_ENV` | Yes | Environment mode | `production` |
| `PORT` | No | Server port (default: 5000) | `5000` |

## 🌐 Custom Domain Setup

### Render.com
1. Go to your service → Settings → Custom Domains
2. Add your domain
3. Update DNS records as shown

### Vercel
1. Go to project → Settings → Domains
2. Add custom domain
3. Follow DNS configuration steps

### VPS/Self-Hosted
1. Point your domain's A record to your server IP
2. Configure Nginx with your domain
3. Run `sudo certbot --nginx -d yourdomain.com`

## 🔒 Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure firewall rules
- [ ] Enable rate limiting
- [ ] Use strong passwords
- [ ] Keep dependencies updated
- [ ] Monitor logs regularly

## 📱 Android App Deployment

See [android/README.md](android/README.md) for Android app build and deployment instructions.

## 🚨 Troubleshooting

### Build Fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check database allows external connections
- Test connection: `npm run db:push`

### Port Already in Use
- Change `PORT` in `.env`
- Or kill existing process: `lsof -ti:5000 | xargs kill -9`

### App Not Loading
- Check server logs: `pm2 logs tradeflow`
- Verify all environment variables are set
- Ensure database migrations ran: `npm run db:push`

## 📞 Support

For deployment issues:
- Check documentation: [SELF_HOSTING.md](SELF_HOSTING.md)
- Review logs for specific errors
- Open an issue on GitHub

## 🎉 Success!

Once deployed, your TradeFlow instance will be accessible at your domain/URL. Login and start managing your executive workflows!

**Default Access**:
- URL: `https://your-domain.com`
- Role: Executive or Personal Assistant
- Features: Full access to all modules

Enjoy your self-hosted TradeFlow Executive Hub! 🚀
