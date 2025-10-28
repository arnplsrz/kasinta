import type {
  User,
  AuthResponse,
  Match,
  Message,
  SwipeResponse,
  PotentialMatch,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// Helper function to create headers with auth
const createHeaders = (includeAuth = true): HeadersInit => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "An error occurred" }));
    throw new Error(error.error || "An error occurred");
  }
  return response.json();
};

// ===== AUTH API =====

export const authAPI = {
  register: async (data: {
    email: string;
    password: string;
    name: string;
    age: number;
    gender?: string;
    interestedIn?: string;
  }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: createHeaders(false),
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(response);
  },

  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: createHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(response);
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: createHeaders(),
    });
    return handleResponse<void>(response);
  },

  getMe: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: createHeaders(),
    });
    const data = await handleResponse<User>(response);
    return data;
  },
};

// ===== USER API =====

export const userAPI = {
  getUser: async (userId: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      headers: createHeaders(),
    });
    return handleResponse<User>(response);
  },

  updateProfile: async (data: {
    name?: string;
    age?: number;
    gender?: string;
    bio?: string;
    interestedIn?: string;
    preferenceMinAge?: number;
    preferenceMaxAge?: number;
    preferenceDistance?: number;
    latitude?: number;
    longitude?: number;
  }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: createHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(response);
  },

  uploadPhoto: async (file: File): Promise<User> => {
    const formData = new FormData();
    formData.append("photo", file);

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/users/photo`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return handleResponse<User>(response);
  },

  deletePhoto: async (): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/photo`, {
      method: "DELETE",
      headers: createHeaders(),
    });
    return handleResponse<User>(response);
  },
};

// ===== DISCOVERY API =====

export const discoveryAPI = {
  getPotentialMatches: async (params?: {
    minAge?: number;
    maxAge?: number;
    maxDistance?: number;
  }): Promise<PotentialMatch[]> => {
    const queryParams = new URLSearchParams();
    if (params?.minAge) queryParams.append("minAge", params.minAge.toString());
    if (params?.maxAge) queryParams.append("maxAge", params.maxAge.toString());
    if (params?.maxDistance)
      queryParams.append("maxDistance", params.maxDistance.toString());

    const url = `${API_BASE_URL}/api/discovery${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse<PotentialMatch[]>(response);
  },

  swipe: async (
    targetId: string,
    action: "like" | "dislike"
  ): Promise<SwipeResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/discovery/swipe`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ targetId, action }),
    });
    return handleResponse<SwipeResponse>(response);
  },

  undoSwipe: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/discovery/undo`, {
      method: "POST",
      headers: createHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// ===== MATCH API =====

export const matchAPI = {
  getMatches: async (): Promise<Match[]> => {
    const response = await fetch(`${API_BASE_URL}/api/matches`, {
      headers: createHeaders(),
    });
    return handleResponse<Match[]>(response);
  },

  unmatch: async (matchId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/matches/${matchId}`, {
      method: "DELETE",
      headers: createHeaders(),
    });
    return handleResponse<void>(response);
  },
};

// ===== CHAT API =====

export const chatAPI = {
  getUnreadCount: async (): Promise<{ unreadCount: number }> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/unread/count`, {
      headers: createHeaders(),
    });
    return handleResponse<{ unreadCount: number }>(response);
  },

  getMessages: async (
    matchUserId: string,
    params?: { limit?: number; before?: string }
  ): Promise<Message[]> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.before) queryParams.append("before", params.before);

    const url = `${API_BASE_URL}/api/chat/${matchUserId}${
      queryParams.toString() ? `?${queryParams}` : ""
    }`;
    const response = await fetch(url, {
      headers: createHeaders(),
    });
    return handleResponse<Message[]>(response);
  },

  sendMessage: async (
    matchUserId: string,
    content: string
  ): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/api/chat/${matchUserId}`, {
      method: "POST",
      headers: createHeaders(),
      body: JSON.stringify({ content }),
    });
    return handleResponse<Message>(response);
  },
};

export { API_BASE_URL };
