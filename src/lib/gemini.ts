import { getAuthToken } from "@/lib/authStorage";

// API Base URL - uses environment variable or defaults to localhost
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

export interface InvoiceData {
  invoice_number: string | null;
  invoice_date: string | null;
  seller_name: string | null;
  seller_gstin: string | null;
  buyer_name: string | null;
  buyer_gstin: string | null;
  taxable_amount: number | null;
  cgst: number | null;
  sgst: number | null;
  igst: number | null;
  total_amount: number | null;
  currency: string | null;
}

export interface ApiLog {
  id: string;
  timestamp: string;
  level: "info" | "error";
  message: string;
  meta?: Record<string, unknown>;
}

export interface BackendHealth {
  ok: boolean;
  hasServerApiKey: boolean;
}

export interface LogQuery {
  limit?: number;
  offset?: number;
  level?: "info" | "error" | "all";
  from?: string;
  to?: string;
}

export interface LogsResponse {
  logs: ApiLog[];
  total: number;
  hasMore: boolean;
}

export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

async function apiFetch(input: string, init: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  
  // Prepend base URL for relative paths
  const url = input.startsWith("/") ? `${API_BASE_URL}${input}` : input;
  return fetch(url, { ...init, headers });
}

export async function extractInvoice(file: File, apiKey: string): Promise<InvoiceData> {
  const base64 = await fileToBase64(file);
  const mimeType = file.type || (file.name.endsWith(".pdf") ? "application/pdf" : "image/jpeg");
  const res = await apiFetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: file.name,
      mimeType,
      base64,
      apiKey: apiKey.trim() || undefined,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Extraction API error: ${res.status} ${err}`);
  }

  return (await res.json()) as InvoiceData;
}

export async function validateApiKey(apiKey: string): Promise<boolean> {
  try {
    const res = await apiFetch("/api/validate-key", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });
    const body = (await res.json()) as { ok?: boolean };
    return Boolean(body.ok);
  } catch {
    return false;
  }
}

export async function getBackendHealth(): Promise<BackendHealth> {
  const res = await apiFetch("/api/health");
  if (!res.ok) throw new Error(`Backend unavailable (${res.status})`);
  return (await res.json()) as BackendHealth;
}

export async function getLogs(query: LogQuery = {}): Promise<LogsResponse> {
  const params = new URLSearchParams();
  params.set("limit", String(query.limit ?? 80));
  params.set("offset", String(query.offset ?? 0));
  if (query.level && query.level !== "all") params.set("level", query.level);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);

  const res = await apiFetch(`/api/logs?${params.toString()}`);
  if (!res.ok) throw new Error(`Unable to load logs (${res.status})`);
  const body = (await res.json()) as Partial<LogsResponse>;
  return {
    logs: body.logs ?? [],
    total: body.total ?? 0,
    hasMore: Boolean(body.hasMore),
  };
}

export async function clearLogs(): Promise<void> {
  const res = await apiFetch("/api/logs", { method: "DELETE" });
  if (!res.ok) throw new Error(`Unable to clear logs (${res.status})`);
}

export function getLogsCsvUrl(query: LogQuery = {}): string {
  const params = new URLSearchParams();
  params.set("limit", String(query.limit ?? 300));
  if (query.level && query.level !== "all") params.set("level", query.level);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  return `/api/logs/export.csv?${params.toString()}`;
}

export async function getLogDates(level?: "all" | "info" | "error"): Promise<string[]> {
  const params = new URLSearchParams();
  if (level && level !== "all") params.set("level", level);
  const query = params.toString();
  const res = await apiFetch(`/api/log-dates${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error(`Unable to load log dates (${res.status})`);
  const body = (await res.json()) as { dates?: string[] };
  return body.dates ?? [];
}
