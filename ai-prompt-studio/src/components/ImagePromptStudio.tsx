import { useState } from "react";
import {
  Image as ImageIcon, Sparkles, Copy, Check, Wand2, Info, AlertTriangle,
  ChevronDown, Upload, X, Lightbulb,
  Instagram, Youtube, Twitter, Facebook, Linkedin, Smartphone, Monitor,
  Presentation, Globe, Megaphone, FileImage, BookOpen, User, Package
} from "lucide-react";

// ── Models grouped by prompt dialect ─────────────────────────────────────────
type Dialect = "natural" | "tags" | "weighted";
interface ImageModel { id: string; name: string; dialect: Dialect; freeNote: string; badge: string; tip: string; }
const MODELS: ImageModel[] = [
  { id: "gemini",     name: "Nano Banana / Gemini",       dialect: "natural",  freeNote: "Free · ~20/day in Gemini app",  badge: "Natural",  tip: "Reads plain English. Describe the scene like a photo brief." },
  { id: "dalle",      name: "DALL·E 3 (Bing)",            dialect: "natural",  freeNote: "Free with a Microsoft account", badge: "Natural",  tip: "Loves full sentences; ignores keyword spam & negative lists." },
  { id: "flux",       name: "FLUX.2 (Raphael/Perchance)", dialect: "natural",  freeNote: "Free, no signup (watermark)",    badge: "Natural",  tip: "Strong prompt fidelity. Descriptive prose beats keywords." },
  { id: "midjourney", name: "Midjourney v7",              dialect: "tags",     freeNote: "Paid (trial varies)",            badge: "Keyword",  tip: "Front-load key words; uses --ar and --no parameters." },
  { id: "sd",         name: "Stable Diffusion (SDXL)",    dialect: "weighted", freeNote: "Free · open-source",             badge: "Weighted", tip: "Comma tokens + a separate Negative prompt; (weight:1.2) syntax." },
];

// ── Option type: every option explains itself (label + desc) ─────────────────
interface Opt { id: string; label: string; desc: string; }

