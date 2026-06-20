import type {
  HeatmapResponse,
  PageSummary,
  SessionEventsResponse,
  SessionSummary,
  StatsResponse,
} from "../types/event";

const API_BASE = (
  import.meta.env.VITE_API_BASE ?? "http://localhost:5000/api"
).replace(/\/$/, "");

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function fetchStats(): Promise<StatsResponse> {
  return getJson<StatsResponse>("/stats");
}

export function fetchSessions(): Promise<SessionSummary[]> {
  return getJson<SessionSummary[]>("/sessions");
}

export function fetchSessionEvents(
  sessionId: string,
): Promise<SessionEventsResponse> {
  return getJson<SessionEventsResponse>(
    `/sessions/${encodeURIComponent(sessionId)}`,
  );
}

export function fetchHeatmapData(pageUrl: string): Promise<HeatmapResponse> {
  return getJson<HeatmapResponse>(
    `/heatmap?page_url=${encodeURIComponent(pageUrl)}`,
  );
}

export function fetchPages(): Promise<PageSummary[]> {
  return getJson<PageSummary[]>("/pages");
}
