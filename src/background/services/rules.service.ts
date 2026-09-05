const GLANCE_RULE_ID = 1;

function buildGlanceRule(): chrome.declarativeNetRequest.Rule {
  return {
    id: GLANCE_RULE_ID,
    priority: 1,
    action: {
      type: "modifyHeaders",
      responseHeaders: [
        { header: "X-Frame-Options", operation: "remove" },
        { header: "Content-Security-Policy", operation: "remove" },
        {
          header: "Content-Security-Policy-Report-Only",
          operation: "remove",
        },
        { header: "X-Content-Security-Policy", operation: "remove" },
        { header: "X-WebKit-CSP", operation: "remove" },
        { header: "Cross-Origin-Embedder-Policy", operation: "remove" },
        { header: "Cross-Origin-Opener-Policy", operation: "remove" },
        { header: "Cross-Origin-Resource-Policy", operation: "remove" },
        { header: "Permissions-Policy", operation: "remove" },
        { header: "X-Permissions-Policy", operation: "remove" },
        { header: "frame-ancestors", operation: "remove" },
      ],
    },
    condition: {
      urlFilter: "*",
      resourceTypes: ["sub_frame"],
    },
  };
}

export async function installGlanceHeaderRules(): Promise<void> {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [GLANCE_RULE_ID],
      addRules: [buildGlanceRule()],
    });
  } catch {
    // Rule updates are best-effort; stubborn sites may refuse to embed
  }
}
