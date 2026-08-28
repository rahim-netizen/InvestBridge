import { getHeaders } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export async function searchUsers(query = "") {
  const response = await fetch(
    `${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`,
    { headers: getHeaders() },
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Could not load users.");
  }
  return data.users || [];
}
