# Kasinta Client

A modern dating app frontend built with Next.js 16, React 19, TypeScript, and Tailwind CSS, featuring a neobrutalism design system.

## Key Features

- **User Authentication**: Secure JWT-based registration and login
- **Profile Management**: Edit profile with photo upload and preferences
- **Discovery System**: Swipe-based matching with advanced filters
- **Real-time Chat**: Socket.IO powered instant messaging
- **Match Notifications**: Live notifications when mutual likes occur
- **Theme Support**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Sidebar Navigation**: Collapsible sidebar with match list
- **Online Status**: See when matches are online
- **Undo Swipes**: Revert accidental swipes

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui with neobrutalism theme
- **Real-time**: Socket.IO Client
- **Icons**: Lucide React
- **Theme**: next-themes (dark/light mode)
- **State Management**: React Context API
- **Package Manager**: pnpm

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
│   └── SocketContext.tsx             # Socket.IO connection
├── lib/
│   ├── api.ts                        # API client functions
│   ├── types.ts                      # TypeScript types
│   └── utils.ts                      # Utility functions
├── .env.local                        # Environment variables (create this)
├── .env.example                      # Environment template
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

This configures the backend API endpoint. In production, update to your deployed backend URL.

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

Real-time communication layer:

- Automatic socket connection when authenticated
- JWT-based socket authentication
- Event listeners for:
  - `newMessage` - Real-time message delivery
  - `newMatch` - Instant match notifications
  - `unmatch` - Unmatch event handling
- Connection status tracking
- `sendMessage()` helper for real-time messaging

#### 3. Theme Provider ([components/ThemeProvider.tsx](components/ThemeProvider.tsx))

- Dark/light mode support via next-themes
- System preference detection
- Theme toggle component
- Persistent theme selection

#### 4. Root Layout ([app/layout.tsx](app/layout.tsx))

- Wraps entire app with AuthProvider, SocketProvider, and ThemeProvider
- Configured with Geist fonts
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
- Main content area showing either:
  - [DiscoverySection](components/layout/DiscoverySection.tsx) (default)
  - [ChatInterface](components/layout/ChatInterface.tsx) (when match selected)
- Seamless switching between discovery and chat views

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

- Socket connects when user is authenticated
- Auto-authenticates via JWT token emit
- Maintains userId -> socketId mapping on server

**Events**:

1. **New Messages** (`newMessage`):

   - Instantly delivers messages to recipient
   - Updates chat UI in real-time
   - Triggers in active conversation

2. **New Matches** (`newMatch`):

   - Notified when mutual like occurs
   - Shows "It's a Match!" modal
   - Updates matches list

3. **Unmatch** (`unmatch`):
   - Removes match from both users' lists
   - Updates UI instantly

**Fallback**:

- HTTP endpoints available for all operations
- Chat can function without WebSocket connection
- Connection status displayed in UI

## State Management

### Global State (Context API)

- **AuthContext**: User authentication and profile
- **SocketContext**: WebSocket connection and real-time events

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

For backend documentation, see the [server README](../server/README.md).
