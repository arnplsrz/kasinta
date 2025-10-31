"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  usePushNotifications,
  NotificationData,
  NotificationPermission,
} from "@/hooks/usePushNotifications";
import { useAuth } from "./AuthContext";
import { useSocket } from "./SocketContext";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface NotificationContextType {
  permission: NotificationPermission;
  isSupported: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showNotification: (data: NotificationData) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

// Component to handle notification clicks
const NotificationClickHandler: React.FC = () => {
  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const customEvent = event as CustomEvent<{
        matchId: string;
        notificationType: string;
      }>;
      const { matchId } = customEvent.detail;

      if (matchId) {
        // Navigate to the chat by updating the URL
        const url = new URL(window.location.href);
        url.searchParams.set("matchId", matchId);
        window.history.pushState({}, "", url);

        // Dispatch a custom event to notify the app to update
        window.dispatchEvent(new Event("popstate"));
      }
    };

    window.addEventListener("notification-clicked", handleNotificationClick);

    return () => {
      window.removeEventListener(
        "notification-clicked",
        handleNotificationClick
      );
    };
  }, []);

  return null;
};

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { isSupported, permission, requestPermission, showNotification } =
    usePushNotifications();
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const [hasPromptedThisSession, setHasPromptedThisSession] = useState(false);

  // Show permission prompt for authenticated users who haven't decided yet
  useEffect(() => {
    if (
      user &&
      isSupported &&
      permission === "default" &&
      !hasPromptedThisSession
    ) {
      // Delay showing the prompt to avoid overwhelming the user immediately
      const timer = setTimeout(() => {
        setShowPermissionPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, permission, hasPromptedThisSession]);

  const handleRequestPermission = async () => {
    setHasPromptedThisSession(true);
    setShowPermissionPrompt(false);
    await requestPermission();
  };

  const handleDismiss = () => {
    setHasPromptedThisSession(true);
    setShowPermissionPrompt(false);
  };

  // Listen for notification events from socket
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNotification = (data: NotificationData) => {
      showNotification(data);
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, connected, showNotification]);

  const value: NotificationContextType = {
    permission,
    isSupported,
    requestPermission,
    showNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Notification click handler */}
      <NotificationClickHandler />

      {/* Permission Request Prompt */}
      {showPermissionPrompt && (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
          <Card className="w-100 p-0 shadow-lg border-2">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-sm">
                        Enable Notifications
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Get notified when you receive new matches and messages
                      </p>
                    </div>
                    <Button
                      variant="neutral"
                      size="icon"
                      className="h-6 w-6 -mt-1 -mr-1"
                      onClick={handleDismiss}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleRequestPermission}
                      size="sm"
                      className="flex-1"
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Enable
                    </Button>
                    <Button
                      onClick={handleDismiss}
                      size="sm"
                      className="flex-1"
                    >
                      <BellOff className="h-4 w-4 mr-1" />
                      Not Now
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </NotificationContext.Provider>
  );
};
