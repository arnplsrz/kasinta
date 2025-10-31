// Service Worker for Push Notifications
// Handles notification display and click events

self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(clients.claim());
});

// Handle notification click events
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification.tag);

  event.notification.close();

  // Get the notification data
  const data = event.notification.data || {};
  const { matchId, type } = data;

  // Determine the URL to navigate to
  let targetUrl = "/";
  if (matchId) {
    targetUrl = `/?matchId=${matchId}`;
  }

  // Open or focus the app window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (
            client.url.includes(self.registration.scope) &&
            "focus" in client
          ) {
            return client.focus().then(() => {
              // Send message to the client to navigate
              client.postMessage({
                type: "NOTIFICATION_CLICKED",
                matchId,
                notificationType: type,
              });
            });
          }
        }

        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

// Handle messages from the main thread
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Handle push notification display
self.addEventListener("push", (event) => {
  if (!event.data) {
    return;
  }

  try {
    const data = event.data.json();
    const { title, body, icon, badge, tag, data: notificationData } = data;

    const options = {
      body,
      icon: icon || "/logo.svg",
      badge: badge || "/logo.svg",
      tag: tag || "kasinta-notification",
      data: notificationData,
      requireInteraction: false,
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Error handling push notification:", error);
  }
});
