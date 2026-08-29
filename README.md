<div align="center">

<img src="./client/public/logo.svg" height="75" />
<img src="./client/public/kasinta-title.svg" height="75" />

**A modern, real-time dating web application
built with Next.js, Express.js, and Socket.IO**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Architecture](#architecture)

</div>

## Screenshots

<table>
  <tr>
    <td width="50%" align="center">
      <img src="./docs/images/landing-page.png" alt="Landing Page" />
      <br />
      <em>Landing Page</em>
    </td>
    <td width="50%" align="center">
      <img src="./docs/images/discovery.png" alt="Discovery" />
      <br />
      <em>Swipe Discovery</em>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./docs/images/match-modal.png" alt="Match Modal" />
      <br />
      <em>Match Notification</em>
    </td>
    <td width="50%" align="center">
      <img src="./docs/images/chat.png" alt="Chat Interface" />
      <br />
      <em>Real-time Chat</em>
    </td>
  </tr>
</table>

## Overview

Kasinta is a full-stack dating application featuring real-time messaging, swipe-based matching, and a modern neobrutalism design aesthetic. Built as a monorepo with separate client and server packages managed by pnpm workspaces.

### Key Highlights

- **Secure Authentication** - JWT-based auth with bcrypt password hashing, plus Google OAuth login
- **Real-time Chat** - Socket.IO powered instant messaging with typing indicators
- **Smart Matching** - Swipe-based discovery with filters (age, distance, gender)
- **Push Notifications** - Browser-based push notifications for matches and messages
- **Live Status Tracking** - Real-time online status updates in sidebar
- **Responsive Design** - Mobile-first UI with modern neobrutalism aesthetic
- **Dark Mode** - System-aware theme switching
- **Photo Uploads** - Profile photo management with preview and validation
- **Optimized Performance** - Next.js 16 App Router with React 19
- **Production Ready** - Docker optimized for Fly.io deployment with multi-stage builds
- **CI/CD Automation** - GitHub Actions workflows for code review and PR assistance

## Features

### User Features

- **Profile Management**

  - Profile photo upload and deletion
  - Bio and profile customization
  - Age, gender, and preference settings
  - Location-based distance preferences

- **Discovery & Matching**

  - Tinder-style swipe interface
  - Advanced filters (age range, distance, gender)
  - Undo swipe functionality
  - "It's a Match!" modal on mutual likes
  - Real-time match notifications

- **Real-time Chat**

  - Instant message delivery via Socket.IO
  - Typing indicators
  - Online/offline status with real-time updates
  - Message read receipts
  - Chat history with timestamps
  - Unread message indicators
  - Browser push notifications for new messages

- **Match Management**
  - View all matches with last message preview
  - Unmatch functionality
  - Sidebar navigation with chat heads

### Technical Features

- JWT-based authentication with 7-day expiration
- WebSocket connections with automatic reconnection
- Browser push notification API integration
- Optimistic UI updates
- Responsive layouts (mobile, tablet, desktop)
- Modern neobrutalism design with custom scrollbars
- Form validation with React Hook Form + Zod
- PostgreSQL database with Prisma ORM
- RESTful API with Socket.IO real-time layer
- Optimized Docker builds with multi-stage configuration
- GitHub Actions CI/CD workflows

## Tech Stack

### Frontend ([/client](./client))

| Technology           | Version | Purpose                      |
| -------------------- | ------- | ---------------------------- |
| **Next.js**          | 16.3.0  | React framework (App Router) |
| **React**            | 19.2.8  | UI library                   |
| **TypeScript**       | 5.9.x   | Type safety                  |
| **TailwindCSS**      | 4.x     | Styling system               |
| **Socket.IO Client** | 4.8.3   | Real-time communication      |
| **shadcn/ui**        | Latest  | UI component library         |
| **React Hook Form**  | 7.85.0  | Form management              |
| **Zod**              | 4.4.3   | Schema validation            |
| **Lucide React**     | 0.577.0 | Icon library                 |
| **next-themes**      | 0.4.6   | Dark mode support            |

### Backend ([/server](./server))

| Technology     | Version | Purpose               |
| -------------- | ------- | --------------------- |
| **Node.js**    | 20+     | Runtime environment   |
| **Express.js** | 5.x     | Web framework         |
| **TypeScript** | 5.x     | Type safety           |
| **PostgreSQL** | 12+     | Database              |
| **Prisma**     | 7.9.1   | ORM                   |
| **Socket.IO**  | 4.8.3   | WebSocket server      |
| **JWT**        | 9.0.3   | Authentication tokens |
| **bcryptjs**   | 3.0.3   | Password hashing      |
| **Multer**     | 2.2.0   | File upload handling  |
| **AWS SDK**    | 3.x     | S3 profile photo storage |

### DevOps & Tools

- **pnpm** - Monorepo package manager
- **Docker** - Containerization
- **docker compose** - Multi-container orchestration
- **GitHub Actions** - CI (lint/build) and Fly.io deploy
- **Fly.io / Vercel** - Server and client hosting
- **CodeRabbit / fallow** - PR review and static analysis
- **Dependabot** - Automated dependency updates
- **ESLint** - Code linting
- **ts-node-dev** - TypeScript development

## Quick Start

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 12 or higher
- pnpm 10.x (`npm install -g pnpm`)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/kasinta.git
cd kasinta
```

2. **Install dependencies**

```bash
pnpm install
```

This installs dependencies for both client and server packages.

3. **Configure environment variables**

**Server** (`server/.env`):

```env
DATABASE_URL="postgresql://username:password@localhost:5432/kasinta_db?schema=public"
DATABASE_SSL=false
JWT_SECRET="your-super-secret-jwt-key"
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
MAX_FILE_SIZE=5242880

# Photo uploads (required — the app errors on upload/delete routes without these)
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=kasinta-uploads
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Google OAuth login (optional)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

See [`server/.env.example`](./server/.env.example) for the authoritative list.

**Client** (`client/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_MAX_FILE_SIZE=5242880
```

4. **Setup the database**

```bash
pnpm --filter server prisma:generate
pnpm --filter server prisma:migrate
```

5. **Start development servers**

From the root directory:

```bash
pnpm dev
```

This starts both the client (port 3000) and server (port 4000) concurrently.

**Or start separately:**

```bash
# Terminal 1 - Backend
pnpm dev:server

# Terminal 2 - Frontend
pnpm dev:client
```

6. **Open the application**

Navigate to [http://localhost:3000](http://localhost:3000)

### Using Docker

**Development (docker compose):**

```bash
cd server

# Start PostgreSQL + Server
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

`server/docker-compose.yml` only defines the `postgres` and `server` services. The client isn't containerized for local dev — run it with `pnpm dev:client`.

**Production:**

The client deploys to **Vercel** and the server deploys to **Fly.io** with a managed **Neon PostgreSQL** database (see [Architecture](#architecture)). The server's Docker image is used for the Fly.io deploy:

- **Multi-stage builds** with Node.js 24 Alpine for minimal image size
- **Automatic Prisma migrations** on container startup
- **Non-root user** for security
- **Health checks** for container monitoring
- **Environment variables** configured via Fly.io secrets

Photo uploads use S3, but the production S3 bucket isn't currently provisioned — upload/delete routes error until `AWS_*`/`S3_BUCKET_NAME` are configured there.

See `client/Dockerfile` and `server/Dockerfile` for build configurations. An older AWS EC2 + RDS setup is documented in [Architecture](#architecture) as legacy.

## Project Structure

```
kasinta/
├── client/                 # Next.js frontend application
│   ├── app/                # Next.js App Router pages
│   │   ├── page.tsx        # Home page (Discovery/Chat)
│   │   ├── layout.tsx      # Root layout with providers
│   │   ├── login/          # Login page
│   │   ├── register/       # Registration page
│   │   └── profile/        # Profile management
│   ├── components/
│   │   ├── layout/         # Page-level components
│   │   │   ├── AppSidebar.tsx       # Sidebar with matches
│   │   │   ├── ChatInterface.tsx    # Chat UI
│   │   │   ├── DiscoverySection.tsx # Swipe cards
│   │   │   └── FilterPopover.tsx    # Discovery filters
│   │   └── ui/             # Reusable UI components
│   ├── contexts/
│   │   ├── AuthContext.tsx          # Auth state management
│   │   └── SocketContext.tsx        # Socket.IO connection
│   ├── lib/
│   │   ├── api.ts          # HTTP API client
│   │   ├── types.ts        # TypeScript interfaces
│   │   └── utils.ts        # Utility functions
│   ├── services/
│   │   └── socket.ts       # Socket.IO service
│   └── package.json
│
├── server/                 # Express.js backend application
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   │   ├── authController.ts
│   │   │   ├── userController.ts
│   │   │   ├── discoveryController.ts
│   │   │   ├── matchController.ts
│   │   │   └── chatController.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts     # JWT verification
│   │   │   └── upload.ts   # Multer configuration
│   │   ├── routes/         # API route definitions
│   │   ├── socket/
│   │   │   └── socketHandler.ts # Socket.IO events
│   │   └── config/
│   │       └── database.ts # Prisma client
│   ├── src/services/       # External services (S3 storage)
│   ├── server.ts           # Application entry point
│   ├── docker-compose.yml  # PostgreSQL + server services
│   └── package.json
│
├── package.json            # Root package.json (workspace)
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md              # This file
```

## Documentation

### Quick Links

- **[Client Documentation](./client/README.md)** - Frontend architecture and components
- **[Server Documentation](./server/README.md)** - Backend API and database

### API Documentation

The server provides RESTful APIs and Socket.IO events:

#### REST API Endpoints

- **Authentication**: `/api/auth/*` - Register, login, logout, get user, Google OAuth (`/api/auth/google`, `/api/auth/google/callback`)
- **User Profile**: `/api/users/*` - Profile management and photo upload
- **Discovery**: `/api/discovery/*` - Browse and swipe on potential matches
- **Matches**: `/api/matches/*` - View and manage matches
- **Chat**: `/api/chat/*` - Message history and sending

#### Socket.IO Events

**Client → Server:**

- `authenticate` - JWT token authentication
- `sendMessage` - Send real-time message
- `typing` - Send typing indicator
- `messageRead` - Mark message as read

**Server → Client:**

- `newMessage` - Receive new message
- `newMatch` - Match notification
- `unmatch` - User unmatched
- `userTyping` - Typing indicator
- `userStatusChange` - Online/offline status
- `messageReadReceipt` - Read confirmation

See [server README](./server/README.md) for complete API documentation.

## Architecture

### System Architecture

```mermaid
graph TB
    subgraph Client["Client (Next.js)"]
        AppRouter["App Router<br/>(Pages)"]
        Contexts["Contexts<br/>(Auth, Socket)"]
        Components["Components<br/>(UI, Layout)"]
    end

    subgraph Communication["Communication Layer"]
        HTTP["HTTP<br/>(REST API)"]
        WebSocket["WebSocket<br/>(Socket.IO)"]
    end

    subgraph Server["Server (Express.js)"]
        Routes["Routes<br/>(/api/*)"]
        Controllers["Controllers<br/>(Business Logic)"]
        SocketHandler["Socket Handler<br/>(Real-time Events)"]
        Middleware["Middleware<br/>(Auth, CORS)"]
        Prisma["Prisma ORM"]
        ObjectStorage["S3 Object Storage<br/>(Profile Uploads)"]
    end

    Database[("PostgreSQL<br/>Database")]

    AppRouter --> HTTP
    Contexts --> HTTP
    Contexts --> WebSocket
    Components --> HTTP

    HTTP --> Routes
    WebSocket --> SocketHandler
    Routes --> Controllers
    Controllers --> Prisma
    Controllers --> ObjectStorage
    SocketHandler --> Prisma
    Middleware --> Routes
    Middleware --> SocketHandler
    Prisma --> Database

    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style Database fill:#ffe1e1
    style Communication fill:#f0f0f0
```

### Production Architecture (current)

```mermaid
flowchart TB
    User["User Browser"]
    Vercel["Vercel<br/>Next.js Client"]
    Fly["Fly.io<br/>Express + Socket.IO container"]
    Neon[("Neon<br/>Managed PostgreSQL")]
    S3[("S3 Bucket<br/>profile photos<br/>not yet provisioned")]

    User --> Vercel
    Vercel -->|REST API + Socket.IO| Fly
    Fly -->|Prisma| Neon
    Fly -.->|profile upload/read/delete<br/>currently errors| S3
```

- **Client** deploys to **Vercel** via its native Git integration.
- **Server** deploys to **Fly.io** as a Docker container (see `.github/workflows/deploy-server.yml`).
- **Neon** provides managed PostgreSQL for the server.
- **S3** is the intended profile-photo store, but the production bucket/credentials aren't configured yet — upload/delete routes error until `AWS_*`/`S3_BUCKET_NAME` secrets are set on Fly.io.

### AWS Architecture (legacy)

The application was previously deployed on AWS EC2 + RDS. This has been superseded by the Fly.io + Neon setup above, but the Docker image remains AWS-compatible if needed.

```mermaid
flowchart TB
    User["User Browser"]
    DNS["DNS Provider<br/>kasinta.arnplsrz.com<br/>api.kasinta.arnplsrz.com"]
    Vercel["Vercel<br/>Next.js Client"]

    subgraph AWS["AWS ap-southeast-1"]
        EIP["Elastic IP<br/>47.131.223.114"]
        Nginx["EC2 kasinta-server<br/>Nginx reverse proxy<br/>HTTP/HTTPS + WebSocket upgrade"]
        Docker["Docker container<br/>Express + Socket.IO<br/>Port 4000"]
        RDS[("RDS PostgreSQL<br/>kasinta-postgres")]
        S3[("S3 Bucket<br/>kasinta-uploads<br/>profiles/*")]
        IAM["EC2 IAM Role<br/>S3 profile object access"]
    end

    User --> DNS
    DNS --> Vercel
    DNS --> EIP
    User --> Vercel
    Vercel -->|REST API + Socket.IO| EIP
    EIP --> Nginx
    Nginx --> Docker
    Docker -->|Prisma| RDS
    Docker -->|profile upload/read/delete| S3
    IAM -. grants .-> Docker
    IAM -. allows .-> S3
```

**AWS services used (legacy):**

- **EC2** ran the backend Docker container.
- **Nginx** terminated HTTP/HTTPS and proxied REST + Socket.IO traffic to `127.0.0.1:4000`.
- **RDS PostgreSQL** stored application data.
- **S3** stored uploaded profile photos under `profiles/*`.
- **IAM instance role** gave the EC2 backend S3 access without static AWS keys.

### Data Flow Examples

#### 1. User Login Flow

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant Server
    participant Database
    participant Socket

    User->>Client: Submit credentials
    Client->>Server: POST /api/auth/login
    Server->>Database: Verify password
    Database-->>Server: User data
    Server-->>Client: JWT token + user data
    Client->>Client: Store token (localStorage)
    Client->>Socket: Connect Socket.IO
    Socket->>Server: Emit 'authenticate' with JWT
    Server->>Server: Map userId to socketId
    Server-->>Socket: Emit 'authenticated'
```

#### 2. Match Flow

```mermaid
sequenceDiagram
    participant UserA
    participant ClientA
    participant Server
    participant Database
    participant ClientB
    participant UserB

    UserA->>ClientA: Swipe right
    ClientA->>Server: POST /api/discovery/swipe
    Server->>Database: Check reciprocal like
    Database-->>Server: Mutual like found
    Server->>Database: Create Match
    Server->>ClientA: Emit 'newMatch' (Socket.IO)
    Server->>ClientB: Emit 'newMatch' (Socket.IO)
    ClientA-->>UserA: Display match modal
    ClientB-->>UserB: Display match modal
    ClientA->>ClientA: Update sidebar
    ClientB->>ClientB: Update sidebar
```

#### 3. Real-time Message Flow

```mermaid
sequenceDiagram
    participant Sender
    participant SenderClient
    participant Server
    participant Database
    participant ReceiverClient
    participant Receiver

    Sender->>SenderClient: Type message
    SenderClient->>Server: Emit 'sendMessage' (Socket.IO)
    Server->>Database: Verify match exists
    Database-->>Server: Match confirmed
    Server->>Database: Save message
    Server->>ReceiverClient: Emit 'newMessage' (Socket.IO)
    Server->>SenderClient: Emit 'messageSent' (Socket.IO)
    ReceiverClient-->>Receiver: Display message
    ReceiverClient->>ReceiverClient: Update sidebar preview
    SenderClient->>SenderClient: Optimistic UI update
```

### State Management

**Client-Side State:**

- **AuthContext** - User authentication and profile data
- **SocketContext** - WebSocket connection and event handlers
- **Local Component State** - UI state, forms, loading states

**Server-Side State:**

- **userSockets Map** - userId → socketId mapping for real-time events
- **Database** - Persistent data storage via Prisma

### Security Features

- JWT tokens with 7-day expiration
- bcrypt password hashing (10 salt rounds)
- CORS protection with origin whitelist
- Protected API routes with auth middleware
- Match verification before message access
- File upload size limits (5MB)
- SQL injection prevention via Prisma parameterized queries

## Recent Updates

### Latest Improvements

**Docker & Deployment**

- Optimized multi-stage Docker builds for production
- Configured for Fly.io deployment with health checks
- Improved image optimization in Next.js production builds
- Push notification asset configuration for production

**UI/UX Redesign**

- Redesigned landing page with improved mobile responsiveness
- Updated discovery interface with better card layout
- Refreshed profile dialog and chat interface
- Added custom scrollbar styling for better aesthetics
- Enhanced mobile header and navigation

**Real-time Features**

- Fixed online status not updating in real-time in sidebar
- Improved WebSocket connection reliability
- Added browser push notifications for matches and messages
- Enhanced typing indicators and message delivery

**CI/CD**

- Added CI build/lint gate, CodeRabbit reviews, and non-blocking fallow checks on PRs
- Auto-deploy: server → Fly.io, client → Vercel; Dependabot for weekly updates

## CI/CD

The monorepo uses GitHub Actions plus two hosted apps. **CI is the only gate** —
CodeRabbit and fallow comment but never block a merge.

| Trigger                        | What runs                                   | Blocks merge?              |
| ------------------------------ | ------------------------------------------- | -------------------------- |
| Open / update a PR             | CI (client + server), CodeRabbit, fallow    | CI: yes¹ · others: no      |
| Push to `main` (server paths)  | CI + **Fly.io deploy**                       | —                          |
| Push to `main` (client paths)  | CI + **Vercel deploy** (native integration) | —                          |
| Weekly (Dependabot)            | Dependency PRs → re-run CI / CodeRabbit / fallow | —                     |

¹ CI blocks only after you mark its checks **required** in branch protection (see below).

### Workflows & config

| File                                    | Purpose                                                             |
| --------------------------------------- | ------------------------------------------------------------------ |
| `.github/workflows/ci.yml`              | Lint + build the client and typecheck + build the server (the gate)|
| `.github/workflows/deploy-server.yml`   | `flyctl deploy` the server on push to `main` (server paths only)    |
| `.github/workflows/fallow.yml`          | Non-blocking fallow brief on PRs → run's Summary tab               |
| `.github/dependabot.yml`                | Weekly grouped dependency PRs for `/client`, `/server`, Actions    |
| `.coderabbit.yaml`                      | CodeRabbit PR-review config (runs as a GitHub App)                 |

The client deploys through **Vercel's native Git integration** (with per-PR preview
URLs), so there is intentionally no client deploy workflow here.

### One-time setup

1. **Fly deploy token** — create a deploy-scoped token and add it as the
   `FLY_API_TOKEN` repo secret (GitHub → Settings → Secrets and variables → Actions):

   ```bash
   fly tokens create deploy -x 8760h
   ```

2. **CodeRabbit** — install the GitHub App from [coderabbit.ai](https://coderabbit.ai)
   and grant it this repo. No Actions minutes are used; `.coderabbit.yaml` configures it.

3. **Required checks** — under Settings → Branches, add a protection rule for `main`
   requiring the **`client`** and **`server`** CI checks to pass before merge.

## Development

### Available Scripts

From the root directory:

```bash
# Development
pnpm dev            # Start both client and server
pnpm dev:client     # Start client only
pnpm dev:server     # Start server only

# Build
pnpm build          # Build both packages
pnpm build:client   # Build client only
pnpm build:server   # Build server only
```

### Database Management

```bash
cd server

# Generate Prisma Client after schema changes
pnpm prisma:generate

# Create and apply migrations
pnpm prisma:migrate

# Seed the database
pnpm prisma:seed
```

### Code Style

- **TypeScript** - Strict mode enabled
- **ESLint** - Code linting configured
- **Prettier** - Code formatting (recommended)
- **File naming**:
  - Components: PascalCase (`ChatInterface.tsx`)
  - Utils/Services: camelCase (`socket.ts`)
  - Pages: lowercase (`page.tsx`)

### Environment Setup

**Development URLs:**

- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Database: localhost:5432

**Production Considerations:**

- Set `NODE_ENV=production`
- Use strong JWT_SECRET (64+ characters)
- Configure CORS_ORIGIN to production domain
- Enable HTTPS
- Use Node.js 20 or higher runtime
- Use managed PostgreSQL, such as Neon
- Store uploads in S3 rather than the container filesystem
- Set up environment variables in deployment platform
- Configure push notification VAPID keys for web push
- Set up GitHub Actions workflows for automated deployment
- Database migrations run automatically on server container startup

## Acknowledgments

### Technologies

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Socket.IO](https://socket.io/) - Real-time communication

### UI & Design

- [shadcn/ui](https://ui.shadcn.com/) - UI component library
- [neobrutalism-components](https://github.com/ekmas/neobrutalism-components/) - Neobrutalism components
- [Lucide](https://lucide.dev/) - Icon library
- [Hero Patterns](https://heropatterns.com/) - SVG patterns

### Images

All testimonials photos from [Pexels](https://www.pexels.com/):

- [J carter](https://www.pexels.com/@j-carter-19793)
- [Pixabay - Friends in snow](https://www.pexels.com/photo/full-length-of-happy-friends-in-snow-on-field-247908/)
- [Pixabay - Couple on bed](https://www.pexels.com/photo/man-and-woman-lying-on-bed-414032/)
- [Arthur Brognoli - Person outdoors](https://www.pexels.com/photo/unknown-person-standing-outdoors-2379179/)
- [Pixabay - Aerial couple](https://www.pexels.com/photo/aerial-photo-of-man-and-woman-lying-on-grass-field-265722/)

## License

This project is licensed under the MIT License.
