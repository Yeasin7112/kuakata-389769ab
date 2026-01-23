import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationState {
  isSupported: boolean;
  permission: NotificationPermission;
  isEnabled: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [state, setState] = useState<NotificationState>({
    isSupported: false,
    permission: 'default',
    isEnabled: false,
  });

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = 'Notification' in window;
    setState(prev => ({
      ...prev,
      isSupported,
      permission: isSupported ? Notification.permission : 'denied',
    }));
  }, []);

  const requestPermission = useCallback(async () => {
    if (!state.isSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, permission }));

      if (permission === 'granted' && user) {
        // Save preference to database
        await supabase
          .from('profiles')
          .update({ notification_enabled: true })
          .eq('user_id', user.id);
        
        setState(prev => ({ ...prev, isEnabled: true }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [state.isSupported, user]);

  const showNotification = useCallback((title: string, options?: NotificationOptions) => {
    if (state.permission !== 'granted') return;

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [state.permission]);

  const disableNotifications = useCallback(async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ notification_enabled: false })
        .eq('user_id', user.id);
    }
    setState(prev => ({ ...prev, isEnabled: false }));
  }, [user]);

  return {
    ...state,
    requestPermission,
    showNotification,
    disableNotifications,
  };
};

// Hook to subscribe to real-time notices and beach safety alerts
export const useNotificationSubscription = () => {
  const { showNotification, permission } = useNotifications();

  useEffect(() => {
    if (permission !== 'granted') return;

    // Subscribe to new notices
    const noticesChannel = supabase
      .channel('notices-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notices',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          const notice = payload.new as any;
          showNotification(notice.title_en || 'New Notice', {
            body: notice.content_en || 'A new notice has been posted',
            tag: 'notice-' + notice.id,
          });
        }
      )
      .subscribe();

    // Subscribe to beach safety updates
    const safetyChannel = supabase
      .channel('beach-safety-notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'beach_safety',
        },
        (payload) => {
          const safety = payload.new as any;
          const flagEmoji = safety.flag_color === 'red' ? '🔴' : safety.flag_color === 'yellow' ? '🟡' : '🟢';
          showNotification(`${flagEmoji} Beach Safety Alert`, {
            body: `Beach status: ${safety.status}. ${safety.notes_en || ''}`,
            tag: 'beach-safety',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(noticesChannel);
      supabase.removeChannel(safetyChannel);
    };
  }, [permission, showNotification]);
};
