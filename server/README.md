# Kasinta Server

A full-featured dating app backend built with Express.js, Prisma, PostgreSQL, and Socket.IO for real-time features.

## Features

- **User Authentication**: JWT-based registration and login with secure password hashing
- **Profile Management**: Create and update user profiles with photo uploads
- **Discovery System**: Browse potential matches with filters (age, gender, distance)
- **Swipe Mechanism**: Like/dislike users with automatic mutual match detection
- **Real-time Chat**: Socket.IO powered messaging between matched users
- **Push Notifications**: Browser notification events for matches and messages
- **Match Management**: View all matches and unmatch functionality
- **Online Status**: Real-time online/offline status tracking
- **Read Receipts**: Message read status and timestamps
- **Typing Indicators**: See when matches are typing
- **CORS Support**: Cross-origin headers for uploaded profile photos
- **S3 Upload Storage**: Profile photos stored in AWS S3 for stateless production deploys

## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM 7.1.0
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken) with bcryptjs
- **File Upload**: Multer 2.0.2
- **Object Storage**: AWS S3 via AWS SDK v3
- **Package Manager**: pnpm

## Project Structure

```
server/
├── prisma/
│   └── schema.prisma # Prisma database schema
├── src/
│   ├── config/
│   │   └── database.ts # Prisma client instance
│   ├── controllers/ # Request handlers
│   │   ├── authController.ts
│   │   ├── userController.ts
│   │   ├── discoveryController.ts
│   │   ├── matchController.ts
│   │   └── chatController.ts
│   ├── middleware/ # Express middleware
│   │   ├── auth.ts # JWT authentication
│   │   └── upload.ts # File upload (Multer)
│   ├── routes/ # API route definitions
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   ├── discovery.ts
│   │   ├── matches.ts
│   │   └── chat.ts
│   ├── services/
│   │   └── s3Storage.ts # S3 profile photo storage
│   └── socket/
│       └── socketHandler.ts # Socket.IO event handlers
├── server.ts # Main application entry
├── package.json
├── tsconfig.json
├── Dockerfile
└── docker-compose.yml
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 12+
- pnpm 10.x

### Installation

**1. Clone and Install**

```bash
cd server
pnpm install
```

**2. Environment Setup**

Copy the example environment file and configure:

```bash
cp .env.example .env.local
```

Update `.env` with your configuration:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kasinta_db?schema=public"
JWT_SECRET="your-secret-key"
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

**3. Database Setup**

```bash
# Generate Prisma Client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate
```

**4. Start Development Server**

```bash
pnpm dev
```

The server will start on `http://localhost:4000`

### Environment Variables

| Variable        | Description                              | Default                    |
| --------------- | ---------------------------------------- | -------------------------- |
| `DATABASE_URL`  | PostgreSQL connection string             | -                          |
| `JWT_SECRET`    | Secret key for JWT signing               | -                          |
| `PORT`          | Server port                              | `5000`                     |
| `NODE_ENV`      | Environment (development/production)     | `development`              |
| `CORS_ORIGIN`   | Frontend URL for CORS                    | `http://localhost:3000`    |
| `BACKEND_URL`   | Backend URL for push notification assets | `http://localhost:${PORT}` |
| `MAX_FILE_SIZE` | Max upload file size in bytes            | `5242880` (5MB)            |
| `AWS_REGION`    | AWS region for S3 uploads                | -                          |
| `S3_BUCKET_NAME` | S3 bucket for profile photos            | -                          |
| `AWS_ACCESS_KEY_ID` | Local/dev AWS access key, if no IAM role | -                       |
| `AWS_SECRET_ACCESS_KEY` | Local/dev AWS secret key, if no IAM role | -                 |
| `FRONTEND_URL`  | Frontend origin for redirects/OAuth      | -                          |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID                | -                          |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret        | -                          |
| `GOOGLE_CALLBACK_URL` | Google OAuth callback URL          | -                          |

## Scripts

