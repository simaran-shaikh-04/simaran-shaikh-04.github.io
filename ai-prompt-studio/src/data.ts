import { OptimizationProfile, AIModel } from "./types";

export const OPTIMIZATION_PROFILES: OptimizationProfile[] = [
  {
    id: "token-saving",
    name: "Token Squeezer",
    description: "Forces Claude to output ONLY code changes or modular diffs with absolutely zero boilerplate, chat commentary, or boilerplate code. Save up to 60%+ output tokens.",
    icon: "Cpu",
    tokenFocus: "Outputs minimal code changes inside standard diff blocks or surgical replacements. Skips lengthy explanations and file rewrites.",
    claudeBias: "Optimized for long chat threads to extend the conversation context by up to 3x before memory runs out."
  },
  {
    id: "architectural",
    name: "Modular Architect",
    description: "Sets rigid instructions for scalable system structure, strict TypeScript types first, clean directory schemas, and explicit separation of business logic from UI rendering.",
    icon: "Layers",
    tokenFocus: "Defines clean file trees, writes rigorous interface boundaries, and orders components with robust separation of concerns.",
    claudeBias: "Best for building large, professional applications where folder integrity and clean design principles are required."
  },
  {
    id: "mvp-prototype",
    name: "High-Fidelity MVP",
    description: "Instructs Claude to focus heavily on a single gorgeous interactive screen or polished visual view. Limits complexity, standardizes state using localStorage, and models rich micro-animations.",
    icon: "Zap",
    tokenFocus: "Instructs Claude to bypass mock backend layers, database credentials, or complex external APIs to create a functional client-side masterpiece instantly.",
    claudeBias: "Perfect for fast creations, demos, calculators, or feature playgrounds without structural bloating."
  },
  {
    id: "comprehensive",
    name: "Deep Thinking Spec",
    description: "Tells Claude to think exhaustively step-by-step inside XML `<thinking>` tags before outputting any code, validating edge cases, performance, security, and UI transitions.",
    icon: "Brain",
    tokenFocus: "Ensures Claude checks error boundaries, double-checks logical rules, explains potential issues, and covers dark-mode contrast or accessibility.",
    claudeBias: "Recommended for high-stakes core systems, complex parsers, formula grids, or interactive puzzle structures."
  }
];

export const STARTER_IDEAS = [
  {
    title: "🎨 Creative Canvas",
    idea: "A physics-based draw and drop playground using HTML Canvas, allowing users to draw shapes that fall under gravity, collide, and generate musical notes on impact."
  },
  {
    title: "📊 Financial Analytics",
    idea: "A single-screen budget planner featuring interactive flow charts, localized currency conversions, custom nested categories, and CSV data import/export."
  },
  {
    title: "🎵 Synthesizer Synth",
    idea: "An interactive ambient music composer incorporating step sequencers, multi-oscillator filters, adjustable feedback delays, and dynamic visual frequency displays."
  },
  {
    title: "🧩 Retro Game Builder",
    idea: "A visual tile-based micro-game engine and editor where users can design 2D obstacle tracks, set actor behaviors, and play/save their customized stages."
  }
];

export const CLAUDE_TIPS = [
  {
    title: "XML Tags are Claude's Superpower",
    description: "Claude is specifically trained to segment rules, variables, and code inside structured tags like `<system_instructions>`, `<code_block>`, or `<context_boundaries>` for maximum adherence."
  },
  {
    title: "Provide Negative Constraints",
    description: "Telling Claude what NOT to do (e.g., 'Do not write any comments inside the generated TypeScript code') saves extensive output tokens and yields faster speeds."
  },
  {
    title: "State Types First",
    description: "Claude designs better business logic when prompted to create `/src/types.ts` first and review its structure before generating the UI layout or handler functions."
  }
];

export interface StudentPreset {
  id: string;
  title: string;
  name: string;
  description: string;
  defaultIdea: string;
  questions: { id: string; question: string; helperText: string }[];
}

