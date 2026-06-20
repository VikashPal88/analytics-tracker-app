import express from "express";
import Event from "../models/event.model.js";

const router = express.Router();

router.post("/events", async (req, res) => {
  try {
    const events = Array.isArray(req.body) ? req.body : [req.body];

    // Validate that all required fields are present
    for (const event of events) {
      if (!event.session_id || !event.event_type || !event.page_url) {
        return res.status(400).json({
          error: "Each event must include session_id, event_type, and page_url",
        });
      }
    }

    const savedEvents = await Event.insertMany(events);
    res.status(201).json({
      message: `${savedEvents.length} event(s) recorded`,
      count: savedEvents.length,
    });
  } catch (error) {
    console.error("Error saving events:", error);
    res.status(500).json({ error: "Failed to save events" });
  }
});

router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Event.aggregate([
      {
        $group: {
          _id: "$session_id",
          total_events: { $sum: 1 },
          page_views: {
            $sum: { $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] },
          },
          first_seen: { $min: "$timestamp" },
          last_seen: { $max: "$timestamp" },
          pages_visited: { $addToSet: "$page_url" },
        },
      },
      {
        $addFields: {
          pages_count: { $size: "$pages_visited" },
        },
      },
      { $sort: { last_seen: -1 } },
    ]);

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
    const [stats] = await Event.aggregate([
      {
        $facet: {
          overview: [
            {
              $group: {
                _id: null,
                total_events: { $sum: 1 },
                total_sessions: { $addToSet: "$session_id" },
                total_page_views: {
                  $sum: {
                    $cond: [{ $eq: ["$event_type", "page_view"] }, 1, 0],
                  },
                },
                total_clicks: {
                  $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] },
                },
              },
            },
            {
              $addFields: {
                total_sessions: { $size: "$total_sessions" },
              },
            },
          ],
          top_pages: [
            {
              $group: {
                _id: "$page_url",
                views: { $sum: 1 },
              },
            },
            { $sort: { views: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]);

    const overview = stats.overview[0] || {
      total_events: 0,
      total_sessions: 0,
      total_page_views: 0,
      total_clicks: 0,
    };

    res.json({
      ...overview,
      _id: undefined,
      top_pages: stats.top_pages,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/pages", async (req, res) => {
  try {
    const pages = await Event.aggregate([
      {
        $group: {
          _id: "$page_url",
          total_events: { $sum: 1 },
          total_clicks: {
            $sum: { $cond: [{ $eq: ["$event_type", "click"] }, 1, 0] },
          },
        },
      },
      { $sort: { total_events: -1 } },
    ]);

    res.json(pages);
  } catch (error) {
    console.error("Error fetching pages:", error);
    res.status(500).json({ error: "Failed to fetch pages" });
  }
});

export default router;
