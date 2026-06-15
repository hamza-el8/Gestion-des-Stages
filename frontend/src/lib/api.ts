const BASE_URL = import.meta.env.VITE_API_URL || "/api";

function getToken(): string | null {
  try {
    const raw = localStorage.getItem("stageflow.session.v1");
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (s.expiresAt < Date.now()) return null;
    return s.token;
  } catch {
    return null;
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message || `Erreur ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: any }>("POST", "/auth/login", { email, password }),

  register: (data: Record<string, any>) =>
    request<{ token: string; user: any }>("POST", "/auth/register", data),

  getMe: () => request<any>("GET", "/auth/me"),

  updateProfile: (data: Record<string, any>) =>
    request<any>("PUT", "/auth/profile", data),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<any>("PUT", "/auth/password", { currentPassword, newPassword }),

  // Stats
  getStats: () => request<any>("GET", "/data/stats"),

  // Users
  getUsers: () => request<any[]>("GET", "/data/users"),
  updateUser: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/users/${id}`, data),
  deleteUser: (id: string) => request<any>("DELETE", `/data/users/${id}`),

  // Companies
  getCompanies: () => request<any[]>("GET", "/data/companies"),
  createCompany: (data: Record<string, any>) =>
    request<any>("POST", "/data/companies", data),
  updateCompany: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/companies/${id}`, data),
  deleteCompany: (id: string) => request<any>("DELETE", `/data/companies/${id}`),

  // Offers
  getOffers: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>("GET", `/data/offers${q}`);
  },
  createOffer: (data: Record<string, any>) =>
    request<any>("POST", "/data/offers", data),
  updateOffer: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/offers/${id}`, data),
  deleteOffer: (id: string) => request<any>("DELETE", `/data/offers/${id}`),

  // Applications
  getApplications: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>("GET", `/data/applications${q}`);
  },
  createApplication: (data: Record<string, any>) =>
    request<any>("POST", "/data/applications", data),
  updateApplication: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/applications/${id}`, data),
  deleteApplication: (id: string) =>
    request<any>("DELETE", `/data/applications/${id}`),

  // Internships
  getInternships: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>("GET", `/data/internships${q}`);
  },
  createInternship: (data: Record<string, any>) =>
    request<any>("POST", "/data/internships", data),
  updateInternship: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/internships/${id}`, data),
  deleteInternship: (id: string) =>
    request<any>("DELETE", `/data/internships/${id}`),

  // Reports
  getReports: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>("GET", `/data/reports${q}`);
  },
  createReport: (data: Record<string, any>) =>
    request<any>("POST", "/data/reports", data),
  updateReport: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/reports/${id}`, data),
  deleteReport: (id: string) => request<any>("DELETE", `/data/reports/${id}`),

  // Evaluations
  getEvaluations: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>("GET", `/data/evaluations${q}`);
  },
  createEvaluation: (data: Record<string, any>) =>
    request<any>("POST", "/data/evaluations", data),

  // Notifications
  getNotifications: (userId?: string) => {
    const q = userId ? `?userId=${userId}` : "";
    return request<any[]>("GET", `/data/notifications${q}`);
  },
  createNotification: (data: Record<string, any>) =>
    request<any>("POST", "/data/notifications", data),
  markNotificationRead: (id: string) =>
    request<any>("PUT", `/data/notifications/${id}/read`),
  markAllNotificationsRead: () =>
    request<any>("PUT", "/data/notifications/read-all"),
  deleteNotification: (id: string) =>
    request<any>("DELETE", `/data/notifications/${id}`),

  // Conversations
  getConversations: (userId?: string) => {
    const q = userId ? `?userId=${userId}` : "";
    return request<any[]>("GET", `/data/conversations${q}`);
  },
  createConversation: (data: Record<string, any>) =>
    request<any>("POST", "/data/conversations", data),

  // Messages
  getMessages: (conversationId: string) =>
    request<any[]>("GET", `/data/messages?conversationId=${conversationId}`),
  createMessage: (data: Record<string, any>) =>
    request<any>("POST", "/data/messages", data),

  // Soutenances
  getSoutenances: (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<any[]>("GET", `/data/soutenances${q}`);
  },
  createSoutenance: (data: Record<string, any>) =>
    request<any>("POST", "/data/soutenances", data),
  updateSoutenance: (id: string, data: Record<string, any>) =>
    request<any>("PUT", `/data/soutenances/${id}`, data),
  deleteSoutenance: (id: string) =>
    request<any>("DELETE", `/data/soutenances/${id}`),
};
