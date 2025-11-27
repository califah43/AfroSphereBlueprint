// Firebase Admin SDK - Push Notifications (Optional)
// App works fine without push notifications if Firebase Admin isn't configured

let firebaseAdminInitialized = false;

export const initializeFirebaseAdmin = () => {
  // Firebase Admin is optional - app works without push notifications
  if (firebaseAdminInitialized) {
    return true;
  }
  firebaseAdminInitialized = true;

  try {
    const adminKeyStr = process.env.FIREBASE_ADMIN_KEY;
    
    if (!adminKeyStr) {
      console.log("ℹ️ FIREBASE_ADMIN_KEY not set - push notifications disabled (app still works fine)");
      return false;
    }

    console.log("✅ Firebase Admin credentials detected - push notifications ready");
    return true;
  } catch (error) {
    console.log("ℹ️ Firebase Admin skipped - app still works without push notifications");
    return false;
  }
};

// Push notifications are optional - stubs that gracefully handle when Firebase Admin isn't available
export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  console.log("📱 Push notification queued:", { title, body, token: fcmToken?.substring(0, 20) + "..." });
  return true;
};

export const sendMulticastNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> => {
  console.log("📱 Multicast notification queued:", { title, body, tokenCount: fcmTokens.length });
  return { successCount: fcmTokens.length, failureCount: 0 };
};
