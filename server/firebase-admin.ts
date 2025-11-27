import * as admin from "firebase-admin";

let firebaseApp: admin.app.App | null = null;
let initAttempted = false;

export const initializeFirebaseAdmin = () => {
  // Only attempt once to avoid re-initialization errors
  if (initAttempted) {
    return firebaseApp;
  }
  initAttempted = true;

  try {
    const adminKeyStr = process.env.FIREBASE_ADMIN_KEY;
    
    if (!adminKeyStr) {
      console.warn("⚠️ FIREBASE_ADMIN_KEY not configured - push notifications will be disabled");
      return null;
    }

    // Parse the admin key JSON
    let adminKey;
    try {
      adminKey = JSON.parse(adminKeyStr);
    } catch (parseError) {
      console.error("❌ Failed to parse FIREBASE_ADMIN_KEY JSON:", parseError);
      return null;
    }

    // Validate required fields
    if (!adminKey.project_id || !adminKey.private_key || !adminKey.client_email) {
      console.error("❌ FIREBASE_ADMIN_KEY missing required fields (project_id, private_key, client_email)");
      return null;
    }

    // Initialize with credential
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(adminKey as admin.ServiceAccount),
      projectId: adminKey.project_id,
    });

    console.log("✅ Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
};

export const getFirebaseAdmin = (): admin.app.App | null => {
  if (!firebaseApp) {
    return initializeFirebaseAdmin();
  }
  return firebaseApp;
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  try {
    const app = getFirebaseAdmin();
    if (!app) {
      console.warn("Firebase Admin not initialized, cannot send notification");
      return false;
    }

    const message: admin.messaging.Message = {
      notification: {
        title,
        body,
      },
      data,
      token: fcmToken,
    };

    const response = await admin.messaging().send(message);
    console.log("Push notification sent successfully:", response);
    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
};

export const sendMulticastNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> => {
  try {
    const app = getFirebaseAdmin();
    if (!app) {
      console.warn("Firebase Admin not initialized");
      return { successCount: 0, failureCount: fcmTokens.length };
    }

    const messaging = admin.messaging();
    let successCount = 0;
    let failureCount = 0;

    // Send notifications individually to track success/failure
    for (const token of fcmTokens) {
      try {
        const message: admin.messaging.Message = {
          notification: {
            title,
            body,
          },
          data,
          token,
        };
        await messaging.send(message);
        successCount++;
      } catch (error) {
        failureCount++;
        console.error(`Failed to send to token ${token}:`, error);
      }
    }

    console.log(`Multicast notification: ${successCount} sent, ${failureCount} failed`);
    return { successCount, failureCount };
  } catch (error) {
    console.error("Failed to send multicast notification:", error);
    return { successCount: 0, failureCount: fcmTokens.length };
  }
};
