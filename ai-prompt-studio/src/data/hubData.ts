// src/data/hubData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Curated + cited data powering Career Finder and the Resource Hub.
//
// THE RULE (enforced by structure): every factual claim carries a Citation
// { source, url, asOf }. If a claim has no citation, the UI shows
// "insufficient data" instead of guessing. Nothing is predicted without a source.
//
// This is a SEED set, not exhaustive. Extending it = adding rows below,
// never editing component logic. Reuses the shared StudentLevel taxonomy.
// ─────────────────────────────────────────────────────────────────────────────

import type { StudentLevel } from "./studentPresets";

export interface Citation {
  source: string;   // human-readable label
  url: string;      // authoritative/official link
  asOf: string;     // when this was last verified, e.g. "Jan 2025"
}

// Shared, reusable citations -----------------------------------------------------
const WEF_2025: Citation = {
  source: "WEF Future of Jobs Report 2025",
  url: "https://www.weforum.org/publications/the-future-of-jobs-report-2025/",
  asOf: "Jan 2025",
};
const ICAI: Citation = { source: "ICAI (official)", url: "https://www.icai.org", asOf: "2025 (New Scheme)" };
const ICSI: Citation = { source: "ICSI (official)", url: "https://www.icsi.edu", asOf: "2025" };
const CFA:  Citation = { source: "CFA Institute (official)", url: "https://www.cfainstitute.org", asOf: "2025" };

// ─── CAREERS ─────────────────────────────────────────────────────────────────
export type DemandSignal = "growing" | "stable" | "declining" | "insufficient-data";

export interface LocalDemand {
  location: string;            // e.g. "Maharashtra, IN"
  signal: DemandSignal;
  note: string;
  cite: Citation;              // local demand MUST be cited or it doesn't go in
}

export interface CareerPath {
  id: string;
  title: string;
  field: string;
  levels: StudentLevel[];
  summary: string;
  qualifications: string[];
  coreSkills: string[];
  governingBody?: string;
  pathCite?: Citation;         // source for the qualification path
  outlook: { signal: DemandSignal; note: string; cite?: Citation };
  localDemand: LocalDemand[];  // seeded empty — add cited local data over time
  fitFor: string[];
  notFitIf: string[];
  matches: string[];           // lowercase keywords matched against "what are you pursuing"
}

