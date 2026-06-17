import { useState, useMemo } from "react";
import {
  Library, ExternalLink, Check, Flag, Search,
  BookOpen, GraduationCap, Target, Rocket,
  X, Loader2, Calendar
} from "lucide-react";
import { RESOURCES, RESOURCE_CATEGORIES } from "../data/hubData";
import type { Resource, ResourceCategory, ResourceCost } from "../data/hubData";
import type { StudentLevel } from "../data/studentPresets";

const LEVELS: { id: StudentLevel | "all"; label: string; icon: any }[] = [
  { id: "all", label: "All levels", icon: Library },
  { id: "school", label: "School", icon: BookOpen },
  { id: "college", label: "College", icon: GraduationCap },
  { id: "competitive", label: "Competitive", icon: Target },
  { id: "professional", label: "Career", icon: Rocket },
];

const COST_LABEL: Record<ResourceCost, { label: string; c: string }> = {
  "free": { label: "Free", c: "text-emerald-400 bg-emerald-950/40 border-emerald-800/50" },
  "freemium": { label: "Freemium", c: "text-sky-400 bg-sky-950/40 border-sky-800/50" },
  "free-audit": { label: "Free to audit", c: "text-violet-400 bg-violet-950/40 border-violet-800/50" },
  "paid": { label: "Paid", c: "text-slate-400 bg-slate-800/40 border-slate-700/50" },
};

