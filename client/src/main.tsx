import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Suppress Firebase messaging errors for unsupported browsers
const originalError = console.error;
console.error = function(...args: any[]) {
  const msg = String(args[0] || "");
  if (msg.includes("messaging/unsupported-browser") || 
      (msg.includes("Firebase") && msg.includes("messaging"))) {
    return;
  }
  originalError.apply(console, args);
};

// Suppress uncaught errors from Firebase messaging
window.addEventListener("error", (event) => {
  const msg = String(event.message || event.error || "");
  if (msg.includes("messaging/unsupported-browser") || 
      (msg.includes("Firebase") && msg.includes("messaging"))) {
    event.preventDefault();
  }
}, true);

createRoot(document.getElementById("root")!).render(<App />);
