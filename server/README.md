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

## Tech Stack

- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL with Prisma ORM 7.1.0
- **Real-time**: Socket.IO
- **Authentication**: JWT (jsonwebtoken) with bcryptjs
- **File Upload**: Multer 2.0.2
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
│   └── socket/
│       └── socketHandler.ts # Socket.IO event handlers
├── uploads/profiles/ # Uploaded profile photos
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

- `GET /uploads/profiles/:filename` - Serve uploaded profile photos with CORS headers

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

## Implementation Notes

### File Upload & CORS

- Profile photos are stored locally in `uploads/profiles/`
- `/uploads` endpoint serves static files with CORS headers:
  - `Access-Control-Allow-Origin`: Set to `CORS_ORIGIN`
  - `Access-Control-Allow-Methods`: GET, OPTIONS
  - `Cross-Origin-Resource-Policy`: cross-origin
- Allows frontend to load profile photos from different origins (development, production)

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
