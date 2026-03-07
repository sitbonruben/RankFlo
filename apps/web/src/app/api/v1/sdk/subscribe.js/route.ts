import { NextResponse } from "next/server";

/**
 * RankFlo Subscribe Widget SDK
 *
 * Serves a self-contained JavaScript widget that external websites embed to
 * capture email subscribers. The script discovers all elements with the
 * `data-rankflo-subscribe` attribute, injects a styled form, and POSTs
 * submissions to the RankFlo subscribe API.
 *
 * Usage:
 *   <script src="https://app.rankflo.io/api/v1/sdk/subscribe.js?key=blg_xxx"></script>
 *   <div data-rankflo-subscribe></div>
 *
 * Data-attribute options:
 *   data-rankflo-theme="dark|light"          — color theme (default: dark)
 *   data-rankflo-button-text="Subscribe"     — submit button label
 *   data-rankflo-placeholder="Enter email"   — input placeholder text
 *   data-rankflo-source="widget"             — attribution source tag
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key") || "";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.rankflo.io";

  const sdkScript = `
(function(w, d) {
  'use strict';

  var API_KEY = '${key}';
  var API_URL = '${appUrl}/api/v1/subscribe';

  // ── Theme palettes ────────────────────────────────────────────
  var THEMES = {
    dark: {
      bg: '#0a0a0a',
      inputBg: '#141414',
      inputBorder: '#2a2a2a',
      inputBorderFocus: '#39FF14',
      inputText: '#e5e5e5',
      placeholder: '#666',
      buttonBg: '#39FF14',
      buttonText: '#0a0a0a',
      buttonHoverBg: '#32e612',
      successText: '#39FF14',
      errorText: '#ef4444',
      labelText: '#a3a3a3',
      poweredByText: '#525252'
    },
    light: {
      bg: '#ffffff',
      inputBg: '#f5f5f5',
      inputBorder: '#e5e5e5',
      inputBorderFocus: '#22c55e',
      inputText: '#171717',
      placeholder: '#a3a3a3',
      buttonBg: '#39FF14',
      buttonText: '#0a0a0a',
      buttonHoverBg: '#32e612',
      successText: '#16a34a',
      errorText: '#dc2626',
      labelText: '#525252',
      poweredByText: '#a3a3a3'
    }
  };

  // ── Helpers ───────────────────────────────────────────────────
  function escapeAttr(s) {
    return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function validateEmail(email) {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  }

  function uuid() {
    return 'bgst_' + Math.random().toString(36).slice(2, 10);
  }

  // ── Build & mount a single widget ─────────────────────────────
  function mountWidget(container) {
    var themeName = (container.getAttribute('data-rankflo-theme') || 'dark').toLowerCase();
    var buttonText = container.getAttribute('data-rankflo-button-text') || 'Subscribe';
    var placeholder = container.getAttribute('data-rankflo-placeholder') || 'Enter your email';
    var source = container.getAttribute('data-rankflo-source') || 'widget';
    var t = THEMES[themeName] || THEMES.dark;
    var id = uuid();

    // Prevent double-init
    if (container.getAttribute('data-rankflo-mounted') === 'true') return;
    container.setAttribute('data-rankflo-mounted', 'true');

    // ── Container styles ──────────────────────────────────────
    container.style.cssText = [
      'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
      'box-sizing:border-box',
      'width:100%',
      'max-width:480px'
    ].join(';');

    // ── Build HTML ────────────────────────────────────────────
    container.innerHTML = [
      '<form id="' + id + '" style="display:flex;flex-wrap:wrap;gap:8px;width:100%">',
        '<div style="flex:1 1 220px;min-width:0">',
          '<input type="email" required',
            ' placeholder="' + escapeAttr(placeholder) + '"',
            ' autocomplete="email"',
            ' aria-label="Email address"',
            ' style="',
              'width:100%;',
              'box-sizing:border-box;',
              'padding:10px 14px;',
              'font-size:14px;',
              'line-height:1.5;',
              'border-radius:8px;',
              'border:1px solid ' + t.inputBorder + ';',
              'background:' + t.inputBg + ';',
              'color:' + t.inputText + ';',
              'outline:none;',
              'transition:border-color .15s ease',
            '" />',
        '</div>',
        '<div style="flex:0 0 auto">',
          '<button type="submit" style="',
            'padding:10px 20px;',
            'font-size:14px;',
            'font-weight:600;',
            'line-height:1.5;',
            'border:none;',
            'border-radius:8px;',
            'background:' + t.buttonBg + ';',
            'color:' + t.buttonText + ';',
            'cursor:pointer;',
            'transition:background .15s ease,opacity .15s ease;',
            'white-space:nowrap',
          '">' + escapeAttr(buttonText) + '</button>',
        '</div>',
      '</form>',
      '<div id="' + id + '_msg" style="',
        'margin-top:6px;',
        'font-size:13px;',
        'min-height:20px;',
        'line-height:1.4',
      '" role="status" aria-live="polite"></div>'
    ].join('');

    // ── Element refs ──────────────────────────────────────────
    var form = d.getElementById(id);
    var msgEl = d.getElementById(id + '_msg');
    var input = form.querySelector('input[type="email"]');
    var btn = form.querySelector('button[type="submit"]');

    // ── Focus / hover micro-interactions ──────────────────────
    input.addEventListener('focus', function() {
      input.style.borderColor = t.inputBorderFocus;
    });
    input.addEventListener('blur', function() {
      input.style.borderColor = t.inputBorder;
    });
    btn.addEventListener('mouseenter', function() {
      btn.style.background = t.buttonHoverBg;
    });
    btn.addEventListener('mouseleave', function() {
      btn.style.background = t.buttonBg;
    });

    // ── Submit handler ───────────────────────────────────────
    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var email = (input.value || '').trim();
      if (!validateEmail(email)) {
        showMsg('Please enter a valid email address.', t.errorText);
        return;
      }

      // Disable while in-flight
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.style.cursor = 'default';
      var originalLabel = btn.textContent;
      btn.textContent = 'Sending\\u2026';
      msgEl.textContent = '';

      var payload = {
        email: email,
        project_key: API_KEY,
        source: source,
        referrer: w.location.href
      };

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function(res) { return res.json().then(function(data) { return { ok: res.ok, data: data }; }); })
      .then(function(result) {
        if (result.ok && result.data.success) {
          showMsg(result.data.message || 'Subscribed successfully!', t.successText);
          input.value = '';
        } else {
          showMsg(result.data.error || 'Something went wrong. Please try again.', t.errorText);
        }
      })
      .catch(function() {
        showMsg('Network error. Please check your connection and try again.', t.errorText);
      })
      .finally(function() {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.textContent = originalLabel;
      });
    });

    function showMsg(text, color) {
      msgEl.textContent = text;
      msgEl.style.color = color;
    }
  }

  // ── Discover & mount ──────────────────────────────────────────
  function init() {
    var targets = d.querySelectorAll('[data-rankflo-subscribe]');
    for (var i = 0; i < targets.length; i++) {
      mountWidget(targets[i]);
    }
  }

  // Run on DOMContentLoaded or immediately if already ready
  if (d.readyState === 'loading') {
    d.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for SPA / dynamic usage
  w.RankFloSubscribe = { mount: mountWidget, init: init };

})(window, document);
`.trim();

  return new NextResponse(sdkScript, {
    status: 200,
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
