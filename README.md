<div align="center">

<img src="./client/public/logo.svg" height="75" />
<img src="./client/public/kasinta-title.svg" height="75" />

**A modern, real-time dating web application
built with Next.js, Express.js, and Socket.IO**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Architecture](#architecture)

</div>

## Screenshots

> Recent redesign with improved mobile responsiveness and modern neobrutalism aesthetic

<table>
  <tr>
    <td width="50%" align="center">
      <img src="./docs/images/landing-page.png" alt="Landing Page" />
      <br />
      <em>Landing Page - Redesigned with improved mobile UX</em>
    </td>
    <td width="50%" align="center">
      <img src="./docs/images/discovery.png" alt="Discovery" />
      <br />
      <em>Swipe Discovery - Redesigned interface</em>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="./docs/images/match-modal.png" alt="Match Modal" />
      <br />
      <em>Match Notification - Instant real-time updates</em>
    </td>
    <td width="50%" align="center">
      <img src="./docs/images/chat.png" alt="Chat Interface" />
      <br />
      <em>Real-time Chat - Redesigned with custom scrollbars</em>
    </td>
  </tr>
</table>

## Overview

Kasinta is a full-stack dating application featuring real-time messaging, swipe-based matching, and a modern neobrutalism design aesthetic. Built as a monorepo with separate client and server packages managed by pnpm workspaces.

### Key Highlights

- **Secure Authentication** - JWT-based auth with bcrypt password hashing
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
| **Next.js**          | 16.0.0  | React framework (App Router) |
| **React**            | 19.2.0  | UI library                   |
| **TypeScript**       | 5.x     | Type safety                  |
| **TailwindCSS**      | 4.x     | Styling system               |
| **Socket.IO Client** | 4.8.1   | Real-time communication      |
| **shadcn/ui**        | Latest  | UI component library         |
| **React Hook Form**  | 7.65.0  | Form management              |
| **Zod**              | 4.1.12  | Schema validation            |
| **Lucide React**     | 0.548.0 | Icon library                 |
| **next-themes**      | 0.4.6   | Dark mode support            |

### Backend ([/server](./server))

| Technology     | Version | Purpose               |
| -------------- | ------- | --------------------- |
| **Node.js**    | 18+     | Runtime environment   |
| **Express.js** | 5.x     | Web framework         |
| **TypeScript** | 5.x     | Type safety           |
| **PostgreSQL** | 12+     | Database              |
| **Prisma**     | 6.18.0  | ORM                   |
| **Socket.IO**  | 4.8.1   | WebSocket server      |
| **JWT**        | 9.0.2   | Authentication tokens |
| **bcryptjs**   | 2.4.3   | Password hashing      |
| **Multer**     | 1.4.5   | File upload handling  |

### DevOps & Tools

- **pnpm** - Monorepo package manager
- **Docker** - Containerization
- **docker-compose** - Multi-container orchestration
- **ESLint** - Code linting
- **ts-node-dev** - TypeScript development

## Quick Start

### Prerequisites

- Node.js 18 or higher
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
JWT_SECRET="your-super-secret-jwt-key"
PORT=4000
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
MAX_FILE_SIZE=5242880
```

**Client** (`client/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

4. **Setup the database**

```bash
cd server
pnpm prisma:generate
pnpm prisma:migrate
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

**Development (docker-compose):**

```bash
# Start all services (PostgreSQL + Server + Client)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

**Production (Fly.io):**

The application includes optimized Docker configurations for production deployment on Fly.io:

- **Multi-stage builds** for minimal image size
- **Non-root user** for security
- **Health checks** for container monitoring
- **Environment variable** configuration via Fly.io secrets

See `client/Dockerfile` and `server/Dockerfile` for production build configurations.

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
│   ├── uploads/profiles/   # Profile photo storage
│   ├── server.ts           # Application entry point
│   └── package.json
│
├── package.json            # Root package.json (workspace)
├── pnpm-workspace.yaml     # Workspace configuration
├── docker-compose.yml      # Docker services definition
└── README.md              # This file
```

## Documentation

### Quick Links

- **[Client Documentation](./client/README.md)** - Frontend architecture and components
- **[Server Documentation](./server/README.md)** - Backend API and database

### API Documentation

The server provides RESTful APIs and Socket.IO events:

#### REST API Endpoints

- **Authentication**: `/api/auth/*` - Register, login, logout, get user
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
        FileSystem["File System<br/>(Uploads)"]
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
    Controllers --> FileSystem
    SocketHandler --> Prisma
    Middleware --> Routes
    Middleware --> SocketHandler
    Prisma --> Database

    style Client fill:#e1f5ff
    style Server fill:#fff4e1
    style Database fill:#ffe1e1
    style Communication fill:#f0f0f0
```

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

- Added GitHub Actions workflow for automated code review
- Integrated Claude PR Assistant for pull request analysis

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
- Backend: http://localhost:5001
- Database: localhost:5432

**Production Considerations:**

- Set `NODE_ENV=production`
- Use strong JWT_SECRET (64+ characters)
- Configure CORS_ORIGIN to production domain
- Enable HTTPS
- Use managed PostgreSQL (AWS RDS, Heroku, Fly.io Postgres, etc.)
- Configure CDN for uploads or use cloud storage
- Set up environment variables in deployment platform
- Configure push notification VAPID keys for web push
- Set up GitHub Actions workflows for automated deployment

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