const STYLES: Opt[] = [
  { id: "photo", label: "Photorealistic", desc: "true-to-life photo look" },
  { id: "cinematic", label: "Cinematic", desc: "movie still, filmic colour & mood" },
  { id: "3d", label: "3D Render", desc: "polished CGI / Octane look" },
  { id: "illustration", label: "Digital Illustration", desc: "clean drawn artwork" },
  { id: "anime", label: "Anime / Manga", desc: "Japanese animation style" },
  { id: "watercolor", label: "Watercolor", desc: "soft painted washes" },
  { id: "oil", label: "Oil Painting", desc: "rich textured brushwork" },
  { id: "vector", label: "Flat Vector", desc: "simple flat shapes, graphic" },
  { id: "iso", label: "Isometric 3D", desc: "angled mini-diorama look" },
  { id: "lineart", label: "Line Art", desc: "minimal outlines, no fill" },
  { id: "pixel", label: "Pixel Art", desc: "retro 8/16-bit blocks" },
  { id: "lowpoly", label: "Low Poly", desc: "faceted geometric 3D" },
  { id: "clay", label: "Claymation", desc: "molded clay / stop-motion" },
  { id: "sketch", label: "Pencil Sketch", desc: "hand-drawn graphite" },
];
const LIGHTING: Opt[] = [
  { id: "studio", label: "Soft Studio", desc: "even, flattering softbox light" },
  { id: "golden", label: "Golden Hour", desc: "warm low-sun glow" },
  { id: "blue", label: "Blue Hour", desc: "cool twilight tones" },
  { id: "rim", label: "Dramatic Rim", desc: "bright edge, dark body" },
  { id: "neon", label: "Neon / Cyberpunk", desc: "glowing coloured city light" },
  { id: "volumetric", label: "Volumetric Rays", desc: "visible light beams / god rays" },
  { id: "overcast", label: "Overcast", desc: "soft, even, shadowless" },
  { id: "highkey", label: "High-Key", desc: "bright, airy, low shadow" },
  { id: "lowkey", label: "Low-Key", desc: "dark, moody, deep shadows" },
  { id: "backlit", label: "Backlit", desc: "light behind subject, silhouette" },
  { id: "candle", label: "Candlelight", desc: "warm flickering glow" },
  { id: "hardsun", label: "Hard Sunlight", desc: "sharp, strong shadows" },
];
const COMPOSITION: Opt[] = [
  { id: "closeup", label: "Close-Up Portrait", desc: "face/upper body fills frame" },
  { id: "medium", label: "Medium Shot", desc: "waist-up framing" },
  { id: "wide", label: "Wide / Establishing", desc: "subject small in a big scene" },
  { id: "flatlay", label: "Top-Down Flat Lay", desc: "shot straight from above" },
  { id: "macro", label: "Macro", desc: "extreme tiny detail" },
  { id: "thirds", label: "Rule of Thirds", desc: "subject off-centre, balanced" },
  { id: "symmetry", label: "Centered Symmetry", desc: "subject dead-centre, mirrored" },
  { id: "birdseye", label: "Bird's-Eye", desc: "high looking-down angle" },
  { id: "lowangle", label: "Low Angle", desc: "looking up; makes subject powerful" },
  { id: "dutch", label: "Dutch Angle", desc: "tilted, uneasy energy" },
];
const MOOD: Opt[] = [
  { id: "warm", label: "Warm & Inviting", desc: "cosy, friendly tones" },
  { id: "cool", label: "Cool & Calm", desc: "serene, collected feel" },
  { id: "vibrant", label: "Vibrant & Energetic", desc: "punchy, lively colour" },
  { id: "dark", label: "Dark & Moody", desc: "tense, dramatic atmosphere" },
  { id: "minimal", label: "Minimal & Clean", desc: "lots of negative space" },
  { id: "pastel", label: "Dreamy Pastel", desc: "soft, gentle, faded hues" },
  { id: "contrast", label: "Bold High-Contrast", desc: "strong lights vs darks" },
  { id: "vintage", label: "Vintage / Retro", desc: "aged, nostalgic palette" },
];
const CAMERA: Opt[] = [
  { id: "85mm", label: "85mm Portrait", desc: "blurred background, flattering" },
  { id: "35mm", label: "35mm Street", desc: "natural everyday perspective" },
  { id: "macro100", label: "Macro 100mm", desc: "tiny subject, crisp detail" },
  { id: "24mm", label: "Wide 24mm", desc: "expansive, slight distortion" },
  { id: "tele", label: "Telephoto", desc: "compressed, distant subject" },
  { id: "film", label: "Film 35mm", desc: "grain, analog colour" },
];

const GROUPS: { key: string; title: string; opts: Opt[] }[] = [
  { key: "style", title: "Style", opts: STYLES },
  { key: "lighting", title: "Lighting", opts: LIGHTING },
  { key: "composition", title: "Composition", opts: COMPOSITION },
  { key: "mood", title: "Mood", opts: MOOD },
  { key: "camera", title: "Camera / Lens", opts: CAMERA },
];

const ASPECTS = ["1:1", "4:5", "9:16", "16:9", "3:2", "2:3", "4:1", "3:1", "3:4"];

