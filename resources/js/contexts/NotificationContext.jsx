import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import notificationEvents from '../utils/notificationEvents';
import { useNotificationRefresh } from '../hooks/useNotificationRefresh';

const NotificationContext = createContext();

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState({
    patients_sent_to_cashier: 0,
    credit_patients_approval: 0,
    patients_sent_to_doctor: 0,
    patients_sent_to_optician: 0,
    glass_patients: 0,
    dispensing_requests: 0,
    procedure_requests: 0,
    other_dispensing_requests: 0,
    patients_to_return: 0,
    glass_dispensing_requests: 0,
    vip_patients: 0,
    spectacle_patients: 0,
    waiting_patients: 0,
    patients_sent_to_sales: 0,
    website_appointments: 0,
  });
  const [loading, setLoading] = useState(false);
  const [currentParams, setCurrentParams] = useState({});
  // Keep previous snapshot to avoid abrupt zeroing
  const [previousNotifications, setPreviousNotifications] = useState(null);
  // Stabilization window per key to prevent flicker right after actions
  const [stabilizeUntil, setStabilizeUntil] = useState({}); // { key: timestampMs }
  // Require two consecutive zeros before clearing a badge
  const [zeroStreak, setZeroStreak] = useState({}); // { key: count }
  // Prevent server from overwriting page-driven updates for a short time
  const [stickyUntil, setStickyUntil] = useState({}); // { key: timestampMs }
  // Hard locks per key while on a page
  const [lockedKeys, setLockedKeys] = useState({}); // { key: true }

  // Use notification refresh hook
  useNotificationRefresh(() => {
    console.log('Notification refresh triggered from context');
    fetchNotifications(currentParams);
  });

  const fetchNotifications = useCallback(async (params = {}) => {
    try {
      console.log('NotificationContext: Starting to fetch notifications...');
      setLoading(true);
      setCurrentParams(params);
      
      // Simple authentication check - if no user, don't fetch
      if (!window.user || !window.user.id) {
        console.log('NotificationContext: User not authenticated or no privileges, skipping fetch');
        setLoading(false);
        return null;
      }
      
      console.log('NotificationContext: Making API call to /api/notifications');
      
      // Simple API call without complex error handling
      const response = await window.axios.get('/api/notifications');
      console.log('NotificationContext: API response received:', response);
      
      if (response.data && response.data.data) {
        const serverData = response.data.data;
        console.log('Fetched notifications:', serverData);
        
        // Simple merge with defaults
        const defaultNotifications = {
          patients_sent_to_cashier: 0,
          credit_patients_approval: 0,
          patients_sent_to_doctor: 0,
          patients_sent_to_optician: 0,
          glass_patients: 0,
          dispensing_requests: 0,
          procedure_requests: 0,
          other_dispensing_requests: 0,
          patients_to_return: 0,
          glass_dispensing_requests: 0,
          vip_patients: 0,
          spectacle_patients: 0,
          waiting_patients: 0,
          patients_sent_to_sales: 0,
          website_appointments: 0,
        };
        
        const mergedData = { ...defaultNotifications, ...serverData };
        setNotifications(mergedData);
        return mergedData;
      }
    } catch (error) {
      console.error('NotificationContext: Failed to fetch notifications:', error);
      
      // Set default values on error
      setNotifications({
        patients_sent_to_cashier: 0,
        credit_patients_approval: 0,
        patients_sent_to_doctor: 0,
        patients_sent_to_optician: 0,
        glass_patients: 0,
        dispensing_requests: 0,
        procedure_requests: 0,
        other_dispensing_requests: 0,
        patients_to_return: 0,
        glass_dispensing_requests: 0,
        vip_patients: 0,
        spectacle_patients: 0,
        waiting_patients: 0,
        patients_sent_to_sales: 0,
        website_appointments: 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(() => {
    // Defer by one tick to allow pages to lock keys first
    return new Promise((resolve) => {
      setTimeout(() => resolve(fetchNotifications(currentParams)), 0);
    });
  }, [fetchNotifications, currentParams]);

  // Immediate notification refresh for critical updates
  const refreshNotificationsImmediately = useCallback(() => {
    console.log('Immediate notification refresh triggered');
    // Clear any cached data to force fresh fetch
    const cacheKey = 'notifications_' + (window.user?.id || 'default');
    try {
      if (window.cache && typeof window.cache.delete === 'function') {
        window.cache.delete(cacheKey);
      }
    } catch (e) {
      // Ignore cache errors
    }
    // Fetch immediately without params to get fresh data
    return fetchNotifications({});
  }, [fetchNotifications]);

  // One-time initial fetch for basic notifications
  useEffect(() => {
    // Check if user is authenticated before fetching notifications
    const token = localStorage.getItem('token');
    const user = window.user; // Get user from window object set by Default layout
    if (token && user && user.privileges) {
      console.log('NotificationContext: User authenticated, fetching notifications...');
      fetchNotifications({});
    } else {
      console.log('NotificationContext: User not authenticated or no privileges, skipping fetch');
      setLoading(false);
    }
    // Expose events globally so layouts can trigger refresh on auth ready
    window.notificationEvents = notificationEvents;
  }, []); // Empty dependency array - run only once

  // WebSocket listener for real-time notifications (replaces polling)
  useEffect(() => {
    // Skip WebSocket if not available
    if (!window.Echo) {
      console.log('NotificationContext: Echo not available, using polling only');
      return;
    }

    const user = window.user;
    if (!user || !user.id) {
      console.log('NotificationContext: No authenticated user, skipping WebSocket');
      return;
    }

    console.log('NotificationContext: Setting up WebSocket for user:', user.id);
    
    // Simple private channel for this user
    const channel = window.Echo.private(`user.${user.id}.notifications`)
      .listen('NotificationUpdated', (data) => {
        console.log('✅ WebSocket notification received:', data);
        fetchNotifications({});
      })
      .error((error) => {
        console.warn('❌ WebSocket error:', error);
      });

    return () => {
      console.log('NotificationContext: Cleaning up WebSocket');
      if (channel) {
        try {
          if (typeof channel.leave === 'function') {
            channel.leave();
          } else if (typeof channel.stop === 'function') {
            channel.stop();
          } else if (typeof channel.unsubscribe === 'function') {
            channel.unsubscribe();
          }
        } catch (error) {
          console.warn('Error cleaning up WebSocket channel:', error);
        }
      }
    };
  }, [fetchNotifications]);

  // Simple polling as fallback
  useEffect(() => {
    // Skip if WebSocket is available
    if (window.Echo) {
      console.log('NotificationContext: WebSocket available, skipping polling');
      return;
    }

    // Skip if no authenticated user
    if (!window.user || !window.user.id) {
      console.log('NotificationContext: No user, skipping polling');
      return;
    }

    console.log('NotificationContext: Using polling fallback');
    
    // Poll every 30 seconds
    const interval = setInterval(() => {
      if (!loading) {
        fetchNotifications({});
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, loading]);

  // Listen to notification refresh events with improved debouncing and immediate response
  useEffect(() => {
    let timeoutId;
    let immediateTimeoutId;
    let lastFetchTime = 0;
    const MIN_FETCH_INTERVAL = 500; // Reduced to 500ms for more responsive updates
    
    const unsubscribe = notificationEvents.subscribe(() => {
      console.log('NotificationContext: Event-triggered refresh received');

      // Clear any pending timeouts
      clearTimeout(timeoutId);
      clearTimeout(immediateTimeoutId);

        const now = Date.now();

      // For immediate response to user actions, trigger quickly
        if (now - lastFetchTime >= MIN_FETCH_INTERVAL && !loading) {
          lastFetchTime = now;
        console.log('NotificationContext: Triggering immediate notification refresh');
        // Immediate refresh for user-triggered events
        immediateTimeoutId = setTimeout(() => {
          refreshNotifications();
        }, 100); // Very short delay for immediate feel

        // Follow-up refresh to ensure consistency
        timeoutId = setTimeout(() => {
          if (!loading) {
            console.log('NotificationContext: Triggering follow-up notification refresh');
            refreshNotifications();
          }
        }, 2000); // Follow-up after 2 seconds
      } else {
        // If too soon since last fetch, queue it for later
        timeoutId = setTimeout(() => {
          if (!loading) {
            console.log('NotificationContext: Triggering queued notification refresh');
            refreshNotifications();
          }
        }, MIN_FETCH_INTERVAL - (now - lastFetchTime));
      }
    });

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(immediateTimeoutId);
      unsubscribe();
    };
  }, [refreshNotifications, loading]);

  // Listen for authentication changes and fetch notifications when user logs in
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'token' && e.newValue) {
        console.log('NotificationContext: Token detected, fetching notifications...');
        fetchNotifications({});
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check for token changes within the same tab
    const checkToken = () => {
      const token = localStorage.getItem('token');
      // Only fetch if we have a token and notifications are empty or all zeros
      // Also add a flag to prevent multiple simultaneous requests
      if (token && (!notifications || Object.values(notifications).every(v => v === 0))) {
        // Check if we're already loading to prevent duplicate requests
        if (!loading) {
          console.log('NotificationContext: Token found, fetching notifications...');
          fetchNotifications({});
        }
      }
    };

    // Check every 10 seconds for token changes (reduced from 2 seconds to prevent spam)
    const interval = setInterval(checkToken, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [fetchNotifications, notifications]);

  const setNotificationField = useCallback((key, value, ttlMs = 0) => {
    // Only update if the value has actually changed to prevent flickering
    setNotifications((prev) => {
      if (prev && prev[key] === value) {
        return prev;
      }
      return { ...(prev || {}), [key]: value };
    });
  }, []);

  // Expose lock/unlock functions for pages
  const lockNotificationKey = useCallback((key) => {
    setLockedKeys((prev) => ({ ...prev, [key]: true }));
  }, []);

  const unlockNotificationKey = useCallback((key) => {
    setLockedKeys((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const value = {
    notifications,
    loading,
    fetchNotifications,
    refreshNotifications,
    refreshNotificationsImmediately,
    setNotificationField,
    lockNotificationKey,
    unlockNotificationKey
  };

  // Expose refresh function globally for debugging and manual refresh
  useEffect(() => {
    window.refreshNotifications = () => {
      console.log('Manual notification refresh triggered');
      return refreshNotifications();
    };
    window.forceNotificationRefresh = () => {
      console.log('Force notification refresh triggered - bypassing loading check');
      return fetchNotifications({});
    };
    window.debugNotifications = () => {
      console.log('Current notifications:', notifications);
      console.log('Loading:', loading);
      console.log('Last fetch params:', currentParams);
      return { notifications, loading, currentParams };
    };
  }, [refreshNotifications, fetchNotifications, notifications, loading, currentParams]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};