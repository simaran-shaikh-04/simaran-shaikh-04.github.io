import { useState, useEffect } from "react";
import { History, X, Search, Copy, Check, Trash2, Clock } from "lucide-react";
import { getHistory, removeHistory, clearHistory } from "../lib/history";
import type { HistoryEntry } from "../lib/history";

function ago(ts: number): string {
  const s = (Date.now() - ts) / 1000;
  if (s < 60) return "just now";
  const m = s / 60; if (m < 60) return `${Math.floor(m)}m ago`;
  const h = m / 60; if (h < 24) return `${Math.floor(h)}h ago`;
  const d = h / 24; if (d < 7) return `${Math.floor(d)}d ago`;
  return new Date(ts).toLocaleDateString();
}

const TOOL_COLOR: Record<string, string> = {
  "Prompt Forge": "text-indigo-300 bg-indigo-950/40 border-indigo-900/50",
  "Context Bridge": "text-cyan-300 bg-cyan-950/40 border-cyan-900/50",
  "Student Suite": "text-emerald-300 bg-emerald-950/40 border-emerald-900/50",
  "Image Studio": "text-rose-300 bg-rose-950/40 border-rose-900/50",
  "Resource Hub": "text-amber-300 bg-amber-950/40 border-amber-900/50",
  "Career Hub": "text-violet-300 bg-violet-950/40 border-violet-900/50",
};

export default function HistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setItems(getHistory());
    refresh();
    window.addEventListener("history-updated", refresh);
    return () => window.removeEventListener("history-updated", refresh);
  }, []);

  if (!open) return null;

  const filtered = query.trim()
    ? items.filter(e => `${e.title} ${e.tool} ${e.content}`.toLowerCase().includes(query.toLowerCase()))
    : items;

  const copy = (e: HistoryEntry) => {
    navigator.clipboard.writeText(e.content);
    setCopiedId(e.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md h-full bg-[#0B1020] border-l border-[#1A2138] shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-center justify-between gap-3 p-4 border-b border-[#1A2138]">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" /> Prompt History
          </h3>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={() => { if (confirm("Clear all saved prompts?")) clearHistory(); }}
                className="text-[10px] font-semibold text-slate-500 hover:text-red-300 flex items-center gap-1 cursor-pointer">
                <Trash2 className="w-3 h-3" /> Clear all
              </button>
            )}
            <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer"><X className="w-4 h-4" /></button>
          </div>
        </div>

        {/* search */}
        <div className="p-3 border-b border-[#1A2138]">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search your prompts…"
              className="w-full bg-[#080C16] border border-[#1A2138] focus:border-indigo-600/50 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none" />
          </div>
        </div>

        {/* list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-600 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              {items.length === 0 ? "Nothing yet — every prompt you copy is saved here automatically." : "No matches."}
            </div>
          ) : filtered.map(e => (
            <div key={e.id} className="bg-[#0D1225] border border-[#1A2138] rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded border ${TOOL_COLOR[e.tool] || "text-slate-400 bg-slate-800/40 border-slate-700/50"}`}>{e.tool}</span>
                <span className="text-[9px] text-slate-600 shrink-0">{ago(e.ts)}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 whitespace-pre-wrap font-mono">{e.content}</p>
              <div className="flex items-center justify-end gap-1 pt-1">
                <button onClick={() => copy(e)}
                  className={`text-[10px] font-semibold inline-flex items-center gap-1 px-2 py-1 rounded border transition cursor-pointer ${copiedId === e.id ? "text-emerald-400 border-emerald-700/40 bg-emerald-950/30" : "text-slate-300 border-[#1A2138] bg-[#080C16] hover:text-white"}`}>
                  {copiedId === e.id ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
                <button onClick={() => removeHistory(e.id)}
                  className="text-[10px] text-slate-600 hover:text-red-300 inline-flex items-center gap-1 px-2 py-1 rounded cursor-pointer">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-[#1A2138] text-[10px] text-slate-600 text-center">
          Saved only in this browser · last {200} prompts kept
        </div>
      </div>
    </div>
  );
}
