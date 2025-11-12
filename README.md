# TradeFlow - Executive Hub

A comprehensive team management platform for executives, featuring email management, notes, team communication, and integrations with OneDrive, HubSpot, Jira, Trello, and Microsoft Teams.

## Features

- **Email Center**: Send and manage team emails with Resend API integration
- **Rich Text Notes**: Create and edit notes with TipTap editor
- **Team Lounge**: Casual communication hub for team members
- **NetSuite Integration**: ERP and financial management
- **Multiple Integrations**: Trello, HubSpot, Jira, OneDrive, OneNote, Teams
- **Mobile Support**: Progressive Web App (PWA) with Android app available

## Quick Start

### Web Application

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Push database schema
npm run db:push

# Development
npm run dev

# Production build
npm run build
npm start
```

### Android Application

See [android/README.md](android/README.md) for instructions on building and installing the native Android app.

## Self-Hosting

For detailed self-hosting instructions, see [SELF_HOSTING.md](SELF_HOSTING.md).

### Required Environment Variables

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
RESEND_API_KEY=re_your_api_key
PORT=5000
NODE_ENV=production
```

## Project Structure

```
TradeFlow/
├── client/               # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── App.tsx      # Main app component
│   └── public/          # Static assets & PWA files
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── db-storage.ts    # Database operations
├── shared/              # Shared code
│   └── schema.ts        # Database schema
├── android/             # Native Android app
│   └── app/            # Android WebView wrapper
└── dist/                # Production build output
```

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Tailwind CSS + Shadcn UI
- TipTap Editor
- Wouter (routing)
- TanStack Query

**Backend:**
- Express.js
- Node.js
- PostgreSQL + Drizzle ORM
- Resend (email)

**Mobile:**
- Progressive Web App (PWA)
- Native Android WebView app

## Deployment

### Render.com (Recommended)

1. Push to GitHub
2. Connect repository to Render
3. Add environment variables
4. Deploy (uses `render.yaml`)

### Docker (Coming Soon)

Docker support will be added in a future update.

### VPS

Use PM2 for process management:

```bash
npm install -g pm2
pm2 start npm --name "tradeflow" -- start
pm2 save
pm2 startup
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema

### Database

The app uses PostgreSQL with Drizzle ORM. Compatible with:
- Neon (Serverless PostgreSQL)
- Supabase
- Railway
- Self-hosted PostgreSQL

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
