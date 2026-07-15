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
  register: (d) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify(d) }),
  login: (d) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify(d) }),

  getProjects: () => request("/api/projects"),
  createProject: (d) =>
    request("/api/projects", { method: "POST", body: JSON.stringify(d) }),

  getTasks: () => request("/api/tasks"),
  createTask: (d) =>
    request("/api/tasks", { method: "POST", body: JSON.stringify(d) }),
};
