# Kasinta Client

A modern dating app frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS, featuring a neobrutalism design system.

## Key Features

- **User Authentication**: Secure JWT-based registration and login
- **Profile Management**: Edit profile with photo upload and preferences
- **Discovery System**: Swipe-based matching with advanced filters
- **Real-time Chat**: Socket.IO powered instant messaging with typing indicators
- **Push Notifications**: Browser-based notifications for new matches and messages
- **Match Notifications**: Live notifications when mutual likes occur
- **Theme Support**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Sidebar Navigation**: Collapsible sidebar with match list
- **Online Status**: Real-time presence tracking with visual indicators
- **Undo Swipes**: Revert accidental swipes
- **Service Worker**: Background notification handling with click navigation

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui with neobrutalism theme
- **Real-time**: Socket.IO Client with auto-reconnection
- **Push Notifications**: Service Worker API with notification permissions
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)
- **State Management**: React Context API
- **Package Manager**: pnpm
- **Deployment**: Docker with multi-stage builds (standalone mode)

## Project Structure

```
client/
├── app/
│   ├── page.tsx                      # Home page (Hero or Dashboard)
│   ├── layout.tsx                    # Root layout with providers
│   ├── globals.css                   # Global styles & CSS variables
│   ├── login/page.tsx                # Login page
│   ├── register/page.tsx             # Registration page
│   └── profile/page.tsx              # Profile management
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx            # Main sidebar navigation
│   │   ├── ChatInterface.tsx         # Chat component
│   │   ├── DiscoverySection.tsx      # Swipe interface
│   │   ├── FilterPopover.tsx         # Discovery filters
│   │   ├── Hero.tsx                  # Landing page hero
│   │   ├── Header.tsx                # Header component
│   │   └── Footer.tsx                # Footer component
│   ├── ui/                           # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── sidebar.tsx
│   │   ├── avatar.tsx
│   │   ├── dialog.tsx
│   │   └── ... (other UI components)
│   ├── ThemeProvider.tsx             # Theme context provider
│   └── ThemeToggle.tsx               # Theme switcher
├── contexts/
│   ├── AuthContext.tsx               # Authentication state
│   ├── SocketContext.tsx             # Socket.IO connection
│   └── NotificationContext.tsx       # Push notification management
├── hooks/
│   └── usePushNotifications.ts       # Notification permissions & display
├── lib/
│   ├── api.ts                        # API client functions
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Utility functions
├── public/
│   ├── sw.js                         # Service Worker for notifications
│   └── logo.svg                      # App logo for notifications
├── .env.local                        # Environment variables (create this)
├── .env.example                      # Environment template
├── Dockerfile                        # Production Docker build
├── tailwind.config.ts                # Tailwind configuration
├── components.json                   # shadcn/ui config
└── package.json
```

## Getting Started

### Prerequisites

1. Backend server running on http://localhost:5000
2. PostgreSQL database configured and migrated
3. Environment variables set in both client and server

### Starting Both Servers

**Option 1: From root directory**

```bash
# From kasinta/ directory
pnpm dev
```

This starts both client and server concurrently.

**Option 2: Separate terminals**

Terminal 1 (Backend):

```bash
cd server
pnpm dev
```

Terminal 2 (Frontend):

```bash
cd client
pnpm dev
```

### Environment Configuration

**Required Environment Variables**

Create `.env.local` in the client directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

