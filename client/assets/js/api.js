const API_BASE_URL = "http://localhost:5000/api";

export const api = {
  async post(endpoint, data, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Request failed");
    return result;
  },

  async get(endpoint, token = null) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Request failed");
    return result;
  },

  async put(endpoint, data, token = null) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Request failed");
    return result;
  },

  async delete(endpoint, token = null) {
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || "Request failed");
    return result;
  },
};
