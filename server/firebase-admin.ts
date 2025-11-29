// Firebase Admin SDK - Account creation, Storage uploads, and Push Notifications
import * as admin from "firebase-admin";
import { Readable } from "stream";

let firebaseAdminInitialized = false;
let firebaseAdminApp: any = null;

export const initializeFirebaseAdmin = () => {
  if (firebaseAdminInitialized) {
    return !!firebaseAdminApp;
  }
  firebaseAdminInitialized = true;

  try {
    const adminKeyStr = process.env.FIREBASE_ADMIN_KEY;
    
    if (!adminKeyStr) {
      console.log("ℹ️ FIREBASE_ADMIN_KEY not set - account creation and storage disabled");
      return false;
    }

    const serviceAccount = JSON.parse(adminKeyStr);
    const storageBucket = process.env.STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`;

    firebaseAdminApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket
    });

    console.log("✅ Firebase Admin initialized - account creation & storage ready");
    return true;
  } catch (error) {
    console.log("ℹ️ Firebase Admin skipped - app still works without account creation/storage");
    return false;
  }
};

// Create user in Firebase Auth (server-side)
export const createFirebaseUser = async (
  email: string,
  password: string,
  displayName?: string
): Promise<{ uid: string; email: string } | null> => {
  if (!firebaseAdminApp) return null;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName
    });
    console.log(`✅ Firebase user created: ${userRecord.uid}`);
    return { uid: userRecord.uid, email: userRecord.email || email };
  } catch (error: any) {
    console.error("Firebase user creation error:", error.message);
    throw error;
  }
};

// Verify Firebase ID token
export const verifyFirebaseToken = async (idToken: string): Promise<string | null> => {
  if (!firebaseAdminApp) return null;

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
  } catch (error: any) {
    console.error("Token verification error:", error.message);
    return null;
  }
};

// Upload file to Firebase Storage
export const uploadToStorage = async (
  filePath: string,
  fileBuffer: Buffer,
  mimeType: string
): Promise<string | null> => {
  if (!firebaseAdminApp) return null;

  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(filePath);

    const writeStream = file.createWriteStream({
      metadata: { contentType: mimeType },
      resumable: false
    });

    await new Promise((resolve, reject) => {
      const stream = Readable.from(fileBuffer);
      stream.pipe(writeStream)
        .on("finish", resolve)
        .on("error", reject);
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;
    console.log(`✅ File uploaded to Storage: ${publicUrl}`);
    return publicUrl;
  } catch (error: any) {
    console.error("Storage upload error:", error.message);
    return null;
  }
};

// Push notifications (FCM)
export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<boolean> => {
  if (!firebaseAdminApp) {
    console.log("⚠️ Firebase Admin not available for FCM");
    return false;
  }

  try {
    const messaging = admin.messaging(firebaseAdminApp);
    const message = {
      notification: { title, body },
      data: data || {},
      token: fcmToken,
    };

    const result = await messaging.send(message as any);
    console.log(`📱 Push notification sent (${result}): ${title}`);
    return true;
  } catch (error: any) {
    console.error("FCM send error:", error.message);
    return false;
  }
};

export const sendMulticastNotification = async (
  fcmTokens: string[],
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<{ successCount: number; failureCount: number }> => {
  if (!firebaseAdminApp || fcmTokens.length === 0) {
    console.log("⚠️ Firebase Admin not available or no tokens");
    return { successCount: 0, failureCount: 0 };
  }

  try {
    const messaging = admin.messaging(firebaseAdminApp);
    let successCount = 0;
    let failureCount = 0;

    // Send notifications to each token individually
    for (const token of fcmTokens) {
      try {
        await messaging.send({
          notification: { title, body },
          data: data || {},
          token,
        });
        successCount++;
      } catch (error) {
        failureCount++;
      }
    }
    
    console.log(`📱 Multicast sent: ${successCount} success, ${failureCount} failed`);
    return { successCount, failureCount };
  } catch (error: any) {
    console.error("Multicast send error:", error.message);
    return { successCount: 0, failureCount: fcmTokens.length };
  }
};
