// Firebase Cloud Messaging Service Worker
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyB1234567890",
  authDomain: "afrosphere.firebaseapp.com",
  projectId: "afrosphere",
  storageBucket: "afrosphere.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  
  const notificationTitle = payload.notification.title || "AfroSphere";
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/logo.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
