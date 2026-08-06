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

export async function getConnectedOpportunities() {
  const response = await fetch(`${API_BASE_URL}/api/connected-opportunities`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load saved opportunities.");
  }

  return data;
}

export async function connectOpportunity(opportunityId) {
  const response = await fetch(`${API_BASE_URL}/api/connected-opportunities`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({ opportunity_id: opportunityId }),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to save opportunity.");
    throw new Error(errorMessage);
  }

  return data;
}

export async function disconnectOpportunity(connectionId) {
  const response = await fetch(
    `${API_BASE_URL}/api/connected-opportunities/${connectionId}`,
    {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    },
  );

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to remove saved opportunity.");
  }

  return data;
}
