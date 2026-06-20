export type EventType = "page_view" | "click";

export interface AnalyticsEvent {
  _id: string;
  session_id: string;
  event_type: EventType;
  page_url: string;
  timestamp: string;
  click_x?: number | null;
  click_y?: number | null;
  viewport_width?: number | null;
  viewport_height?: number | null;
}

export interface SessionSummary {
  _id: string;
  total_events: number;
  page_views: number;
  clicks: number;
  first_seen: string;
  last_seen: string;
  pages_visited: string[];
  pages_count: number;
}

export interface SessionEventsResponse {
  session_id: string;
  total_events: number;
  events: AnalyticsEvent[];
}

export interface HeatmapClick {
  _id?: string;
  session_id: string;
  click_x: number | null;
  click_y: number | null;
  viewport_width?: number | null;
  viewport_height?: number | null;
  timestamp: string;
}

export interface HeatmapResponse {
  page_url: string;
  total_clicks: number;
  clicks: HeatmapClick[];
}

export interface PageSummary {
  _id: string;
  total_events: number;
  total_clicks: number;
}

export interface StatsResponse {
  total_events: number;
  total_sessions: number;
  total_page_views: number;
  total_clicks: number;
  top_pages: Array<{
    _id: string;
    views: number;
  }>;
}
