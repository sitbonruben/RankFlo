/// <reference types="chrome"/>

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id! });
});

// Listen for messages from side panel
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === "GET_PAGE_INFO") {
    // Ask content script for page info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.id) {
        sendResponse({ error: "No active tab" });
        return;
      }
      chrome.tabs.sendMessage(tab.id, { type: "EXTRACT_PAGE" }, (response) => {
        if (chrome.runtime.lastError) {
          // Content script not ready — extract from tab metadata
          sendResponse({
            title: tab.title ?? "",
            url: tab.url ?? "",
            description: "",
            body: "",
          });
        } else {
          sendResponse(response);
        }
      });
    });
    return true; // async
  }

  if (message.type === "CHECK_SESSION") {
    chrome.cookies.get(
      { name: "rankflo_session", url: message.url || "https://app.rankflo.io" },
      (cookie) => {
        sendResponse({ token: cookie?.value ?? null });
      }
    );
    return true; // async
  }

  if (message.type === "OPEN_LOGIN") {
    chrome.tabs.create({ url: message.url || "https://app.rankflo.io/login" });
    sendResponse({ ok: true });
  }
});

// Notify side panel when cookies change (login detected)
chrome.cookies.onChanged.addListener((changeInfo) => {
  if (
    changeInfo.cookie.name === "rankflo_session" &&
    !changeInfo.removed
  ) {
    chrome.runtime.sendMessage({ type: "SESSION_DETECTED", token: changeInfo.cookie.value })
      .catch(() => {}); // side panel might not be open
  }
});
