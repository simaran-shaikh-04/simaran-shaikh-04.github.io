import { useState } from "react";
import {
  BookOpen, KeyRound, Sparkles, Link2, GraduationCap, Image as ImageIcon,
  Library, Lightbulb, ShieldCheck, HelpCircle, ChevronDown, ExternalLink
} from "lucide-react";

interface Section {
  id: string;
  title: string;
  icon: any;
  body: React.ReactNode;
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-xs text-slate-300 leading-relaxed">
      <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-950/50 border border-indigo-800/60 text-indigo-300 text-[10px] font-bold flex items-center justify-center">{n}</span>
      <span>{children}</span>
    </li>
  );
}

const SECTIONS: Section[] = [
  {
    id: "start",
    title: "1. Getting started — add your free key",
    icon: KeyRound,
    body: (
      <div className="space-y-3">
        <p className="text-xs text-slate-400 leading-relaxed">The AI features run on Google's free Gemini model. You add your own key once — it stays in your browser and nothing is charged to anyone else.</p>
        <ol className="space-y-2">
          <Step n={1}>Click <span className="text-amber-300 font-semibold">Add API Key</span> at the top-right of the app.</Step>
          <Step n={2}>In the popup, click <span className="font-semibold">Open Google AI Studio</span> and sign in with any Google account.</Step>
          <Step n={3}>Click <span className="font-semibold">Create API key</span> (free), copy it, paste it into the box, and press Save.</Step>
        </ol>
        <p className="text-[11px] text-slate-500">The dot next to the key button turns <span className="text-emerald-400">green</span> once it's set. You only do this once per device.</p>
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-950/30 border border-indigo-900/50 px-3 py-2 rounded-lg transition">
          Get a free Gemini key <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    ),
  },
  {
    id: "forge",
    title: "2. Prompt Forge",
    icon: Sparkles,
    body: (
      <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
        <p>Turns a rough idea into a polished prompt tuned for a specific AI (Gemini, Claude, Perplexity, and others).</p>
        <ol className="space-y-2 pt-1">
          <Step n={1}>Pick the AI model you'll be using.</Step>
          <Step n={2}>Describe what you want in plain words.</Step>
          <Step n={3}>Generate, then copy the optimised prompt into that AI.</Step>
        </ol>
      </div>
    ),
  },
  {
    id: "bridge",
    title: "3. Context Bridge",
    icon: Link2,
    body: (
      <p className="text-xs text-slate-400 leading-relaxed">Moving from one AI to another? Paste your existing conversation or context, and Context Bridge writes a clean hand-off summary so the next AI picks up exactly where you left off — no repeating yourself.</p>
    ),
  },
  {
    id: "student",
    title: "4. Student Suite (+ NotebookLM)",
    icon: GraduationCap,
    body: (
      <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
        <p><span className="text-slate-200 font-semibold">Student Suite</span> builds structured study prompts:</p>
        <ol className="space-y-2">
          <Step n={1}>Choose your level — School, College, Competitive exams, or Career.</Step>
          <Step n={2}>Pick a preset (notes, essay, revision, exam prep, etc.).</Step>
          <Step n={3}>Answer the short questions, then generate — or just copy the structured template, which works in any AI even without a key.</Step>
        </ol>
        <p className="pt-1"><span className="text-slate-200 font-semibold">NotebookLM tab</span> creates ready-to-paste prompts for slides, video scripts, audio overviews, study guides, mind maps, and flashcards — also level-aware.</p>
      </div>
    ),
  },
  {
    id: "image",
    title: "5. Image Studio",
    icon: ImageIcon,
    body: (
      <div className="space-y-2 text-xs text-slate-400 leading-relaxed">
        <p>Builds image prompts tuned to each generator's "dialect" (Gemini/Nano Banana, DALL·E, FLUX, Midjourney, Stable Diffusion) — the reason a prompt that works in one tool flops in another.</p>
        <ol className="space-y-2 pt-1">
          <Step n={1}>Pick the image model you'll use.</Step>
          <Step n={2}>Fill in subject, style, lighting, composition — pick only what matters.</Step>
          <Step n={3}>Build, read the "why this works" notes, and copy the prompt. Or use <span className="text-slate-200 font-semibold">Enhance</span> mode to fix a vague prompt you already have.</Step>
        </ol>
      </div>
    ),
  },
  {
    id: "resources",
    title: "6. Resource Hub",
    icon: Library,
    body: (
      <p className="text-xs text-slate-400 leading-relaxed">A curated library of trusted, free-first websites — learning, courses, commerce & finance, arts, research, archives & libraries, study tools, handy utilities (background remover, PDF tools, etc.), jobs & internships, and startup resources. Filter by your level or category, and every card links to the official source. Everything is legal — no piracy sites.</p>
    ),
  },
  {
    id: "tips",
    title: "Tips for better results",
    icon: Lightbulb,
    body: (
      <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
        <li>• Be specific — "explain photosynthesis to a Class 10 student" beats "explain photosynthesis".</li>
        <li>• Set your level first in Student Suite / NotebookLM so examples match you.</li>
        <li>• In Image Studio, pick the actual generator you'll paste into — the prompt format changes per tool.</li>
        <li>• Copy buttons are everywhere; paste the result straight into the target AI.</li>
      </ul>
    ),
  },
  {
    id: "privacy",
    title: "Privacy & your key",
    icon: ShieldCheck,
    body: (
      <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed">
        <li>• Your API key is saved only in your own browser (local storage).</li>
        <li>• It's sent with each request just to call Gemini as you — never stored in a database, logged, or shared.</li>
        <li>• Remove it anytime from the API Key popup.</li>
      </ul>
    ),
  },
  {
    id: "faq",
    title: "Troubleshooting / FAQ",
    icon: HelpCircle,
    body: (
      <div className="space-y-3 text-xs text-slate-400 leading-relaxed">
        <div><p className="text-slate-200 font-semibold">The AI features aren't working.</p><p>Check the API Key button shows a green dot. The key should start with "AIza". Re-paste it if unsure.</p></div>
        <div><p className="text-slate-200 font-semibold">Do I have to pay?</p><p>No — a personal Gemini key is free, with generous daily limits.</p></div>
        <div><p className="text-slate-200 font-semibold">Which parts work without a key?</p><p>Resource Hub, the NotebookLM templates, and the copyable Student Suite templates all work offline. Only the "Generate / Polish with AI" buttons need a key.</p></div>
        <div><p className="text-slate-200 font-semibold">My key stopped working.</p><p>You may have hit the free daily limit — try again later, or create a fresh key in Google AI Studio.</p></div>
      </div>
    ),
  },
];

export default function UserManual() {
  const [open, setOpen] = useState<string>("start");

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-400" /> User Guide
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">Everything you need to get started — no technical knowledge required.</p>
      </div>

      <div className="space-y-2">
        {SECTIONS.map(s => {
          const Icon = s.icon;
          const isOpen = open === s.id;
          return (
            <div key={s.id} className="bg-[#0D1225] border border-[#1A2138] rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(isOpen ? "" : s.id)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer hover:bg-[#0F1530] transition"
              >
                <span className="flex items-center gap-2.5">
                  <span className={`p-1.5 rounded-lg ${isOpen ? "bg-indigo-600 text-white" : "bg-[#080C16] text-slate-400"}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="text-sm font-semibold text-slate-200">{s.title}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[#1A2138]">
                  {s.body}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-600 text-center pt-2">
        Still stuck? Most issues are the API key — open the <span className="text-amber-400">API Key</span> button up top and re-check it.
      </p>
    </div>
  );
}
