import { useEffect, useState, useCallback, useRef } from "react";

export type NotificationPermission = "default" | "granted" | "denied";

export interface NotificationData {
  type: "newMessage" | "newMatch";
  title: string;
  body: string;
  matchId?: string;
  senderId?: string;
  icon?: string | null;
  badge?: string | null;
}

export const usePushNotifications = () => {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const notificationQueueRef = useRef<NotificationData[]>([]);

  // Check if notifications are supported
  useEffect(() => {
    const supported = "Notification" in window && "serviceWorker" in navigator;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  // Register service worker
  useEffect(() => {
    if (!isSupported) return;

    const registerServiceWorker = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        // console.log("Service Worker registered:", reg);
        setRegistration(reg);

        // Handle service worker updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                // console.log("New service worker available");
              }
            });
          }
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    };

    registerServiceWorker();
  }, [isSupported]);

  // Listen for notification clicks from service worker
  useEffect(() => {
    if (!isSupported) return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NOTIFICATION_CLICKED") {
        const { matchId, notificationType } = event.data;

        // Dispatch custom event that can be listened to by components
        window.dispatchEvent(
          new CustomEvent("notification-clicked", {
            detail: { matchId, notificationType },
          })
        );
      }
    };

    navigator.serviceWorker.addEventListener("message", handleMessage);

    return () => {
      navigator.serviceWorker.removeEventListener("message", handleMessage);
    };
  }, [isSupported]);

  // Request notification permission
  const requestPermission =
    useCallback(async (): Promise<NotificationPermission> => {
      if (!isSupported) {
        console.warn("Notifications are not supported");
        return "denied";
      }

      try {
        const result = await Notification.requestPermission();
        setPermission(result as NotificationPermission);

        // Process any queued notifications if permission was granted
        if (result === "granted" && notificationQueueRef.current.length > 0) {
          const queue = [...notificationQueueRef.current];
          notificationQueueRef.current = [];
          queue.forEach((data) => showNotification(data));
        }

        return result as NotificationPermission;
      } catch (error) {
        console.error("Error requesting notification permission:", error);
        return "denied";
      }
    }, [isSupported]);

  // Show notification
  const showNotification = useCallback(
    async (data: NotificationData) => {
      if (!isSupported) {
        console.warn("Notifications are not supported");
        return;
      }

      // If permission is not granted yet, queue the notification
      if (permission !== "granted") {
        notificationQueueRef.current.push(data);
        return;
      }

      try {
        const { title, body, icon, badge, matchId, type } = data;

        // Check if the document is visible
        const isDocumentVisible =
          document.visibilityState === "visible" && document.hasFocus();

        // Only show notification if the document is not visible or minimized
        if (!isDocumentVisible) {
          const options: NotificationOptions = {
            body,
            icon: icon || "/logo.svg",
            badge: badge || "/logo.svg",
            tag: matchId ? `${type}-${matchId}` : type,
            data: { matchId, type },
            requireInteraction: false,
            silent: false,
          };

          // Use service worker if available, otherwise fall back to Notification API
          if (registration && registration.active) {
            await registration.showNotification(title, options);
          } else {
            const notification = new Notification(title, options);

            // Handle notification click for non-service worker notifications
            notification.onclick = () => {
              window.focus();
              notification.close();

              // Dispatch custom event
              window.dispatchEvent(
                new CustomEvent("notification-clicked", {
                  detail: { matchId, notificationType: type },
                })
              );
            };
          }
        }
      } catch (error) {
        console.error("Error showing notification:", error);
      }
    },
    [isSupported, permission, registration]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    showNotification,
    registration,
  };
};
