import { useState, useMemo } from "react";
import {
  Briefcase, Database, Cpu, Shield, Star, ExternalLink, Search,
  BookOpen, GraduationCap, Target, Rocket, Sparkles, Check, Copy
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CAREER_HUB_CATEGORIES } from "../data/careerHubData";
import type { CareerResource, CareerCategory } from "../data/careerHubData";

export default function CareerHub() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    return CAREER_HUB_CATEGORIES.map(cat => {
      // Filter resources inside category
      const matchedResources = cat.resources.filter(r => {
        const matchesQuery = query.trim() === "" ||
          `${r.name} ${r.bestFor} ${r.skills.join(" ")} ${r.reputation}`
            .toLowerCase()
            .includes(query.toLowerCase());
        return matchesQuery;
      });

      return {
        ...cat,
        resources: matchedResources
      };
    }).filter(cat => {
      // Filter category list itself
      if (activeCategoryId !== "all" && cat.id !== activeCategoryId) return false;
      return cat.resources.length > 0;
    });
  }, [activeCategoryId, query]);

  const handleCopyLink = (r: CareerResource) => {
    navigator.clipboard.writeText(r.url);
    setCopiedId(r.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-400" /> Career & Skills Hub
        </h2>
        <p className="text-sm text-slate-400 mt-0.5">
          Explore high-growth careers, master critical skills like SQL, and discover AI-Resistant or AI-Augmented pathways.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-[#0D1225] border border-[#1A2138] rounded-2xl p-4 space-y-4 shadow-lg">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search skills, websites, or certifications..."
            className="w-full bg-[#080C16] border border-[#1A2138] focus:border-indigo-500/50 rounded-lg pl-9 pr-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none transition-all"
          />
        </div>

        {/* Category Toggles */}
        <div className="flex flex-wrap gap-1.5 border-t border-[#1A2138] pt-3">
          <button
            onClick={() => setActiveCategoryId("all")}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-lg border transition cursor-pointer ${
              activeCategoryId === "all"
                ? "bg-indigo-950/40 text-indigo-300 border-indigo-800/60"
                : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"
            }`}
          >
            <Briefcase className="w-3 h-3" /> All Categories
          </button>
          {CAREER_HUB_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`flex items-center gap-1.5 text-[10px] font-bold px-3 py-2 rounded-lg border transition cursor-pointer ${
                activeCategoryId === cat.id
                  ? "bg-indigo-950/40 text-indigo-300 border-indigo-800/60"
                  : "bg-[#080C16]/50 border-transparent text-slate-400 hover:text-slate-200 hover:bg-[#080C16]"
              }`}
            >
              {cat.id === "data-analysis" && <Database className="w-3 h-3 text-cyan-400" />}
              {cat.id === "emerging-careers" && <Cpu className="w-3 h-3 text-rose-400" />}
              {cat.id === "bcom-resistant" && <Shield className="w-3 h-3 text-emerald-400" />}
              {cat.id === "bcom-augmented" && <Sparkles className="w-3 h-3 text-amber-400" />}
              <span>{cat.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Render Categorized Resources */}
      <div className="space-y-8">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12 bg-[#0D1225] border border-[#1A2138] rounded-2xl">
            <Briefcase className="w-10 h-10 mx-auto text-slate-600 mb-2 opacity-55 animate-pulse" />
            <p className="text-xs text-slate-500">No resources found matching your search.</p>
          </div>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.id} className="space-y-4">
              {/* Category Header */}
              <div className="border-b border-[#1A2138] pb-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  {cat.id === "data-analysis" && <Database className="w-4 h-4 text-cyan-400" />}
                  {cat.id === "emerging-careers" && <Cpu className="w-4 h-4 text-rose-400" />}
                  {cat.id === "bcom-resistant" && <Shield className="w-4 h-4 text-emerald-400" />}
                  {cat.id === "bcom-augmented" && <Sparkles className="w-4 h-4 text-amber-400" />}
                  {cat.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">{cat.description}</p>
              </div>

              {/* Resources Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cat.resources.map((r, index) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: Math.min(index * 0.05, 0.3) }}
                    whileHover={{ y: -3, borderColor: "rgba(99, 102, 241, 0.3)" }}
                    className="bg-[#0D1225] border border-[#1A2138] rounded-xl p-4.5 flex flex-col justify-between transition-all duration-200 shadow-md hover:shadow-xl hover:bg-[#0E142B] cursor-default"
                  >
                    <div className="space-y-3">
                      {/* Name, Stars, Price */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-bold text-white hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors duration-155"
                          >
                            {r.name} <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          </a>
                          {/* Visual Star Rating */}
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < r.stars ? "fill-amber-400 text-amber-400" : "text-slate-700"
                                }`}
                              />
                            ))}
                            <span className="text-[10px] text-slate-500 font-mono ml-1">({r.stars}.0)</span>
                          </div>
                        </div>
 
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                              r.cost === "free"
                                ? "text-emerald-400 bg-emerald-950/20 border-emerald-900/30"
                                : "text-sky-400 bg-sky-950/20 border-sky-900/30"
                            }`}
                          >
                            {r.cost}
                          </span>
                          {r.aiClassification && (
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                r.aiClassification === "resistant"
                                  ? "text-emerald-400 bg-emerald-500/10 border-transparent"
                                  : "text-amber-400 bg-amber-500/10 border-transparent"
                              }`}
                            >
                              {r.aiClassification === "resistant" ? "🛡️ AI-Resistant" : "🤖 AI-Augmented"}
                            </span>
                          )}
                        </div>
                      </div>
 
                      {/* Best For */}
                      <p className="text-[11px] text-slate-300 leading-relaxed font-normal">
                        {r.bestFor}
                      </p>
 
                      {/* Qualifications */}
                      {r.qualifications && r.qualifications.length > 0 && (
                        <div className="border-l-2 border-indigo-500 bg-[#080C16]/55 pl-3 py-2 pr-2.5 rounded-r-lg space-y-1 shadow-sm">
                          <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Required / Ideal Pathway:</span>
                          <ul className="list-disc pl-3.5 space-y-0.5">
                            {r.qualifications.map((qual, idx) => (
                              <li key={idx} className="text-[10px] text-slate-400 leading-normal">
                                {qual}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
 
                      {/* Skills taught */}
                      <div className="flex flex-wrap gap-1 pt-1">
                        {r.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-semibold bg-[#080C16]/60 text-slate-400 px-2 py-0.5 rounded-full hover:text-slate-350 transition-colors"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
 
                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-[#1A2138] mt-4 pt-3.5 text-[10px] text-slate-500">
                      <span className="italic truncate max-w-[70%] text-slate-500">{r.reputation}</span>
                      <button
                        onClick={() => handleCopyLink(r)}
                        className={`text-[10px] font-semibold inline-flex items-center gap-1 cursor-pointer transition ${
                          copiedId === r.id ? "text-emerald-400" : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {copiedId === r.id ? (
                          <>
                            <Check className="w-3 h-3" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" /> Copy Link
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-[#080C16] border border-[#1A2138] rounded-xl p-4 text-center">
        <p className="text-[10px] text-slate-500">
          💡 <strong>Tip:</strong> All cataloged resources are verified, legitimate, and safe. Click their titles to visit the official sites directly.
        </p>
      </div>
    </div>
  );
}
