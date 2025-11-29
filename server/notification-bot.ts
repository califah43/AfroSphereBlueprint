// Firebase Cloud Messaging Bot - Sends real-time lock screen notifications
import * as admin from "firebase-admin";

let firebaseAdminApp: any = null;

export const initNotificationBot = (app: any) => {
  firebaseAdminApp = app;
};

// Send push notification + save to database
export const sendBotNotification = async (
  userId: string,
  title: string,
  body: string,
  type: "new_like" | "new_comment" | "new_follower",
  fcmToken?: string
): Promise<boolean> => {
  try {
    if (!firebaseAdminApp) {
      console.log("⚠️ Firebase Admin not available for FCM");
      return false;
    }

    // Send FCM push notification if token available
    if (fcmToken) {
      try {
        const messaging = admin.messaging(firebaseAdminApp);
        const payload = {
          notification: { title, body },
          data: {
            type,
            userId,
            timestamp: Date.now().toString(),
          },
        };
        
        await messaging.send({
          ...payload,
          token: fcmToken,
        });
        
        console.log(`📱 Push notification sent to ${userId} (${type})`);
        return true;
      } catch (fcmError: any) {
        console.log(`⚠️ FCM send failed: ${fcmError.message}`);
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error("Notification bot error:", error);
    return false;
  }
};

// Get user's FCM token from database
export const getUserFcmToken = async (db: any, userId: string): Promise<string | null> => {
  try {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");
    
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });
    
    return user?.fcmToken || null;
  } catch (error) {
    console.error("Failed to get FCM token:", error);
    return null;
  }
};

// Save FCM token for user
export const saveFcmToken = async (
  db: any,
  userId: string,
  fcmToken: string
): Promise<boolean> => {
  try {
    const { users } = await import("@shared/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(users)
      .set({ fcmToken })
      .where(eq(users.id, userId));

    console.log(`✅ FCM token saved for user ${userId}`);
    return true;
  } catch (error) {
    console.error("Failed to save FCM token:", error);
    return false;
  }
};
