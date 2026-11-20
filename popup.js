// PromptVault popup: list, search, copy, delete, export, import.
const STORE_KEY = "promptvault.items";
const listEl = document.getElementById("list");
const countEl = document.getElementById("count");
const searchEl = document.getElementById("search");

async function getItems() {
  const data = await chrome.storage.local.get(STORE_KEY);
  return data[STORE_KEY] || [];
}
async function setItems(items) {
  await chrome.storage.local.set({ [STORE_KEY]: items });
}

function esc(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

async function render() {
  const q = searchEl.value.trim().toLowerCase();
  const items = await getItems();
  countEl.textContent = `${items.length} saved`;
  const shown = items.filter((it) =>
    !q || it.text.toLowerCase().includes(q) || (it.tags || []).join(" ").toLowerCase().includes(q));
  if (!shown.length) {
    listEl.innerHTML = `<div class="empty">${items.length ? "No matches." : "Nothing saved yet."}</div>`;
    return;
  }
  listEl.innerHTML = shown.map((it) => `
    <article class="item" data-id="${it.id}">
      <p>${esc(it.text)}</p>
      <div class="meta">${new Date(it.createdAt).toLocaleString()}
        ${it.tags?.length ? `· <span class="tags">${esc(it.tags.map((t) => "#" + t).join(" "))}</span>` : ""}
        ${it.url ? `· <a href="${esc(it.url)}" target="_blank" rel="noreferrer">source</a>` : ""}
      </div>
      <div class="row">
        <button data-act="copy">Copy</button>
        <button data-act="md" title="Copy as markdown quote with source">Markdown</button>
        <button data-act="del" class="danger">Delete</button>
      </div>
    </article>`).join("");
}

listEl.addEventListener("click", async (e) => {
  const btn = e.target.closest("button[data-act]");
  if (!btn) return;
  const id = btn.closest(".item").dataset.id;
  const items = await getItems();
  const item = items.find((it) => it.id === id);
  if (!item) return;
  if (btn.dataset.act === "copy") {
    await navigator.clipboard.writeText(item.text);
    btn.textContent = "Copied ✓";
  } else if (btn.dataset.act === "md") {
    const md = item.url ? `> ${item.text}\n>\n> — [${item.title || item.url}](${item.url})` : `> ${item.text}`;
    await navigator.clipboard.writeText(md);
    btn.textContent = "Copied ✓";
  } else if (btn.dataset.act === "del") {
    await setItems(items.filter((it) => it.id !== id));
  }
  setTimeout(render, btn.dataset.act === "del" ? 0 : 600);
});

document.getElementById("add-btn").addEventListener("click", async () => {
  const textEl = document.getElementById("new-text");
  const tagsEl = document.getElementById("new-tags");
  const text = textEl.value.trim();
  if (!text) return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const items = await getItems();
  items.unshift({
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    text,
    url: tab?.url || "",
    title: tab?.title || "",
    tags: tagsEl.value.split(",").map((t) => t.trim()).filter(Boolean),
    createdAt: new Date().toISOString(),
  });
  await setItems(items);
  textEl.value = "";
  tagsEl.value = "";
  render();
});

searchEl.addEventListener("input", render);

document.getElementById("export-btn").addEventListener("click", async () => {
  const items = await getItems();
  const blob = new Blob([JSON.stringify({ app: "PromptVault", version: 1, items }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "promptvault-export.json";
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById("import-file").addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const incoming = Array.isArray(parsed) ? parsed : parsed.items;
    if (!Array.isArray(incoming)) throw new Error("bad format");
    const items = await getItems();
    const known = new Set(items.map((it) => it.id));
    const fresh = incoming.filter((it) => it && typeof it.text === "string" && !known.has(it.id));
    await setItems([...fresh, ...items]);
    render();
  } catch {
    alert("Import failed: not a PromptVault JSON export.");
  }
  e.target.value = "";
});

render();
