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

// The founder's one-time submission (image + description, optionally paid)
// against one of their own posts.
export async function getEntrepreneurTransaction(opportunityId) {
  const response = await fetch(
    `${API_BASE_URL}/api/opportunities/${opportunityId}/entrepreneur-transaction`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load your submission.");
  }

  return data;
}

export async function submitEntrepreneurTransaction(opportunityId, payload) {
  const response = await fetch(
    `${API_BASE_URL}/api/opportunities/${opportunityId}/entrepreneur-transaction`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
  );

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors
        ? Object.values(data.errors).flat().join(" ")
        : "Failed to submit.");
    const error = new Error(errorMessage);
    error.errors = data.errors || null;
    throw error;
  }

  return data;
}