export const CAREERS: CareerPath[] = [
  {
    id: "ca",
    title: "Chartered Accountant (CA)",
    field: "Commerce & Finance",
    levels: ["college", "competitive"],
    summary: "Licensed professional in accounting, audit, taxation and financial compliance.",
    qualifications: [
      "Class 12 → CA Foundation",
      "CA Intermediate (2 groups, 6 papers under the New Scheme)",
      "Articleship (practical training) + ICAI self-paced modules",
      "CA Final",
    ],
    coreSkills: ["Financial reporting", "Auditing", "Direct & indirect tax", "Analytical rigour", "Ethics & law"],
    governingBody: "ICAI",
    pathCite: ICAI,
    outlook: { signal: "stable", note: "Core finance profession with steady demand; specialisation (forensic, risk, financial services) is emphasised in the New Scheme.", cite: ICAI },
    localDemand: [],
    fitFor: ["Detail-oriented with numbers", "Comfortable with long-haul study & discipline", "Interested in law + accounting"],
    notFitIf: ["You want fast results", "You dislike detailed rules and accounting standards"],
    matches: ["bcom", "b.com", "commerce", "accounting", "ca", "finance", "accounts"],
  },
  {
    id: "cs",
    title: "Company Secretary (CS)",
    field: "Commerce & Finance",
    levels: ["college", "competitive"],
    summary: "Corporate governance, secretarial and compliance specialist for companies.",
    qualifications: [
      "CSEET → CS Executive → CS Professional (per ICSI)",
      "Practical training as prescribed by ICSI",
    ],
    coreSkills: ["Corporate & company law", "Compliance & governance", "Drafting", "Board procedures"],
    governingBody: "ICSI",
    pathCite: ICSI,
    outlook: { signal: "stable", note: "Demand tied to corporate compliance needs; verify the current scheme on icsi.edu.", cite: ICSI },
    localDemand: [],
    fitFor: ["Enjoy law & regulation", "Methodical and precise", "Interested in corporate governance"],
    notFitIf: ["You dislike legal/regulatory detail"],
    matches: ["bcom", "b.com", "commerce", "cs", "company secretary", "law", "legal"],
  },
  {
    id: "equity-research",
    title: "Financial / Equity Research Analyst",
    field: "Commerce & Finance",
    levels: ["college", "professional"],
    summary: "Analyses companies and securities to support investment decisions.",
    qualifications: [
      "Degree in finance / commerce / economics (typical)",
      "CFA Program is a recognised credential (3 levels, optional but valued)",
      "Strong financial-modelling portfolio",
    ],
    coreSkills: ["Valuation & financial modelling", "Excel", "Reading financial statements", "Research & writing"],
    pathCite: CFA,
    outlook: { signal: "growing", note: "Fintech-adjacent finance roles are among the faster-growing categories.", cite: WEF_2025 },
    localDemand: [],
    fitFor: ["Curious about markets & businesses", "Strong with numbers + writing", "Self-driven research habits"],
    notFitIf: ["You dislike uncertainty / market volatility"],
    matches: ["bcom", "b.com", "commerce", "finance", "economics", "equity", "investment", "research", "analyst"],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    field: "Data & Analytics",
    levels: ["college", "professional"],
    summary: "Turns raw data into insights that drive decisions.",
    qualifications: [
      "Any quantitative-friendly degree",
      "SQL + Python/R + statistics (often self-taught + portfolio)",
    ],
    coreSkills: ["SQL", "Python or R", "Statistics", "Data visualisation", "Business sense"],
    outlook: { signal: "growing", note: "Data analysts and big-data specialists are listed among the fastest-growing roles to 2030.", cite: WEF_2025 },
    localDemand: [],
    fitFor: ["Like finding patterns in data", "Comfortable with logic & some coding", "Want a fast-entry data path"],
    notFitIf: ["You avoid anything quantitative"],
    matches: ["bcom", "b.com", "statistics", "computer", "data", "analytics", "maths", "mathematics", "economics", "bca", "b.tech"],
  },
  {
    id: "software-dev",
    title: "Software Developer",
    field: "Technology",
    levels: ["college", "professional"],
    summary: "Designs and builds software applications and systems.",
    qualifications: ["CS/IT degree OR self-taught with a strong project portfolio"],
    coreSkills: ["A programming language", "Data structures & algorithms", "Version control (git)", "Problem-solving"],
    outlook: { signal: "growing", note: "Software and application developers rank among the fastest-growing roles.", cite: WEF_2025 },
    localDemand: [],
    fitFor: ["Enjoy building things & solving puzzles", "Patient with debugging", "Like continuous learning"],
    notFitIf: ["You dislike sitting with hard problems for long stretches"],
    matches: ["computer", "bca", "b.tech", "cs", "coding", "software", "it", "programming", "engineering"],
  },
  {
    id: "ml-specialist",
    title: "AI / Machine Learning Specialist",
    field: "Technology",
    levels: ["college", "professional"],
    summary: "Builds models that learn from data for prediction and automation.",
    qualifications: [
      "Strong maths (linear algebra, probability, calculus)",
      "CS + ML coursework; postgrad common but not mandatory",
      "Demonstrable ML projects",
    ],
    coreSkills: ["Python", "Maths/statistics", "ML frameworks", "Data handling", "Experimentation"],
    outlook: { signal: "growing", note: "AI and machine-learning specialists top the fastest-growing roles in percentage terms.", cite: WEF_2025 },
    localDemand: [],
    fitFor: ["Strong in maths", "Enjoy experimentation", "Comfortable with ambiguity"],
    notFitIf: ["You dislike maths", "You want highly predictable, rule-based work"],
    matches: ["computer", "b.tech", "data", "ai", "machine learning", "ml", "maths", "mathematics", "statistics", "bca"],
  },
  {
    id: "fintech-engineer",
    title: "Fintech Engineer",
    field: "Technology & Finance",
    levels: ["college", "professional"],
    summary: "Builds the software behind payments, trading, lending and financial platforms.",
    qualifications: ["Software engineering skills + finance-domain understanding"],
    coreSkills: ["Programming", "Systems design", "Finance fundamentals", "Security awareness"],
    outlook: { signal: "growing", note: "Fintech engineers are listed among the top fastest-growing roles to 2030.", cite: WEF_2025 },
    localDemand: [],
    fitFor: ["Like both code and finance", "Detail-focused", "Interested in real-world money systems"],
    notFitIf: ["You want pure-research work with no product pressure"],
    matches: ["finance", "computer", "fintech", "software", "commerce", "bcom", "b.com", "b.tech", "coding"],
  },
];