export const STUDENT_PRESETS: StudentPreset[] = [
  {
    id: "academic-notes",
    title: "📝 Study Notes & Active Recall",
    name: "Academic Notes Generator",
    description: "Generate highly structured active-recall study guides, flashcard lists (compatible with Anki), and conceptual notes directly from lectures & transcripts.",
    defaultIdea: "I want to generate active-recall academic notes, mnemonic cheat sheets, and cloze-deletion flashcards from my lecture transcript about Distributed Database Concordance and Raft Consensus algorithms.",
    questions: [
      {
        id: "note-format",
        question: "What formatting style supports your learning best?",
        helperText: "Options include: Cornell Note Taking system, standard hierarchical outline, or active-recall Q&A sheets."
      },
      {
        id: "flashcard-format",
        question: "What flashcard format should we compile?",
        helperText: "e.g., standard Anki Q&A, Cloze deletion format, or matching pairs definitions."
      },
      {
        id: "depth",
        question: "What level of academic depth should notes target?",
        helperText: "Specify depth (e.g., high school basics, undergraduate foundation, or graduate-level research rigor)."
      },
      {
        id: "synthesis-addons",
        question: "Would you like definition sidebars, mnemonics, or test-prep questions?",
        helperText: "Add custom tools like conceptual cheat sheets, practice mock questions, or visualization diagrams drafts."
      }
    ]
  },
  {
    id: "assignment-research",
    title: "🔍 Assignment & Project Research",
    name: "Research Blueprint & MLA/APA Citations",
    description: "Draft structural thesis skeletons, methodology design parameters, counterargument vectors, and verified citations guidelines (APA, MLA, IEEE).",
    defaultIdea: "I need to construct a rigorous research skeleton and thesis methodology exploring the environmental impacts of localized crypto mining on high-altitude power grids.",
    questions: [
      {
        id: "citation-style",
        question: "What academic citation style is required?",
        helperText: "Select formatting style (e.g., APA 7th Edition, MLA 9th, IEEE format, or Chicago Manual)."
      },
      {
        id: "analysis-criteria",
        question: "Specify your research methodologies profile:",
        helperText: "Describe the approach: qualitative analysis, peer-reviewed lit review, statistical validation, or comparative case study."
      },
      {
        id: "argumentative-depth",
        question: "What is your main thesis statement or core argument?",
        helperText: "e.g., 'Decentralized mining leads to regional grid instability but creates incentives for direct off-grid hydroelectric generation.'"
      },
      {
        id: "validity-checks",
        question: "Should the AI formulate counter-theses and bias evaluations?",
        helperText: "We can direct the AI to outline weak points, historical conflicts, or alternative arguments to solidify your work."
      }
    ]
  },
  {
    id: "skill-finder",
    title: "🚀 Skill Builder & Free Resource Finder",
    name: "Skill Master Roadmap & Resource Finder",
    description: "Construct tailored step-by-step master syllabi and list highly-rated free video series, sandboxes, and books from trusted communities.",
    defaultIdea: "I want to acquire a master-level understanding of Rust Memory Safety, owner-borrow semantics, concurrent programming, and async runtime patterns, starting from zero.",
    questions: [
      {
        id: "target-skill",
        question: "What exact skill or engineering domain are you mastering?",
        helperText: "e.g., WebGPU shaders, Rust compile-time constraints, quantitative finance formulas, or color-theory styling."
      },
      {
        id: "current-level",
        question: "What is your starting baseline and final goal?",
        helperText: "Describe experience (e.g., 'Junior programmer with some JS background. Goal is to contribute to production engines')."
      },
      {
        id: "source-verification",
        question: "What type of trusted learning resources do you prefer?",
        helperText: "e.g., Interactive in-browser sandboxes, video-course playlists, GitHub source code repos, or PDF handbooks."
      },
      {
        id: "review-sources",
        question: "Which communities/sources do you trust for reviews?",
        helperText: "Specify vetted platforms (e.g., Hacker News, Reddit consensus, GitHub Stars, or university open-courseware reviews)."
      }
    ]
  },
  {
    id: "interview-practice",
    title: "💼 Interactive Interview Practice Coach",
    name: "Interactive Interview Coach Simulator",
    description: "Prompt the AI to operate as a live technical, behavioral, or system-design interviewer. Scores inputs using a performance analytics rubric.",
    defaultIdea: "I need to practice technical system design and live coding data structures (e.g., priority queues and binary trees), with the AI simulating a senior staff engineer.",
    questions: [
      {
        id: "interview-type",
        question: "What specific interview category are you preparing for?",
        helperText: "e.g., Software engineering live coding, backend system design, behavioral STAR questionnaire, or project walk-throughs."
      },
      {
        id: "difficulty-tier",
        question: "What is the job experience tier?",
        helperText: "e.g., Undergraduate standard internship, college grad full-time, or senior level specialist."
      },
      {
        id: "rubric-criteria",
        question: "What evaluation criteria should the AI grade you on?",
        helperText: "Choose: code correctness, Big-O complexity, edge-case mitigation, collaborative communication, or STAR method structures."
      },
      {
        id: "simulation-flow",
        question: "How should the live interview run?",
        helperText: "Options: Ask one question at a time and wait for input, or output a full checklist of interactive scenarios first."
      }
    ]
  },
  {
    id: "resume-builder",
    title: "📄 STAR Formula Resume Tailor",
    name: "Google STAR-Method Resume Builder",
    description: "Recast static job bullets into achievements (Situation, Task, Action, Result) mapped perfectly to ATS match criteria.",
    defaultIdea: "Structure a high-impact metric-driven resume point for my portfolio. I built a file explorer and preview system with image generation helpers.",
    questions: [
      {
        id: "target-role",
        question: "What is your target job title or research role?",
        helperText: "e.g., Junior Full-Stack Developer, AI Research Intern, or Associate Systems Administrator."
      },
      {
        id: "experience-points",
        question: "What is the core task/project you built? (Raw draft)",
        helperText: "e.g., 'I made a tool that converts files. Users liked it.'"
      },
      {
        id: "star-formula",
        question: "What metrics can we measure or estimate?",
        helperText: "e.g., reduced compile times by 40%, supported uploads up to 50MB, or reached 200 daily active student developers."
      },
      {
        id: "ats-keywords",
        question: "What key search terms or libraries should be highlighted?",
        helperText: "e.g., React, TypeScript, Tailwind CSS, REST APIs, JSON validation schemas, FileReader API, etc."
      }
    ]
  },
  {
    id: "linkedin-writing",
    title: "✍️ Student LinkedIn Storyteller",
    name: "Open-Source & Hackathon Storyteller",
    description: "Write clean, deeply engaging, non-cringe technical narratives about recent student research successes, project launches, or peer lessons.",
    defaultIdea: "I want to share a tech story on LinkedIn about constructing a Claude-optimized prompt compiler using server-side proxy engines and drag-drop context materials.",
    questions: [
      {
        id: "milestone-theme",
        question: "What educational or technical milestone are you sharing?",
        helperText: "e.g., won a 24-hour hackathon, pushed first major open-source PR, or concluded an intensive software internship."
      },
      {
        id: "tone-voice",
        question: "How do you want to balance your tone?",
        helperText: "Options: Humble & technical details first, visual storyteller, or advice-centric post for other students."
      },
      {
        id: "code-inclusion",
        question: "Should a schematic breakdown or code block be written?",
        helperText: "Describe the architecture: node reverse proxy, frontend context loops, or file drag-and-drop state listeners."
      },
      {
        id: "hook-style",
        question: "What type of intro/hook do you prefer?",
        helperText: "Options: lesson-first, raw excitement, or chronological story starting with the hurdle."
      }
    ]
  },
  {
    id: "internship-report",
    title: "🏢 Internship Log & Performance Report",
    name: "Internship Performance & Retrospective Writer",
    description: "Convert informal weekly sprint summaries and logs into high-quality, professional performance reviews and slides acceptable to college departments.",
    defaultIdea: "Help me synthesize my raw daily work notes from my 8-week internship as an assistant software developer at a logistics firm into a formal, structured corporate report.",
    questions: [
      {
        id: "duration-scope",
        question: "What is the timeframe and goal of this report?",
        helperText: "e.g., Weekly activity report, mid-term 4-week review, or final 12-week comprehensive retrospective."
      },
      {
        id: "key-impacts",
        question: "What were your principal contributions?",
        helperText: "Specify contributions: migrations, feature coding, bug squashing, documentation, team sprints participation."
      },
      {
        id: "department-standards",
        question: "Select formatting standards required by your school/firm:",
        helperText: "e.g., chronological weekly table logs, formal academic write-up style, or engineering-centric problem-solution logs."
      },
      {
        id: "future-recommendations",
        question: "What future product or teamwork expansion suggestions did you note?",
        helperText: "Describe recommendations: automated testing suites, decoupled services, improved developer sandboxes, etc."
      }
    ]
  }
];

