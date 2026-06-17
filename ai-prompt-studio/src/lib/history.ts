// src/lib/history.ts
// Unified prompt history across every tool. Works by wrapping the clipboard
// "copy" action once — so each tool's existing Copy buttons feed history with
// no component edits. Stored only in this browser.

const KEY = "prompt_history_v1";
const MAX = 200;

export interface HistoryEntry {
  id: string;
  tool: string;
  title: string;
  content: string;
  ts: number;
}

// App updates this on tab change so entries are tagged with the right tool.
let currentTool = "App";
export const setCurrentTool = (t: string) => { currentTool = t; };

export function getHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}

function persist(list: HistoryEntry[]) {
  try { localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX))); } catch { /* ignore */ }
  try { window.dispatchEvent(new CustomEvent("history-updated")); } catch { /* ignore */ }
}

export function addHistory(content: string, tool = currentTool) {
  const text = (content || "").trim();
  if (text.length < 12) return;                       // ignore trivial copies
  const list = getHistory();
  if (list[0] && list[0].content === text) return;    // dedupe consecutive
  const entry: HistoryEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    tool,
    title: text.replace(/\s+/g, " ").slice(0, 80),
    content: text,
    ts: Date.now(),
  };
  persist([entry, ...list]);
}

export function removeHistory(id: string) {
  persist(getHistory().filter(e => e.id !== id));
}

export function clearHistory() {
  persist([]);
}

// Install once (from main.tsx). Wraps navigator.clipboard.writeText so every
// "Copy" across the app is recorded. Guarded so it can never break the app.
let installed = false;
export function installHistoryCapture() {
  if (installed || typeof navigator === "undefined" || !navigator.clipboard) return;
  installed = true;
  try {
    const orig = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = async (text: string) => {
      try { addHistory(text); } catch { /* ignore */ }
      return orig(text);
    };
  } catch { /* clipboard not writable — history capture simply stays off */ }
}
