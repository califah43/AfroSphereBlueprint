import { getMessaging, getToken, onMessage, Messaging } from "firebase/messaging";
import { app } from "./firebase";

let messaging: Messaging | null = null;
let messagingSupported = true;

// Check if browser supports Firebase messaging
const checkMessagingSupport = (): boolean => {
  try {
    // Check for required APIs
    if (!("serviceWorker" in navigator)) {
      return false;
    }
    if (!("PushManager" in window)) {
      return false;
    }
    if (!("Notification" in window)) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};

const initializeMessaging = (): Messaging | null => {
  if (!messagingSupported) {
    return null;
  }
  if (!messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      messagingSupported = false;
      console.log("Firebase messaging not supported in this browser");
      return null;
    }
  }
  return messaging;
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Check if messaging is supported first
    if (!checkMessagingSupport()) {
      console.log("This browser does not support Firebase messaging");
      return null;
    }

    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support desktop notifications");
      return null;
    }

    // Check if already granted
    if (Notification.permission === "granted") {
      return await getFCMToken();
    }

    // Request permission
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        return await getFCMToken();
      }
    }

    return null;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return null;
  }
};

export const getFCMToken = async (): Promise<string | null> => {
  try {
    const msg = initializeMessaging();
    if (!msg) {
      return null;
    }
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

    const token = await getToken(msg, { vapidKey });

    if (token) {
      console.log("FCM Token obtained:", token.substring(0, 20) + "...");
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

export const setupMessageListener = (
  onMessageReceived: (payload: any) => void
) => {
  try {
    const msg = initializeMessaging();
    if (!msg) {
      return;
    }
    
    // Listen for messages when app is in foreground
    onMessage(msg, (payload) => {
      console.log("Message received in foreground:", payload);
      onMessageReceived(payload);
    });
  } catch (error) {
    console.error("Error setting up message listener:", error);
  }
};

export const saveFCMTokenToBackend = async (token: string, userId: string) => {
  try {
    const res = await fetch("/api/notifications/fcm-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, userId }),
    });

    if (!res.ok) {
      throw new Error("Failed to save FCM token");
    }

    return await res.json();
  } catch (error) {
    console.error("Error saving FCM token to backend:", error);
    return null;
  }
};
