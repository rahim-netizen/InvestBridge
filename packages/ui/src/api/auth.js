const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Helper to extract specific cookie value from document.cookie
 */
export function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[2]) : null;
}

/**
 * Explicitly purge all session & CSRF cookies in browser
 */
export function eraseAllAuthCookies() {
  if (typeof document === "undefined") return;
  const cookies = ["investbridge_session", "laravel_session", "XSRF-TOKEN"];
  cookies.forEach((name) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `${name}=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
    document.cookie = `${name}=; path=/; domain=127.0.0.1; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  });
}

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
 * Fetch CSRF cookie from Laravel Sanctum
 */
export async function getCsrfToken() {
  try {
    await fetch(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      method: "GET",
      credentials: "include",
    });
  } catch (err) {
    console.warn("CSRF cookie warning:", err);
  }
}

/**
 * Build default headers including X-XSRF-TOKEN for cookie authentication
 */
function getHeaders(customHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...customHeaders,
  };

  const xsrfToken = getCookie("XSRF-TOKEN");
  if (xsrfToken) {
    headers["X-XSRF-TOKEN"] = xsrfToken;
  }

  return headers;
}

/**
 * Sign In user via cookie session
 */
export async function apiLogin(email, password) {
  await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/login`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    // Strictly ensure ZERO cookies exist for unverified user or failed login
    eraseAllAuthCookies();
    localStorage.removeItem("investbridgeSessionUser");

    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Invalid credentials.");
    throw new Error(errorMessage);
  }

  if (data.user) {
    localStorage.setItem("investbridgeSessionUser", JSON.stringify(data.user));
  }

  return data;
}

/**
 * Sign Up user via cookie session (unverified, ZERO cookies issued)
 */
export async function apiRegister(name, email, password) {
  await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({
      name,
      email,
      password,
      password_confirmation: password,
    }),
  });

  const data = await parseJsonResponse(response);

  // STRICT ENFORCEMENT: Unverified user MUST have ZERO cookies
  eraseAllAuthCookies();
  localStorage.removeItem("investbridgeSessionUser");

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Registration failed.");
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Resend 5-minute email verification link
 */
export async function apiResendVerification(email) {
  await getCsrfToken();

  const response = await fetch(`${API_BASE_URL}/api/email/resend-verification`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ email }),
  });

  const data = await parseJsonResponse(response);

  // Purge any cookies while resending verification
  eraseAllAuthCookies();

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to resend verification email.");
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * Sign Out user and invalidate session cookies
 */
export async function apiLogout() {
  try {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
    });
  } catch (err) {
    console.warn("Logout error:", err);
  } finally {
    eraseAllAuthCookies();
    localStorage.removeItem("investbridgeSessionUser");
  }
}

/**
 * Retrieve current user from cookie session
 */
export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (response.ok) {
      const data = await parseJsonResponse(response);
      if (data.id || data.email) {
        localStorage.setItem("investbridgeSessionUser", JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn("Fetch current user error:", err);
  }

  return null;
}
