import { AnalyticsPayload, AuthPayload, ProblemInput, ProblemRecord, Recommendation } from "../types";

const API_BASE_URL = "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(errorBody?.message ?? "Request failed.");
  }

  return (await response.json()) as T;
}

export function register(input: { name: string; email: string; password: string }) {
  return request<AuthPayload>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function login(input: { email: string; password: string }) {
  return request<AuthPayload>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export async function fetchProblems(token: string) {
  const response = await request<{ items: ProblemRecord[] }>("/api/problems", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.items;
}

export function createProblem(token: string, input: ProblemInput) {
  return request<ProblemRecord>("/api/problems", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(input)
  });
}

export function fetchAnalytics(token: string) {
  return request<AnalyticsPayload>("/api/analytics", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export async function fetchRecommendations(token: string) {
  const response = await request<{ items: Recommendation[] }>("/api/recommendations", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return response.items;
}
