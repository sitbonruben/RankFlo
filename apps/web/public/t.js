// RankFlo Analytics — Lightweight tracking script (~1.5KB minified)
// Cookieless, privacy-first, GDPR-compliant
(function() {
  "use strict";

  var endpoint = (document.currentScript && document.currentScript.dataset.api) || "/api/trpc/analytics.track";
  var domain = (document.currentScript && document.currentScript.dataset.domain) || location.hostname;

  // Session fingerprint (no cookies, no persistent storage)
  function fingerprint() {
    var s = navigator.userAgent + screen.width + screen.height + (new Date()).getTimezoneOffset();
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h + s.charCodeAt(i)) | 0;
    }
    return Math.abs(h).toString(36);
  }

  var visitorId = fingerprint();
  var startTime = Date.now();
  var pathname = location.pathname;

  function send(data) {
    var payload = JSON.stringify({
      json: {
        event: data.event || "pageview",
        url: location.href,
        pathname: data.pathname || pathname,
        referrer: document.referrer || null,
        domain: domain,
        visitorId: visitorId,
        screenWidth: screen.width,
        duration: data.duration || 0,
        utm: {
          source: getParam("utm_source"),
          medium: getParam("utm_medium"),
          campaign: getParam("utm_campaign"),
          term: getParam("utm_term"),
          content: getParam("utm_content"),
        },
      },
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(endpoint, payload);
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.send(payload);
    }
  }

  function getParam(name) {
    var match = location.search.match(new RegExp("[?&]" + name + "=([^&]*)"));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Track pageview
  function trackPageview() {
    pathname = location.pathname;
    startTime = Date.now();
    send({ event: "pageview" });
  }

  // Track time on page on unload
  function trackDuration() {
    send({
      event: "duration",
      duration: Math.round((Date.now() - startTime) / 1000),
      pathname: pathname,
    });
  }

  // Track SPA navigation
  var pushState = history.pushState;
  history.pushState = function() {
    pushState.apply(history, arguments);
    trackPageview();
  };
  window.addEventListener("popstate", trackPageview);

  // Initial pageview
  trackPageview();

  // Duration on unload
  document.addEventListener("visibilitychange", function() {
    if (document.visibilityState === "hidden") {
      trackDuration();
    }
  });

  // Public API
  window.rankflo = {
    track: function(event, props) {
      send({ event: event, props: props });
    },
  };
})();
