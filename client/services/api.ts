import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (email, password) => api.post("/auth/login", { email, password }),
  logout: () => api.post("/auth/logout"),
  getCurrentUser: () => api.get("/auth/me"),
};

// User services
export const userService = {
  getProfile: () => api.get("/users/me"),
  updateProfile: (data) => api.put("/users/me", data),
  uploadPhoto: (formData) =>
    api.post("/users/upload-photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  updateLocation: (longitude, latitude) =>
    api.put("/users/location", { longitude, latitude }),
};

// Discovery services
export const discoveryService = {
  getPotentialMatches: (params) => api.get("/discovery", { params }),
  swipe: (targetUserId, action) =>
    api.post("/discovery/swipe", { targetUserId, action }),
  undoSwipe: () => api.post("/discovery/undo"),
};

// Match services
export const matchService = {
  getMatches: () => api.get("/matches"),
  unmatch: (matchId) => api.delete(`/matches/${matchId}`),
};

// Chat services
export const chatService = {
  getMessages: (matchId, params) => api.get(`/chat/${matchId}`, { params }),
  sendMessage: (matchId, content) => api.post(`/chat/${matchId}`, { content }),
  getUnreadCount: () => api.get("/chat/unread/count"),
};

export default api;
