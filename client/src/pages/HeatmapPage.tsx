import { useMemo, useState, useEffect } from "react";
import { Map } from "lucide-react";
import { DEMO_URL, fetchHeatmapData, fetchPages } from "../services/api";
import type { HeatmapClick, PageSummary } from "../types/event";

function hasCoordinates(
  click: HeatmapClick,
): click is HeatmapClick & { click_x: number; click_y: number } {
  return typeof click.click_x === "number" && typeof click.click_y === "number";
}

export default function HeatmapPage() {
  const [pages, setPages] = useState<PageSummary[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string>("");
  const [clicks, setClicks] = useState<HeatmapClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [clicksLoading, setClicksLoading] = useState(false);

  const urls = useMemo(() => pages.map((page) => page._id), [pages]);
  const visibleClicks = clicks.filter(hasCoordinates);
  const canvasHeight = Math.max(
    720,
    ...visibleClicks.map((click) => click.click_y + 120),
  );
  const canvasWidth = Math.max(
    960,
    ...visibleClicks.map((click) => click.click_x + 120),
  );

  useEffect(() => {
    fetchPages()
      .then((data) => {
        setPages(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Failed to load tracked pages:", err);
        setPages([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // If urls finish loading and we have some but no selectedUrl yet, select the first
    if (!loading && urls.length > 0 && !selectedUrl) {
      setSelectedUrl(urls[0]);
    }
  }, [loading, urls, selectedUrl]);

  useEffect(() => {
    if (!selectedUrl) {
      setClicks([]);
      return;
    }

    let active = true;
    setClicksLoading(true);

    fetchHeatmapData(selectedUrl)
      .then((data) => {
        if (active) setClicks(data.clicks);
      })
      .catch((err) => {
        console.error("Failed to load heatmap data:", err);
        if (active) setClicks([]);
      })
      .finally(() => {
        if (active) setClicksLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedUrl]);

  return (
    <div className="flex flex-col h-full bg-[#0A0A0A]">
      <div className="p-6 border-b border-white/10 bg-[#0D0D0D] flex flex-col gap-4 shadow-sm z-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white flex items-center space-x-2">
            <Map className="w-6 h-6 text-emerald-500" />
            <span>Click Heatmap</span>
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Visualize user interactions by selecting a tracked page.
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center md:space-x-4 md:gap-0">
          <label className="text-sm font-medium text-slate-400">
            Filter URL:
          </label>
          <select
            value={selectedUrl}
            onChange={(e) => setSelectedUrl(e.target.value)}
            className="w-full border-white/10 rounded-md shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm pl-4 pr-8 py-2 border bg-white/5 text-slate-200 cursor-pointer outline-none md:w-[360px]"
          >
            {urls.length === 0 && <option value="">No tracked URLs</option>}
            {urls.map((url) => (
              <option key={url} value={url} className="bg-[#0D0D0D]">
                {url}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {selectedUrl ? (
          <div className="relative h-full w-full overflow-auto rounded-xl border border-dashed border-white/10 bg-[#1A1A1A] shadow-sm pattern-grid">
            {/* Contextual overlay showing it's a simulated viewport */}
            <div className="absolute top-0 right-0 bg-black/80 text-white border border-white/10 border-t-0 border-r-0 text-xs px-3 py-1 rounded-bl-lg z-20 pointer-events-none font-mono">
              Viewport Canvas | {visibleClicks.length} CLICKS
            </div>

            {clicksLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                Loading click positions...
              </div>
            )}

            {!clicksLoading && visibleClicks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                No clicks registered for this URL yet.
              </div>
            )}

            {/* The dots */}
            {visibleClicks.map((click, i) => (
              <div
                key={`${click.session_id}-${click.timestamp}-${i}`}
                className="absolute w-4 h-4 rounded-full bg-red-500/60 backdrop-blur-[1px] transform -translate-x-1/2 -translate-y-1/2 pointer-events-none origin-center animate-in fade-in zoom-in duration-500"
                style={{
                  left: `${click.click_x}px`,
                  top: `${click.click_y}px`,
                  boxShadow: "0 0 10px 2px rgba(239, 68, 68, 0.4)",
                }}
                title={`Click map: X=${click.click_x}, Y=${click.click_y}`}
              />
            ))}

            {/* Simulated scroll depth to allow the heatmap to grow based on largest Y */}
            <div
              style={{
                height: `${canvasHeight}px`,
                width: `${canvasWidth}px`,
              }}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center flex-col text-slate-500">
            <Map className="w-16 h-16 mb-4 text-white/5" />
            <h3 className="text-xl font-medium text-white">Select a URL</h3>
            <p className="mt-2 text-center max-w-sm">
              No page selected or no tracking data is available yet.
            </p>
            {!loading && urls.length === 0 && (
              <a
                href={DEMO_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-6 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-md hover:bg-emerald-500/20 border border-emerald-500/20 transition-colors font-medium"
              >
                Go to Demo Page
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
