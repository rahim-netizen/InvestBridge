const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Cross-tab broadcast channel for real-time authentication sync
const authChannel =
  typeof window !== "undefined" && "BroadcastChannel" in window
    ? new BroadcastChannel("investbridge_auth_channel")
    : null;

/**
 * Broadcast authentication state changes across all browser tabs
 */
export function broadcastAuthChange(payload) {
  if (typeof window === "undefined") return;

  // 1. Dispatch custom DOM event for current window
  window.dispatchEvent(new CustomEvent("auth:sync", { detail: payload }));

  // 2. Broadcast to all other open tabs/windows
  if (authChannel) {
    try {
      authChannel.postMessage(payload);
    } catch (e) {
      console.warn("Failed to broadcast auth message:", e);
    }
  }
}

/**
 * Subscribe to cross-tab & local authentication changes
 */
export function onAuthChange(callback) {
  if (typeof window === "undefined") return () => { };

  const handleBroadcast = (event) => {
    if (event.data && (event.data.type === "LOGIN" || event.data.type === "LOGOUT")) {
      callback(event.data);
    }
  };

  const handleStorage = (event) => {
    if (event.key === "auth_token" || event.key === "investbridgeSessionUser") {
      const token = localStorage.getItem("auth_token");
      const user = JSON.parse(localStorage.getItem("investbridgeSessionUser") || "null");
      if (token && user) {
        callback({ type: "LOGIN", user, token });
      } else if (!token && !user) {
        callback({ type: "LOGOUT" });
      }
    }
  };

  const handleCustomEvent = (event) => {
    if (event.detail) {
      callback(event.detail);
    }
  };

  if (authChannel) {
    authChannel.addEventListener("message", handleBroadcast);
  }
  window.addEventListener("storage", handleStorage);
  window.addEventListener("auth:sync", handleCustomEvent);

  return () => {
    if (authChannel) {
      authChannel.removeEventListener("message", handleBroadcast);
    }
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener("auth:sync", handleCustomEvent);
  };
}

/**
 * Helper to get stored auth token
 */
export function getAuthToken() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Helper to set stored auth token & user session with cross-tab broadcast
 */
export function setAuthSession({ token, user } = {}) {
  if (typeof localStorage === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }

  if (user) {
    localStorage.setItem("investbridgeSessionUser", JSON.stringify(user));
  } else if (!token) {
    localStorage.removeItem("investbridgeSessionUser");
  }

  if (token && user) {
    broadcastAuthChange({ type: "LOGIN", user, token });
  } else if (!token) {
    broadcastAuthChange({ type: "LOGOUT" });
  }
}

/**
 * Helper to set stored auth token
 */
export function setAuthToken(token) {
  if (typeof localStorage === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
}

/**
 * Explicitly clear all session storage and tokens
 */
export function clearAuthSession() {
  if (typeof localStorage === "undefined") return;
  localStorage.removeItem("auth_token");
  localStorage.removeItem("investbridgeSessionUser");
  broadcastAuthChange({ type: "LOGOUT" });
}

// Backward-compatible alias
export const eraseAllAuthCookies = clearAuthSession;

/**
 * Safely parse JSON response body to handle non-JSON or empty response errors
 */
async function parseJsonResponse(response) {
  const text = await response.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { message: text ? text.slice(0, 120) : "Server returned empty response." };
  }
  return data;
}

/**
 * Build default headers including Bearer Token for API authentication
 */
export function getHeaders(customHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Sign In user and store Bearer token with real-time cross-tab synchronization
 */
export async function apiLogin(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    clearAuthSession();
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Invalid credentials.");
    throw new Error(errorMessage);
  }

  if (data.access_token && data.user) {
    setAuthSession({ token: data.access_token, user: data.user });
  } else if (data.access_token) {
    setAuthToken(data.access_token);
  }

  return data;
}

/**
 * Sign Up user with real-time cross-tab synchronization
 */
export async function apiRegister(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
    }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    clearAuthSession();
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Registration failed.");
    throw new Error(errorMessage);
  }

  if (data.access_token && data.user) {
    setAuthSession({ token: data.access_token, user: data.user });
  } else if (data.access_token) {
    setAuthToken(data.access_token);
  }

  return data;
}

/**
 * Resend 5-minute email verification link
 */
export async function apiResendVerification(email) {
  const response = await fetch(`${API_BASE_URL}/api/email/resend-verification`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to resend verification email.");
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Sign Out user and revoke current Bearer token across all tabs
 */
export async function apiLogout() {
  try {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      headers: getHeaders(),
    });
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    clearAuthSession();
  }
}

/**
 * Retrieve current user using Bearer token
 */
export async function getCurrentUser() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (response.ok) {
      const data = await parseJsonResponse(response);
      if (data.id || data.email) {
        localStorage.setItem("investbridgeSessionUser", JSON.stringify(data));
        return data;
      }
    } else if (response.status === 401) {
      clearAuthSession();
    }
  } catch (err) {
    console.warn("Fetch current user error:", err);
  }

  return null;
}