interface Platform { id: string; name: string; icon: any; aspect: string; hint: string; comp?: string; }
const PLATFORMS: Platform[] = [
  { id: "ig-post", name: "Instagram Post", icon: Instagram, aspect: "1:1", hint: "square feed post" },
  { id: "ig-portrait", name: "Instagram Portrait", icon: Instagram, aspect: "4:5", hint: "taller feed post" },
  { id: "ig-story", name: "Story / Reel", icon: Smartphone, aspect: "9:16", hint: "full-screen vertical" },
  { id: "yt-thumb", name: "YouTube Thumbnail", icon: Youtube, aspect: "16:9", hint: "bold, high-contrast, room for text", comp: "medium" },
  { id: "yt-banner", name: "YouTube Banner", icon: Youtube, aspect: "16:9", hint: "channel header" },
  { id: "tiktok", name: "TikTok", icon: Smartphone, aspect: "9:16", hint: "vertical cover" },
  { id: "x-post", name: "X / Twitter Post", icon: Twitter, aspect: "16:9", hint: "in-feed image" },
  { id: "fb-cover", name: "Facebook Cover", icon: Facebook, aspect: "16:9", hint: "profile cover banner" },
  { id: "pin", name: "Pinterest Pin", icon: ImageIcon, aspect: "2:3", hint: "tall pin" },
  { id: "li-post", name: "LinkedIn Post", icon: Linkedin, aspect: "1:1", hint: "feed image" },
  { id: "li-banner", name: "LinkedIn Banner", icon: Linkedin, aspect: "4:1", hint: "profile header" },
  { id: "slide", name: "Presentation Slide", icon: Presentation, aspect: "16:9", hint: "deck visual" },
  { id: "blog", name: "Blog / Web Hero", icon: Globe, aspect: "3:2", hint: "article header" },
  { id: "ad", name: "Ad Banner", icon: Megaphone, aspect: "16:9", hint: "marketing creative" },
  { id: "poster", name: "Poster", icon: FileImage, aspect: "2:3", hint: "print poster", comp: "symmetry" },
  { id: "flyer", name: "Flyer (A4)", icon: FileImage, aspect: "3:4", hint: "single-page flyer" },
  { id: "book", name: "Book Cover", icon: BookOpen, aspect: "2:3", hint: "front cover art" },
  { id: "album", name: "Album Art", icon: ImageIcon, aspect: "1:1", hint: "square cover art" },
  { id: "avatar", name: "Profile Avatar", icon: User, aspect: "1:1", hint: "headshot / avatar", comp: "closeup" },
  { id: "app-icon", name: "App Icon", icon: ImageIcon, aspect: "1:1", hint: "rounded-square icon", comp: "symmetry" },
  { id: "product", name: "Product Shot", icon: Package, aspect: "1:1", hint: "clean product photo", comp: "symmetry" },
  { id: "wall-desktop", name: "Desktop Wallpaper", icon: Monitor, aspect: "16:9", hint: "widescreen background" },
  { id: "wall-phone", name: "Phone Wallpaper", icon: Smartphone, aspect: "9:16", hint: "vertical background" },
];

const labelOf = (opts: Opt[], id: string) => opts.find(o => o.id === id)?.label || "";

const getAspectPreviewStyle = (ar: string) => {
  const parts = ar.split(":");
  const w = parseInt(parts[0], 10);
  const h = parseInt(parts[1], 10);
  if (w === h) return { width: "22px", height: "22px" };
  if (w > h) {
    const ratio = h / w;
    return { width: "28px", height: `${Math.round(28 * ratio)}px` };
  } else {
    const ratio = w / h;
    return { width: `${Math.round(28 * ratio)}px`, height: "28px" };
  }
};

