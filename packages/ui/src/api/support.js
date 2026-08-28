import { getHeaders } from "./auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

async function request(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: getHeaders(options.headers),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Something went wrong.");
  }
  return data;
}

export function getComplaints() {
  return request("/api/complaints");
}

export function createComplaint(subject, message) {
  return request("/api/complaints", {
    method: "POST",
    body: JSON.stringify({ subject, message }),
  });
}

export function getChatMessages(chatHash) {
  return request(`/api/chat/${encodeURIComponent(chatHash)}`);
}

export function sendChatMessage(chatHash, message) {
  return request(`/api/chat/${encodeURIComponent(chatHash)}`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}
