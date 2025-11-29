import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

let messaging: any = null;

export const initializeFCM = async () => {
  try {
    // Check if Notifications API is supported
    if (!("Notification" in window)) {
      console.log("ℹ️ Browser does not support notifications");
      return false;
    }

    // Check if SW is supported
    if (!("serviceWorker" in navigator)) {
      console.log("ℹ️ Browser does not support service workers");
      return false;
    }

    const app = initializeApp(firebaseConfig);
    messaging = getMessaging(app);

    // Request notification permission
    if (Notification.permission === "granted") {
      await registerFCMToken();
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await registerFCMToken();
      }
    }

    // Listen for incoming messages
    onMessage(messaging, (payload) => {
      console.log("FCM message received:", payload);
      
      if (payload.notification) {
        // Show notification if in foreground
        new Notification(payload.notification.title || "AfroSphere", {
          body: payload.notification.body,
          icon: "/logo.png",
        });
      }
    });

    return true;
  } catch (error) {
    console.error("FCM initialization error:", error);
    return false;
  }
};

export const registerFCMToken = async () => {
  if (!messaging) return;

  try {
    // Register service worker
    const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    console.log("Service worker registered");

    // Get FCM token
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      // Save token to backend
      const userId = localStorage.getItem("userId");
      if (userId) {
        await fetch("/api/notifications/fcm-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, userId }),
        });
        console.log("FCM token registered");
      }
    }
  } catch (error) {
    console.error("Failed to register FCM token:", error);
  }
};