export default function ResourceHub() {
  const [level, setLevel] = useState<StudentLevel | "all">("all");
  const [category, setCategory] = useState<ResourceCategory | "all">("all");
  const [freeFirst, setFreeFirst] = useState(false);
  const [query, setQuery] = useState("");
  const [flagged, setFlagged] = useState<string | null>(null);

  // Curated study planner states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [studyGoal, setStudyGoal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return RESOURCES.filter(r => {
      if (level !== "all" && !r.levels.includes(level)) return false;
      if (category !== "all" && r.category !== category) return false;
      if (freeFirst && !(r.cost === "free" || r.cost === "free-audit")) return false;
      if (query.trim() && !(`${r.name} ${r.bestFor}`.toLowerCase().includes(query.toLowerCase()))) return false;
      return true;
    });
  }, [level, category, freeFirst, query]);

  const reportDead = (r: Resource) => {
    const text = `Resource report — "${r.name}" (${r.url}): [describe the issue, e.g. dead link / outdated / moved]`;
    navigator.clipboard.writeText(text);
    setFlagged(r.id);
    setTimeout(() => setFlagged(null), 2500);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGeneratePlan = async () => {
    if (!studyGoal.trim()) return;
    setIsGenerating(true);
    setError(null);

    const selectedResources = RESOURCES.filter(r => selectedIds.includes(r.id)).map(r => ({
      name: r.name,
      url: r.url,
      bestFor: r.bestFor
    }));

    try {
      const res = await fetch("/api/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resources: selectedResources, studyGoal })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate study plan.");
      setGeneratedPlan(data.studyPlanPrompt);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-5 pb-24">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Library className="w-5 h-5 text-amber-400" /> Resource Hub
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Trusted, free-first places to learn — every entry links to its official source.</p>
      </div>

      {/* Filters */}
      <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-4 space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search resources…"
            className="w-full bg-[#080C16] border border-[#1A2138] focus:border-amber-700/50 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none" />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {LEVELS.map(l => {
            const Icon = l.icon; const on = level === l.id;
            return (
              <button key={l.id} onClick={() => setLevel(l.id)}
                className={`flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${on ? "bg-amber-950/40 text-amber-300 border-amber-800/60" : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"}`}>
                <Icon className="w-3 h-3" /> {l.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button onClick={() => setCategory("all")}
            className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${category === "all" ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"}`}>All</button>
          {RESOURCE_CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${category === cat ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"}`}>{cat}</button>
          ))}
          <button onClick={() => setFreeFirst(f => !f)}
            className={`ml-auto text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${freeFirst ? "bg-emerald-950/40 text-emerald-300 border-emerald-800/60" : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"}`}>
            {freeFirst ? "✓ Free only" : "Free only"}
          </button>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-xs text-slate-500 text-center py-8">No resources match these filters yet. Clear a filter, or add one to <code className="text-slate-400">hubData.ts</code>.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(r => {
            const cost = COST_LABEL[r.cost];
            const isSelected = selectedIds.includes(r.id);
            return (
              <div key={r.id} className={`bg-[#0D1225] border rounded-xl p-4 space-y-2.5 flex flex-col transition-all duration-150 ${isSelected ? "border-amber-500/40 bg-amber-950/5" : "border-[#1A2138] hover:border-slate-800 hover:bg-[#0E132A]"}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => toggleSelect(r.id)}
                      className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition cursor-pointer ${isSelected ? "bg-amber-500 border-amber-500 text-slate-950" : "border-[#1A2138] bg-[#080C16]/50 hover:border-slate-500"}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <a href={r.url} target="_blank" rel="noreferrer"
                      className="text-sm font-bold text-white hover:text-amber-300 inline-flex items-center gap-1.5 transition">
                      {r.name} <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                    </a>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border shrink-0 ${cost.c}`}>{cost.label}</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed flex-1">{r.bestFor}.</p>
                {r.reputationNote && <p className="text-[10px] text-slate-500 italic leading-normal">{r.reputationNote}</p>}
                <div className="flex items-center justify-between pt-2 border-t border-[#1A2138]">
                  <span className="text-[9px] text-slate-600">{r.category} · checked {r.asOf}</span>
                  <button onClick={() => reportDead(r)}
                    className={`text-[9px] inline-flex items-center gap-1 transition cursor-pointer ${flagged === r.id ? "text-emerald-400" : "text-slate-600 hover:text-amber-400"}`}>
                    {flagged === r.id ? <><Check className="w-2.5 h-2.5" /> Copied report</> : <><Flag className="w-2.5 h-2.5" /> Report</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[10px] text-slate-600 text-center">
        Free-first and piracy-free by design — only official sites and openly-licensed material. "Report" copies a prefilled note for you to log.
      </p>

      {/* Floating curating scheduler bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0D1225] border border-amber-500/35 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 z-40 animate-slideUp max-w-[90%] w-[480px]">
          <div className="flex-1">
            <span className="text-xs font-bold text-white block">Curated Study Planner</span>
            <span className="text-[10px] text-slate-400">{selectedIds.length} resource{selectedIds.length > 1 ? "s" : ""} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="text-[10px] text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-[#1A2138] bg-[#080C16] cursor-pointer"
            >
              Clear
            </button>
            <button
              onClick={() => {
                setStudyGoal("");
                setGeneratedPlan("");
                setError(null);
                setShowModal(true);
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-1.5 rounded-lg transition cursor-pointer"
            >
              <Calendar className="w-3 h-3" /> Generate Study Plan
            </button>
          </div>
        </div>
      )}

      {/* Goal & Planner modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-[#0D1225] border border-[#1A2138] w-full max-w-2xl rounded-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white bg-[#080C16] border border-[#1A2138] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" /> Create Custom Study Plan
              </h3>
              <p className="text-[11px] text-slate-400">
                Generate a structured syllabus plan incorporating the {selectedIds.length} selected resource{selectedIds.length > 1 ? "s" : ""}.
              </p>
            </div>

            {!generatedPlan ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">What is your learning goal?</label>
                  <textarea
                    value={studyGoal}
                    onChange={e => setStudyGoal(e.target.value)}
                    placeholder="e.g. I want to learn microeconomics concepts to pass my college midterm in 3 weeks. I can study 4 hours a week."
                    className="w-full h-24 bg-[#080C16] border border-[#1A2138] focus:border-amber-500/50 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none animate-fadeIn"
                  />
                </div>

                {error && <p className="text-xs text-rose-400 font-semibold">{error}</p>}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 bg-[#080C16] border border-[#1A2138] rounded-lg hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleGeneratePlan}
                    disabled={isGenerating || !studyGoal.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg cursor-pointer"
                  >
                    {isGenerating ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                    ) : (
                      <>Generate Syllabus Prompt</>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 animate-fadeIn">
                <div className="bg-[#080C16] p-4 rounded-xl border border-[#1A2138] font-mono text-[11px] text-slate-300 max-h-[400px] overflow-y-auto whitespace-pre-wrap select-all leading-normal">
                  {generatedPlan}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPlan);
                      setCopiedPlan(true);
                      setTimeout(() => setCopiedPlan(false), 2000);
                    }}
                    className={`px-4 py-2 text-xs font-bold rounded-lg border cursor-pointer ${copiedPlan ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" : "bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-500"}`}
                  >
                    {copiedPlan ? "Copied Study Plan!" : "Copy Study Plan"}
                  </button>
                  <button
                    onClick={() => setGeneratedPlan("")}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 bg-[#080C16] border border-[#1A2138] rounded-lg hover:text-white cursor-pointer"
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
