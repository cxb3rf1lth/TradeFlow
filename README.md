# TradeFlow

> **A comprehensive executive and virtual PA management platform with AI-powered automation**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

TradeFlow is a production-ready platform designed for executive teams and virtual personal assistants to streamline task management, communication, and workflow automation with integrated AI capabilities.

## ✨ Features

### 🎯 Core Features

- **Task Management** - Comprehensive CRUD operations with AI-powered categorization and priority suggestions
- **Email Center** - Professional email management with AI drafting and templates (PA-only)
- **Rich Notes** - Note-taking with AI summarization and action item extraction
- **Team Lounge** - Internal team communication hub with pinned posts
- **Integrations** - Connect with Trello, Jira, HubSpot, OneDrive, Teams, OneNote, and NetSuite
- **Automation Engine** - Rule-based workflow automation with triggers and actions
- **Analytics Dashboard** - Real-time metrics, workload distribution, and productivity insights

### 🤖 AI-Powered Intelligence

- Task categorization and priority suggestions
- Email draft generation and improvement
- Note summarization
- Action item extraction from meeting notes
- Productivity insights and recommendations
- Smart workflow optimization

### 🔐 Security & Authentication

- JWT-based authentication with bcrypt password hashing
- Role-based access control (Executive & Virtual PA)
- Protected API endpoints
- Secure credential management

### 📊 Analytics & Reporting

- Task completion tracking and trends
- Workload distribution across team members
- Integration health monitoring
- Productivity scoring
- AI-generated insights

## 🚀 Quick Start

### Automatic Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/cxb3rf1lth/TradeFlow.git
cd TradeFlow

# Make setup script executable
chmod +x setup.sh

# Run automatic setup
./setup.sh
```

The setup script will handle everything: dependencies, configuration, database, and optionally start the server.

### Docker Setup

```bash
# Make Docker setup script executable
chmod +x docker-setup.sh

# Run Docker setup (includes PostgreSQL)
./docker-setup.sh
```

### Manual Setup

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed manual setup instructions.

## 📋 Requirements

- **Node.js** 18+ and npm
- **PostgreSQL** 15+ (or use Docker)
- **Optional**: Anthropic API key for AI features
- **Optional**: Resend API key for email features

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn UI components
- React Query for data management
- Wouter for routing
- TipTap for rich text editing

### Backend
- Node.js with Express
- TypeScript
- Drizzle ORM with PostgreSQL
- JWT authentication
- Anthropic Claude AI integration
- Resend for email delivery

## 📁 Project Structure

```
TradeFlow/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Application pages
│   │   ├── hooks/       # Custom React hooks
│   │   └── lib/         # Utilities
├── server/              # Express backend
│   ├── auth.ts          # Authentication logic
│   ├── routes.ts        # API routes
│   ├── ai-service.ts    # AI integration
│   ├── automation-engine.ts
│   ├── integration-manager.ts
│   ├── analytics-service.ts
│   └── db-storage.ts    # Database operations
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schemas
├── setup.sh             # Automatic setup script
├── docker-compose.yml   # Docker configuration
└── DEPLOYMENT.md        # Deployment guide
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/tradeflow
JWT_SECRET=your-super-secret-key-change-in-production

# Optional
RESEND_API_KEY=your-resend-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Application
NODE_ENV=development
PORT=5000
```

Generate a secure JWT secret:
```bash
openssl rand -base64 32
```

## 📖 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Task Endpoints

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/bulk/assign` - Bulk assign tasks
- `POST /api/tasks/ai/suggest-priority` - AI priority suggestion

### Email Endpoints (PA Only)

- `POST /api/email/send` - Send email
- `GET /api/email/templates` - Get templates
- `POST /api/email/templates` - Create template
- `POST /api/email/ai/draft` - AI draft generation
- `POST /api/email/ai/improve` - AI email improvement

### Notes Endpoints

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PATCH /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note
- `POST /api/notes/:id/ai/summarize` - AI summarization
- `POST /api/notes/:id/ai/extract-action-items` - Extract action items

### Automation Endpoints

- `GET /api/automation/rules` - Get all rules
- `POST /api/automation/rules` - Create rule
- `PATCH /api/automation/rules/:id` - Update rule
- `DELETE /api/automation/rules/:id` - Delete rule
- `POST /api/automation/rules/:id/toggle` - Enable/disable rule
- `POST /api/automation/rules/:id/test` - Test rule

### Analytics Endpoints

- `GET /api/analytics/tasks` - Task analytics
- `GET /api/analytics/workload` - Workload distribution
- `GET /api/analytics/productivity` - Productivity metrics
- `GET /api/analytics/ai/insights` - AI-generated insights

## 🎨 Features in Detail

### Task Management
- Create, read, update, and delete tasks
- Assign tasks to team members
- Set priorities and due dates
- Filter and search tasks
- Bulk operations (assign, update status)
- AI-powered priority suggestions
- Task source tracking (manual, AI, integrations)

### Email Center (Virtual PA Role)
- Compose and send emails
- Create reusable email templates
- Save drafts
- Email history and logs
- AI-powered email draft generation
- AI email improvement suggestions

### Notes & Documentation
- Rich text editor with formatting
- Create and organize notes
- AI-powered summarization
- Automatic action item extraction
- Convert action items to tasks

### Team Lounge
- Post notes, jokes, suggestions, and acknowledgements
- Pin important posts
- Filter by post type
- Team-wide visibility

### Integrations
- **Trello** - Import tasks from boards
- **Jira** - Sync issues and projects
- **HubSpot** - CRM integration
- **OneDrive** - File synchronization
- **Microsoft Teams** - Team communication
- **OneNote** - Note synchronization
- **NetSuite** - ERP integration

### Automation Rules
- **Triggers**: Task created, updated, completed, overdue, scheduled, etc.
- **Actions**: Send email, create task, assign task, update priority, webhooks
- Enable/disable rules
- Test rules before activation
- Execution logging

### Analytics
- Task completion rates
- Team workload distribution
- Integration health status
- Productivity scores
- AI-generated insights and recommendations

## 🔍 Development

### Running in Development Mode

```bash
npm run dev
```

This starts:
- Vite dev server with HMR on port 5173
- Express API server on port 5000
- TypeScript compilation in watch mode

### Running Type Checks

```bash
npm run check
```

### Building for Production

```bash
npm run build
```

### Running in Production

```bash
npm start
```

## 📦 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment instructions including:
- Render.com deployment
- Heroku deployment
- VPS/Cloud server setup
- Docker deployment
- Environment configuration
- Database setup
- Troubleshooting

## 🧪 Testing

```bash
# Run type checks
npm run check

# Build the application
npm run build
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- UI components from [Shadcn UI](https://ui.shadcn.com/)
- AI powered by [Anthropic Claude](https://www.anthropic.com/)
- Email service by [Resend](https://resend.com/)

## 📞 Support

For issues, questions, or contributions:
- Open an [issue](https://github.com/cxb3rf1lth/TradeFlow/issues)
- Check [DEPLOYMENT.md](DEPLOYMENT.md) for setup help
- Review the code documentation

---

**Made with ❤️ for executive teams and virtual assistants**

## 🎯 Roadmap

- [ ] Mobile responsive improvements
- [ ] Real-time collaboration features
- [ ] Advanced reporting and export
- [ ] Calendar integration
- [ ] File attachment support
- [ ] Advanced search and filtering
- [ ] Multi-language support
- [ ] Dark/Light theme customization

---

**Start managing your team more efficiently with TradeFlow today!** 🚀
