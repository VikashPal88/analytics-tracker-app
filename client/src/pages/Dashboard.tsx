import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Eye,
  Globe2,
  MousePointer2,
  Users,
} from "lucide-react";
import StatsCard from "../components/StatsCard";
import { fetchPages, fetchSessions, fetchStats } from "../services/api";
import type { PageSummary, SessionSummary, StatsResponse } from "../types/event";

function formatNumber(value: number | undefined) {
  return (value ?? 0).toLocaleString();
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsData, sessionsData, pagesData] = await Promise.all([
          fetchStats(),
          fetchSessions(),
          fetchPages(),
        ]);

        setStats(statsData);
        setSessions(sessionsData);
        setPages(pagesData);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const recentSessions = sessions.slice(0, 5);

  const topClickPages = useMemo(
    () =>
      [...pages]
        .filter((page) => page.total_clicks > 0)
        .sort((a, b) => b.total_clicks - a.total_clicks)
        .slice(0, 5),
    [pages],
  );

  const clickRate = stats?.total_events
    ? Math.round((stats.total_clicks / stats.total_events) * 100)
    : 0;

  const pageViewRate = stats?.total_events
    ? Math.round((stats.total_page_views / stats.total_events) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A]">
        <div className="border-b border-white/10 bg-[#0D0D0D] px-5 py-6 md:px-8">
          <div className="h-8 w-48 skeleton" />
          <div className="mt-3 h-4 w-64 max-w-full skeleton" />
        </div>
        <div className="p-5 md:p-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="skeleton h-[120px]" />
            ))}
          </div>
          <div className="mt-6 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="skeleton h-[320px]" />
            <div className="skeleton h-[320px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="border-b border-white/10 bg-[#0D0D0D] px-5 py-6 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Analytics Overview
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Session activity, tracked events, page engagement, and click
              behavior from the CausalFunnel tracking script.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:flex">
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-xs text-slate-500">Tracked pages</div>
              <div className="mt-1 font-mono text-lg text-slate-100">
                {formatNumber(pages.length)}
              </div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
              <div className="text-xs text-slate-500">Click rate</div>
              <div className="mt-1 font-mono text-lg text-slate-100">
                {clickRate}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5 md:p-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            icon={<Users className="h-5 w-5" />}
            label="Total Sessions"
            value={formatNumber(stats?.total_sessions)}
            sub="Unique tracked sessions"
            color="purple"
          />
          <StatsCard
            icon={<Activity className="h-5 w-5" />}
            label="Total Events"
            value={formatNumber(stats?.total_events)}
            sub="Page views and clicks"
            color="blue"
          />
          <StatsCard
            icon={<Eye className="h-5 w-5" />}
            label="Page Views"
            value={formatNumber(stats?.total_page_views)}
            sub="Navigation events"
            color="green"
          />
          <StatsCard
            icon={<MousePointer2 className="h-5 w-5" />}
            label="Total Clicks"
            value={formatNumber(stats?.total_clicks)}
            sub="Coordinate events"
            color="amber"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Event Mix</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Distribution across page views and click events.
                </p>
              </div>
              <Activity className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="space-y-5 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Page views</span>
                  <span className="font-mono text-slate-500">
                    {pageViewRate}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${pageViewRate}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-300">Clicks</span>
                  <span className="font-mono text-slate-500">
                    {clickRate}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/5">
                  <div
                    className="h-full rounded-full bg-amber-500"
                    style={{ width: `${clickRate}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-500">Avg events</div>
                  <div className="mt-2 font-mono text-xl text-slate-100">
                    {stats?.total_sessions
                      ? Math.round(stats.total_events / stats.total_sessions)
                      : 0}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-500">Click pages</div>
                  <div className="mt-2 font-mono text-xl text-slate-100">
                    {formatNumber(topClickPages.length)}
                  </div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                  <div className="text-xs text-slate-500">Recent sessions</div>
                  <div className="mt-2 font-mono text-xl text-slate-100">
                    {formatNumber(recentSessions.length)}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-semibold text-white">Top Pages</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Pages ranked by total tracked events.
                </p>
              </div>
              <Globe2 className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="divide-y divide-white/10">
              {(stats?.top_pages ?? []).slice(0, 5).map((page, index) => (
                <div
                  key={page._id}
                  className="grid grid-cols-[32px_1fr_auto] gap-3 px-5 py-4 text-sm"
                >
                  <span className="font-mono text-slate-600">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="break-all text-slate-300">{page._id}</span>
                  <span className="font-mono text-slate-500">
                    {formatNumber(page.views)}
                  </span>
                </div>
              ))}
              {(stats?.top_pages ?? []).length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  No tracked pages yet.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">Recent Sessions</h2>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                {recentSessions.length} latest
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr>
                    {["Session", "Events", "Views", "Clicks", "Last Seen"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="border-b border-white/10 bg-white/[0.02] px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr
                      key={session._id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="border-b border-white/10 px-5 py-3.5 text-sm">
                        <span className="rounded bg-emerald-500/10 px-2 py-1 font-mono text-xs text-emerald-400">
                          {session._id.substring(0, 10)}...
                        </span>
                      </td>
                      <td className="border-b border-white/10 px-5 py-3.5 text-sm text-slate-300">
                        {session.total_events}
                      </td>
                      <td className="border-b border-white/10 px-5 py-3.5 text-sm text-slate-300">
                        {session.page_views}
                      </td>
                      <td className="border-b border-white/10 px-5 py-3.5 text-sm text-slate-300">
                        {session.clicks}
                      </td>
                      <td className="border-b border-white/10 px-5 py-3.5 text-sm text-slate-500">
                        {formatDateTime(session.last_seen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="overflow-hidden rounded-xl border border-white/10 bg-[#0D0D0D]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="font-semibold text-white">Click Pages</h2>
              <span className="rounded-full bg-white/[0.05] px-3 py-1 text-xs font-medium text-slate-400">
                heatmap source
              </span>
            </div>
            <div className="divide-y divide-white/10">
              {topClickPages.map((page) => (
                <div
                  key={page._id}
                  className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 text-sm"
                >
                  <div className="min-w-0">
                    <div className="break-all text-slate-300">{page._id}</div>
                    <div className="mt-1 text-xs text-slate-600">
                      {formatNumber(page.total_events)} total events
                    </div>
                  </div>
                  <div className="font-mono text-amber-400">
                    {formatNumber(page.total_clicks)}
                  </div>
                </div>
              ))}
              {topClickPages.length === 0 && (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  No click events recorded yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {!loading && stats?.total_events === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#0D0D0D] px-6 py-16 text-center">
            <Activity className="mb-4 h-10 w-10 text-white/10" />
            <div className="text-xl font-semibold text-white">No data yet</div>
            <div className="mt-2 max-w-[420px] text-sm leading-6 text-slate-500">
              Open the demo page and interact with it to populate the analytics
              overview.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
