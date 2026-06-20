// CausalFunnel Analytics Tracker
// Tracks page_view and click events, sends data to backend API.

/**
 * Usage:
 *   <script src="http://localhost:5000/tracker/cf-tracker.js"
 *           data-endpoint="http://localhost:5000/api/events"></script>
 */
(function () {
  "use strict";

  const scriptTag = document.currentScript;
  function getDefaultEndpoint() {
    if (scriptTag && scriptTag.src) {
      try {
        return new URL("/api/events", scriptTag.src).toString();
      } catch (_err) {
        return "http://localhost:5000/api/events";
      }
    }

    return "http://localhost:5000/api/events";
  }

  const API_ENDPOINT =
    (scriptTag && scriptTag.getAttribute("data-endpoint")) ||
    getDefaultEndpoint();

  const SESSION_KEY = "cf_session_id";
  const SESSION_TIMESTAMP_KEY = "cf_session_last_active";
  const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  // Generate a unique session ID using crypto API or fallback UUID algorithm
  function generateSessionId() {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback: generate UUID v4 format manually
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  // Retrieve or create a session ID, handling expiration after SESSION_TIMEOUT_MS
  function getSessionId() {
    let sessionId = localStorage.getItem(SESSION_KEY);
    const lastActive = localStorage.getItem(SESSION_TIMESTAMP_KEY);
    const now = Date.now();

    // Create new session if none exists or if session expired
    if (
      !sessionId ||
      !lastActive ||
      now - parseInt(lastActive, 10) > SESSION_TIMEOUT_MS
    ) {
      sessionId = generateSessionId();
      localStorage.setItem(SESSION_KEY, sessionId);
    }

    // Update last active timestamp
    localStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
    return sessionId;
  }

  // Send event data to the backend API endpoint
  // Uses sendBeacon for reliability, falls back to fetch
  function sendEvent(eventData) {
    const payload = JSON.stringify(eventData);

    // Prefer sendBeacon for reliability (works even during page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(API_ENDPOINT, blob);
      if (sent) return;
    }

    // Fallback to fetch
    fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(function (err) {
      console.warn("[CausalFunnel Tracker] Failed to send event:", err);
    });
  }

  // Build an event object with standardized properties
  function buildEvent(type, extras) {
    const event = {
      session_id: getSessionId(),
      event_type: type,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    };

    if (extras) {
      Object.keys(extras).forEach(function (key) {
        event[key] = extras[key];
      });
    }

    return event;
  }

  // Track page view event when page loads
  function trackPageView() {
    sendEvent(buildEvent("page_view"));
  }

  // Track click events with coordinates
  function trackClick(e) {
    sendEvent(
      buildEvent("click", {
        click_x: Math.round(e.clientX),
        click_y: Math.round(e.clientY),
      }),
    );
  }

  // Initialize the tracker: set up page view and click tracking
  function init() {
    // Track page view
    trackPageView();

    // Track all clicks on the document (using capture phase)
    document.addEventListener("click", trackClick, true);

    console.log(
      "[CausalFunnel Tracker] Initialized | Session:",
      getSessionId().substring(0, 8) + "...",
    );
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