```bash
# Development
pnpm dev # Start dev server with hot reload

# Build
pnpm build # Compile TypeScript to JavaScript

# Production
pnpm start # Start production server

# Database
pnpm prisma:generate # Generate Prisma Client
pnpm prisma:migrate # Run database migrations
pnpm prisma:deploy # Deploy migrations (production)
```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### User Profile

- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/preferences` - Update matching preferences
- `POST /api/users/photo` - Upload profile photo
- `DELETE /api/users/photo` - Delete profile photo

### Discovery

- `GET /api/discovery` - Get potential matches
- `POST /api/discovery/swipe` - Swipe on a user (like/dislike)
- `POST /api/discovery/undo` - Undo last swipe

### Matches

- `GET /api/matches` - Get all matches
- `DELETE /api/matches/:matchId` - Unmatch a user

### Chat

- `GET /api/chat/:matchUserId` - Get chat messages
- `POST /api/chat/:matchUserId` - Send message (HTTP)
- `GET /api/chat/unread/count` - Get unread message count

### Static Files

- `GET /uploads/*key` - Stream uploaded profile photos from S3 with CORS headers

### Health Check

- `GET /api/health` - Server health status

## Socket.IO Events

### Client -> Server

- `authenticate` - Authenticate socket connection with JWT token
- `sendMessage` - Send a message to matched user
- `typing` - Send typing indicator
- `messageRead` - Mark message as read

### Server -> Client

- `authenticated` - Authentication successful
- `authError` - Authentication failed
- `newMessage` - New message received
- `messageSent` - Message sent confirmation
- `newMatch` - New match notification
- `unmatch` - User unmatched notification
- `userTyping` - Typing indicator from match
- `userStatusChange` - User online/offline status update
- `messageReadReceipt` - Message read confirmation
- `notification` - Push notification event (newMatch, newMessage types)
- `error` - Error occurred

**Notification Event Payload**:

The `notification` event includes:

- `type`: Event type (`newMatch` or `newMessage`)
- `title`: Notification heading
- `body`: Notification content
- `matchId`: Associated match ID
- `badge`: Profile photo URL (uses `BACKEND_URL` + user's `profilePhoto`)
- `icon`: (for messages) Sender's profile photo URL
- `senderId`: (for messages) ID of message sender

## Deployment

### Fly.io + Neon + S3 (current)

Compute runs on **Fly.io**, PostgreSQL on **Neon** (free serverless tier), and
profile photos stay on the existing **AWS S3** bucket.

```mermaid
flowchart TB
    Client["Vercel<br/>Next.js client<br/>kasinta.arnplsrz.com"]

    subgraph Fly["Fly.io (sin)"]
        App["Machine<br/>Express + Socket.IO<br/>0.0.0.0:4000<br/>always-on"]
    end

    Neon[("Neon PostgreSQL<br/>sslmode=require<br/>DATABASE_URL")]
    Bucket[("AWS S3 ap-southeast-1<br/>kasinta-uploads<br/>profiles/*")]
    IAM["IAM user<br/>S3-scoped keys"]

    Client -->|REST + Socket.IO over HTTPS| App
    App -->|Prisma / pg + SSL| Neon
    App -->|upload/read/delete photos| Bucket
    IAM -. static keys .-> App
    IAM -. allows .-> Bucket
```

Layout:

- **Frontend**: Vercel, `https://kasinta.arnplsrz.com`
- **Backend**: Fly.io machine, region `sin`, `https://api.kasinta.arnplsrz.com`, Express + Socket.IO on one port (4000)
- **Database**: Neon serverless PostgreSQL (Singapore), `sslmode=require`
- **Uploads**: S3 bucket `kasinta-uploads`
- **S3 auth**: static keys from a dedicated IAM **user** — Fly has no EC2 IAM role,
  so scope an IAM user to `s3:GetObject/PutObject/DeleteObject` on
  `arn:aws:s3:::kasinta-uploads/*` and use its access keys

Configuration lives in [`fly.toml`](./fly.toml). Non-secret values (`PORT`,
`NODE_ENV=production`, `DATABASE_SSL=true`) are set there under `[env]`; everything
else from [`.env.example`](./.env.example) is set as a Fly secret.

**1. Create the Neon database**

Create a Neon project in the Singapore region and copy its connection string
(include `?sslmode=require`). `DATABASE_SSL=true` in `fly.toml` enables SSL in the
`pg` pool to match.

**2. Launch without Fly Postgres or Tigris**

```bash
cd server

# Uses the committed fly.toml. Decline the "set up a Postgres database?" prompt.
fly launch --no-object-storage --no-deploy --copy-config
```

**3. Set secrets** (values that must not live in `fly.toml`)

```bash
fly secrets set \
  DATABASE_URL="postgresql://<user>:<pw>@<neon-host>/<db>?sslmode=require" \
  JWT_SECRET="<strong-secret>" \
  CORS_ORIGIN="https://kasinta.arnplsrz.com" \
  FRONTEND_URL="https://kasinta.arnplsrz.com" \
  BACKEND_URL="https://api.kasinta.arnplsrz.com" \
  AWS_REGION="ap-southeast-1" \
  S3_BUCKET_NAME="kasinta-uploads" \
  AWS_ACCESS_KEY_ID="<iam-user-key>" \
  AWS_SECRET_ACCESS_KEY="<iam-user-secret>" \
  GOOGLE_CLIENT_ID="<google-client-id>" \
  GOOGLE_CLIENT_SECRET="<google-client-secret>" \
  GOOGLE_CALLBACK_URL="https://api.kasinta.arnplsrz.com/api/auth/google/callback" \
  --app kasinta-server
```

**4. Deploy and verify**

```bash
fly deploy   # Dockerfile CMD runs `prisma migrate deploy` against Neon on boot
fly status   # expect 1 running machine in sin
fly logs     # confirm migrations applied with no SSL errors
curl -i https://api.kasinta.arnplsrz.com/api/health
```

Once a custom domain is wired, update `BACKEND_URL` and `GOOGLE_CALLBACK_URL` to
`https://api.kasinta.arnplsrz.com`, then add the Fly certificate
(`fly certs add api.kasinta.arnplsrz.com`) and point a Cloudflare `CNAME` at
`kasinta-server.fly.dev`.

### AWS Production Architecture (legacy)

> **Superseded by the Fly.io + Neon + S3 setup above.** The app now runs on Fly.io

```mermaid
flowchart TB
    Client["Vercel<br/>Next.js client<br/>kasinta.arnplsrz.com"]
    Cloudflare["Cloudflare<br/>api.kasinta.arnplsrz.com"]

    subgraph AWS["AWS ap-southeast-1"]
        EIP["Elastic IP"]
        Nginx["EC2 kasinta-server<br/>Nginx<br/>WebSocket upgrade"]
        App["Docker container<br/>Express + Socket.IO<br/>127.0.0.1:4000"]
        DB[("RDS PostgreSQL<br/>DATABASE_URL")]
        Bucket[("S3<br/>kasinta-uploads<br/>profiles/*")]
        Role["EC2 IAM Role<br/>S3 object access"]
    end

    Client -->|REST + Socket.IO| Cloudflare
    Cloudflare --> EIP
    EIP --> Nginx
    Nginx --> App
    App -->|Prisma| DB
    App -->|upload/read/delete photos| Bucket
    Role -. grants .-> App
    Role -. allows .-> Bucket
```

Recommended AWS layout:

- **Frontend**: Vercel, `https://kasinta.arnplsrz.com`
- **Backend**: EC2, Docker, Nginx, `https://api.kasinta.arnplsrz.com`
- **Database**: RDS PostgreSQL
- **Uploads**: S3 bucket `kasinta-uploads`
- **Cloudflare**: `api.kasinta.arnplsrz.com` `A` record to EC2 Elastic IP
- **S3 auth**: EC2 IAM role in production; static AWS keys only for local/dev

Production env example:

```env
DATABASE_URL="postgresql://postgres:<password>@<rds-endpoint>:5432/kasinta_db?schema=public"
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://kasinta.arnplsrz.com
FRONTEND_URL=https://kasinta.arnplsrz.com
BACKEND_URL=https://api.kasinta.arnplsrz.com
JWT_SECRET=<strong-secret>
MAX_FILE_SIZE=5242880
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=kasinta-uploads
GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret>
GOOGLE_CALLBACK_URL=https://api.kasinta.arnplsrz.com/api/auth/google/callback
```

### Using Docker Compose (Recommended)

The server includes a production-ready Dockerfile with the following features:

- **Multi-stage build** using Node.js 24 Alpine
- **Automatic Prisma migrations** on container startup
- **Non-root user** (nodejs:1001) for security
- **Health check** endpoint monitoring
- **pnpm workspace** support with preserved symlinks

```bash
# Start all services (PostgreSQL + Server)
docker compose up -d

# View logs
docker compose logs -f server

# Stop all services
docker compose down
```

The server automatically runs `prisma migrate deploy` when the container starts, ensuring the database schema is always up to date.

### Using Docker Only

```bash
# Build image
docker build -t kasinta-server .

# Run container (requires external PostgreSQL)
docker run -p 4000:4000 \
 -e DATABASE_URL="your-database-url" \
 -e JWT_SECRET="your-secret" \
 kasinta-server
```

Note: The container uses port 4000 by default. Database migrations will run automatically on startup.

### EC2 + Docker + Nginx (legacy)

> The steps below apply only to the legacy EC2 path.

Build and run the backend container on EC2:

```bash
cd ~/kasinta/server
sudo docker build -t kasinta-server .
sudo docker run -d \
  --name kasinta-server \
  --restart unless-stopped \
  --env-file ~/kasinta/server/.env.production \
  -p 127.0.0.1:4000:4000 \
  kasinta-server
```

Nginx reverse proxy:

```nginx
server {
    listen 80;
    server_name api.kasinta.arnplsrz.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Verify deploy:

```bash
sudo docker ps
sudo docker logs --tail=100 kasinta-server
curl -i http://127.0.0.1:4000/api/health
curl -i http://api.kasinta.arnplsrz.com/api/health
```

## Implementation Notes

### File Upload, S3 & CORS

- Profile photos are uploaded to S3 under `profiles/*`
- The app stores profile photo paths as `/uploads/profiles/<object-key>`
- `/uploads` endpoint streams S3 objects through Express with CORS headers:
  - `Access-Control-Allow-Origin`: Set to `CORS_ORIGIN`
  - `Access-Control-Allow-Methods`: GET, OPTIONS
  - `Cross-Origin-Resource-Policy`: cross-origin
- Allows frontend to load profile photos from different origins (development, production)
- Production should use an EC2 IAM role with S3 object permissions instead of static AWS keys

### Push Notifications

**Architecture**:

- Sent via Socket.IO `notification` event to connected users
- Only sent to online users (checked via `userSockets` Map)
- Badge URLs use `BACKEND_URL` environment variable for correct origin

**Notification Types**:

1. **New Match** (`discoveryController.ts`):
   - Emitted to both users when mutual like detected
   - Includes match partner's profile photo as badge
   - Triggered during swipe action

2. **New Message** (`socketHandler.ts`):
   - Emitted to message recipient
   - Includes sender's profile photo as icon/badge
   - Includes message preview in body
   - Triggered on real-time message send

**Badge URL Format**: `${BACKEND_URL}${user.profilePhoto}`

### Security & Authentication

- JWT tokens expire after 7 days
- Passwords are hashed using bcryptjs with 10 salt rounds
- All chat operations verify match exists before allowing access
- Socket authentication via JWT token on connect

### Distance Calculations

- Uses Haversine formula for accurate distance between coordinates
- User locations stored as latitude/longitude
- Distance filtering applied in discovery queries

### Real-time Architecture

- Socket.IO maintains centralized `userSockets` Map (userId -> socketId)
- Shared via `app.set()` for access in route handlers
- Online status tracked in database and broadcast to connected users
- Connection persists across page navigations

For frontend documentation, see the [client README](../client/README.md).
