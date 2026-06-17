import { useState, useEffect } from "react";
import {
  Sparkles, Copy, Check, RotateCcw, Layers, Brain, Cpu, Zap,
  Send, ArrowRight, ArrowLeft, Clock, Trash2, Download,
  AlertTriangle, Lightbulb, FileText, Paperclip, UploadCloud,
  FileCheck, BookOpen, GraduationCap, X,
  Target, Rocket, PenLine, FlaskConical, Presentation, Landmark, Globe, Newspaper
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { Question, OptimizationProfile, PromptAnalysis, HistoryItem, GenerationState, Attachment } from "../types";
import { OPTIMIZATION_PROFILES } from "../data";
import { STUDENT_PRESETS, STUDENT_LEVELS, fillPresetTemplate } from "../data/studentPresets";
import type { StudentLevel } from "../data/studentPresets";
import NotebookLMSuite from "./NotebookLMSuite";

type StudentTab = "prompts" | "notebooklm";

function renderProfileIcon(icon: string) {
  const cls = "w-4 h-4";
  if (icon === "Cpu") return <Cpu className={cls} />;
  if (icon === "Layers") return <Layers className={cls} />;
  if (icon === "Zap") return <Zap className={cls} />;
  return <Brain className={cls} />;
}

const PRESET_ICONS: Record<string, any> = {
  BookOpen, GraduationCap, Target, Rocket, Lightbulb, PenLine,
  FileCheck, FlaskConical, Presentation, Landmark, Globe, Newspaper, Brain, FileText,
};

export default function StudentSuite() {
  const [studentTab, setStudentTab] = useState<StudentTab>("prompts");
  const [activeLevel, setActiveLevel] = useState<StudentLevel>("college");
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const [tplCopied, setTplCopied] = useState(false);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("student_prompt_history") || "[]"); }
    catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem("student_prompt_history", JSON.stringify(history));
  }, [history]);

  const [state, setState] = useState<GenerationState>({
    appIdea: "", isLoadingQuestions: false, questions: [],
    currentQuestionIndex: 0, answers: {},
    selectedProfileId: "token-saving", generatedPrompt: "",
    isGeneratingPrompt: false, analysis: null, attachments: []
  });

  const [activeStep, setActiveStep] = useState<"ideation" | "questions" | "result">("ideation");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // ─── File upload ─────────────────────────────────────────────────────────────
  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    setErrorMessage(null);
    Array.from(files).forEach(file => {
      if (file.size > 50 * 1024 * 1024) { setErrorMessage(`"${file.name}" exceeds 50 MB.`); return; }
      const reader = new FileReader();
      const isImage = file.type.startsWith("image/");
      const isText = file.type.startsWith("text/") ||
        ["json","ts","tsx","js","jsx","sql","py","csv","md","yaml","yml"].some(ext => file.name.endsWith(`.${ext}`));
      reader.onload = e => {
        const content = e.target?.result as string;
        setState(prev => {
          const list = prev.attachments || [];
          if (list.some(a => a.name === file.name && a.size === file.size)) return prev;
          return { ...prev, attachments: [...list, {
            id: Math.random().toString(36).substring(2, 9),
            name: file.name, type: file.type || "application/octet-stream",
            size: file.size, content,
            previewUrl: isImage ? content : undefined
          }]};
        });
      };
      if (isImage) reader.readAsDataURL(file);
      else if (isText) reader.readAsText(file);
      else reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) =>
    setState(prev => ({ ...prev, attachments: (prev.attachments || []).filter(a => a.id !== id) }));

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragActive(false);
    handleFileUpload(e.dataTransfer.files);
  };

  // ─── Step 1: Generate questions ───────────────────────────────────────────────
  const generateQuestions = async () => {
    if (!state.appIdea.trim()) { setErrorMessage("Describe your study task or goal first."); return; }
    setState(prev => ({ ...prev, isLoadingQuestions: true, questions: [], currentQuestionIndex: 0, answers: {} }));
    setErrorMessage(null);
    try {
      const res = await fetch("/api/generate-questions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appIdea: state.appIdea })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate questions.");
      if (!data.questions?.length) throw new Error("No questions returned. Try rephrasing your idea.");
      setState(prev => ({ ...prev, questions: data.questions, isLoadingQuestions: false }));
      setActiveStep("questions");
    } catch (err: any) {
      setErrorMessage(err.message);
      setState(prev => ({ ...prev, isLoadingQuestions: false }));
    }
  };

  // ─── Step 2: Answer handling ─────────────────────────────────────────────────
  const handleAnswerSubmit = (value: string) => {
    const q = state.questions[state.currentQuestionIndex];
    if (!q) return;
    setState(prev => {
      const updated = { ...prev.answers, [q.id]: value };
      const isLast = prev.currentQuestionIndex >= prev.questions.length - 1;
      return { ...prev, answers: updated, currentQuestionIndex: isLast ? prev.currentQuestionIndex : prev.currentQuestionIndex + 1 };
    });
  };

  const skipAll = () => {
    const filled: Record<string, string> = {};
    state.questions.forEach(q => { filled[q.id] = state.answers[q.id] || "Not specified"; });
    setState(prev => ({ ...prev, answers: filled }));
    compileFinalPrompt(filled);
  };

  // ─── Step 3: Compile prompt ───────────────────────────────────────────────────
  const compileFinalPrompt = async (forcedAnswers?: Record<string, string>) => {
    setState(prev => ({ ...prev, isGeneratingPrompt: true }));
    setErrorMessage(null);
    const answersToSubmit = forcedAnswers || state.answers;
    try {
      const res = await fetch("/api/generate-prompt", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appIdea: state.appIdea, answers: answersToSubmit,
          profileId: state.selectedProfileId, attachments: state.attachments || []
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Compilation failed.");
      setState(prev => ({ ...prev, generatedPrompt: data.optimizedPrompt, analysis: data.analysis, isGeneratingPrompt: false }));
      setHistory(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · " + new Date().toLocaleDateString([], { month: "short", day: "numeric" }),
        appIdea: state.appIdea, optimizedPrompt: data.optimizedPrompt,
        profileId: state.selectedProfileId, answers: answersToSubmit, attachments: state.attachments || []
      }, ...prev]);
      setActiveStep("result");
    } catch (err: any) {
      setErrorMessage(err.message);
      setState(prev => ({ ...prev, isGeneratingPrompt: false }));
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(state.generatedPrompt);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const downloadMarkdown = () => {
    const el = document.createElement("a");
    el.href = URL.createObjectURL(new Blob([state.generatedPrompt], { type: "text/markdown" }));
    el.download = `student-prompt-${state.appIdea.substring(0, 25).replace(/\s+/g, "-").toLowerCase()}.md`;
    el.click();
  };

  const exportFlashcardsCSV = () => {
    const text = state.generatedPrompt;
    if (!text) return;
    const lines = text.split("\n");
    const cards: [string, string][] = [];
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      if (trimmed.includes("|")) {
        const parts = trimmed.split("|");
        if (parts.length >= 2) {
          cards.push([parts[0].trim(), parts[1].trim()]);
          return;
        }
      }
      if (trimmed.includes(":") && !trimmed.includes("://") && !trimmed.startsWith("http") && !trimmed.startsWith("#")) {
        const parts = trimmed.split(":");
        if (parts.length === 2 && parts[0].length > 3 && parts[1].length > 3) {
          cards.push([parts[0].trim(), parts[1].trim()]);
        }
      }
    });
    if (cards.length === 0) {
      alert("No flashcards detected in the output prompt. Format should be 'Front | Back'.");
      return;
    }
    const csvContent = cards
      .map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `anki-flashcards-${Date.now()}.csv`;
    a.click();
  };

  const resetWorkspace = () => {
    setState({ appIdea: "", isLoadingQuestions: false, questions: [], currentQuestionIndex: 0, answers: {}, selectedProfileId: "token-saving", generatedPrompt: "", isGeneratingPrompt: false, analysis: null, attachments: [] });
    setActiveStep("ideation"); setErrorMessage(null);
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setState({ appIdea: item.appIdea, isLoadingQuestions: false,
      questions: Object.entries(item.answers).map(([key, val]) => ({ id: key, question: `Scope: ${key}`, helperText: `"${val}"` })),
      currentQuestionIndex: 0, answers: item.answers, selectedProfileId: item.profileId as any,
      generatedPrompt: item.optimizedPrompt, isGeneratingPrompt: false, analysis: null, attachments: item.attachments || []
    });
    setActiveStep("result"); setShowHistory(false);
  };

  const deleteHistoryItem = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setHistory(prev => prev.filter(i => i.id !== id));
  };

  const currentQ = state.questions[state.currentQuestionIndex];
  const [answerInput, setAnswerInput] = useState("");

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-400" />
            Student Suite
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">Academic prompt builder + NotebookLM tools</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowHistory(true)}
            className="relative flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-[#0D1225] hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-[#1A2138] transition cursor-pointer">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> History
            {history.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{history.length}</span>
            )}
          </button>
          {(state.generatedPrompt || activeStep !== "ideation") && (
            <button onClick={resetWorkspace}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#0D1225] hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-[#1A2138] transition cursor-pointer">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab nav */}
      <div className="flex bg-[#0D1225] p-1 rounded-xl border border-[#1A2138] w-fit gap-1">
        <button onClick={() => setStudentTab("prompts")}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            studentTab === "prompts" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/50" : "text-slate-500 hover:text-slate-300"
          }`}>
          <Sparkles className="w-3.5 h-3.5" /> AI Prompt Builder
        </button>
        <button onClick={() => setStudentTab("notebooklm")}
          className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg transition cursor-pointer ${
            studentTab === "notebooklm" ? "bg-violet-950/50 text-violet-400 border border-violet-900/50" : "text-slate-500 hover:text-slate-300"
          }`}>
          <BookOpen className="w-3.5 h-3.5" /> NotebookLM Suite
        </button>
      </div>

      {/* Error */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-3 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="ml-auto font-bold text-red-400">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Prompt Builder tab ──────────────────────────────────────────────────── */}
      {studentTab === "prompts" && (
        <>
          {/* STEP: IDEATION */}
          {activeStep === "ideation" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-5">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">
                      <span className="text-emerald-400">01.</span> Your Study Task
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Describe what you need help with — notes, research, interview prep, resume, etc.</p>
                  </div>

                  <textarea
                    value={state.appIdea}
                    onChange={e => { setState(prev => ({ ...prev, appIdea: e.target.value })); setErrorMessage(null); }}
                    placeholder="e.g. I need to generate active-recall study notes and flashcards from my macroeconomics lecture on open-economy models, IS-LM curves, and the Mundell-Fleming framework..."
                    className="w-full h-40 bg-[#080C16] border border-[#1A2138] focus:border-emerald-700/60 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
                  />

                  {/* Level selector + structured presets */}
                  <div className="space-y-3 border-t border-[#1A2138] pt-4">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Choose your level, then a structured preset
                    </span>

                    <div className="flex flex-wrap gap-1.5">
                      {STUDENT_LEVELS.map(lvl => {
                        const Icon = PRESET_ICONS[lvl.iconName] || Lightbulb;
                        const on = activeLevel === lvl.id;
                        return (
                          <button key={lvl.id} title={lvl.blurb}
                            onClick={() => { setActiveLevel(lvl.id); setActivePresetId(null); }}
                            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${on ? lvl.activeClass : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"}`}>
                            <Icon className="w-3.5 h-3.5" /> {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500">{STUDENT_LEVELS.find(l => l.id === activeLevel)?.blurb}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {STUDENT_PRESETS.filter(p => p.level === activeLevel).map(item => {
                        const Icon = PRESET_ICONS[item.iconName] || Lightbulb;
                        const isSelected = activePresetId === item.id;
                        
                        // Active level color maps
                        let activeBorderCls = "bg-emerald-950/20 border-emerald-700/50";
                        let activeIconColor = "text-emerald-400";
                        if (activeLevel === "school") {
                          activeBorderCls = "bg-sky-950/20 border-sky-700/50";
                          activeIconColor = "text-sky-400";
                        } else if (activeLevel === "competitive") {
                          activeBorderCls = "bg-amber-950/20 border-amber-700/50";
                          activeIconColor = "text-amber-400";
                        } else if (activeLevel === "professional") {
                          activeBorderCls = "bg-violet-950/20 border-violet-700/50";
                          activeIconColor = "text-violet-400";
                        }

                        return (
                          <button key={item.id}
                            onClick={() => {
                              setState(prev => ({ ...prev, appIdea: item.defaultIdea, questions: item.questions, currentQuestionIndex: 0, answers: {} }));
                              setActivePresetId(item.id); setErrorMessage(null);
                            }}
                            className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? activeBorderCls : "bg-[#080C16]/50 border-transparent hover:border-[#1A2138]/60 hover:bg-[#080C16]"}`}>
                            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 mb-0.5">
                              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? activeIconColor : "text-slate-500"}`} /> {item.title}
                            </span>
                            <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{item.description}</p>
                          </button>
                        );
                      })}
                    </div>

                    {activePresetId && (() => {
                      const preset = STUDENT_PRESETS.find(p => p.id === activePresetId)!;
                      const filled = fillPresetTemplate(preset, state.appIdea, state.answers);
                      
                      let borderLeftColor = "border-l-emerald-500/60";
                      let textColor = "text-emerald-400";
                      let copyBtnClass = "bg-emerald-950/40 border-emerald-700/40 text-emerald-400";
                      
                      if (activeLevel === "school") {
                        borderLeftColor = "border-l-sky-500/60";
                        textColor = "text-sky-400";
                        copyBtnClass = "bg-sky-950/40 border-sky-700/40 text-sky-400";
                      } else if (activeLevel === "competitive") {
                        borderLeftColor = "border-l-amber-500/60";
                        textColor = "text-amber-400";
                        copyBtnClass = "bg-amber-950/40 border-amber-700/40 text-amber-400";
                      } else if (activeLevel === "professional") {
                        borderLeftColor = "border-l-violet-500/60";
                        textColor = "text-violet-400";
                        copyBtnClass = "bg-violet-950/40 border-violet-700/40 text-violet-400";
                      }

                      return (
                        <div className={`bg-[#080C16]/50 border-l-2 ${borderLeftColor} rounded-r-xl p-3.5 space-y-2`}>
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] uppercase font-bold tracking-wider ${textColor} flex items-center gap-1`}>
                              <FileText className="w-3 h-3" /> Structured template — copy &amp; use in any AI
                            </span>
                            <button onClick={() => { navigator.clipboard.writeText(filled); setTplCopied(true); setTimeout(() => setTplCopied(false), 2000); }}
                              className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition cursor-pointer ${tplCopied ? copyBtnClass : "bg-[#0D1225] border-[#1A2138] text-slate-300 hover:text-white"}`}>
                              {tplCopied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                            </button>
                          </div>
                          <pre className="text-[10px] text-slate-400 whitespace-pre-wrap font-mono leading-relaxed max-h-44 overflow-y-auto">{filled}</pre>
                          <p className="text-[9px] text-slate-500">Placeholders in […] fill automatically as you answer the questions, or edit them yourself.</p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* File upload */}
                  <div className="space-y-3 border-t border-[#1A2138] pt-4">
                    <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">02.</span> Reference Files
                    </h3>
                    <div onDragEnter={e => { e.preventDefault(); setDragActive(true); }} onDragOver={e => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}
                      className={`relative border border-dashed rounded-xl p-5 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${dragActive ? "border-emerald-600 bg-emerald-950/10" : "border-[#1A2138] hover:border-slate-700 hover:bg-[#080C16]"}`}>
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" multiple onChange={e => handleFileUpload(e.target.files)} />
                      <UploadCloud className="w-6 h-6 text-slate-600" />
                      <p className="text-xs text-slate-400">Drag & drop or <span className="text-emerald-400">browse</span> · 50MB max</p>
                    </div>
                    {(state.attachments || []).length > 0 && (
                      <div className="space-y-1.5">
                        {(state.attachments || []).map(att => {
                          const sizeMB = att.size > 1024 * 1024 ? `${(att.size / 1024 / 1024).toFixed(1)} MB` : `${(att.size / 1024).toFixed(0)} KB`;
                          return (
                            <div key={att.id} className="flex items-center gap-2 p-2 rounded-lg bg-[#080C16]/50 border border-transparent hover:border-[#1A2138]/50">
                              {att.previewUrl
                                ? <img src={att.previewUrl} className="w-8 h-8 rounded object-cover shrink-0" alt={att.name} />
                                : <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                              <div className="flex-1 overflow-hidden">
                                <div className="text-xs text-slate-200 truncate">{att.name}</div>
                                <div className="text-[9px] text-slate-500 font-mono">{sizeMB}</div>
                              </div>
                              <button onClick={() => removeAttachment(att.id)} className="text-slate-600 hover:text-red-400 transition p-0.5 cursor-pointer">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Optimization profile */}
                <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-4">
                  <h3 className="font-bold text-white flex items-center gap-2">
                    <span className="text-emerald-400">03.</span> Output Style
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {OPTIMIZATION_PROFILES.map(profile => {
                      const isSelected = state.selectedProfileId === profile.id;
                      return (
                        <button key={profile.id}
                          onClick={() => setState(prev => ({ ...prev, selectedProfileId: profile.id }))}
                          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${isSelected ? "bg-emerald-950/10 border-emerald-500/40 shadow-lg" : "bg-[#080C16]/50 border-transparent hover:border-[#1A2138]/60 hover:bg-[#080C16]"}`}>
                          {isSelected && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`p-1.5 rounded-lg ${isSelected ? "bg-slate-800 text-emerald-400" : "bg-[#080C16] text-slate-500"}`}>
                              {renderProfileIcon(profile.icon)}
                            </div>
                            <span className={`text-xs font-semibold ${isSelected ? "text-white" : "text-slate-300"}`}>{profile.name}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed line-clamp-2">{profile.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-end">
                  {state.questions?.length > 0 && (
                    <button onClick={() => { setActiveStep("questions"); setErrorMessage(null); }}
                      className="flex items-center justify-center gap-2 bg-emerald-900/30 border border-emerald-700/40 text-emerald-400 font-bold px-6 py-3.5 rounded-xl text-sm transition cursor-pointer hover:bg-emerald-900/50">
                      <Sparkles className="w-4 h-4" /> Use Loaded Questions <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={generateQuestions} disabled={state.isLoadingQuestions || !state.appIdea.trim()}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold px-6 py-3.5 rounded-xl text-sm transition disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/30 cursor-pointer">
                    {state.isLoadingQuestions
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Generating…</>
                      : <><Sparkles className="w-4 h-4" />Generate Scoping Questions<ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" /> Prompting Tips
                  </span>
                  {[
                    { t: "Be specific", d: "Include subject area, exam type, and output format (e.g. 'Anki flashcards for B.Com Semester IV')" },
                    { t: "Add context", d: "Mention your level (undergraduate, postgraduate) and any specific textbooks or topics" },
                    { t: "Attach materials", d: "Upload lecture slides, PDFs, or notes for higher accuracy and relevance" }
                  ].map(tip => (
                    <div key={tip.t} className="p-2.5 rounded-lg bg-[#080C16]/50 border border-transparent hover:border-[#1A2138]/50">
                      <p className="text-xs font-semibold text-slate-200 mb-0.5">{tip.t}</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">{tip.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP: QUESTIONS */}
          {activeStep === "questions" && (
            <div className="max-w-2xl mx-auto space-y-5">
              <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white">Scoping Questions</h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {state.currentQuestionIndex + 1} / {state.questions.length}
                  </span>
                </div>
                {/* Progress */}
                <div className="w-full h-1 bg-[#1A2138] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${((state.currentQuestionIndex + 1) / state.questions.length) * 100}%` }} />
                </div>

                {currentQ && (
                  <div className="space-y-3 animate-fade-up">
                    <p className="text-base font-semibold text-white">{currentQ.question}</p>
                    <p className="text-xs text-slate-400">{currentQ.helperText}</p>
                    <textarea
                      value={answerInput}
                      onChange={e => setAnswerInput(e.target.value)}
                      placeholder="Your answer…"
                      className="w-full h-28 bg-[#080C16] border border-[#1A2138] focus:border-emerald-700/60 rounded-xl p-3.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none"
                      onKeyDown={e => {
                        if (e.key === "Enter" && e.metaKey) {
                          handleAnswerSubmit(answerInput);
                          setAnswerInput("");
                        }
                      }}
                    />
                    <div className="flex items-center gap-3">
                      {state.currentQuestionIndex > 0 && (
                        <button onClick={() => setState(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex - 1 }))}
                          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-[#080C16] border border-[#1A2138] px-3 py-2 rounded-lg transition cursor-pointer">
                          <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                      )}
                      <button onClick={() => { handleAnswerSubmit(answerInput || "Not specified"); setAnswerInput(""); }}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-sm py-2.5 rounded-xl transition cursor-pointer">
                        {state.currentQuestionIndex >= state.questions.length - 1
                          ? <><Sparkles className="w-4 h-4" />Build Prompt</>
                          : <>Next <ArrowRight className="w-4 h-4" /></>
                        }
                      </button>
                    </div>
                  </div>
                )}

                {/* Show compile button after last Q */}
                {state.currentQuestionIndex >= state.questions.length - 1 && state.answers[currentQ?.id || ""] && (
                  <button onClick={() => compileFinalPrompt()}
                    disabled={state.isGeneratingPrompt}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl text-sm transition disabled:opacity-40 cursor-pointer">
                    {state.isGeneratingPrompt
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Compiling…</>
                      : <><Sparkles className="w-4 h-4" />Compile Final Prompt</>
                    }
                  </button>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-[#1A2138]">
                  <button onClick={() => setActiveStep("ideation")}
                    className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Back to idea
                  </button>
                  <button onClick={skipAll}
                    className="text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer">
                    Skip all & compile
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP: RESULT */}
          {activeStep === "result" && (
            <div className="space-y-4">
              <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-[#1A2138]">
                  <h3 className="font-bold text-white text-sm">Generated Prompt</h3>
                  <div className="flex items-center gap-2">
                    {state.generatedPrompt && (state.generatedPrompt.includes("|") || state.generatedPrompt.includes(":")) && (
                      <button onClick={exportFlashcardsCSV}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-indigo-950/45 hover:bg-indigo-900/45 text-indigo-400 border border-indigo-900/50 transition cursor-pointer"
                        title="Export Flashcards to Anki CSV">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Export Anki CSV</span>
                      </button>
                    )}
                    <button onClick={copyToClipboard}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg border transition cursor-pointer ${copied ? "bg-emerald-950/30 border-emerald-700/40 text-emerald-400" : "bg-emerald-700 hover:bg-emerald-600 border-emerald-700 text-white"}`}>
                      {copied ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
                    </button>
                    <button onClick={downloadMarkdown}
                      className="p-2 rounded-lg text-slate-400 hover:text-white bg-[#080C16] border border-[#1A2138] transition cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-5 max-h-[600px] overflow-y-auto">
                  <div className="markdown-body text-slate-300 text-sm leading-relaxed">
                    <Markdown components={{
                      h1: ({ children }) => <h1 className="text-base font-bold text-white border-b border-[#1A2138] pb-2 mt-6 mb-3">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mt-5 mb-2">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mt-4 mb-1">{children}</h3>,
                      p: ({ children }) => <p className="text-slate-300 text-xs leading-relaxed mb-3">{children}</p>,
                      code: ({ children }) => <code className="bg-[#080C16] text-amber-400 font-mono text-[11px] px-1.5 py-0.5 rounded border border-[#1A2138]">{children}</code>,
                      ul: ({ children }) => <ul className="list-disc text-slate-300 mb-3 pl-4 space-y-1 text-xs">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal text-slate-300 mb-3 pl-4 space-y-1 text-xs">{children}</ol>,
                      blockquote: ({ children }) => <blockquote className="border-l-2 border-emerald-500/50 bg-emerald-950/10 px-3 py-1 text-xs text-slate-400 italic rounded-r-lg my-3">{children}</blockquote>
                    }}>
                      {state.generatedPrompt}
                    </Markdown>
                  </div>
                </div>
              </div>

              {/* Analysis */}
              {state.analysis && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0D1225] border border-[#1A2138] rounded-xl p-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">Efficiency Score</span>
                    <span className="text-2xl font-bold text-white">{state.analysis.efficiencyScore}<span className="text-sm text-slate-500">/100</span></span>
                  </div>
                  <div className="bg-[#0D1225] border border-[#1A2138] rounded-xl p-4 sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1.5">Recommendations</span>
                    <ul className="space-y-1">
                      {state.analysis.recommendations.slice(0, 2).map((r, i) => (
                        <li key={i} className="text-[11px] text-slate-400 flex items-start gap-1.5">
                          <span className="text-emerald-500 shrink-0 mt-0.5">›</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── NotebookLM tab ──────────────────────────────────────────────────────── */}
      {studentTab === "notebooklm" && <NotebookLMSuite />}

      {/* History panel */}
      <AnimatePresence>
        {showHistory && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)} className="fixed inset-0 bg-black z-40 cursor-pointer" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              className="fixed top-0 right-0 h-full w-[400px] max-w-full bg-[#0D1225] border-l border-[#1A2138] shadow-2xl z-50 flex flex-col">
              <div className="p-4 border-b border-[#1A2138] flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-sm">Saved Prompts</span>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-1 px-2 text-slate-400 hover:text-white hover:bg-[#1A2138] rounded transition font-bold cursor-pointer">×</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-600 space-y-2">
                    <FileText className="w-7 h-7 mx-auto stroke-1" />
                    <p className="text-xs">No saved prompts yet.</p>
                  </div>
                ) : history.map(item => (
                  <div key={item.id} onClick={() => loadHistoryItem(item)}
                    className="p-3.5 rounded-xl bg-[#080C16] border border-[#1A2138] hover:border-emerald-700/40 transition cursor-pointer group space-y-2">
                    <div className="flex justify-between items-center gap-2">
                      <span className="text-[9px] font-mono uppercase tracking-wide bg-[#0D1225] text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/30">{item.profileId}</span>
                      <span className="text-[10px] text-slate-500">{item.timestamp}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-100 line-clamp-2 leading-relaxed">"{item.appIdea}"</p>
                    <div className="flex justify-between items-center pt-1 border-t border-[#1A2138]">
                      <span className="text-[10px] text-emerald-400 font-semibold group-hover:underline flex items-center gap-1">
                        Load <ArrowRight className="w-3 h-3" />
                      </span>
                      <button onClick={e => deleteHistoryItem(e, item.id)}
                        className="p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-950/20 transition cursor-pointer">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
