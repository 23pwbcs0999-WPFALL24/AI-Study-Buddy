export async function api(path: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  } as Record<string, string>;
  const res = await fetch(path.startsWith("/api/") ? path : `/api/${path}`, {
    ...options,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

export const Auth = {
  login: (body: any) => api("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  signup: (body: any) => api("/auth/signup", { method: "POST", body: JSON.stringify(body) }),
  profile: () => api("/auth/profile"),
};

export const Files = {
  upload: async (file: File) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/files/upload", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Upload failed");
    return data;
  },
};

export const Notes = {
  list: () => api("/notes"),
  create: (body: any) => api("/notes", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: any) => api(`/notes/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id: string) => api(`/notes/${id}`, { method: "DELETE" }),
};

export const AI = {
  summarize: (text: string) => api("/ai/summarize", { method: "POST", body: JSON.stringify({ text }) }),
  flashcards: (text: string) => api("/ai/flashcards", { method: "POST", body: JSON.stringify({ text }) }),
  quiz: (text: string) => api("/ai/quiz", { method: "POST", body: JSON.stringify({ text }) }),
  chat: (text: string) => api("/ai/chat", { method: "POST", body: JSON.stringify({ text }) }),
};

export const Progress = {
  get: () => api("/progress"),
};


