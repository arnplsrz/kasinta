'use client';

import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { NotificationData } from '@/hooks/usePushNotifications';

/**
 * Component that listens to socket notification events and displays browser notifications
 * Must be placed inside both SocketProvider and NotificationProvider
 */
export const NotificationListener = () => {
  const { socket, connected } = useSocket();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!socket || !connected) return;

    const handleNotification = (data: NotificationData) => {
      showNotification(data);
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket, connected, showNotification]);

  return null;
};
