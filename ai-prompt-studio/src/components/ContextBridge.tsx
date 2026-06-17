import { useState, useRef } from "react";
import {
  Link2, Copy, Check, RotateCcw, ExternalLink, ArrowRight,
  UploadCloud, FileCheck, X, ChevronDown, ChevronUp,
  RefreshCw, Download, MessageSquare, Image as ImageIcon, Sparkles,
  ChevronLeft, ChevronRight, BookOpen, Plus, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AI_MODELS } from "../data";
import { Attachment, Question } from "../types";

interface BridgeResult {
  contextSummary: string;
  bridgePrompt: string;
  extractedVariables: { key: string; value: string }[];
  reflectiveQuestions: Question[];
}

const ALL_MODELS = [{ id: "unknown", shortName: "Unknown AI", name: "Other / Unknown AI", textClass: "text-slate-400", bgClass: "bg-slate-800/30", borderClass: "border-slate-700/50", activeBgClass: "bg-slate-800/50", accentHex: "#64748B", badgeText: "", iconEmoji: "?" }, ...AI_MODELS];

export default function ContextBridge() {
  const [sourceModelId, setSourceModelId] = useState("unknown");
  const [targetModelId, setTargetModelId] = useState("gemini");
  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [chatHistory, setChatHistory] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [continuationGoal, setContinuationGoal] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<BridgeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Reflective questions
  const [showQuestions, setShowQuestions] = useState(false);
  const [questionAnswers, setQuestionAnswers] = useState<Record<string, string>>({});
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [variables, setVariables] = useState<{ key: string; value: string }[]>([]);
  const [isRefining, setIsRefining] = useState(false);
  const [refinedPrompt, setRefinedPrompt] = useState("");

  // Copy state
  const [copiedMain, setCopiedMain] = useState(false);
  const [copiedRefined, setCopiedRefined] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  const sourceModel = ALL_MODELS.find(m => m.id === sourceModelId) || ALL_MODELS[0];
  const targetModel = AI_MODELS.find(m => m.id === targetModelId) || AI_MODELS[0];

  // ─── File upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) { setError(`"${file.name}" exceeds 50 MB.`); return; }
      const reader = new FileReader();
      const isImage = file.type.startsWith("image/");
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
      else reader.readAsText(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // ─── Generate bridge ──────────────────────────────────────────────────────────
  const handleBridge = async (withAnswers = false) => {
    const hasContent = chatHistory.trim() || attachments.length > 0;
    if (!hasContent) { setError("Paste your chat history or upload a screenshot to bridge."); return; }
    setError(null);

    const varsAnswers = {
      ...questionAnswers,
      ...variables.reduce((acc, curr) => {
        if (curr.key.trim()) {
          acc[`Technical parameter: ${curr.key}`] = curr.value;
        }
        return acc;
      }, {} as Record<string, string>)
    };

    if (withAnswers) setIsRefining(true);
    else {
      setIsGenerating(true); setResult(null); setShowQuestions(false);
      setQuestionAnswers({}); setVariables([]); setCurrentQIdx(0); setRefinedPrompt("");
    }

    try {
      const res = await fetch("/api/bridge-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceModelId,
          sourceModelName: sourceModel.name,
          targetModelId,
          targetModelName: targetModel.name,
          targetPromptingStyle: targetModel.promptingStyle,
          targetPromptingTips: targetModel.promptingTips,
          targetSystemPromptSupport: targetModel.systemPromptSupport,
          chatHistory: inputMode === "paste" ? chatHistory : "",
          continuationGoal,
          attachments,
          questionAnswers: withAnswers ? varsAnswers : {}
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bridge generation failed.");

      if (withAnswers) {
        setRefinedPrompt(data.bridgePrompt);
      } else {
        setResult(data);
        setVariables(data.extractedVariables || []);
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
    a.download = `${prefix}-bridge-to-${targetModel.id}.md`;
    a.click();
  };

  const exportToJupyter = () => {
    if (!result) return;
    const filename = `bridge-to-${targetModel.id}.ipynb`;
    const notebook = {
      cells: [
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `# AI Prompt Studio — Context Bridge Continuation Notebook\n`,
            `* **Source Model:** ${sourceModel.name}\n`,
            `* **Target Model:** ${targetModel.name} (${targetModel.provider})\n`,
            `* **Created As Of:** ${new Date().toLocaleString()}\n`,
            `* **Continuation Goal:** ${continuationGoal || "Continue from where we left off"}\n`
          ]
        },
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `## 📝 Context Summary\n`,
            ...result.contextSummary.split("\n").map(line => line + "\n")
          ]
        },
        {
          cell_type: "markdown",
          metadata: {},
          source: [
            `## 🎯 Bridge Prompt\n`,
            `Paste this prompt into ${targetModel.shortName} to resume your session:\n\n`,
            ...result.bridgePrompt.split("\n").map(line => line + "\n")
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

    if (variables.length > 0) {
      const varLines = [`## ⚙ Extracted Parameters\n\n`];
      variables.forEach(v => {
        if (v.key.trim()) {
          varLines.push(`* **${v.key}:** ${v.value}\n`);
        }
      });
      notebook.cells.splice(2, 0, {
        cell_type: "markdown",
        metadata: {},
        source: varLines
      });
    }

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
      notebook.cells.splice(variables.length > 0 ? 3 : 2, 0, {
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
          `## ✦ Refined Bridge Prompt\n`,
          `This is the refined continuation prompt containing your answers:\n\n`,
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
    setChatHistory(""); setAttachments([]); setContinuationGoal("");
    setResult(null); setError(null); setShowQuestions(false);
    setQuestionAnswers({}); setVariables([]); setCurrentQIdx(0); setRefinedPrompt("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            Context Bridge
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Hit a usage limit? Paste your chat history or screenshot — the Bridge creates a seamless continuation prompt for any new AI.
          </p>
        </div>
        {(result || chatHistory) && (
          <button onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#0D1225] hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-[#1A2138] transition cursor-pointer">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-sm">
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200 font-bold">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Step 1: Model pair selector ───────────────────────────────────────── */}
      <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
          01 · AI Model Transfer
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Source Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Leaving (Source AI)</label>
            <div className="relative">
              <select
                value={sourceModelId}
                onChange={e => setSourceModelId(e.target.value)}
                className="w-full bg-[#080C16] border border-[#1A2138] focus:border-cyan-600/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none appearance-none cursor-pointer font-semibold"
              >
                {ALL_MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0D1225] text-slate-200">
                    {m.iconEmoji} {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Target Select */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Continuing On (Target AI)</label>
            <div className="relative">
              <select
                value={targetModelId}
                onChange={e => setTargetModelId(e.target.value)}
                className="w-full bg-[#080C16] border border-[#1A2138] focus:border-cyan-600/50 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none appearance-none cursor-pointer font-semibold"
              >
                {AI_MODELS.map(m => (
                  <option key={m.id} value={m.id} className="bg-[#0D1225] text-slate-200">
                    {m.iconEmoji} {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Transfer summary strip */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-[#080C16] border border-[#1A2138]">
          <span className={`text-xs font-bold ${sourceModel.textClass}`}>{sourceModel.shortName}</span>
          <ArrowRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <span className={`text-xs font-bold ${targetModel.textClass}`}>{targetModel.shortName}</span>
          <span className="text-[10px] text-slate-600 ml-auto">Bridge will use {targetModel.name}'s prompt syntax</span>
        </div>
      </div>

      {/* ── Step 2: Context input ──────────────────────────────────────────────── */}
      <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
          02 · Previous Conversation Context
        </span>

        {/* Mode toggle */}
        <div className="flex bg-[#080C16] p-1 rounded-xl border border-[#1A2138] w-fit gap-1">
          <button onClick={() => setInputMode("paste")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer ${
              inputMode === "paste" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/50" : "text-slate-500 hover:text-slate-300"
            }`}>
            <MessageSquare className="w-3.5 h-3.5" /> Paste Chat
          </button>
          <button onClick={() => setInputMode("upload")}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition cursor-pointer ${
              inputMode === "upload" ? "bg-cyan-950/50 text-cyan-400 border border-cyan-900/50" : "text-slate-500 hover:text-slate-300"
            }`}>
            <ImageIcon className="w-3.5 h-3.5" /> Upload Screenshot
          </button>
        </div>

        {inputMode === "paste" ? (
          <textarea
            value={chatHistory}
            onChange={e => { setChatHistory(e.target.value); if (error) setError(null); }}
            placeholder={`Paste your full conversation here.\n\nYou: [your message]\nAI: [response]\nYou: [follow-up]\nAI: [response]\n\nTip: Copy all messages from the AI conversation and paste them here. Include as much as possible — more context = better bridge.`}
            className="w-full h-52 bg-[#080C16] border border-[#1A2138] focus:border-slate-600 rounded-xl p-4 text-sm text-slate-300 placeholder-slate-700 focus:outline-none resize-none font-mono leading-relaxed"
          />
        ) : (
          <div
            onDragEnter={e => { e.preventDefault(); setDragActive(true); }}
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`relative border border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              dragActive ? "border-cyan-600 bg-cyan-950/10" : "border-[#1A2138] hover:border-slate-700 hover:bg-[#080C16]"
            }`}>
            <input ref={fileInputRef} type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={e => handleFileUpload(e.target.files)} />
            <UploadCloud className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-semibold">Drop screenshots here</p>
            <p className="text-xs text-slate-600 mt-1">PNG, JPG, WebP — multiple files supported</p>
          </div>
        )}

        {/* Attachment list (for upload mode or when files added) */}
        {attachments.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">Attached files</span>
            {attachments.map(att => (
              <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#080C16] border border-[#1A2138]">
                {att.previewUrl
                  ? <img src={att.previewUrl} className="w-10 h-7 rounded object-cover shrink-0" alt={att.name} />
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
      </div>

      {/* ── Step 3: Continuation goal ─────────────────────────────────────────── */}
      <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 block">
          03 · Continuation Goal
        </span>
        <textarea
          value={continuationGoal}
          onChange={e => setContinuationGoal(e.target.value)}
          placeholder={`What do you want to continue or focus on next?\n\ne.g. "Continue building the authentication system — we stopped at implementing JWT refresh tokens"\ne.g. "Summarize what we've done and then continue with the essay's third section"`}
          className="w-full h-24 bg-[#080C16] border border-[#1A2138] focus:border-slate-600 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-sans leading-relaxed"
        />

        <button
          onClick={() => handleBridge(false)}
          disabled={isGenerating || (!chatHistory.trim() && attachments.length === 0)}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${targetModel.textClass}`}
          style={{ background: `linear-gradient(135deg, ${targetModel.accentHex}20, ${targetModel.accentHex}08)`, border: `1px solid ${targetModel.accentHex}40` }}>
          {isGenerating ? (
            <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />Building Bridge to {targetModel.shortName}…</>
          ) : (
            <><Sparkles className="w-4 h-4" />Build Bridge Prompt for {targetModel.shortName}<ArrowRight className="w-4 h-4" /></>
          )}
        </button>
      </div>

      {/* ── Output ────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {result && !isGenerating && (
          <motion.div ref={outputRef} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="space-y-4 animate-fade-up">

            {/* Context Summary (collapsible) */}
            <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl overflow-hidden">
              <button
                onClick={() => setSummaryOpen(p => !p)}
                className="w-full flex items-center justify-between p-4 text-left cursor-pointer hover:bg-[#111830] transition">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                  Context Summary (what the AI extracted)
                </span>
                {summaryOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {summaryOpen && (
                <div className="px-4 pb-4 border-t border-[#1A2138]">
                  <pre className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-sans mt-3">{result.contextSummary}</pre>
                </div>
              )}
            </div>

            {/* Extracted Variables Parameter Editor */}
            <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-[#1A2138] pb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-cyan-400">
                  Extracted Technical Parameters (editable)
                </span>
                <button
                  onClick={() => setVariables(v => [...v, { key: "New Parameter", value: "" }])}
                  className="text-[10px] font-bold text-cyan-400 hover:text-white px-2 py-1 bg-[#080C16] border border-[#1A2138] rounded transition cursor-pointer flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add Row
                </button>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {variables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.key}
                      onChange={e => {
                        const newVars = [...variables];
                        newVars[idx].key = e.target.value;
                        setVariables(newVars);
                      }}
                      placeholder="Variable name"
                      className="w-1/3 bg-[#080C16] border border-[#1A2138] focus:border-cyan-600/50 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={e => {
                        const newVars = [...variables];
                        newVars[idx].value = e.target.value;
                        setVariables(newVars);
                      }}
                      placeholder="Value"
                      className="flex-1 bg-[#080C16] border border-[#1A2138] focus:border-cyan-600/50 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                    />
                    <button
                      onClick={() => setVariables(v => v.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-red-400 transition p-1 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {variables.length === 0 && (
                  <p className="text-[10px] text-slate-600 italic">No parameters extracted. Click "Add Row" to define one.</p>
                )}
              </div>
            </div>

            {/* Bridge Prompt */}
            <div className={`bg-[#0D1225] border rounded-2xl p-5 space-y-3 ${targetModel.borderClass}`}
              style={{ borderColor: `${targetModel.accentHex}30` }}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-widest ${targetModel.textClass}`}>
                  Bridge Prompt → {targetModel.name}
                </span>
                <a href={targetModel.url} target="_blank" rel="noreferrer"
                  className={`flex items-center gap-1 text-[10px] ${targetModel.textClass} hover:underline`}>
                  Open {targetModel.shortName} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="bg-[#080C16] border border-[#1A2138] rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto select-all">
                {result.bridgePrompt}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCopy(result.bridgePrompt, "main")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                    copiedMain ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-400"
                      : `${targetModel.bgClass} ${targetModel.borderClass} ${targetModel.textClass} hover:opacity-80`
                  }`}>
                  {copiedMain ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Bridge Prompt</>}
                </button>
                <button onClick={() => handleDownload(result.bridgePrompt, "bridge")}
                  className="p-2.5 rounded-lg bg-[#080C16] border border-[#1A2138] text-slate-500 hover:text-white transition cursor-pointer"
                  title="Download Markdown">
                  <Download className="w-4 h-4" />
                </button>
                <button onClick={exportToJupyter}
                  className="p-2.5 rounded-lg bg-[#080C16] border border-[#1A2138] text-slate-500 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title="Export to Jupyter Notebook (.ipynb)">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">Export Notebook</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Reflective questions (optional wizard) ───────────────────────────── */}
      <AnimatePresence>
        {result && result.reflectiveQuestions?.length > 0 && showQuestions && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Refine the Bridge with Questions Wizard
                  <span className="ml-2 text-[9px] text-slate-600 normal-case tracking-normal font-normal">(optional)</span>
                </span>
                <p className="text-xs text-slate-500 mt-0.5">These questions fill gaps the AI spotted in your conversation history.</p>
              </div>
              <button onClick={() => setShowQuestions(false)} className="text-slate-600 hover:text-slate-300 transition cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Wizard Steps Progress */}
            <div className="flex items-center gap-1.5 pb-1">
              {result.reflectiveQuestions.map((q, idx) => (
                <div key={q.id} className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentQIdx ? `w-8 bg-cyan-500` :
                  questionAnswers[q.id]?.trim() ? `w-2 bg-emerald-500` : `w-2 bg-[#1A2138]`
                }`} />
              ))}
              <span className="text-[10px] text-slate-500 ml-2 font-semibold">
                Question {currentQIdx + 1} of {result.reflectiveQuestions.length}
              </span>
            </div>

            {/* Question card (active step) */}
            {activeQ && (
              <div className="p-4 rounded-xl border bg-[#080C16] border-[#1A2138] relative overflow-hidden">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-400">Q{currentQIdx + 1}</span>
                  <p className="text-sm font-semibold text-slate-200 leading-snug">{activeQ.question}</p>
                </div>
                <p className="text-xs text-slate-400 mb-3 leading-relaxed">{activeQ.helperText}</p>
                <textarea
                  value={questionAnswers[activeQ.id] || ""}
                  onChange={e => setQuestionAnswers(prev => ({ ...prev, [activeQ.id]: e.target.value }))}
                  placeholder="Optional answer…"
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
                      handleBridge(true);
                    }
                  }}
                  className={`flex items-center gap-1 text-[11px] font-bold px-3 py-2 rounded-lg transition cursor-pointer ${
                    currentQIdx < result.reflectiveQuestions.length - 1 ? "bg-slate-800 text-white hover:bg-slate-700" : "text-cyan-400 bg-cyan-950/25 border border-cyan-900/45 hover:bg-cyan-950/40"
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
                      handleBridge(true);
                    }
                  }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 px-2.5 py-2 transition cursor-pointer">
                  Skip this question
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => handleBridge(true)} disabled={isRefining}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-cyan-400 bg-cyan-950/25 border border-cyan-900/40 transition cursor-pointer disabled:opacity-40 hover:bg-cyan-950/40">
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

            <AnimatePresence>
              {refinedPrompt && !isRefining && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl border space-y-3 ${targetModel.bgClass} ${targetModel.borderClass}`}>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${targetModel.textClass}`}>
                    ✦ Refined Bridge Prompt
                  </span>
                  <div className="bg-[#080C16] border border-[#1A2138] rounded-xl p-4 font-mono text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto select-all">
                    {refinedPrompt}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleCopy(refinedPrompt, "refined")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                        copiedRefined ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-400"
                          : `${targetModel.borderClass} ${targetModel.textClass} hover:opacity-80`
                      }`}>
                      {copiedRefined ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Refined Bridge</>}
                    </button>
                    <button onClick={() => handleDownload(refinedPrompt, "refined-bridge")}
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
    </div>
  );
}