// ─── AI Models for Prompt Forge ───────────────────────────────────────────────

export const AI_MODELS: AIModel[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    shortName: "Gemini",
    provider: "Google",
    url: "https://gemini.google.com",
    textClass: "text-blue-400",
    bgClass: "bg-blue-950/20",
    borderClass: "border-blue-900/50",
    activeBgClass: "bg-blue-950/40",
    accentHex: "#60A5FA",
    badgeText: "GENEROUS FREE",
    freeInfo: "Gemini 1.5 Pro / Flash — massive context window and multimodal support",
    strengths: ["2M+ token context", "Multimodal (image/audio/video/PDF)", "Structured JSON outputs", "Fast responses"],
    bestFor: ["Long document analysis", "Multi-step breakdowns", "Code generation", "Multimodal understanding"],
    promptingStyle: "Gemini models excel at handling massive amounts of context and multimodal input. Gemini is highly instruction-following. It performs best when you define its role, structure the prompt with markdown headings, and use clear lists. Explicitly state the desired output format.",
    promptingTips: [
      "Open with a clear role: 'You are an expert database administrator...'",
      "Upload entire codebases, long PDFs, or audio/video files directly (up to 2M tokens).",
      "Provide clear examples of desired outputs (few-shot prompting) for complex formats.",
      "Reference specific parts of media: 'Based on the slide shown at 12:30 in the attached video...'"
    ],
    systemPromptSupport: false,
    contextWindow: "2M tokens",
    iconEmoji: "◈"
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    shortName: "NotebookLM",
    provider: "Google",
    url: "https://notebooklm.google.com",
    textClass: "text-violet-400",
    bgClass: "bg-violet-950/20",
    borderClass: "border-violet-900/50",
    activeBgClass: "bg-violet-950/40",
    accentHex: "#A78BFA",
    badgeText: "100% FREE",
    freeInfo: "Fully free — upload PDFs, docs, URLs; no token counting",
    strengths: ["Source-grounded answers", "Podcast/audio generation", "Study guide creation", "Citation-backed responses"],
    bestFor: ["Study notes from PDFs", "Audio overviews", "FAQs from documents", "Lecture summarization"],
    promptingStyle: "NotebookLM is NOT a general chatbot — it works exclusively with your uploaded sources. You must upload your PDFs, docs, or URLs FIRST. The generated prompt will be designed to query those sources. Frame everything as: 'Based on the uploaded sources...' or 'From the materials provided...'",
    promptingTips: [
      "Upload your source documents BEFORE using the generated prompt",
      "Frame queries as: 'Based on the sources, explain...' or 'Create a study guide for...'",
      "Use explicit output types: 'Create a podcast overview / FAQ / timeline / study guide'",
      "Ask for citations: 'Reference which source each point comes from'"
    ],
    systemPromptSupport: false,
    contextWindow: "Based on uploaded sources",
    iconEmoji: "◉"
  },
  {
    id: "aistudio",
    name: "Google AI Studio",
    shortName: "AI Studio",
    provider: "Google",
    url: "https://aistudio.google.com",
    textClass: "text-emerald-400",
    bgClass: "bg-emerald-950/20",
    borderClass: "border-emerald-900/50",
    activeBgClass: "bg-emerald-950/40",
    accentHex: "#34D399",
    badgeText: "FREE API",
    freeInfo: "Free Gemini API — system prompts, JSON mode, temperature control, 2M context",
    strengths: ["System instructions", "Structured JSON output schemas", "Parameter tuning (temp/safety)", "Free tier API keys"],
    bestFor: ["Developer prompt testing", "System prompt engineering", "Structured data extraction", "API prototype building"],
    promptingStyle: "AI Studio separates the System Instruction from the user message. The generated prompt will include both a SYSTEM PROMPT section (permanent rules/persona) and a USER MESSAGE section. Paste each into their respective fields in AI Studio. Use JSON Schema for structured data extraction.",
    promptingTips: [
      "Paste the SYSTEM section into the 'System instructions' box in AI Studio.",
      "Set temperature to 0 for deterministic outputs, 0.7+ for creative brainstorming.",
      "Utilize the 'Structured Output' (JSON Schema) setting for reliable programmatic data.",
      "Upload multiple files to the context pane to ground the model on your dataset."
    ],
    systemPromptSupport: true,
    contextWindow: "2M tokens",
    iconEmoji: "⬡"
  },
  {
    id: "chatgpt",
    name: "OpenAI ChatGPT",
    shortName: "ChatGPT",
    provider: "OpenAI",
    url: "https://chatgpt.com",
    textClass: "text-teal-400",
    bgClass: "bg-teal-950/20",
    borderClass: "border-teal-900/50",
    activeBgClass: "bg-teal-950/40",
    accentHex: "#14B8A6",
    badgeText: "FREE TIER",
    freeInfo: "GPT-4o / GPT-4o-mini free — memory, custom instructions, and GPTs",
    strengths: ["Highly versatile", "Custom Instructions", "Fast responses (mini)", "Multimodal uploads"],
    bestFor: ["Everyday tasks", "Creative writing", "Code generation", "Quick summaries"],
    promptingStyle: "ChatGPT responds best to clear, direct instructions structured with Markdown. Provide a clear persona, list constraints, and specify the format of the output. ChatGPT benefits from few-shot examples (providing 1-2 example inputs and outputs) for complex formatting.",
    promptingTips: [
      "Define a persona: 'Act as a Senior React Developer with 10 years experience.'",
      "List constraints clearly using bullet points to prevent unwanted output.",
      "Provide few-shot examples for complex formatting or tone matching.",
      "Specify output format: 'Output only the raw code, with no explanations.'"
    ],
    systemPromptSupport: false,
    contextWindow: "128K tokens",
    iconEmoji: "🗲"
  },
  {
    id: "claude",
    name: "Claude AI",
    shortName: "Claude",
    provider: "Anthropic",
    url: "https://claude.ai",
    textClass: "text-amber-400",
    bgClass: "bg-amber-950/20",
    borderClass: "border-amber-900/50",
    activeBgClass: "bg-amber-950/40",
    accentHex: "#F59E0B",
    badgeText: "FREE TIER",
    freeInfo: "Claude.ai free — Claude 3.5 Sonnet / Haiku access",
    strengths: ["XML tag comprehension", "Long reasoning chains", "High-quality coding", "Nuanced instruction following"],
    bestFor: ["Technical writing", "Refining messy code", "Logical reasoning", "Complex analysis"],
    promptingStyle: "Claude is specifically trained to respond to XML-tagged sections (like <context>, <instructions>, <examples>, <task>). Wrap different parts of your prompt in tags. Claude follows negative constraints (things to NOT do) exceptionally well. Telling it to think inside <thinking> tags yields better logic.",
    promptingTips: [
      "Structure your prompt using XML tags: <context>, <instructions>, <task>.",
      "Include explicit negative constraints: 'Do NOT write any boilerplate or summary text.'",
      "Add: 'Think step-by-step inside <thinking> tags before outputting any code/answers.'",
      "Provide 1-2 examples of ideal output inside <examples> tags to align tone or format."
    ],
    systemPromptSupport: false,
    contextWindow: "200K tokens",
    iconEmoji: "◆"
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    shortName: "Perplexity",
    provider: "Perplexity",
    url: "https://perplexity.ai",
    textClass: "text-cyan-400",
    bgClass: "bg-cyan-950/20",
    borderClass: "border-cyan-900/50",
    activeBgClass: "bg-cyan-950/40",
    accentHex: "#22D3EE",
    badgeText: "FREE RESEARCH",
    freeInfo: "Free web search engine — grounded in real-time citations",
    strengths: ["Real-time web search", "Citation-backed answers", "Academic source filtering", "Current events knowledge"],
    bestFor: ["Research with sources", "Fact verification", "Finding recent studies", "Competitive analysis"],
    promptingStyle: "Perplexity is a search-engine hybrid. Prompts should be framed as research queries. Direct the model on which sources to prioritize (e.g. 'prioritize academic papers / Reddit / official docs') and specify a target timeline. Ask for structured summaries with citations.",
    promptingTips: [
      "Select 'Focus' modes (Academic, Writing, Reddit, YouTube) to filter sources.",
      "State time constraints: 'Search for articles from the last 6 months...'",
      "Instruct: 'Include in-text citations linking directly to the sources for all claims.'",
      "Request structured tables comparing different viewpoints or facts."
    ],
    systemPromptSupport: false,
    contextWindow: "Search-context based",
    iconEmoji: "◎"
  },
  {
    id: "mistral",
    name: "Mistral / Le Chat",
    shortName: "Le Chat",
    provider: "Mistral AI",
    url: "https://chat.mistral.ai",
    textClass: "text-pink-400",
    bgClass: "bg-pink-950/20",
    borderClass: "border-pink-900/50",
    activeBgClass: "bg-pink-950/40",
    accentHex: "#F472B6",
    badgeText: "VERY GENEROUS",
    freeInfo: "Mistral Large 2 free on Le Chat — strong coding & multilingual",
    strengths: ["Code generation", "Multilingual (25+ languages)", "Direct instruction following", "Document drafting"],
    bestFor: ["Coding tasks", "Translation", "Long-form drafting", "Data analysis"],
    promptingStyle: "Mistral Large is a direct instruction-following model. It excels at following constraints when structured as a numbered set of instructions. For code tasks, explicitly state the coding standard, framework version, and required error handling.",
    promptingTips: [
      "List rules as numbered instructions: '1. Use ES6 syntax. 2. Handle errors with try/catch.'",
      "For multilingual tasks, specify the target locale (e.g., 'Translate to French (France)').",
      "Use 'Output ONLY the response without any conversational intro or outro.'",
      "Provide system instructions as a separate block at the start of your prompt."
    ],
    systemPromptSupport: false,
    contextWindow: "128K tokens",
    iconEmoji: "◇"
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    shortName: "DeepSeek",
    provider: "DeepSeek",
    url: "https://chat.deepseek.com",
    textClass: "text-indigo-400",
    bgClass: "bg-indigo-950/20",
    borderClass: "border-indigo-900/50",
    activeBgClass: "bg-indigo-950/40",
    accentHex: "#818CF8",
    badgeText: "FREE",
    freeInfo: "DeepSeek V3 + R1 free — excellent reasoning and math",
    strengths: ["Complex reasoning (R1 mode)", "Math and logic", "Code debugging", "Multi-step analysis"],
    bestFor: ["Math problems", "Complex code debugging", "Logical reasoning", "Research summarization"],
    promptingStyle: "DeepSeek has two main modes: V3 (general chat) and R1 (reasoning). In standard V3 mode, it responds well to clear, direct prompts. In R1 mode, it uses an internal thinking engine. For R1, do NOT tell it to 'think step-by-step' or explain its reasoning — this is handled automatically. Specify output formatting and strict constraints explicitly.",
    promptingTips: [
      "For logic, math, and code, enable 'Deep Think' (R1); for translation and quick answers, use standard V3.",
      "Do NOT add 'think step-by-step' or ask it to show its reasoning; let R1's thinking run naturally.",
      "Set strict output constraints (e.g. 'Output ONLY valid JSON' or 'Do not alter the function name').",
      "Provide detailed context and source documentation — R1 excels at parsing complex rules."
    ],
    systemPromptSupport: false,
    contextWindow: "128K tokens",
    iconEmoji: "◈"
  },
  {
    id: "grok",
    name: "Grok",
    shortName: "Grok",
    provider: "xAI",
    url: "https://x.com/i/grok",
    textClass: "text-slate-300",
    bgClass: "bg-slate-800/30",
    borderClass: "border-slate-700/50",
    activeBgClass: "bg-slate-800/50",
    accentHex: "#94A3B8",
    badgeText: "FREE ON X",
    freeInfo: "Grok 3 free on X.com — real-time X platform data & deepsearch",
    strengths: ["Real-time X/Twitter data", "Image generation (Aurora)", "Deepsearch mode", "Coding and math reasoning"],
    bestFor: ["X/Twitter trend analysis", "Current events research", "Image generation", "Conversational brainstorming"],
    promptingStyle: "Grok 3 excels at real-time trend analysis and math/reasoning. Grok has a default witty tone, but is highly objective if directed. Use its 'Deepsearch' mode for complex research or coding, and leverage its integration with the X platform by telling it where to search.",
    promptingTips: [
      "To query live events, write: 'Check recent X posts about [topic] from today.'",
      "Add: 'Respond in a professional, objective tone' to turn off Grok's default humor.",
      "Use 'Deepsearch' or 'Think' mode in X for multi-step reasoning tasks.",
      "For image generation, describe camera angle, lighting, and style parameters clearly."
    ],
    systemPromptSupport: false,
    contextWindow: "128K tokens",
    iconEmoji: "✕"
  }
];
