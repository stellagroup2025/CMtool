# Social Media Manager

A full-stack social media management platform built with Next.js 15, React 19, TypeScript, and PostgreSQL.

## Features

- 🎨 **Multi-Platform Publishing** - Schedule and publish posts to Instagram, Facebook, Twitter/X, TikTok, LinkedIn, and YouTube
- 📊 **Analytics Dashboard** - Track engagement, reach, and performance metrics across all platforms
- 💬 **Unified Inbox** - Manage DMs, comments, and mentions from all platforms in one place
- 🤖 **AI-Powered Content** - Generate post content and optimize posting times with AI
- 📅 **Content Calendar** - Visual calendar for scheduling and managing posts
- 👥 **Team Collaboration** - Role-based access control (Owner, Manager, Analyst, Agent)
- 🔒 **Secure** - End-to-end encryption for social account tokens, rate limiting, audit logs
- ⚡ **Real-time Updates** - Live notifications for new messages and post status changes

## Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Radix UI** (accessible components)
- **Recharts** (data visualization)
- **React Hook Form + Zod** (form validation)
- **Sonner** (toast notifications)

### Backend
- **PostgreSQL** (database)
- **Prisma** (ORM)
- **NextAuth v5** (authentication)
- **BullMQ + Redis** (job queue)
- **AWS S3** (media storage)
- **Pusher** (realtime)
- **Pino** (logging)

### Infrastructure
- **Redis** - Queue and rate limiting
- **S3** - Media uploads
- **Worker Process** - Background job processing

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+
- Redis 6+
- AWS S3 account (or S3-compatible storage like MinIO)
- (Optional) Pusher account for realtime features
- (Optional) OpenAI API key for AI features

### 1. Clone and Install

```bash
git clone <repository-url>
cd social-media-manager
npm install
```

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

**Required environment variables:**

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/social_media_manager?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-a-secret>"  # Run: openssl rand -base64 32

# Redis
REDIS_URL="redis://localhost:6379"

# S3
S3_REGION="us-east-1"
S3_BUCKET="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"

# Encryption (for social tokens)
ENCRYPTION_KEY="<generate-a-key>"  # Run: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Optional features:**

```env
# Pusher (realtime)
PUSHER_APP_ID="your-app-id"
PUSHER_KEY="your-key"
PUSHER_SECRET="your-secret"
PUSHER_CLUSTER="us2"

# OpenAI (AI features)
OPENAI_API_KEY="your-openai-key"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with test data
npm run db:seed
```

This will create a demo user:
- **Email:** demo@example.com
- **Password:** password123

### 4. Start Development

Start both the Next.js dev server and the worker process:

```bash
npm run dev:all
```

