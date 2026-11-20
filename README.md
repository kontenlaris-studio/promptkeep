# PromptVault — Snippet & Prompt Saver

A tiny, private Chrome extension (Manifest V3) for saving the text you keep re-typing or re-finding: AI prompts, snippets, quotes and page notes — into one searchable local library.

**No account. No server. No tracking.** Everything lives in `chrome.storage.local` in your own browser, and the extension works fully offline.

## Features

- **Save in one gesture** — select text on any page, right-click → *Save selection to PromptVault*, or press `Ctrl+Shift+S` (macOS: `Cmd+Shift+S`).
- **Save page notes** — right-click a page → *Save page note* stores its title and URL.
- **Popup library** — search across text and tags, add items with tags, copy back with one click, or copy as a Markdown quote with the source linked.
- **Export / Import** — download your whole library as JSON and restore it anywhere. Your data is yours.
- **Zero dependencies** — plain HTML/CSS/JS, about 12 KB total.

## Install (developer mode, free)

1. Download or clone this repo.
2. Open `chrome://extensions`, enable **Developer mode**.
3. Click **Load unpacked** and choose this folder.

A Chrome Web Store listing is planned; the store charges developers a one-time registration fee, so for now the GitHub install above is the official channel.

## Privacy

PromptVault collects nothing. It requests only the permissions it needs: `storage` (your library), `contextMenus` (the right-click save), `activeTab` + `scripting` (reading your current selection when you invoke the shortcut — never in the background).

## Layout

- `manifest.json` — MV3 manifest
- `background.js` — context menus and the keyboard command
- `popup.html` / `popup.css` / `popup.js` — the library UI
- `icons/` — extension icons

## License

MIT — see `LICENSE`.

---

<sub>Built by [Kontenlaris Studio](https://github.com/kontenlaris-studio) · More tools as live apps on [SkillSafe](https://skillsafe.ai/share/shr_pm3czpuh2gr8)</sub>
