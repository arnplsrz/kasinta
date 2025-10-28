// User types matching backend Prisma schema
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  gender: string;
  bio?: string;
  profilePhoto?: string;
  latitude?: number;
  longitude?: number;
  interestedIn: string;
  preferenceMinAge: number;
  preferenceMaxAge: number;
  preferenceDistance: number;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Match type
export interface Match {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;
  user1?: User;
  user2?: User;
  lastMessage?: Message;
}

// Message type
export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  matchId?: string;
  read: boolean;
  readAt?: Date;
  createdAt: Date;
  sender?: User;
  receiver?: User;
}

// Swipe type
export interface Swipe {
  id: string;
  userId: string;
  targetId: string;
  action: 'like' | 'dislike';
  createdAt: Date;
}

// API Response types
export interface AuthResponse {
  token: string;
  user: User;
}

export interface SwipeResponse {
  swipe: Swipe;
  match?: Match;
}

// Discovery potential match with distance
export interface PotentialMatch extends User {
  distance?: number;
}

// API Error type
export interface ApiError {
  error: string;
  details?: string;
}
