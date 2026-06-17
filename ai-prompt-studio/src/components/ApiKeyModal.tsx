import { useState } from "react";
import { KeyRound, X, ExternalLink, Check, Trash2, ShieldCheck } from "lucide-react";
import { getApiKey, setApiKey, clearApiKey } from "../lib/api";

export default function ApiKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [value, setValue] = useState(getApiKey());
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);

  if (!open) return null;

  const save = () => {
    if (!value.trim()) return;
    setApiKey(value);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };
  const remove = () => { clearApiKey(); setValue(""); };
  const hasSaved = getApiKey().length > 0;

  const steps = [
    "Open Google AI Studio (button below) and sign in with any Google account.",
    'Click "Create API key" — it is completely free.',
    "Copy the key, paste it in the box below, and press Save.",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-lg bg-[#0D1225] border border-[#1A2138] rounded-2xl shadow-2xl p-6 space-y-5" onClick={e => e.stopPropagation()}>
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-950/40 border border-indigo-900/50">
              <KeyRound className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Add your free Gemini API key</h3>
              <p className="text-[11px] text-slate-500">Needed once to power the AI features. It's free.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white cursor-pointer shrink-0"><X className="w-4 h-4" /></button>
        </div>

        {/* steps */}
        <ol className="space-y-2">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
              <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-950/50 border border-indigo-800/60 text-indigo-300 text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
              {s}
            </li>
          ))}
        </ol>

        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/30 border border-indigo-900/50 px-3 py-2 rounded-lg transition">
          Open Google AI Studio <ExternalLink className="w-3 h-3" />
        </a>

        {/* input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Your Gemini API key</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Paste your key (starts with AIza…)"
              className="w-full bg-[#080C16] border border-[#1A2138] focus:border-indigo-600/60 rounded-lg pl-3 pr-16 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none font-mono"
            />
            <button onClick={() => setShow(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer">
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {/* actions */}
        <div className="flex gap-2">
          <button onClick={save} disabled={!value.trim()}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${saved ? "bg-emerald-600 text-white" : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white"}`}>
            {saved ? <><Check className="w-3.5 h-3.5" /> Saved!</> : "Save key"}
          </button>
          {hasSaved && (
            <button onClick={remove}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold bg-[#080C16] border border-[#1A2138] text-slate-400 hover:text-red-300 hover:border-red-900/50 transition cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          )}
        </div>

        {/* privacy */}
        <div className="flex gap-2 items-start text-[10px] text-slate-500 leading-relaxed bg-[#080C16] border border-[#1A2138] p-3 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>Your key is saved only in this browser. It's sent with each AI request so the server can call Gemini as you — it is never written to any database, logged, or shared.</span>
        </div>
      </div>
    </div>
  );
}
