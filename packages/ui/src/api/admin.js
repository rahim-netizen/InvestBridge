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

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/api/admin${path}`, {
    headers: getHeaders(),
    ...options,
  });

  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new Error(data.message || "Admin request failed.");
  }

  return data;
}

export function getAdminStats() {
  return request("/stats");
}

export function getAdminUsers() {
  return request("/users");
}

export function deleteAdminUser(id) {
  return request(`/users/${id}`, { method: "DELETE" });
}

export function getAdminOpportunities() {
  return request("/opportunities");
}

export function setAdminOpportunityStatus(id, status) {
  return request(`/opportunities/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function deleteAdminOpportunity(id) {
  return request(`/opportunities/${id}`, { method: "DELETE" });
}