export const CAREER_FIELDS = Array.from(new Set(CAREERS.map(c => c.field)));

// ─── RESOURCES ───────────────────────────────────────────────────────────────
export type ResourceCategory =
  | "Learn" | "Courses" | "Practice"
  | "Commerce & Finance" | "Arts & Humanities" | "Research"
  | "Archives & Libraries" | "Tools" | "Utilities"
  | "Jobs & Internships" | "Startup" | "Problem-Solvers";
export type ResourceCost = "free" | "freemium" | "free-audit" | "paid";

export interface Resource {
  id: string;
  name: string;
  url: string;             // official link — also serves as the citation
  category: ResourceCategory;
  levels: StudentLevel[];
  cost: ResourceCost;
  bestFor: string;
  reputationNote?: string; // editorial / qualitative — NOT presented as hard data
  asOf: string;
}

const Y = "2026";
const ALL: StudentLevel[] = ["school", "college", "competitive", "professional"];

export const RESOURCES: Resource[] = [
  // ── Learn ────────────────────────────────────────────────────────────────
  { id: "fcc", name: "freeCodeCamp", url: "https://www.freecodecamp.org", category: "Learn", levels: ["college", "professional"], cost: "free", bestFor: "Hands-on coding & web/data curriculum", reputationNote: "Very widely recommended free coding path.", asOf: Y },
  { id: "khan", name: "Khan Academy", url: "https://www.khanacademy.org", category: "Learn", levels: ["school", "college"], cost: "free", bestFor: "School maths & science from scratch", reputationNote: "Long-standing go-to for school foundations.", asOf: Y },
  { id: "mitocw", name: "MIT OpenCourseWare", url: "https://ocw.mit.edu", category: "Learn", levels: ["college", "professional"], cost: "free", bestFor: "Full university course materials, free", asOf: Y },
  { id: "mdn", name: "MDN Web Docs", url: "https://developer.mozilla.org", category: "Learn", levels: ["college", "professional"], cost: "free", bestFor: "Authoritative web-development reference", asOf: Y },
  { id: "odin", name: "The Odin Project", url: "https://www.theodinproject.com", category: "Learn", levels: ["college", "professional"], cost: "free", bestFor: "Full open-source web-dev path", asOf: Y },
  { id: "fcc-yt", name: "freeCodeCamp (YouTube)", url: "https://www.youtube.com/c/Freecodecamp", category: "Learn", levels: ["college", "professional"], cost: "free", bestFor: "Full-length free course videos", reputationNote: "YouTube picks are subjective — one of the most established channels.", asOf: Y },

  // ── Courses (platforms & aggregators) ──────────────────────────────────────
  { id: "nptel", name: "NPTEL / SWAYAM", url: "https://nptel.ac.in", category: "Courses", levels: ["college", "competitive"], cost: "free", bestFor: "Indian university courses + recognised certificates", reputationNote: "Govt-backed (India); certificate via paid exam optional.", asOf: Y },
  { id: "cs50", name: "CS50 (Harvard)", url: "https://cs50.harvard.edu", category: "Courses", levels: ["college"], cost: "free", bestFor: "The classic intro to computer science", asOf: Y },
  { id: "coursera", name: "Coursera", url: "https://www.coursera.org", category: "Courses", levels: ["college", "professional"], cost: "free-audit", bestFor: "University courses — audit free, certificate paid", asOf: Y },
  { id: "edx", name: "edX", url: "https://www.edx.org", category: "Courses", levels: ["college", "professional"], cost: "free-audit", bestFor: "University courses — audit free", asOf: Y },
  { id: "classcentral", name: "Class Central", url: "https://www.classcentral.com", category: "Courses", levels: ALL, cost: "free", bestFor: "Search engine for free online courses", reputationNote: "Aggregates & ranks courses across providers.", asOf: Y },
  { id: "alison", name: "Alison", url: "https://alison.com", category: "Courses", levels: ["college", "professional"], cost: "freemium", bestFor: "Free certificate courses", asOf: Y },

  // ── Practice ───────────────────────────────────────────────────────────────
  { id: "leetcode", name: "LeetCode", url: "https://leetcode.com", category: "Practice", levels: ["college", "professional"], cost: "freemium", bestFor: "Coding-interview practice", asOf: Y },
  { id: "kaggle", name: "Kaggle", url: "https://www.kaggle.com", category: "Practice", levels: ["college", "professional"], cost: "free", bestFor: "Datasets, notebooks & data-science competitions", asOf: Y },
  { id: "hackerrank", name: "HackerRank", url: "https://www.hackerrank.com", category: "Practice", levels: ["college", "professional"], cost: "freemium", bestFor: "Skill drills & coding assessments", asOf: Y },
  { id: "exercism", name: "Exercism", url: "https://exercism.org", category: "Practice", levels: ["college", "professional"], cost: "free", bestFor: "Mentored coding exercises, 70+ languages", asOf: Y },

  // ── Commerce & Finance ─────────────────────────────────────────────────────
  { id: "varsity", name: "Zerodha Varsity", url: "https://zerodha.com/varsity", category: "Commerce & Finance", levels: ["college", "competitive", "professional"], cost: "free", bestFor: "Markets, trading & finance — beginner to advanced (India)", reputationNote: "Widely praised free Indian finance curriculum.", asOf: Y },
  { id: "investopedia", name: "Investopedia", url: "https://www.investopedia.com", category: "Commerce & Finance", levels: ["college", "professional"], cost: "free", bestFor: "Finance & investing concepts dictionary", asOf: Y },
  { id: "cfi", name: "Corporate Finance Institute", url: "https://corporatefinanceinstitute.com", category: "Commerce & Finance", levels: ["college", "professional"], cost: "freemium", bestFor: "Financial modelling & valuation resources", asOf: Y },
  { id: "screener", name: "Screener.in", url: "https://www.screener.in", category: "Commerce & Finance", levels: ["college", "professional"], cost: "freemium", bestFor: "Free fundamental data on Indian companies", reputationNote: "Popular for equity research in India.", asOf: Y },
  { id: "icai-bos", name: "ICAI Board of Studies", url: "https://www.icai.org", category: "Commerce & Finance", levels: ["competitive"], cost: "free", bestFor: "Official CA study material & past papers", asOf: Y },
  { id: "icsi-bos", name: "ICSI Academic Portal", url: "https://www.icsi.edu", category: "Commerce & Finance", levels: ["competitive"], cost: "free", bestFor: "Official CS study material", asOf: Y },
  { id: "rbi", name: "RBI", url: "https://www.rbi.org.in", category: "Commerce & Finance", levels: ["college", "competitive", "professional"], cost: "free", bestFor: "Central-bank data, circulars & reports (India)", asOf: Y },
  { id: "nse", name: "NSE India", url: "https://www.nseindia.com", category: "Commerce & Finance", levels: ["college", "professional"], cost: "free", bestFor: "Live market data & filings", asOf: Y },
  { id: "mca", name: "MCA (Corporate Affairs)", url: "https://www.mca.gov.in", category: "Commerce & Finance", levels: ["competitive", "professional"], cost: "free", bestFor: "Company filings & corporate law (India)", asOf: Y },

  // ── Arts & Humanities ──────────────────────────────────────────────────────
  { id: "googlearts", name: "Google Arts & Culture", url: "https://artsandculture.google.com", category: "Arts & Humanities", levels: ALL, cost: "free", bestFor: "Explore art & museum collections worldwide", asOf: Y },
  { id: "met", name: "The Met Open Access", url: "https://www.metmuseum.org/art/collection", category: "Arts & Humanities", levels: ALL, cost: "free", bestFor: "Free, openly-licensed artwork images", reputationNote: "Open-access works free to use.", asOf: Y },
  { id: "smithsonian", name: "Smithsonian Open Access", url: "https://www.si.edu/openaccess", category: "Arts & Humanities", levels: ALL, cost: "free", bestFor: "Millions of free open-access cultural images", asOf: Y },
  { id: "wikiart", name: "WikiArt", url: "https://www.wikiart.org", category: "Arts & Humanities", levels: ["school", "college"], cost: "free", bestFor: "Visual art encyclopedia", asOf: Y },
  { id: "poetryfound", name: "Poetry Foundation", url: "https://www.poetryfoundation.org", category: "Arts & Humanities", levels: ["school", "college"], cost: "free", bestFor: "Vast free poetry archive", asOf: Y },

  // ── Research ───────────────────────────────────────────────────────────────
  { id: "scholar", name: "Google Scholar", url: "https://scholar.google.com", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "Search scholarly papers & citations", asOf: Y },
  { id: "arxiv", name: "arXiv", url: "https://arxiv.org", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "Open-access preprints (STEM)", asOf: Y },
  { id: "doaj", name: "DOAJ", url: "https://doaj.org", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "Directory of open-access journals", asOf: Y },
  { id: "pubmed", name: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "Biomedical & life-sciences literature", asOf: Y },
  { id: "ssrn", name: "SSRN", url: "https://www.ssrn.com", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "Social-science & finance working papers", asOf: Y },
  { id: "semanticscholar", name: "Semantic Scholar", url: "https://www.semanticscholar.org", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "AI-powered paper search", asOf: Y },
  { id: "connectedpapers", name: "Connected Papers", url: "https://www.connectedpapers.com", category: "Research", levels: ["college", "professional"], cost: "freemium", bestFor: "Visual map of related papers", asOf: Y },
  { id: "core", name: "CORE", url: "https://core.ac.uk", category: "Research", levels: ["college", "professional"], cost: "free", bestFor: "Aggregator of open-access research", asOf: Y },

  // ── Archives & Libraries (legal, non-piracy) ───────────────────────────────
  { id: "archiveorg", name: "Internet Archive", url: "https://archive.org", category: "Archives & Libraries", levels: ALL, cost: "free", bestFor: "Books, audio, video, web & software archive", reputationNote: "Legal non-profit archive & library.", asOf: Y },
  { id: "openlibrary", name: "Open Library", url: "https://openlibrary.org", category: "Archives & Libraries", levels: ALL, cost: "free", bestFor: "Borrow digital books (controlled lending)", reputationNote: "Internet Archive project — legal lending.", asOf: Y },
  { id: "ndli", name: "National Digital Library of India", url: "https://ndl.iitkgp.ac.in", category: "Archives & Libraries", levels: ALL, cost: "free", bestFor: "Govt-run library across all levels & subjects (India)", asOf: Y },
  { id: "hathitrust", name: "HathiTrust", url: "https://www.hathitrust.org", category: "Archives & Libraries", levels: ["college", "professional"], cost: "free", bestFor: "Digitised academic library collections", asOf: Y },
  { id: "doab", name: "Directory of Open Access Books", url: "https://www.doabooks.org", category: "Archives & Libraries", levels: ["college", "professional"], cost: "free", bestFor: "Peer-reviewed open-access books", asOf: Y },
  { id: "openstax", name: "OpenStax", url: "https://openstax.org", category: "Archives & Libraries", levels: ["school", "college"], cost: "free", bestFor: "Peer-reviewed, openly-licensed textbooks", reputationNote: "Legally free (Rice University).", asOf: Y },
  { id: "gutenberg", name: "Project Gutenberg", url: "https://www.gutenberg.org", category: "Archives & Libraries", levels: ALL, cost: "free", bestFor: "70,000+ public-domain books", reputationNote: "Legally free public-domain works.", asOf: Y },
  { id: "loc", name: "Library of Congress", url: "https://www.loc.gov", category: "Archives & Libraries", levels: ALL, cost: "free", bestFor: "Huge digital collections & primary sources", asOf: Y },

  // ── Tools (study & productivity) ───────────────────────────────────────────
  { id: "anki", name: "Anki", url: "https://apps.ankiweb.net", category: "Tools", levels: ["school", "college", "competitive"], cost: "free", bestFor: "Spaced-repetition flashcards", asOf: Y },
  { id: "notion", name: "Notion", url: "https://www.notion.so", category: "Tools", levels: ["college", "professional"], cost: "freemium", bestFor: "Notes, planning & organisation", asOf: Y },
  { id: "obsidian", name: "Obsidian", url: "https://obsidian.md", category: "Tools", levels: ["college", "professional"], cost: "freemium", bestFor: "Local-first linked notes / knowledge base", asOf: Y },
  { id: "zotero", name: "Zotero", url: "https://www.zotero.org", category: "Tools", levels: ["college", "professional"], cost: "free", bestFor: "Reference & citation manager", asOf: Y },
  { id: "overleaf", name: "Overleaf", url: "https://www.overleaf.com", category: "Tools", levels: ["college", "professional"], cost: "freemium", bestFor: "LaTeX writing for reports & theses", asOf: Y },
  { id: "desmos", name: "Desmos", url: "https://www.desmos.com", category: "Tools", levels: ["school", "college"], cost: "free", bestFor: "Free graphing calculator", asOf: Y },
  { id: "geogebra", name: "GeoGebra", url: "https://www.geogebra.org", category: "Tools", levels: ["school", "college"], cost: "free", bestFor: "Interactive geometry, algebra & calculus", asOf: Y },
  { id: "excalidraw", name: "Excalidraw", url: "https://excalidraw.com", category: "Tools", levels: ALL, cost: "free", bestFor: "Quick hand-drawn-style diagrams", asOf: Y },

  // ── Utilities (convenient internet tools) ──────────────────────────────────
  { id: "removebg", name: "remove.bg", url: "https://www.remove.bg", category: "Utilities", levels: ALL, cost: "freemium", bestFor: "One-click background removal", asOf: Y },
  { id: "photopea", name: "Photopea", url: "https://www.photopea.com", category: "Utilities", levels: ALL, cost: "free", bestFor: "Free Photoshop-style editor in the browser", asOf: Y },
  { id: "canva", name: "Canva", url: "https://www.canva.com", category: "Utilities", levels: ALL, cost: "freemium", bestFor: "Design + passport-photo & resume templates", reputationNote: "Has passport-size photo templates.", asOf: Y },
  { id: "iloveimg", name: "iLoveIMG", url: "https://www.iloveimg.com", category: "Utilities", levels: ALL, cost: "freemium", bestFor: "Resize, crop, compress & convert images", asOf: Y },
  { id: "tinypng", name: "TinyPNG", url: "https://tinypng.com", category: "Utilities", levels: ALL, cost: "free", bestFor: "Compress PNG/JPG without quality loss", asOf: Y },
  { id: "ilovepdf", name: "iLovePDF", url: "https://www.ilovepdf.com", category: "Utilities", levels: ALL, cost: "freemium", bestFor: "Merge, split, compress & convert PDFs", asOf: Y },
  { id: "cloudconvert", name: "CloudConvert", url: "https://cloudconvert.com", category: "Utilities", levels: ALL, cost: "freemium", bestFor: "Convert almost any file format", asOf: Y },
  { id: "hemingway", name: "Hemingway Editor", url: "https://hemingwayapp.com", category: "Utilities", levels: ["school", "college", "professional"], cost: "free", bestFor: "Make writing clearer & more readable", asOf: Y },

  // ── Jobs & Internships ─────────────────────────────────────────────────────
  { id: "internshala", name: "Internshala", url: "https://internshala.com", category: "Jobs & Internships", levels: ["college", "professional"], cost: "freemium", bestFor: "Internships & entry roles (India)", asOf: Y },
  { id: "unstop", name: "Unstop", url: "https://unstop.com", category: "Jobs & Internships", levels: ["college", "professional"], cost: "free", bestFor: "Competitions, hackathons & internships (India)", asOf: Y },
  { id: "linkedin", name: "LinkedIn", url: "https://www.linkedin.com", category: "Jobs & Internships", levels: ["college", "professional"], cost: "freemium", bestFor: "Networking + job listings", asOf: Y },
  { id: "wellfound", name: "Wellfound", url: "https://wellfound.com", category: "Jobs & Internships", levels: ["college", "professional"], cost: "free", bestFor: "Startup jobs & internships", asOf: Y },
  { id: "naukri", name: "Naukri", url: "https://www.naukri.com", category: "Jobs & Internships", levels: ["professional"], cost: "freemium", bestFor: "Large India job board", asOf: Y },
  { id: "indeed", name: "Indeed", url: "https://www.indeed.com", category: "Jobs & Internships", levels: ["professional"], cost: "free", bestFor: "Global job aggregator", asOf: Y },

  // ── Startup ────────────────────────────────────────────────────────────────
  { id: "ycss", name: "YC Startup School", url: "https://www.startupschool.org", category: "Startup", levels: ["college", "professional"], cost: "free", bestFor: "Free startup-building curriculum (Y Combinator)", asOf: Y },
  { id: "producthunt", name: "Product Hunt", url: "https://www.producthunt.com", category: "Startup", levels: ["college", "professional"], cost: "free", bestFor: "Discover & launch new products", asOf: Y },
  { id: "indiehackers", name: "Indie Hackers", url: "https://www.indiehackers.com", category: "Startup", levels: ["professional"], cost: "free", bestFor: "Stories & community for solo founders", asOf: Y },
  { id: "huggingface", name: "Hugging Face", url: "https://huggingface.co", category: "Startup", levels: ["college", "professional"], cost: "freemium", bestFor: "Build, host & ship AI apps & models", asOf: Y },

  // ── Problem-Solvers ────────────────────────────────────────────────────────
  { id: "stackoverflow", name: "Stack Overflow", url: "https://stackoverflow.com", category: "Problem-Solvers", levels: ["college", "professional"], cost: "free", bestFor: "Q&A for specific coding problems", asOf: Y },
  { id: "wolfram", name: "Wolfram Alpha", url: "https://www.wolframalpha.com", category: "Problem-Solvers", levels: ["school", "college"], cost: "freemium", bestFor: "Step-by-step maths & computation", asOf: Y },
  { id: "symbolab", name: "Symbolab", url: "https://www.symbolab.com", category: "Problem-Solvers", levels: ["school", "college"], cost: "freemium", bestFor: "Step-by-step maths solver", asOf: Y },
  { id: "regex101", name: "regex101", url: "https://regex101.com", category: "Problem-Solvers", levels: ["college", "professional"], cost: "free", bestFor: "Build & debug regular expressions", asOf: Y },
];

export const RESOURCE_CATEGORIES: ResourceCategory[] = [
  "Learn", "Courses", "Practice", "Commerce & Finance", "Arts & Humanities",
  "Research", "Archives & Libraries", "Tools", "Utilities", "Jobs & Internships", "Startup", "Problem-Solvers",
];

// ─── matching helper for Career Finder ─────────────────────────────────────────
export function matchCareers(pursuit: string): CareerPath[] {
  const q = pursuit.toLowerCase().trim();
  if (!q) return [];
  const tokens = q.split(/[^a-z.+]+/).filter(Boolean);
  const scored = CAREERS.map(c => {
    let score = 0;
    for (const kw of c.matches) {
      if (q.includes(kw)) score += 2;
      else if (tokens.some(t => t === kw || kw.includes(t) && t.length > 2)) score += 1;
    }
    return { c, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  return scored.map(x => x.c);
}
