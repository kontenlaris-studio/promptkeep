// PromptVault background service worker: context menus + keyboard command.
const STORE_KEY = "promptvault.items";

async function getItems() {
  const data = await chrome.storage.local.get(STORE_KEY);
  return data[STORE_KEY] || [];
}

async function saveItem(text, sourceUrl, sourceTitle) {
  const items = await getItems();
  items.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text: text.trim(),
    url: sourceUrl || "",
    title: sourceTitle || "",
    tags: [],
    createdAt: new Date().toISOString(),
  });
  await chrome.storage.local.set({ [STORE_KEY]: items });
  return items.length;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "pv-save-selection",
    title: "Save selection to PromptVault",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "pv-save-page",
    title: "Save page note to PromptVault",
    contexts: ["page"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "pv-save-selection" && info.selectionText) {
    await saveItem(info.selectionText, tab?.url, tab?.title);
  } else if (info.menuItemId === "pv-save-page" && tab) {
    await saveItem(`${tab.title}\n${tab.url}`, tab.url, tab.title);
  }
});

chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "save-selection") return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  const results = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => window.getSelection().toString(),
  });
  const text = results?.[0]?.result;
  if (text && text.trim()) {
    await saveItem(text, tab.url, tab.title);
  }
});
