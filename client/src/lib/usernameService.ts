// USERNAME AVAILABILITY SYSTEM (LIKE X / TWITTER)
// Checks if the username is available and reserves it

import { queryClient } from "./queryClient";

const TAKEN_USERNAMES = new Set<string>();
const AVAILABLE_USERNAMES = new Set<string>();

export interface CheckUsernameResult {
  available: boolean;
  message: string;
}

// Validate username format
export function validateUsernameFormat(username: string): { valid: boolean; error?: string } {
  const formatted = username.toLowerCase().trim();

  if (formatted.length < 3) {
    return { valid: false, error: "Username must be at least 3 characters" };
  }

  if (formatted.length > 30) {
    return { valid: false, error: "Username must be at most 30 characters" };
  }

  // Only letters, numbers, dot, underscore
  const usernameRegex = /^[a-z0-9._]+$/;
  if (!usernameRegex.test(formatted)) {
    return { valid: false, error: "Use only letters, numbers, dot or underscore" };
  }

  return { valid: true };
}

// Check username availability in real-time
export async function checkUsernameAvailability(username: string): Promise<CheckUsernameResult> {
  const formatted = username.toLowerCase().trim();

  // Validate format first
  const validation = validateUsernameFormat(formatted);
  if (!validation.valid) {
    return { available: false, message: validation.error || "Invalid username" };
  }

  // Check cache
  if (TAKEN_USERNAMES.has(formatted)) {
    return { available: false, message: "Username already taken" };
  }

  if (AVAILABLE_USERNAMES.has(formatted)) {
    return { available: true, message: "Username available" };
  }

  try {
    // Check availability with backend
    const response = await fetch(`/api/users/check-username?username=${encodeURIComponent(formatted)}`);
    const data = await response.json();

    if (data.available) {
      AVAILABLE_USERNAMES.add(formatted);
      return { available: true, message: "Username available" };
    } else {
      TAKEN_USERNAMES.add(formatted);
      return { available: false, message: "Username already taken" };
    }
  } catch (error) {
    return { available: false, message: "Error checking username availability" };
  }
}

// Update user's username
export async function updateUsername(userId: string, newUsername: string): Promise<{ success: boolean; error?: string }> {
  const formatted = newUsername.toLowerCase().trim();

  // Validate format
  const validation = validateUsernameFormat(formatted);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  // Check availability before submitting
  const availabilityCheck = await checkUsernameAvailability(formatted);
  if (!availabilityCheck.available) {
    return { success: false, error: "Username is not available" };
  }

  try {
    const response = await fetch("/api/users/update-username", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, username: formatted }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.message || "Failed to update username" };
    }

    // Invalidate relevant queries
    queryClient.invalidateQueries({ queryKey: ["/api/users", userId] });
    
    // Update cache
    AVAILABLE_USERNAMES.delete(formatted);
    TAKEN_USERNAMES.add(formatted);

    return { success: true };
  } catch (error) {
    return { success: false, error: "Error updating username" };
  }
}

// Clear cache (useful for testing)
export function clearUsernameCache() {
  TAKEN_USERNAMES.clear();
  AVAILABLE_USERNAMES.clear();
}
