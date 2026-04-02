/*!
 * RankFlo Tracker — lightweight analytics
 * Add to your site: <script src="https://app.rankflo.io/tracker.js" data-project-key="blg_xxx" async></script>
 */
(function () {
  "use strict";

  var script = document.currentScript || (function () {
    var scripts = document.getElementsByTagName("script");
    return scripts[scripts.length - 1];
  })();

  var projectKey = script && (script.getAttribute("data-project-key") || script.getAttribute("data-api-key"));
  if (!projectKey) return;

  var endpoint = (script.getAttribute("data-endpoint") || "https://app.rankflo.io") + "/api/v1/analytics/track";

  // ── ID helpers ────────────────────────────────────────────
  function uuid() {
    return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function getVisitorId() {
    try {
      var k = "rkf_vid";
      var v = localStorage.getItem(k);
      if (!v) { v = uuid(); localStorage.setItem(k, v); }
      return v;
    } catch (_) { return uuid(); }
  }

  function getSessionId() {
    try {
      var k = "rkf_sid";
      var v = sessionStorage.getItem(k);
      if (!v) { v = uuid(); sessionStorage.setItem(k, v); }
      return v;
    } catch (_) { return uuid(); }
  }

  // ── UTM helpers ──────────────────────────────────────────
  function getUTM() {
    var p = new URLSearchParams(window.location.search);
    return {
      utmSource: p.get("utm_source") || undefined,
      utmMedium: p.get("utm_medium") || undefined,
      utmCampaign: p.get("utm_campaign") || undefined,
      utmTerm: p.get("utm_term") || undefined,
      utmContent: p.get("utm_content") || undefined,
    };
  }

  // ── Device detection ─────────────────────────────────────
  function getDevice() {
    var ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return "tablet";
    if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
    return "desktop";
  }

  // ── Send event ───────────────────────────────────────────
  function send(eventType, extra) {
    var payload = Object.assign({
      projectKey: projectKey,
      eventType: eventType,
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      visitorId: getVisitorId(),
      sessionId: getSessionId(),
      device: getDevice(),
      language: navigator.language,
      screenWidth: window.screen.width,
    }, getUTM(), extra || {});

    try {
      navigator.sendBeacon
        ? navigator.sendBeacon(endpoint, JSON.stringify(payload))
        : fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), keepalive: true });
    } catch (_) {}
  }

  // ── Page view ────────────────────────────────────────────
  var pageStart = Date.now();

  function trackPageview() {
    send("pageview");
    pageStart = Date.now();
  }

  // Track initial pageview
  if (document.readyState === "complete" || document.readyState === "interactive") {
    trackPageview();
  } else {
    document.addEventListener("DOMContentLoaded", trackPageview);
  }

  // Track duration on leave
  window.addEventListener("beforeunload", function () {
    var duration = Math.round((Date.now() - pageStart) / 1000);
    if (duration > 0) send("duration", { duration: duration });
  });

  // SPA navigation support (history.pushState)
  var lastPath = window.location.pathname;
  var origPush = history.pushState.bind(history);
  history.pushState = function () {
    origPush.apply(history, arguments);
    setTimeout(function () {
      if (window.location.pathname !== lastPath) {
        lastPath = window.location.pathname;
        trackPageview();
      }
    }, 0);
  };
  window.addEventListener("popstate", function () {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname;
      trackPageview();
    }
  });

  // ── Custom events ────────────────────────────────────────
  // Usage: window.rankflo.track("button_click", { label: "signup" })
  window.rankflo = {
    track: function (eventName, properties) {
      if (!eventName || typeof eventName !== "string") return;
      send("custom", { customEvent: eventName, properties: properties || {} });
    },
  };
})();
