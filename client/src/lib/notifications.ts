import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type NotificationType = 
  | "LIKE_POST" 
  | "COMMENT_POST" 
  | "REPLY_COMMENT" 
  | "FOLLOW_USER" 
  | "BADGE_GRANTED" 
  | "SYSTEM_MESSAGE" 
  | "NEW_FEATURE_ALERT"
  | "followRequest"
  | "followAccepted";

export interface FirestoreNotification {
  id?: string;
  type: NotificationType;
  senderId: string;
  receiverId: string;
  postId?: string;
  commentId?: string;
  message: string;
  timestamp?: number;
  seen: boolean;
}

/**
 * Trigger a notification to be sent to a user
 * Writes to Firestore: notifications/{receiverId}/items/{notificationId}
 */
export async function triggerNotification({
  type,
  senderId,
  receiverId,
  postId,
  commentId,
  message,
}: Omit<FirestoreNotification, "timestamp" | "seen" | "id">): Promise<void> {
  try {
    const notificationsRef = collection(db, "notifications", receiverId, "items");
    await addDoc(notificationsRef, {
      type,
      senderId,
      receiverId,
      postId,
      commentId,
      message,
      timestamp: serverTimestamp(),
      seen: false,
    });
  } catch (error) {
    console.error("Failed to trigger notification:", error);
  }
}

/**
 * Map database notification types to Firestore types
 */
export function mapNotificationType(dbType: string): NotificationType {
  const mapping: Record<string, NotificationType> = {
    like: "LIKE_POST",
    comment: "COMMENT_POST",
    follow: "FOLLOW_USER",
    badge: "BADGE_GRANTED",
    followRequest: "followRequest",
    followAccepted: "followAccepted",
  };
  return mapping[dbType] || "SYSTEM_MESSAGE";
}