This configures the backend API endpoint. In production, update to your deployed backend URL (e.g., https://kasinta-backend.fly.dev).

**Image Configuration**:
- Images are served unoptimized (`unoptimized: true`) to avoid Docker optimization issues
- Remote patterns configured for localhost:4000, localhost:5001, and production backend
- Profile photos loaded from backend `/uploads` endpoint with CORS support

See [.env.example](.env.example) for the complete template.

## Scripts

```bash
# Install dependencies
cd client
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Architecture

### Core Infrastructure

#### 1. Authentication Context ([contexts/AuthContext.tsx](contexts/AuthContext.tsx))

React Context providing:

- User state management
- Login/register/logout functions
- Auto-authentication check on mount
- User refresh functionality
- JWT token storage in localStorage

#### 2. Socket.IO Context ([contexts/SocketContext.tsx](contexts/SocketContext.tsx))

Real-time communication layer with robust reconnection:

- Automatic socket connection when authenticated (`autoConnect: true`)
- JWT-based socket authentication via `auth` object
- Advanced reconnection settings:
  - 10 reconnection attempts with exponential backoff (1-5 seconds)
  - WebSocket transport with polling fallback
  - Force new connection on authentication changes
- Event listeners for:
  - `newMessage` - Real-time message delivery
  - `newMatch` - Instant match notifications
  - `unmatch` - Unmatch event handling
  - `notification` - Push notification events
  - `userStatusChange` - Online/offline presence updates
  - `userTyping` - Typing indicators
- Debug logging for connection events (connect, disconnect, errors)
- Connection status tracking
- `sendMessage()` helper for real-time messaging

#### 3. Notification Context ([contexts/NotificationContext.tsx](contexts/NotificationContext.tsx))

Browser push notification system:

- Permission request management with user-friendly UI
- Service Worker registration and lifecycle management
- Notification display with smart visibility logic (only when tab not focused)
- Click-to-navigate functionality for deep linking to chats
- Notification queuing for pending permissions
- Integration with Socket.IO for real-time notification events
- Support for match and message notification types

#### 4. Theme Provider ([components/ThemeProvider.tsx](components/ThemeProvider.tsx))

- Dark/light mode support via next-themes
- System preference detection
- Theme toggle component
- Persistent theme selection

#### 5. Root Layout ([app/layout.tsx](app/layout.tsx))

- Wraps entire app with AuthProvider, SocketProvider, NotificationProvider, and ThemeProvider
- Configured with custom fonts: Inter (sans), Geist Mono (mono), Bricolage Grotesque (headings)
- Service Worker script registration in production
- Updated metadata for Kasinta branding

## Application Structure

### Home Page ([app/page.tsx](app/page.tsx))

The main application page adapts based on authentication status:

**For Unauthenticated Users**:

- Displays Hero component ([components/layout/Hero.tsx](components/layout/Hero.tsx))
- Landing page with app introduction
- Call-to-action buttons for login/register

**For Authenticated Users**:

- Integrated sidebar-based layout with [SidebarProvider](components/ui/sidebar.tsx)
- [AppSidebar](components/layout/AppSidebar.tsx) for navigation
- [NotificationListener](components/NotificationListener.tsx) for push notifications
- Main content area showing either:
  - [DiscoverySection](components/layout/DiscoverySection.tsx) (default)
  - [ChatInterface](components/layout/ChatInterface.tsx) (when match selected)
- Seamless switching between discovery and chat views
- Browser notification prompt for permission (if not granted)

### Authentication Pages

#### Login Page ([app/login/page.tsx](app/login/page.tsx))

- Email and password form
- Form validation
- Error handling and display
- Loading states
- Auto-redirect to home on success
- Link to register page

#### Register Page ([app/register/page.tsx](app/register/page.tsx))

- Multi-step registration form:
  - Name, email, age
  - Gender selection
  - Interested in selection
  - Password with confirmation
- Client-side validation (age 18+, password match)
- Error handling
- Auto-redirect to profile setup on success

#### Profile Page ([app/profile/page.tsx](app/profile/page.tsx))

- Profile photo upload with preview
- Editable profile fields (name, age, gender, bio)
- Matching preferences:
  - Interested in (men/women/everyone)
  - Age range (min/max)
  - Max distance (km)
- Success/error message display
- Logout functionality

## Core Components

### AppSidebar ([components/layout/AppSidebar.tsx](components/layout/AppSidebar.tsx))

Collapsible sidebar navigation featuring:

- User profile section with photo and name
- Theme toggle (dark/light mode)
- Match list with:
  - Profile photos
  - Last message previews
  - Unread indicators
  - Active chat highlighting
- Navigation buttons:
  - Discover (heart icon)
  - Profile (user icon)
  - Logout
- Responsive mobile/desktop behavior

### DiscoverySection ([components/layout/DiscoverySection.tsx](components/layout/DiscoverySection.tsx))

Tinder-style swipe interface:

- Card-based profile display with:
  - Profile photo or placeholder
  - Name and age
  - Distance from user
  - Bio text
- Action buttons:
  - Dislike (X button)
  - Like (heart button)
  - Undo last swipe
- Advanced filters via [FilterPopover](components/layout/FilterPopover.tsx):
  - Age range slider
  - Distance slider
  - Gender preferences
- Progress indicator
- "It's a Match!" modal on mutual likes
- Real-time match notifications
- Empty state with helpful messaging

### ChatInterface ([components/layout/ChatInterface.tsx](components/layout/ChatInterface.tsx))

Real-time messaging interface:

- Chat header with:
  - Match's profile photo
  - Name
  - Online/offline status
  - Back to discovery button
- Message history:
  - Sender-based styling
  - Timestamp display
  - Auto-scroll to latest
  - Skeleton loading states
- Message input:
  - Text input field
  - Send button
  - Real-time via Socket.IO
  - HTTP fallback
- Optimistic UI updates
- Empty state for new conversations

### Hero ([components/layout/Hero.tsx](components/layout/Hero.tsx))

Landing page for unauthenticated users:

- App branding and tagline
- Feature highlights with animated marquee
- Call-to-action buttons
- Responsive design
- Theme-aware styling

## Authentication Flow

1. **Initial Load**:

   - AuthContext checks localStorage for JWT token
   - If found, calls `authAPI.getMe()` to validate and fetch user
   - Sets user state or clears invalid token

2. **Login/Register**:

   - Form submission calls respective API
   - On success, token stored in localStorage
   - User state updated
   - Auto-redirect to appropriate page

3. **Protected Pages**:

   - All pages (except login/register) check for authenticated user
   - Redirect to /login if not authenticated

4. **Logout**:
   - Calls `authAPI.logout()` to update server-side online status
   - Clears localStorage token
   - Resets user state
   - Redirects to /login

## Real-Time Features

### Socket.IO Integration

**Connection**:

- Socket connects automatically when user is authenticated (`autoConnect: true`)
- JWT token passed in connection `auth` object
- Robust reconnection strategy with 10 attempts and exponential backoff (1-5s)
- Transport upgrade from polling to WebSocket
- Maintains userId -> socketId mapping on server
- Debug logging for connection, disconnect, and error events

**Events**:

1. **New Messages** (`newMessage`):

   - Instantly delivers messages to recipient
   - Updates chat UI in real-time
   - Triggers in active conversation
   - Triggers push notification if tab not focused

2. **New Matches** (`newMatch`):

   - Notified when mutual like occurs
   - Shows "It's a Match!" modal
   - Updates matches list
   - Triggers push notification with profile photo badge

3. **Unmatch** (`unmatch`):

   - Removes match from both users' lists
   - Updates UI instantly
   - Navigates away if currently chatting with unmatched user

4. **Typing Indicators** (`userTyping`):

   - Shows when match is typing in chat
   - Auto-clears after 1 second of inactivity

5. **Online Status** (`userStatusChange`):

   - Real-time presence updates
   - Green dot indicator in sidebar and chat header
   - Updates on login/logout/disconnect

6. **Push Notifications** (`notification`):
   - Browser notifications for matches and messages
   - Badge includes sender's profile photo from backend URL
   - Click-to-navigate to relevant chat
   - Smart display (only when tab not visible/focused)

**Fallback**:

- HTTP endpoints available for all operations
- Chat can function without WebSocket connection
- Connection status displayed in UI

### Push Notifications

**Service Worker** ([public/sw.js](public/sw.js)):

- Registered on app load in production
- Handles notification display and click events
- Persists in background for always-on notifications
- Deep linking to specific chats on notification click
- Notification icon uses `/logo.svg` from public folder

**Permission Flow**:

1. User is authenticated and socket connected
2. System checks notification permission status
3. If not granted, shows permission request card
4. User grants permission via browser prompt
5. Future matches/messages trigger notifications (when tab not focused)

**Notification Types**:

- **New Match**: "New Match! You matched with [Name]"
  - Badge: Match's profile photo
  - Click action: Opens chat with new match
- **New Message**: "New message from [Name]: [Preview]"
  - Badge: Sender's profile photo
  - Click action: Opens chat with sender

**Smart Display Logic**:

- Only shows when document is not visible (user not on tab)
- Prevents duplicate notifications when user is actively viewing app
- Badge URLs use `BACKEND_URL` environment variable for correct origin

## State Management

### Global State (Context API)

- **AuthContext**: User authentication and profile
- **SocketContext**: WebSocket connection and real-time events
- **NotificationContext**: Push notification permissions and display

### Local Component State

- Form inputs and validation
- Loading states
- Error/success messages
- UI-specific state (modals, selected items)

### Data Fetching Pattern

```typescript
// Standard pattern used across all pages
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const result = await api.getData();
      setData(result);
    } catch (error) {
      console.error("Failed to load:", error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

## Error Handling

### API Errors

- All API calls wrapped in try-catch
- Error messages displayed in UI
- User-friendly error text extraction
- Console logging for debugging

### Form Validation

- Client-side validation before API calls
- Age range checks (18-100)
- Password confirmation matching
- File size/type validation for uploads
- Required field enforcement

### Loading States

- Disabled buttons during async operations
- Loading spinners for page transitions
- Optimistic UI updates where appropriate

## Docker Deployment

### Production Build ([Dockerfile](Dockerfile))

The client uses a multi-stage Docker build optimized for Next.js standalone mode:

**Build Stage**:

- Installs dependencies with pnpm
- Builds Next.js application with standalone output
- Optimizes for minimal production bundle

**Production Stage**:

- Copies standalone server, static assets, and cache
- Copies public folder to root for runtime image optimization
- Runs as non-root user (nextjs:nodejs) for security
- Exposes port 3000
- Starts via `node server.js` in standalone directory

**Key Features**:

- Image optimization support with `.next/cache` directory
- Static file serving from `/public` directory
- Production-ready with minimal attack surface
- ~200MB final image size

**Building & Running**:

```bash
# Build image
docker build -t kasinta-client .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=https://kasinta-backend.fly.dev \
  kasinta-client
```

For backend documentation, see the [server README](../server/README.md).
