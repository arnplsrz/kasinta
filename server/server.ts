import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import cookieParser from "cookie-parser";
import initializeSocket from "./src/socket/socketHandler";

// Import routes
import authRoutes from "./src/routes/auth";
import userRoutes from "./src/routes/users";
import discoveryRoutes from "./src/routes/discovery";
import matchRoutes from "./src/routes/matches";
import chatRoutes from "./src/routes/chat";

// Initialize express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// // Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files with CORS headers
app.use("/uploads", (req: any, res: any, next: any) => {
  res.header("Access-Control-Allow-Origin", process.env.CORS_ORIGIN || "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static("uploads"));

// Initialize Socket.IO handlers
const userSockets = initializeSocket(io);

// Make io and userSockets available to routes
app.set("io", io);
app.set("userSockets", userSockets);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    message: "Dating app API is running",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
interface ErrorWithStatus extends Error {
  code?: string;
}

app.use(
  (err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
    console.error("Error:", err);

    if (err.name === "ValidationError") {
      res.status(400).json({ message: err.message });
      return;
    }

    if (err.name === "MulterError") {
      if (err.code === "LIMIT_FILE_SIZE") {
        res
          .status(400)
          .json({ message: "File size too large. Maximum size is 5MB" });
        return;
      }
      res.status(400).json({ message: err.message });
      return;
    }

    res.status(500).json({
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
    });
  }
);

// Start server
const PORT = Number(process.env.PORT) || 5001;
const HOST = "0.0.0.0";

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.error("Unhandled Promise Rejection:", err);
  server.close(() => process.exit(1));
});
