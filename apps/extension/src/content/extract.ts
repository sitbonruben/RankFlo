/// <reference types="chrome"/>

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "EXTRACT_PAGE") {
    const title = document.title;
    const url = window.location.href;

    const metaDesc =
      document.querySelector('meta[name="description"]')?.getAttribute("content") ||
      document.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
      "";

    // Try to find main content area
    const contentEl =
      document.querySelector("article") ||
      document.querySelector("main") ||
      document.querySelector('[role="main"]') ||
      document.body;

    // Get text, strip excess whitespace, limit to 800 chars
    const rawText = contentEl?.innerText ?? "";
    const body = rawText
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 800);

    sendResponse({ title, url, description: metaDesc, body });
  }
  return true;
});
