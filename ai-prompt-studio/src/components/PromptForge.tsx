import { useState, useRef, useEffect } from "react";
import {
  Sparkles, Copy, Check, RotateCcw, ExternalLink,
  UploadCloud, FileCheck, X,
  ArrowRight, Lightbulb, RefreshCw, Download,
  ChevronLeft, ChevronRight, BookOpen, KeyRound, ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AI_MODELS } from "../data";
import { Attachment, Question } from "../types";
import { hasApiKey, setApiKey } from "../lib/api";

interface ForgeResult {
  forgedPrompt: string;
  promptTip: string;
  reflectiveQuestions: Question[];
}

export default function PromptForge() {
  const [selectedModelId, setSelectedModelId] = useState("gemini");
  const [userRequest, setUserRequest] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ForgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // API key banner states
  const [keyMissing, setKeyMissing] = useState(!hasApiKey());
  const [bannerKeyVal, setBannerKeyVal] = useState("");
  const [showBannerKey, setShowBannerKey] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setKeyMissing(!hasApiKey());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleSaveBannerKey = () => {
    if (!bannerKeyVal.trim()) return;
    setApiKey(bannerKeyVal);
    setKeyMissing(false);
    setBannerKeyVal("");
  };

  // Reflective questions state
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState("");

  // Copy state
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedRefined, setCopiedRefined] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const selectedModel = AI_MODELS.find(m => m.id === selectedModelId) || AI_MODELS[0];

  // ─── File upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) {
        setError(`"${file.name}" exceeds 50 MB limit.`);
        return;
      }
      const reader = new FileReader();
      const isImage = file.type.startsWith("image/");
      const isText = file.type.startsWith("text/") ||
        ["json","ts","tsx","js","jsx","sql","py","csv","md","yaml","yml"]
          .some(ext => file.name.endsWith(`.${ext}`));

      reader.onload = e => {
        const content = e.target?.result as string;
        setAttachments(prev => {
          if (prev.some(a => a.name === file.name && a.size === file.size)) return prev;
          return [...prev, {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name, type: file.type || "application/octet-stream",
            size: file.size, content,
            previewUrl: isImage ? content : undefined
          }];
        });
      };
      if (isImage) reader.readAsDataURL(file);
      else if (isText) reader.readAsText(file);
      else reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // ─── Main generation ──────────────────────────────────────────────────────────
  const handleForge = async (withAnswers = false) => {
    if (!userRequest.trim()) { setError("Describe what you want to do."); return; }
    setError(null);

    if (withAnswers) setIsRefining(true);
    else { setIsGenerating(true); setResult(null); setShowQuestions(false); setQuestionAnswers({}); setCurrentQIdx(0); setRefinedPrompt(""); }

    try {
      const res = await fetch("/api/forge-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userRequest,
          modelId: selectedModel.id,
          modelName: selectedModel.name,
          promptingStyle: selectedModel.promptingStyle,
          promptingTips: selectedModel.promptingTips,
          systemPromptSupport: selectedModel.systemPromptSupport,
          contextWindow: selectedModel.contextWindow,
          attachments,
          questionAnswers: withAnswers ? questionAnswers : {}
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed.");

      if (withAnswers) {
        setRefinedPrompt(data.forgedPrompt);
      } else {
        setResult(data);
        setShowQuestions(true);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setIsGenerating(false);
      setIsRefining(false);
    }
  };

  const handleCopy = (text: string, which: "main" | "refined") => {
    navigator.clipboard.writeText(text);
    if (which === "main") { setCopiedMain(true); setTimeout(() => setCopiedMain(false), 2000); }
    else { setCopiedRefined(true); setTimeout(() => setCopiedRefined(false), 2000); }
  };

  const handleDownload = (text: string, prefix: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${prefix}-${selectedModel.id}-prompt.md`;
    a.click();
  };

  const exportToJupyter = () => {
    if (!result) return;
    const filename = `prompt-forge-${selectedModel.id}.ipynb`;
    const notebook = {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `# AI Prompt Studio — Forged Prompt Notebook\n`,
            `* **Target Model:** ${selectedModel.name} (${selectedModel.provider})\n`,
            `* **Created As Of:** ${new Date().toLocaleString()}\n`,
            `* **Original Request:** ${userRequest}\n`
          ]
        },
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `## 🎯 Original Optimized Prompt\n`,
            `Paste this prompt into ${selectedModel.shortName} to begin your session:\n\n`,
            ...result.forgedPrompt.split("\n").map(line => line + "\n")
          ]
        }
      ],
      metadata: {
        kernelspec: {
          display_name: "Python 3",
          language: "python",
          name: "python3"
        },
        language_info: {
          name: "python"
        }
      },
      nbformat: 4,
      nbformat_minor: 2
    };

    const hasAnswers = Object.values(questionAnswers).some(val => val.trim());
    if (hasAnswers) {
      const answerLines: string[] = [`## 🔧 Refinement Q&A\n\n`];
      result.reflectiveQuestions.forEach(q => {
        const ans = questionAnswers[q.id];
        if (ans?.trim()) {
          answerLines.push(`* **Q:** ${q.question}\n`);
          answerLines.push(`  **A:** ${ans}\n\n`);
        }
      });
      notebook.cells.splice(2, 0, {
        cell_type: "markdown",
        metadata: {},
        source: answerLines
      });
    }

    if (refinedPrompt) {
      notebook.cells.push({
        cell_type: "markdown",
        metadata: {},
        source: [
          `## ✦ Refined Prompt\n`,
          `This is the refined version of the prompt containing your answers:\n\n`,
          ...refinedPrompt.split("\n").map(line => line + "\n")
        ]
      });
    }

    const blob = new Blob([JSON.stringify(notebook, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  };

  const handleReset = () => {
    setUserRequest(""); setAttachments([]); setResult(null);
    setError(null); setShowQuestions(false); setQuestionAnswers({});
    setCurrentQIdx(0); setRefinedPrompt("");
  };

  const activeQ = result?.reflectiveQuestions?.[currentQIdx];
  const allQAnswered = result?.reflectiveQuestions
    ? result.reflectiveQuestions.every(q => questionAnswers[q.id] !== undefined)
    : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Prompt Forge
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Transforms your request into an optimized prompt for any free AI — tailored to how each model actually thinks.
          </p>
        </div>
        {(result || userRequest) && (
          <button onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#0D1225] hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-[#1A2138] transition cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Key Missing Step-by-Step Tutorial Banner */}
      <AnimatePresence>
        {keyMissing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-indigo-950/25 to-slate-950/30 border border-indigo-900/50 rounded-2xl p-5 space-y-4 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-800/50 shrink-0">
                <KeyRound className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  🔑 Get a Free Gemini API Key to Activate All AI Features
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI Prompt Studio runs directly on the Google Gemini model. To generate prompts and use all tools, you need a free API key. It takes less than 30 seconds to set up.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              {/* Step 1 */}
              <div className="bg-[#080C16]/60 border border-[#1A2138] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-800/50">1</span>
                  <span className="text-xs font-bold text-slate-200">Open AI Studio</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Open Google AI Studio and sign in with any Google account (Gmail is free).
                </p>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition mt-1"
                >
                  Go to Google AI Studio <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Step 2 */}
              <div className="bg-[#080C16]/60 border border-[#1A2138] rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-800/50">2</span>
                  <span className="text-xs font-bold text-slate-200">Generate Key</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Click the blue <strong>"Create API key"</strong> button, select a new project, and copy the key string.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#080C16]/60 border border-[#1A2138] rounded-xl p-3.5 space-y-2 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-300 text-[10px] font-bold flex items-center justify-center border border-indigo-800/50">3</span>
                    <span className="text-xs font-bold text-slate-200">Paste & Save</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Paste the key below to activate all AI features instantly.
                  </p>
                </div>
                
                <div className="relative mt-2">
                  <input
                    type={showBannerKey ? "text" : "password"}
                    value={bannerKeyVal}
                    onChange={e => setBannerKeyVal(e.target.value)}
                    placeholder="Paste AIzaSy..."
                    className="w-full bg-[#0D1225] border border-[#1A2138] focus:border-indigo-600/60 rounded-lg pl-2.5 pr-12 py-1.5 text-xs text-slate-200 placeholder-slate-700 focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowBannerKey(s => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    {showBannerKey ? "Hide" : "Show"}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-[#1A2138]/40">
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Your key is saved only in this browser's local storage and is never sent to external servers.</span>
              </div>
              
              <button
                onClick={handleSaveBannerKey}
                disabled={!bannerKeyVal.trim()}
                className="w-full sm:w-auto px-5 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer disabled:opacity-40 transition"
              >
                Activate Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-sm">
            <X className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200 font-bold">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 1: AI Model selector ─────────────────────────────────────────── */}
      <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            01 · Select Target AI
          </span>
          <a href={selectedModel.url} target="_blank" rel="noreferrer"
            className={`flex items-center gap-1 text-[10px] font-semibold ${selectedModel.textClass} hover:underline`}>
            Open {selectedModel.shortName} <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AI_MODELS.map(model => {
            const isActive = model.id === selectedModelId;
            return (
              <button key={model.id} onClick={() => { setSelectedModelId(model.id); setResult(null); setShowQuestions(false); setRefinedPrompt(""); }}
                className={`relative text-left p-3 rounded-xl border transition-all duration-150 cursor-pointer group ${
                  isActive
                    ? `${model.activeBgClass} ${model.borderClass} shadow-lg`
                    : "bg-[#080C16] border-[#1A2138] hover:border-slate-700 hover:bg-[#0D1225]"
                }`}
                style={isActive ? { boxShadow: `0 0 0 1px ${model.accentHex}30, 0 4px 20px ${model.accentHex}15` } : {}}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-base ${isActive ? model.textClass : "text-slate-600 group-hover:text-slate-400"} transition-colors`}>
                    {model.iconEmoji}
                  </span>
                  <span className={`text-xs font-bold leading-tight ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"} transition-colors`}>
                    {model.shortName}
                  </span>
                </div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? `${model.bgClass} ${model.textClass}` : "bg-slate-900 text-slate-600"} transition-colors`}>
                  {model.badgeText}
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected model info strip */}
        <div className={`flex flex-wrap items-start gap-3 p-3 rounded-xl border ${selectedModel.bgClass} ${selectedModel.borderClass}`}>
          <div className="flex-1 min-w-0">
            <p className={`text-[11px] font-semibold ${selectedModel.textClass} mb-0.5`}>{selectedModel.name}</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">{selectedModel.freeInfo}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {selectedModel.strengths.map(s => (
              <span key={s} className="text-[9px] px-2 py-0.5 rounded-full bg-[#080C16] text-slate-400 border border-[#1A2138]">{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Step 2: Input ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
            02 · Describe Your Request
          </span>

          <textarea
            value={userRequest}
            onChange={e => { setUserRequest(e.target.value); if (error) setError(null); }}
            placeholder={`What do you want ${selectedModel.shortName} to do? Write naturally — the Forge will optimize the language for ${selectedModel.shortName}'s prompting style.\n\ne.g. "Explain how TCP handshakes work to a first-year CS student with diagrams"`}
            className="w-full h-36 bg-[#080C16] border border-[#1A2138] focus:border-slate-600 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-sans leading-relaxed"
          />

          {/* File upload */}
          <div
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
              dragActive ? "border-slate-500 bg-slate-800/20" : "border-[#1A2138] hover:border-slate-700 hover:bg-[#080C16]"
            }`}>
            <input ref={fileInputRef} type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={e => handleFileUpload(e.target.files)} />
            <UploadCloud className="w-5 h-5 text-slate-600 mx-auto mb-1" />
            <p className="text-[11px] text-slate-500">
              Drop files or screenshots · <span className="text-slate-400">browse</span> · 50MB max
            </p>
          </div>

          {/* Attachment list */}
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#080C16] border border-[#1A2138]">
                  {att.previewUrl
                    ? <img src={att.previewUrl} className="w-7 h-7 rounded object-cover shrink-0" alt={att.name} />
                    : <FileCheck className="w-4 h-4 text-slate-500 shrink-0" />
                  }
                  <span className="text-[11px] text-slate-300 truncate flex-1">{att.name}</span>
                  <button onClick={() => setAttachments(p => p.filter(a => a.id !== att.id))}
                    className="text-slate-600 hover:text-red-400 transition p-0.5 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => handleForge(false)}
            disabled={isGenerating || !userRequest.trim()}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${selectedModel.textClass}`}
            style={{ background: `linear-gradient(135deg, ${selectedModel.accentHex}20, ${selectedModel.accentHex}10)`, border: `1px solid ${selectedModel.accentHex}40` }}>
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Forging for {selectedModel.shortName}…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Forge Prompt for {selectedModel.shortName}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

        {/* ── Step 3: Output ────────────────────────────────────────────────────── */}
        <div ref={outputRef} className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4 min-h-[200px] flex flex-col">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
            03 · Forged Prompt
          </span>

          {!result && !isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8 space-y-2">
              <div className={`text-3xl opacity-20 ${selectedModel.textClass}`}>{selectedModel.iconEmoji}</div>
              <p className="text-xs text-slate-600">Your {selectedModel.shortName}-optimized prompt will appear here.</p>
            </div>
          )}

          {isGenerating && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-slate-600 border-t-slate-200 rounded-full animate-spin" />
              <p className="text-xs text-slate-500 animate-pulse-soft">Forging for {selectedModel.shortName}…</p>
            </div>
          )}

          {result && !isGenerating && (
            <div className="flex-1 flex flex-col gap-3 animate-fade-up">
              {/* Tip strip */}
              {result.promptTip && (
                <div className={`flex items-start gap-2 p-2.5 rounded-lg text-[11px] ${selectedModel.bgClass} ${selectedModel.borderClass} border`}>
                  <Lightbulb className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${selectedModel.textClass}`} />
                  <span className="text-slate-300 leading-relaxed">{result.promptTip}</span>
                </div>
              )}

              {/* Prompt box */}
              <div className="bg-[#080C16] border border-[#1A2138] rounded-xl p-4 flex-1 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto select-all">
                {result.forgedPrompt}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button onClick={() => handleCopy(result.forgedPrompt, "main")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    copiedMain ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-400"
                      : `${selectedModel.bgClass} ${selectedModel.borderClass} ${selectedModel.textClass} hover:opacity-80`
                  }`}>
                  {copiedMain ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Prompt</>}
                </button>
                <button onClick={() => handleDownload(result.forgedPrompt, "forge")}
                  className="p-2.5 rounded-lg bg-[#080C16] border border-[#1A2138] text-slate-500 hover:text-white transition cursor-pointer"
                  title="Download Markdown">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={exportToJupyter}
                  className="p-2.5 rounded-lg bg-[#080C16] border border-[#1A2138] text-slate-500 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Export to Jupyter Notebook (.ipynb)">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  <span className="hidden sm:inline">Export Notebook</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Step 4: Reflective questions (optional wizard) ───────────────────── */}
      <AnimatePresence>
        {result && result.reflectiveQuestions?.length > 0 && showQuestions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
                  04 · Refine with Reflective Questions Wizard
                  <span className="ml-2 text-[9px] text-slate-600 normal-case tracking-normal font-normal">(optional)</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">Answer the questions step-by-step to compile a more precise prompt.</p>
              </div>
              <button onClick={() => setShowQuestions(false)}
                className="text-slate-600 hover:text-slate-300 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wizard Steps Progress */}
            <div className="flex items-center gap-1.5 pb-1">
              {result.reflectiveQuestions.map((q, idx) => (
                <div key={q.id} className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentQIdx ? `w-8 bg-indigo-500` :
                  questionAnswers[q.id]?.trim() ? `w-2 bg-emerald-500` : `w-2 bg-[#1A2138]`
                }`} />
              ))}
              <span className="text-[10px] text-slate-500 ml-2 font-semibold">
                Question {currentQIdx + 1} of {result.reflectiveQuestions.length}
              </span>
            </div>

            {/* Question card (active step) */}
            {activeQ && (
              <div className={`p-4 rounded-xl border transition-all ${selectedModel.bgClass} ${selectedModel.borderClass} border bg-[#080C16] relative overflow-hidden`}>
                <div className="flex items-start gap-2 mb-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${selectedModel.bgClass} ${selectedModel.textClass}`}>Q{currentQIdx + 1}</span>
                  <p className="text-sm font-semibold text-slate-200 leading-snug">{activeQ.question}</p>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{activeQ.helperText}</p>
                <textarea
                  value={questionAnswers[activeQ.id] || ""}
                  onChange={e => setQuestionAnswers(prev => ({ ...prev, [activeQ.id]: e.target.value }))}
                  placeholder="Your answer (optional)…"
                  className="w-full h-20 bg-[#0D1225] border border-[#1A2138] focus:border-slate-600 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Actions / Navigation */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  disabled={currentQIdx === 0}
                  onClick={() => setCurrentQIdx(prev => prev - 1)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-white bg-[#080C16] border border-[#1A2138] px-3 py-2 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer">
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  onClick={() => {
                    if (currentQIdx < result.reflectiveQuestions.length - 1) {
                      setCurrentQIdx(prev => prev + 1);
                    } else {
                      handleForge(true);
                    }
                  }}
                  className={`flex items-center gap-1 text-[11px] font-bold px-3 py-2 rounded-lg transition cursor-pointer ${
                    currentQIdx < result.reflectiveQuestions.length - 1 ? "bg-slate-800 text-white hover:bg-slate-700" : `${selectedModel.textClass} bg-indigo-950/40 border border-indigo-900/40`
                  }`}>
                  {currentQIdx < result.reflectiveQuestions.length - 1 ? (
                    <>Next <ChevronRight className="w-3.5 h-3.5" /></>
                  ) : (
                    <>Finish &amp; Refine</>
                  )}
                </button>
                <button
                  onClick={() => {
                    setQuestionAnswers(prev => ({ ...prev, [activeQ.id]: "" }));
                    if (currentQIdx < result.reflectiveQuestions.length - 1) {
                      setCurrentQIdx(prev => prev + 1);
                    } else {
                      handleForge(true);
                    }
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 px-2.5 py-2 transition cursor-pointer">
                  Skip this question
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleForge(true)} disabled={isRefining}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-bold text-xs transition cursor-pointer disabled:opacity-40 ${selectedModel.textClass}`}
                  style={{ background: `${selectedModel.accentHex}18`, border: `1px solid ${selectedModel.accentHex}35` }}>
                  {isRefining ? (
                    <><div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />Refining…</>
                  ) : (
                    <><RefreshCw className="w-3.5 h-3.5" />Refine Now</>
                  )}
                </button>
                <button onClick={() => { setShowQuestions(false); setQuestionAnswers({}); setCurrentQIdx(0); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer">
                  Clear All
                </button>
              </div>
            </div>

            {/* Refined prompt output */}
            <AnimatePresence>
              {refinedPrompt && !isRefining && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`mt-2 p-4 rounded-xl border space-y-3 ${selectedModel.bgClass} ${selectedModel.borderClass}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedModel.textClass}`}>
                    ✦ Refined Prompt
                  </span>
                  <div className="bg-[#080C16] border border-[#1A2138] rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto select-all">
                    {refinedPrompt}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(refinedPrompt, "refined")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        copiedRefined ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-400"
                          : `${selectedModel.borderClass} ${selectedModel.textClass} hover:opacity-80`
                      }`}>
                      {copiedRefined ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Refined</>}
                    </button>
                    <button onClick={() => handleDownload(refinedPrompt, "refined")}
                      className="p-2 rounded-lg bg-[#080C16] border border-[#1A2138] text-slate-500 hover:text-white transition cursor-pointer"
                      title="Download Refined Markdown">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={exportToJupyter}
                      className="p-2 rounded-lg bg-[#080C16] border border-[#1A2138] text-slate-500 hover:text-white transition cursor-pointer flex items-center gap-1 text-[10px] font-semibold"
                      title="Export Refined to Jupyter Notebook (.ipynb)">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline">Export Notebook</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prompting tips sidebar (shows when no result yet) */}
      {!result && (
        <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-3">
          <span className={`text-[11px] font-bold uppercase tracking-widest ${selectedModel.textClass}`}>
            How {selectedModel.name} thinks
          </span>
          <p className="text-xs text-slate-400 leading-relaxed">{selectedModel.promptingStyle}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {selectedModel.promptingTips.map((tip, i) => (
              <div key={i} className={`flex items-start gap-2 p-2.5 rounded-lg border text-[11px] ${selectedModel.bgClass} ${selectedModel.borderClass}`}>
                <span className={`font-mono font-bold text-[10px] shrink-0 mt-0.5 ${selectedModel.textClass}`}>{i + 1}.</span>
                <span className="text-slate-300 leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
