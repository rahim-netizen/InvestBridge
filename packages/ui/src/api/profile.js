const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

import { getHeaders } from "./auth";

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

export async function getProfile() {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load profile.");
  }

  return data;
}

export async function updateProfile(profileData) {
  const response = await fetch(`${API_BASE_URL}/api/profile`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(profileData),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to save profile.");
    throw new Error(errorMessage);
  }

  return data;
}