Or start them separately:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Worker process
npm run dev:worker
```

The application will be available at http://localhost:3000

### 5. Login

Visit http://localhost:3000/login and sign in with:
- Email: `demo@example.com`
- Password: `password123`

## Project Structure

```
├── app/                      # Next.js App Router
│   ├── api/                 # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── brands/         # Brand & account management
│   │   ├── uploads/        # File upload presigned URLs
│   │   └── ai/             # AI generation endpoints
│   ├── brands/             # Brand selection page
│   ├── dashboard/          # Main dashboard
│   │   └── [brandId]/      # Brand-specific pages
│   │       ├── create/     # Post composer
│   │       ├── calendar/   # Content calendar
│   │       ├── inbox/      # Unified inbox
│   │       └── analytics/  # Analytics dashboard
│   └── login/              # Login page
├── lib/                     # Core utilities
│   ├── prisma.ts           # Prisma client
│   ├── auth.ts             # NextAuth configuration
│   ├── queue.ts            # BullMQ setup
│   ├── s3.ts               # S3 client
│   ├── crypto.ts           # Token encryption
│   ├── rbac.ts             # Role-based access control
│   ├── rateLimit.ts        # Rate limiting
│   ├── realtime.ts         # Pusher/realtime
│   └── social/             # Social platform adapters
│       ├── types.ts        # Adapter interface
│       ├── instagram.ts    # Instagram adapter
│       ├── facebook.ts     # Facebook adapter
│       └── index.ts        # Adapter registry
├── worker/                  # Background worker process
│   ├── index.ts            # Worker bootstrap
│   └── jobs/               # Job processors
│       ├── publishPostItem.ts
│       ├── pullMetrics.ts
│       └── pollInbox.ts
├── prisma/                  # Database
│   ├── schema.prisma       # Prisma schema
│   └── seed.ts             # Seed script
└── components/             # React components
```

## Key Concepts

### Brands & Memberships

Users can belong to multiple brands with different roles:
- **Owner** - Full access, can manage team members
- **Manager** - Can publish posts, connect accounts, manage inbox
- **Analyst** - Read-only access to analytics
- **Agent** - Can respond to inbox messages only

### Social Accounts

Each brand can connect multiple social media accounts. Access tokens are encrypted at rest using AES-256-GCM.

### Post Scheduling

Posts can be scheduled for future publication. Each post can target multiple platforms with platform-specific content variations. When scheduled:
1. Post and PostItems are created in the database
2. Jobs are enqueued in BullMQ with the scheduled time
3. Worker picks up jobs at the scheduled time
4. Platform adapters handle the actual publishing
5. Status updates are broadcast via realtime

### Worker Process

The worker process handles:
- **Publishing** - Publishes scheduled posts to social platforms
- **Metrics** - Pulls engagement metrics from platforms periodically
- **Inbox Polling** - For platforms without webhooks, polls for new messages

### Platform Adapters

Each social platform has an adapter implementing the `SocialAdapter` interface:
- `getAccount()` - Verify token and fetch account info
- `publish()` - Publish content
- `delete()` - Delete published content
- `fetchMetrics()` - Get engagement metrics
- `reply()` - Reply to conversations
- `fetchInboxMessages()` - Poll for new messages (optional)

Currently implemented (stubs with TODOs for real API calls):
- ✅ Instagram
- ✅ Facebook
- ✅ Twitter/X
- ⏳ TikTok (placeholder)
- ⏳ LinkedIn (placeholder)
- ⏳ YouTube (placeholder)

## Development

### Available Scripts

```bash
npm run dev              # Start Next.js dev server
npm run dev:worker       # Start worker process
npm run dev:all          # Start both concurrently
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run typecheck        # Run TypeScript compiler
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
npm run db:push          # Push schema changes (dev only)
npm run db:seed          # Seed database with test data
```

### Adding a New Social Platform

1. Create adapter in `lib/social/{platform}.ts`
2. Implement the `SocialAdapter` interface
3. Register in `lib/social/index.ts`
4. Add platform-specific OAuth flow (if needed)
5. Update Prisma enum if platform not already listed

### Database Migrations

When you modify `prisma/schema.prisma`:

```bash
# Create a new migration
npm run prisma:migrate

# Or push changes directly (dev only)
npm run db:push
```

## Production Deployment

### Environment Variables

Ensure all production environment variables are set securely. Never commit secrets to version control.

### Database

Run migrations on your production database:

```bash
npx prisma migrate deploy
```

### Worker

Deploy the worker process as a separate service:

```bash
node --loader tsx worker/index.ts
```

Or use a process manager like PM2:

```bash
pm2 start worker/index.ts --interpreter tsx
```

### Scaling

- **Horizontal**: Run multiple worker instances; BullMQ handles job distribution
- **Redis**: Use Redis cluster or managed Redis (AWS ElastiCache, Upstash)
- **Database**: Use connection pooling (PgBouncer) for high traffic

## Security

- ✅ Authentication via NextAuth v5
- ✅ Role-based access control (RBAC)
- ✅ Social account tokens encrypted at rest (AES-256-GCM)
- ✅ Rate limiting on API endpoints
- ✅ Audit logging for sensitive actions
- ✅ HTTPS enforced in production
- ✅ Environment variable validation on boot

## Monitoring & Observability

- **Logging**: Pino structured logging (JSON in production, pretty in dev)
- **Queue Monitoring**: Access BullMQ dashboard or use Bull Board
- **Database**: Use Prisma Studio or database monitoring tools
- **Errors**: Integrate with Sentry or similar (add to lib/logger.ts)

## Troubleshooting

### "ENCRYPTION_KEY environment variable is not set"

Generate a key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add to `.env`:
```env
ENCRYPTION_KEY="<generated-key>"
```

### Worker not processing jobs

1. Check Redis is running: `redis-cli ping`
2. Check worker logs for errors
3. Verify `REDIS_URL` in `.env`

### Database connection errors

1. Verify PostgreSQL is running
2. Check `DATABASE_URL` format
3. Ensure database exists: `createdb social_media_manager`

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [Repository Issues](https://github.com/your-repo/issues)
- Documentation: See inline code comments and JSDoc

---

Built with ❤️ using Next.js, React, and TypeScript
