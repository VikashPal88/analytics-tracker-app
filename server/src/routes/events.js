import express from "express";
import Event from "../models/event.model.js";

const router = express.Router();

router.post("/events", async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    for (const event of events) {
      if (!event.session_id || !event.event_type || !event.page_url) {
        return res.status(400).json({
          error: "Each event must include session_id, event_type, and page_url",
        });
      }
    }

    const savedEvents = await Event.create(events);

    res.status(201).json({
      message: `${savedEvents.length} event(s) recorded`,
      count: savedEvents.length,
    });
  } catch (error) {
    console.error("Error saving events:", error);
    res.status(500).json({ error: "Failed to save events" });
  }
});

router.delete("/events/:sessionId", async (req, res) => {
  try {
    const deleted = await Event.deleteMany({
      session_id: req.params.sessionId,
    });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      message: "Session events deleted",
      deletedCount: deleted.deletedCount,
    });
  } catch (error) {
    console.error("Error deleting session events:", error);
    res.status(500).json({ error: "Failed to delete session events" });
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const events = await Event.find({}).sort({ timestamp: 1 }).lean();
    const sessionMap = new Map();

    for (const event of events) {
      const sessionId = event.session_id;
      const existing = sessionMap.get(sessionId) || {
        _id: sessionId,
        total_events: 0,
        page_views: 0,
        clicks: 0,
        first_seen: null,
        last_seen: null,
        pages_visited: new Set(),
      };

      existing.total_events += 1;
      if (event.event_type === "page_view") existing.page_views += 1;
      if (event.event_type === "click") existing.clicks += 1;

      const timestampValue = new Date(event.timestamp).getTime();
      if (
        !existing.first_seen ||
        timestampValue < new Date(existing.first_seen).getTime()
      ) {
        existing.first_seen = event.timestamp;
      }
      if (
        !existing.last_seen ||
        timestampValue > new Date(existing.last_seen).getTime()
      ) {
        existing.last_seen = event.timestamp;
      }

      existing.pages_visited.add(event.page_url);
      sessionMap.set(sessionId, existing);
    }

    const sessions = Array.from(sessionMap.values())
      .map((session) => ({
        ...session,
        pages_count: session.pages_visited.size,
        pages_visited: Array.from(session.pages_visited),
      }))
      .sort((a, b) => new Date(b.last_seen) - new Date(a.last_seen));

    res.json(sessions);
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({ error: "Failed to fetch sessions" });
  }
});

router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const events = await Event.find({ session_id: req.params.sessionId })
      .sort({ timestamp: 1 })
      .lean();

    if (events.length === 0) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      session_id: req.params.sessionId,
      total_events: events.length,
      events,
    });
  } catch (error) {
    console.error("Error fetching session events:", error);
    res.status(500).json({ error: "Failed to fetch session events" });
  }
});

router.get("/heatmap", async (req, res) => {
  try {
    const { page_url } = req.query;

    if (!page_url) {
      return res
        .status(400)
        .json({ error: "page_url query parameter is required" });
    }

    const clicks = await Event.find({
      page_url,
      event_type: "click",
    })
      .select(
        "click_x click_y viewport_width viewport_height timestamp session_id",
      )
      .sort({ timestamp: -1 })
      .lean();

    res.json({
      page_url,
      total_clicks: clicks.length,
      clicks,
    });
  } catch (error) {
    console.error("Error fetching heatmap data:", error);
    res.status(500).json({ error: "Failed to fetch heatmap data" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const events = await Event.find({}).lean();

    const summary = events.reduce(
      (acc, event) => {
        acc.total_events += 1;
        acc.total_sessions.add(event.session_id);

        if (event.event_type === "page_view") {
          acc.total_page_views += 1;
        }

        if (event.event_type === "click") {
          acc.total_clicks += 1;
        }

        if (!acc.topPages[event.page_url]) {
          acc.topPages[event.page_url] = 0;
        }
        acc.topPages[event.page_url] += 1;

        return acc;
      },
      {
        total_events: 0,
        total_sessions: new Set(),
        total_page_views: 0,
        total_clicks: 0,
        topPages: {},
      },
    );

    const top_pages = Object.entries(summary.topPages)
      .map(([page_url, views]) => ({ _id: page_url, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    res.json({
      total_events: summary.total_events,
      total_sessions: summary.total_sessions.size,
      total_page_views: summary.total_page_views,
      total_clicks: summary.total_clicks,
      top_pages,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/pages", async (req, res) => {
  try {
    const events = await Event.find({}).lean();
    const pageMap = new Map();

    for (const event of events) {
      const existing = pageMap.get(event.page_url) || {
        _id: event.page_url,
        total_events: 0,
        total_clicks: 0,
      };

      existing.total_events += 1;
      if (event.event_type === "click") existing.total_clicks += 1;
      pageMap.set(event.page_url, existing);
    }

    const pages = Array.from(pageMap.values()).sort(
      (a, b) => b.total_events - a.total_events,
    );

    res.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

export default router;
