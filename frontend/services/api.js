const getToken = () => localStorage.getItem("token");

// Fonction centrale : tous les appels passent par elle
async function request(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Erreur");
  }
  return res.json();
}

export const api = {
  // --- Auth ---
  register: (d) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(d) }),
  login: (d) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(d) }),

  // --- Projets ---
  getProjects: () => request("/api/projects"),
  createProject: (d) =>
    request("/api/projects", { method: "POST", body: JSON.stringify(d) }),
  deleteProject: (id) =>
    request(`/api/projects/${id}`, { method: "DELETE" }),

  // invitations & collaboration
  createInvitation: (projectId, d) =>
    request(`/api/projects/${projectId}/invitations`, { method: "POST", body: JSON.stringify(d) }),
  joinProject: (code) =>
    request("/api/projects/join", { method: "POST", body: JSON.stringify({ code }) }),
  transferProject: (projectId, userId) =>
    request(`/api/projects/${projectId}/transfer`, { method: "PUT", body: JSON.stringify({ user_id: userId }) }),

  // --- Tâches ---
  getTasks: (params = "") => request(`/api/tasks${params}`),
  createTask: (d) =>
    request("/api/tasks", { method: "POST", body: JSON.stringify(d) }),
  updateTask: (id, d) =>
    request(`/api/tasks/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  deleteTask: (id) =>
    request(`/api/tasks/${id}`, { method: "DELETE" }),

  // --- Utilisateur ---
  getMe: () => request("/api/users/me"),
  deleteMe: () => request("/api/users/me", { method: "DELETE" }),
    updateMe: (d) =>
    request("/api/users/me", { method: "PUT", body: JSON.stringify(d) }),
  changePassword: (d) =>
    request("/api/users/me/password", { method: "PUT", body: JSON.stringify(d) }),
};