export default function ImagePromptStudio() {
  const [mode, setMode] = useState<"build" | "enhance">("build");
  const [modelId, setModelId] = useState("gemini");
  const [platformId, setPlatformId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [sel, setSel] = useState<Record<string, string>>({});
  const [negative, setNegative] = useState("");
  const [aspect, setAspect] = useState("1:1");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ style: true });

  const [platformCategory, setPlatformCategory] = useState<"all" | "social" | "web" | "print">("all");
  const [platformOpen, setPlatformOpen] = useState(false);

  const [image, setImage] = useState<{ previewUrl: string; mimeType: string; data: string } | null>(null);
  const [output, setOutput] = useState("");
  const [explain, setExplain] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState("");

  const model = MODELS.find(m => m.id === modelId) || MODELS[0];
  const platform = PLATFORMS.find(p => p.id === platformId) || null;

  const reset = () => { setOutput(""); setExplain([]); };
  const pickPlatform = (p: Platform) => {
    setPlatformId(p.id); setAspect(p.aspect);
    if (p.comp) setSel(s => ({ ...s, composition: p.comp! }));
    reset();
  };
  const pickOpt = (group: string, id: string) => { setSel(s => ({ ...s, [group]: s[group] === id ? "" : id })); reset(); };
  const toggleGroup = (k: string) => setOpenGroups(o => ({ ...o, [k]: !o[k] }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      const url = r.result as string;
      setImage({ previewUrl: url, mimeType: file.type || "image/png", data: url.includes(",") ? url.split(",")[1] : url });
    };
    r.readAsDataURL(file);
  };

  const build = (): { prompt: string; why: string[] } => {
    const base = subject.trim().replace(/\s+/g, " ").replace(/[.\s]+$/, "");
    const style = labelOf(STYLES, sel.style);
    const light = labelOf(LIGHTING, sel.lighting);
    const comp = labelOf(COMPOSITION, sel.composition);
    const mood = labelOf(MOOD, sel.mood);
    const cam = labelOf(CAMERA, sel.camera);
    const why: string[] = [];
    const platCtx = platform ? platform.name : "";

    if (model.dialect === "natural") {
      const adds: string[] = [];
      if (style) adds.push(`in a ${style.toLowerCase()} style`);
      if (light) adds.push(`${light.toLowerCase()} lighting`);
      if (comp) adds.push(comp.toLowerCase());
      if (mood) adds.push(`a ${mood.toLowerCase()} mood`);
      if (cam) adds.push(cam.toLowerCase());
      let p = base + (adds.length ? `, ${adds.join(", ")}` : "") + ". High detail and visual coherence.";
      if (platCtx) p += ` Designed as a ${platCtx}.`;
      p += ` Compose for a ${aspect} aspect ratio.`;
      if (negative.trim()) p += ` Do not include: ${negative.trim()}.`;
      why.push(`Flowing description — ${model.name} reads natural language, so keyword stacks and "8k, masterpiece" spam hurt more than help.`);
      if (platCtx) why.push(`Tuned for a ${platCtx}, with the ${aspect} ratio stated in words (this model has no --ar parameter).`);
      if (negative.trim()) why.push(`"Avoid" items are written as a plain instruction — natural-language models ignore Negative-prompt token lists.`);
      return { prompt: p, why };
    }
    if (model.dialect === "tags") {
      const segs = [base, style, light, comp, mood, cam, platCtx && `${platCtx} format`, "highly detailed", "sharp focus"].filter(Boolean).join(", ");
      let p = `${segs} --ar ${aspect} --v 7 --style raw`;
      if (negative.trim()) p += ` --no ${negative.split(/,\s*/).filter(Boolean).join(", ")}`;
      why.push(`Comma descriptors, subject first — Midjourney weights front-loaded terms most.`);
      why.push(`--ar ${aspect} sets the ratio; --v 7 --style raw gives truer, less-stylised output.`);
      if (negative.trim()) why.push(`--no excludes elements (Midjourney's negative syntax).`);
      return { prompt: p, why };
    }
    const pos = [base, style, light, comp, mood, cam, "(masterpiece:1.2)", "ultra detailed", "8k"].filter(Boolean).join(", ");
    const neg = negative.trim() || "blurry, low quality, deformed, extra limbs, watermark, text, signature";
    const p = `${pos}\n\nNegative prompt: ${neg}`;
    why.push(`Weighted token stack + a separate Negative prompt — how Stable Diffusion expects input.`);
    why.push(`Set your canvas to ${aspect}${platCtx ? ` (for a ${platCtx})` : ""}; SD has no aspect token in the prompt.`);
    return { prompt: p, why };
  };

  const handleBuild = () => {
    if (!subject.trim()) { setError(mode === "build" ? "Describe your subject first." : "Paste the prompt to improve first."); return; }
    setError(null); setAiNote("");
    const { prompt, why } = build();
    setOutput(prompt); setExplain(why);
  };

  const aiPolish = async () => {
    if (!subject.trim()) { setError("Add a subject or paste a prompt first."); return; }
    setError(null); setAiLoading(true); setAiNote("");
    const { prompt } = output ? { prompt: output } : build();
    try {
      const res = await fetch("/api/enhance-image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: model.name, dialect: model.dialect, image: image ? { mimeType: image.mimeType, data: image.data } : undefined }),
      });
      const data = await res.json();
      if (!res.ok || !data.enhanced) throw new Error(data.error || "unavailable");
      setOutput(data.enhanced);
      setAiNote(image ? "Polished with AI using your reference image." : "Polished with AI.");
    } catch {
      if (!output) { const { prompt: p, why } = build(); setOutput(p); setExplain(why); }
      setAiNote("AI polish unavailable — showing the rule-based prompt. Add your API key (top bar) to enable it.");
    } finally { setAiLoading(false); }
  };

  const copy = () => { if (!output) return; navigator.clipboard.writeText(output); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  return (
    <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2138] pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-rose-400" /> Image Prompt Studio
          </h2>
          <p className="text-xs text-slate-400">Platform-ready prompts tuned to each generator's dialect.</p>
        </div>
        <div className="flex bg-[#080C16] p-1 rounded-xl border border-[#1A2138] self-start">
          {(["build", "enhance"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); reset(); setError(null); }}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer ${mode === m ? "bg-rose-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              {m === "build" ? <><ImageIcon className="w-3.5 h-3.5" /> Build</> : <><Wand2 className="w-3.5 h-3.5" /> Enhance</>}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-950/40 border border-red-900/50 rounded-xl text-red-300 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" /> {error}
          <button onClick={() => setError(null)} className="ml-auto font-bold text-red-400">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* LEFT */}
        <div className="lg:col-span-7 space-y-5">
          {/* model */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Target model</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MODELS.map(m => {
                const on = modelId === m.id;
                return (
                  <button key={m.id} onClick={() => { setModelId(m.id); reset(); }}
                    className={`text-left p-3 rounded-xl border transition cursor-pointer ${on ? "bg-rose-950/20 border-rose-700/50" : "bg-[#080C16] border-[#1A2138] hover:border-slate-700"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-xs font-semibold ${on ? "text-white" : "text-slate-300"}`}>{m.name}</span>
                      <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#0D1225] text-rose-300 border border-rose-900/40 shrink-0">{m.badge}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 block mt-1">{m.freeNote}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 flex items-start gap-1.5 pt-0.5">
              <Lightbulb className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" /> {model.tip}
            </p>
          </div>

          {/* platform templates (collapsible preset card) */}
          <div className="bg-[#080C16] border border-[#1A2138] rounded-xl overflow-hidden">
            <button onClick={() => setPlatformOpen(!platformOpen)} className="w-full flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-[#0D1225] transition">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                📐 Platform Layout Presets
              </span>
              <span className="flex items-center gap-2">
                {platform ? (
                  <span className="text-[10px] text-rose-300 font-semibold">{platform.name} ({platform.aspect})</span>
                ) : (
                  <span className="text-[10px] text-slate-500 italic">Custom Ratio ({aspect})</span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${platformOpen ? "rotate-180" : ""}`} />
              </span>
            </button>
            {platformOpen && (
              <div className="p-3 pt-0 space-y-3">
                {/* category filter bar */}
                <div className="flex flex-wrap gap-1 border-b border-[#1A2138]/60 pb-2">
                  {(["all", "social", "web", "print"] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setPlatformCategory(cat)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        platformCategory === cat
                          ? "bg-rose-950/40 border-rose-900/60 text-rose-300"
                          : "bg-[#0D1225] border-[#1A2138] text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {cat === "all" ? "All Presets" : cat === "social" ? "Social Media" : cat === "web" ? "Web & Video" : "Print & Assets"}
                    </button>
                  ))}
                </div>
                
                {/* buttons list */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                  {PLATFORMS.filter(p => {
                    if (platformCategory === "all") return true;
                    const cat = p.id.startsWith("ig-") || p.id === "tiktok" || p.id === "x-post" || p.id === "fb-cover" || p.id === "pin" || p.id.startsWith("li-") ? "social"
                      : p.id === "slide" || p.id === "blog" || p.id === "ad" || p.id === "yt-thumb" || p.id === "yt-banner" || p.id === "app-icon" || p.id.startsWith("wall-") ? "web"
                      : "print";
                    return cat === platformCategory;
                  }).map(p => {
                    const Icon = p.icon;
                    const on = platformId === p.id;
                    return (
                      <button key={p.id} onClick={() => pickPlatform(p)}
                        className={`text-left p-2.5 rounded-lg border transition cursor-pointer ${on ? "bg-rose-950/20 border-rose-700/50" : "bg-[#0D1225] border-[#1A2138] hover:border-slate-700"}`}>
                        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
                          <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {p.name}
                        </span>
                        <span className="text-[9px] text-slate-500 block mt-0.5">{p.hint} · <span className="font-mono">{p.aspect}</span></span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* subject */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
              {mode === "build" ? "Primary subject" : "Paste your vague / weak prompt"}
            </label>
            <textarea value={subject} onChange={e => { setSubject(e.target.value); reset(); }}
              placeholder={mode === "build" ? "e.g., a confident female founder at her desk, warm smile" : "e.g., cool robot in a city, make it look nice"}
              className="w-full h-20 bg-[#080C16] border border-[#1A2138] focus:border-rose-600/60 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none resize-none" />
          </div>

          {/* reference image */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Reference image (optional — used by "Polish with AI")</label>
            {image ? (
              <div className="flex items-center gap-3 bg-[#080C16] border border-[#1A2138] rounded-xl p-2.5">
                <img src={image.previewUrl} alt="reference" className="w-12 h-12 rounded-lg object-cover border border-[#1A2138]" />
                <span className="text-[11px] text-slate-400 flex-1">Attached — AI will match its style, colour &amp; composition.</span>
                <button onClick={() => setImage(null)} className="text-slate-500 hover:text-red-300 cursor-pointer"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 bg-[#080C16] border border-dashed border-[#1A2138] hover:border-slate-600 rounded-xl p-3 text-[11px] text-slate-500 cursor-pointer transition">
                <Upload className="w-3.5 h-3.5" /> Click to attach an image
                <input type="file" accept="image/*" onChange={onFile} className="hidden" />
              </label>
            )}
          </div>

          {/* collapsible control groups */}
          <div className="space-y-2">
            {GROUPS.map(g => {
              const open = !!openGroups[g.key];
              const chosen = labelOf(g.opts, sel[g.key]);
              return (
                <div key={g.key} className="bg-[#080C16] border border-[#1A2138] rounded-xl overflow-hidden">
                  <button onClick={() => toggleGroup(g.key)} className="w-full flex items-center justify-between gap-2 p-3 cursor-pointer hover:bg-[#0D1225] transition">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{g.title}</span>
                    <span className="flex items-center gap-2">
                      {chosen && <span className="text-[10px] text-rose-300 font-semibold">{chosen}</span>}
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
                    </span>
                  </button>
                  {open && (
                    <div className="p-3 pt-0 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {g.opts.map(o => {
                        const on = sel[g.key] === o.id;
                        return (
                          <button key={o.id} onClick={() => pickOpt(g.key, o.id)}
                            className={`text-left p-2 rounded-lg border transition cursor-pointer ${on ? "bg-rose-600/90 border-rose-500" : "bg-[#0D1225] border-[#1A2138] hover:border-slate-700"}`}>
                            <span className={`text-[11px] font-semibold block ${on ? "text-white" : "text-slate-200"}`}>{o.label}</span>
                            <span className={`text-[9px] block leading-tight mt-0.5 ${on ? "text-rose-100" : "text-slate-500"}`}>{o.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* aspect + negative */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Aspect ratio</label>
              
              <div className="flex items-center gap-3 bg-[#080C16] border border-[#1A2138] p-3 rounded-xl mb-2">
                {/* Visual Shape */}
                <div className="w-10 h-10 flex items-center justify-center bg-[#0D1225] border border-[#1A2138] rounded-lg shrink-0">
                  <div 
                    className="border border-dashed border-rose-500/60 bg-rose-500/10 rounded transition-all duration-300"
                    style={getAspectPreviewStyle(aspect)}
                  />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-200">Ratio: {aspect}</span>
                  <p className="text-[9px] text-slate-500 leading-none">Selected output dimensions</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {ASPECTS.map(a => (
                  <button key={a} onClick={() => { setAspect(a); setPlatformId(null); reset(); }}
                    className={`text-[9px] font-mono px-2 py-1 rounded-lg border transition cursor-pointer ${aspect === a ? "bg-gradient-to-br from-rose-600 to-rose-700 border-rose-500 text-white font-semibold" : "bg-[#080C16] border-[#1A2138] text-slate-400 hover:text-slate-200"}`}>{a}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Avoid / exclude (optional)</label>
              <input type="text" value={negative} onChange={e => { setNegative(e.target.value); reset(); }}
                placeholder="text, watermark, extra fingers, blur"
                className="w-full bg-[#080C16] border border-[#1A2138] rounded-xl p-3 text-xs text-slate-200 placeholder-slate-700 focus:outline-none focus:border-rose-600/60" />
              <p className="text-[9px] text-slate-600">Applied per model — sentence, --no, or a Negative prompt field.</p>
            </div>
          </div>

          {/* actions */}
          <div className="flex gap-2">
            <button onClick={handleBuild}
              className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer">
              <Sparkles className="w-3.5 h-3.5" /> Build for {model.name}
            </button>
            <button onClick={aiPolish} disabled={aiLoading}
              className="px-4 bg-[#080C16] hover:bg-[#0D1225] disabled:opacity-40 text-slate-200 font-bold text-xs py-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer border border-[#1A2138]">
              {aiLoading ? <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> : <Wand2 className="w-3.5 h-3.5 text-amber-300" />}
              Polish with AI
            </button>
          </div>
        </div>

        {/* RIGHT (output) */}
        <div className="lg:col-span-5 flex flex-col border-t lg:border-t-0 lg:border-l border-[#1A2138] pt-5 lg:pt-0 lg:pl-5 space-y-4">
          <span className="text-[10px] uppercase font-bold tracking-widest text-rose-400 block">Generated prompt</span>
          <div className="bg-[#080C16] p-4 rounded-xl border border-[#1A2138] font-mono text-[11px] text-slate-300 min-h-32 leading-relaxed select-all whitespace-pre-wrap break-words">
            {output || <span className="text-slate-600 italic">Pick a model + subject, then Build. The prompt is assembled in that model's dialect.</span>}
          </div>
          {output && (
            <button onClick={copy}
              className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${copied ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400" : "bg-rose-600 hover:bg-rose-500 border-rose-600 text-white"}`}>
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy prompt</>}
            </button>
          )}
          {aiNote && <p className="text-[10px] text-amber-400/80 leading-normal">{aiNote}</p>}
          {explain.length > 0 && (
            <div className="bg-[#080C16] border border-[#1A2138] p-3.5 rounded-lg space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-rose-400" /> Why this works
              </span>
              <ul className="space-y-1.5">
                {explain.map((e, i) => (
                  <li key={i} className="text-[10px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                    <span className="text-rose-500 shrink-0 mt-0.5">›</span>{e}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
