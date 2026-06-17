import { useState, useEffect } from "react";
import { Bot, Sparkles, Link2, GraduationCap, Image as ImageIcon, Library, KeyRound, AlertTriangle, X, History, Briefcase, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import PromptForge from "./components/PromptForge";
import ContextBridge from "./components/ContextBridge";
import StudentSuite from "./components/StudentSuite";
import ImagePromptStudio from "./components/ImagePromptStudio";
import ResourceHub from "./components/ResourceHub";
import ApiKeyModal from "./components/ApiKeyModal";
import HistoryDrawer from "./components/HistoryDrawer";
import CareerHub from "./components/CareerHub";
import UserManual from "./components/UserManual";
import { hasApiKey } from "./lib/api";
import { setCurrentTool } from "./lib/history";

type MainTab = "forge" | "bridge" | "student" | "image" | "resources" | "career" | "guide";

const TABS: {
  id: MainTab;
  label: string;
  icon: React.ElementType;
  desc: string;
  activeText: string;
  activeBg: string;
  underlineBg: string;
  accentHex: string;
}[] = [
  {
    id: "guide",
    label: "User Guide",
    icon: BookOpen,
    desc: "Step-by-step tutorial & FAQ",
    activeText: "text-orange-400",
    activeBg: "bg-orange-950/20",
    underlineBg: "bg-orange-500",
    accentHex: "#F97316"
  },
  {
    id: "forge",
    label: "Prompt Forge",
    icon: Sparkles,
    desc: "AI-specific prompt generation",
    activeText: "text-indigo-400",
    activeBg: "bg-indigo-950/20",
    underlineBg: "bg-indigo-500",
    accentHex: "#6366F1"
  },
  {
    id: "bridge",
    label: "Context Bridge",
    icon: Link2,
    desc: "Cross-AI context continuation",
    activeText: "text-cyan-400",
    activeBg: "bg-cyan-950/20",
    underlineBg: "bg-cyan-500",
    accentHex: "#06B6D4"
  },
  {
    id: "student",
    label: "Student Suite",
    icon: GraduationCap,
    desc: "Academic tools & NotebookLM",
    activeText: "text-emerald-400",
    activeBg: "bg-emerald-950/20",
    underlineBg: "bg-emerald-500",
    accentHex: "#10B981"
  },
  {
    id: "image",
    label: "Image Studio",
    icon: ImageIcon,
    desc: "Gemini / DALL·E / FLUX / Midjourney / SD",
    activeText: "text-rose-400",
    activeBg: "bg-rose-950/20",
    underlineBg: "bg-rose-500",
    accentHex: "#F43F5E"
  },
  {
    id: "resources",
    label: "Resource Hub",
    icon: Library,
    desc: "Trusted free-first resources",
    activeText: "text-amber-400",
    activeBg: "bg-amber-950/20",
    underlineBg: "bg-amber-500",
    accentHex: "#F59E0B"
  },
  {
    id: "career",
    label: "Career Hub",
    icon: Briefcase,
    desc: "SQL, B.Com pathways & Emerging roles",
    activeText: "text-violet-400",
    activeBg: "bg-violet-950/20",
    underlineBg: "bg-violet-500",
    accentHex: "#8B5CF6"
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTab>("guide");
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);

  // Open the setup modal on first visit (no key yet), and whenever the server
  // reports a missing key (401 from any /api/ call).
  useEffect(() => {
    if (!hasApiKey()) setKeyModalOpen(true);
    const onRequired = () => setKeyModalOpen(true);
    window.addEventListener("api-key-required", onRequired);
    return () => window.removeEventListener("api-key-required", onRequired);
  }, []);

  // Synchronize active tab with history tool name
  useEffect(() => {
    const tabDef = TABS.find(t => t.id === activeTab);
    if (tabDef) {
      setCurrentTool(tabDef.label);
    }
  }, [activeTab]);

  const activeTabDef = TABS.find(t => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-200 dot-grid-bg">

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#151C30] bg-[#070B14]/95 backdrop-blur-md sticky top-0 z-30 px-5 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="relative w-9 h-9 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 rounded-xl opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 rounded-xl blur-sm opacity-40" />
              <Bot className="relative w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 leading-tight">
                AI Prompt Studio
                <span className="text-[9px] font-mono tracking-widest uppercase bg-[#111828] text-indigo-400 px-2 py-0.5 rounded border border-indigo-900/50">v2.0</span>
              </h1>
              <p className="text-[11px] text-slate-600 leading-tight">
                Prompt engineering for free AI models — no paid plans required
              </p>
            </div>
          </div>

          {/* Right side: API key + active tab indicator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHistoryDrawerOpen(true)}
              className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-[#1A2138] bg-[#080C16] text-slate-300 hover:text-white transition cursor-pointer"
              title="View your clipboard/prompt history"
            >
              <History className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button
              onClick={() => setKeyModalOpen(true)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${hasApiKey() ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/50 hover:border-emerald-700/60" : "text-amber-400 bg-amber-950/20 border-amber-900/50 hover:border-amber-700/60"}`}
              title={hasApiKey() ? "API key set — click to change" : "Add your free Gemini API key"}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{hasApiKey() ? "API Key" : "Add API Key"}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasApiKey() ? "bg-emerald-400" : "bg-amber-400"}`} />
            </button>

            <div
              className={`hidden sm:flex items-center gap-1.5 text-[11px] font-semibold ${activeTabDef.activeText} px-3 py-1.5 rounded-lg border ${activeTabDef.activeBg}`}
              style={{ borderColor: `${activeTabDef.accentHex}35` }}
            >
              <activeTabDef.icon className="w-3.5 h-3.5" />
              {activeTabDef.label}
            </div>
          </div>
        </div>
      </header>

      {/* ── TAB NAVIGATION ─────────────────────────────────────────────────────── */}
      <div className="border-b border-[#151C30] bg-[#070B14]/80 sticky top-[61px] z-20">
        <div className="max-w-7xl mx-auto px-5">
          <div className="flex gap-0.5 overflow-x-auto scrollbar-thin">
            {TABS.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-4 py-3.5 text-[11px] font-bold transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? `${tab.activeText} ${tab.activeBg}`
                      : "text-slate-400 hover:text-white hover:bg-[#0D1225]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="tracking-wide">{tab.label}</span>
                  {/* Active underline */}
                  {isActive && (
                    <motion.div
                      layoutId="tab-underline"
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${tab.underlineBg}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── GLOBAL ERROR ───────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {globalError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-7xl mx-auto px-5 pt-4"
          >
            <div className="flex items-center gap-3 p-3.5 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-sm">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{globalError}</span>
              <button onClick={() => setGlobalError(null)} className="ml-auto text-red-400 hover:text-red-200 font-bold cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-5 py-7">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {activeTab === "forge"     && <PromptForge />}
            {activeTab === "bridge"    && <ContextBridge />}
            {activeTab === "student"   && <StudentSuite />}
            {activeTab === "image"     && <ImagePromptStudio />}
            {activeTab === "resources" && <ResourceHub />}
            {activeTab === "career"    && <CareerHub />}
            {activeTab === "guide"     && <UserManual />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#151C30] py-5 mt-12 text-center text-[11px] text-slate-700">
        <p>AI Prompt Studio · Free AI tools only · Gemini, NotebookLM, ChatGPT, Claude, Perplexity, Mistral, DeepSeek, Grok</p>
        <p className="mt-1 text-slate-800">No data stored externally · Powered by Gemini API on server</p>
      </footer>

      <ApiKeyModal open={keyModalOpen} onClose={() => setKeyModalOpen(false)} />
      <HistoryDrawer open={historyDrawerOpen} onClose={() => setHistoryDrawerOpen(false)} />
    </div>
  );
}
