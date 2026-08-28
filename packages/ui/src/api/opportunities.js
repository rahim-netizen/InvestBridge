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

export async function getMyOpportunities() {
  const response = await fetch(`${API_BASE_URL}/api/opportunities`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load opportunities.");
  }

  return data;
}

export async function createOpportunity(opportunityData) {
  const response = await fetch(`${API_BASE_URL}/api/opportunities`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(opportunityData),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to post opportunity.");
    throw new Error(errorMessage);
  }

  return data;
}

export async function updateOpportunity(id, opportunityData) {
  const response = await fetch(`${API_BASE_URL}/api/opportunities/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(opportunityData),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    const errorMessage =
      data.message ||
      (data.errors ? Object.values(data.errors).flat().join(" ") : "Failed to update opportunity.");
    throw new Error(errorMessage);
  }

  return data;
}

export async function deleteOpportunity(id) {
  const response = await fetch(`${API_BASE_URL}/api/opportunities/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete opportunity.");
  }

  return data;
}

export async function getAllOpportunities() {
  const response = await fetch(`${API_BASE_URL}/api/opportunities/all`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Failed to load opportunities.");
  }

  return data;
}
