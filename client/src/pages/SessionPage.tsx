import { useState, useEffect } from "react";
import { MousePointer2, Eye, Clock, Activity } from "lucide-react";
import { fetchSessionEvents, fetchSessions } from "../services/api";
import type { AnalyticsEvent, SessionSummary } from "../types/event";

function formatTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [sessionEvents, setSessionEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);

  useEffect(() => {
    fetchSessions()
      .then((data) => {
        setSessions(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load sessions:", err);
        setSessions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0]._id);
    }
  }, [selectedSessionId, sessions]);

  useEffect(() => {
    if (!selectedSessionId) {
      setSessionEvents([]);
      return;
    }

    let active = true;
    setEventsLoading(true);

    fetchSessionEvents(selectedSessionId)
      .then((data) => {
        if (active) setSessionEvents(data.events);
      })
      .catch((err) => {
        console.error("Failed to load session events:", err);
        if (active) setSessionEvents([]);
      })
      .finally(() => {
        if (active) setEventsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedSessionId]);

  return (
    <div className="flex h-full min-h-screen flex-col md:flex-row">
      {/* Sessions List */}
      <div className="flex max-h-[45vh] w-full flex-col overflow-y-auto border-b border-white/10 bg-[#0D0D0D] md:max-h-none md:w-[360px] md:border-b-0 md:border-r">
        <div className="p-5 md:p-6 border-b border-white/10 sticky top-0 bg-[#0D0D0D]/95 backdrop-blur z-10">
          <h2 className="text-xl font-semibold text-white">Active Sessions</h2>
          <p className="text-sm text-slate-500 mt-1">
            Found {sessions.length} sessions tracked
          </p>
        </div>

        <div className="p-4 space-y-3 flex-1">
          {loading && (
            <p className="text-slate-500 text-center py-10">
              Loading sessions...
            </p>
          )}
          {!loading && sessions.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <Activity className="w-10 h-10 mx-auto mb-3 text-white/10" />
              <p>No sessions recorded yet.</p>
              <p className="text-sm mt-1">Open the demo page to record data.</p>
            </div>
          )}
          {sessions.map((s) => (
            <button
              key={s._id}
              onClick={() => setSelectedSessionId(s._id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                selectedSessionId === s._id
                  ? "border-emerald-500/20 bg-emerald-500/5 shadow-sm"
                  : "border-transparent hover:bg-white/5 hover:border-white/5 bg-transparent"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-mono text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                  {s._id.substring(0, 12)}...
                </span>
                <span className="text-xs text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(s.last_seen)}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-300">
                  {s.total_events} Events
                </span>
                <span className="text-slate-500 text-xs">
                  {formatDate(s.first_seen)}
                </span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <span>{s.page_views} views</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>{s.clicks} clicks</span>
                <span className="h-1 w-1 rounded-full bg-slate-700" />
                <span>{s.pages_count} pages</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Session Details Timeline */}
      <div className="flex-1 overflow-y-auto bg-[#0A0A0A]">
        {selectedSessionId ? (
          <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                User Journey
              </h2>
              <p className="text-slate-500 mt-2 font-mono text-sm">
                {selectedSessionId}
              </p>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              {eventsLoading && (
                <p className="text-slate-500 pl-14 md:text-center md:pl-0">
                  Loading timeline...
                </p>
              )}
              {!eventsLoading && sessionEvents.length === 0 && (
                <p className="text-slate-500 pl-14 md:text-center md:pl-0">
                  No events found for this session.
                </p>
              )}
              {sessionEvents.map((evt, idx) => (
                <div
                  key={evt._id || idx}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  {/* Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A0A0A] bg-[#1A1A1A] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform hover:scale-110">
                    {evt.event_type === "page_view" ? (
                      <Eye className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <MousePointer2 className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl border border-white/10 bg-white/5 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${evt.event_type === "page_view" ? "text-emerald-500" : "text-slate-300"}`}
                      >
                        {evt.event_type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {formatTime(evt.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-200 break-all">
                      {evt.page_url}
                    </div>
                    {evt.event_type === "click" &&
                      evt.click_x != null &&
                      evt.click_y != null && (
                      <div className="mt-3 text-xs flex space-x-3 text-slate-400 bg-black/20 p-2 rounded-md border border-white/5">
                        <span className="font-mono">
                          X: {Math.round(evt.click_x)}px
                        </span>
                        <span className="font-mono">
                          Y: {Math.round(evt.click_y)}px
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center flex-col text-slate-500 p-8 text-center space-y-4">
            <Activity className="w-16 h-16 text-white/5" />
            <h3 className="text-xl font-medium text-white">
              No Session Selected
            </h3>
            <p className="max-w-sm">
              Select a session from the sidebar to view the detailed user
              journey and event timeline.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
