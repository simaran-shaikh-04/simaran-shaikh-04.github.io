// src/data/careerHubData.ts

export interface CareerResource {
  id: string;
  name: string;
  url: string;
  stars: number;
  cost: "free" | "freemium";
  bestFor: string;
  skills: string[];
  reputation: string; // qualitative/industry note
  aiClassification?: "resistant" | "augmented";
  qualifications?: string[]; // required qualifications for this career
}

export interface CareerCategory {
  id: string;
  title: string;
  description: string;
  resources: CareerResource[];
}

export const CAREER_HUB_CATEGORIES: CareerCategory[] = [
  {
    id: "data-analysis",
    title: "Data Analysis & SQL Foundations",
    description: "The core skill of modern business analytics. Master SQL, query building, database operations, and data transformations.",
    resources: [
      {
        id: "sqlbolt",
        name: "SQLBolt",
        url: "https://sqlbolt.com",
        stars: 5,
        cost: "free",
        bestFor: "Interactive, step-by-step SQL tutorials directly in your browser",
        skills: ["SQL SELECT", "Table Joins", "Aggregations", "Filtering Data"],
        reputation: "Highly recommended for absolute beginners to build confidence.",
        qualifications: ["No formal prerequisite; self-taught portfolio is key for jobs"]
      },
      {
        id: "sqlzoo",
        name: "SQLZoo",
        url: "https://sqlzoo.net",
        stars: 5,
        cost: "free",
        bestFor: "Hands-on SQL practice quizzes with immediate query testing",
        skills: ["Database Queries", "Subqueries", "SUM and COUNT", "SQL Joins"],
        reputation: "An industry-standard playground used by bootcamps worldwide.",
        qualifications: ["Ideal supplementary practice for analytical roles"]
      },
      {
        id: "mode-sql",
        name: "Mode Analytics SQL Tutorial",
        url: "https://mode.com/sql-tutorial",
        stars: 5,
        cost: "free",
        bestFor: "Advanced business analytics and real-world database queries",
        skills: ["Window Functions", "Data Wrangling", "Subqueries", "Performance Tuning"],
        reputation: "Highly trusted by data scientists for realistic analytics scenarios.",
        qualifications: ["Highly valued for Business Analyst / Data Analyst screenings"]
      },
      {
        id: "kaggle-sql",
        name: "Kaggle SQL Course",
        url: "https://www.kaggle.com/learn/intro-to-sql",
        stars: 5,
        cost: "free",
        bestFor: "BigQuery and large-dataset SQL operations inside Jupyter notebooks",
        skills: ["Google BigQuery", "Structured Queries", "AS & WITH clauses", "Group By"],
        reputation: "Best for transitioning SQL knowledge into Python environments.",
        qualifications: ["Good foundation for Data Engineers & Big Data Analysts"]
      },
      {
        id: "leetcode-sql",
        name: "LeetCode SQL Study Plan",
        url: "https://leetcode.com/studyplan/30-days-of-sql",
        stars: 4,
        cost: "freemium",
        bestFor: "Solving competitive database challenges for interview prep",
        skills: ["Complex Joins", "Database Schema", "Query Optimization", "CTE"],
        reputation: "Excellent for polishing skills to pass technical screenings.",
        qualifications: ["Used to clear technical rounds in top tech companies"]
      },
      {
        id: "w3-sql",
        name: "W3Schools SQL",
        url: "https://www.w3schools.com/sql",
        stars: 4,
        cost: "free",
        bestFor: "Quick syntactical reference, cheatsheets, and mini-quizzes",
        skills: ["SQL Syntax", "INSERT/UPDATE/DELETE", "Primary Keys", "Foreign Keys"],
        reputation: "The most popular quick-reference cheatsheet on the internet.",
        qualifications: ["Best reference tool for daily practice and basics"]
      }
    ]
  },
  {
    id: "emerging-careers",
    title: "Emerging Fields & Fast-Growing Roles",
    description: "Skills and careers not traditionally taught in school or college curriculums, but seeing exponential industry growth.",
    resources: [
      {
        id: "learn-prompting",
        name: "Learn Prompting",
        url: "https://learnprompting.org",
        stars: 5,
        cost: "free",
        bestFor: "Mastering Prompt Engineering, AI Ops, and LLM orchestration",
        skills: ["Prompt Design", "Few-Shot Learning", "AI Agents", "Adversarial Prompting"],
        reputation: "Award-winning comprehensive curriculum on using AI effectively.",
        qualifications: ["Open certification (Self-Study) / AI Practitioner portfolio"]
      },
      {
        id: "deeplearning-ai",
        name: "DeepLearning.AI (Andrew Ng)",
        url: "https://www.deeplearning.ai",
        stars: 5,
        cost: "free",
        bestFor: "Generative AI, AI Agent workflows, and vector databases",
        skills: ["LLM Orchestration", "RAG Systems", "AI Agents", "LangChain"],
        reputation: "Founded by industry icon Andrew Ng; considered the gold standard.",
        qualifications: ["Industry certificates / AI System Integrator credentials"]
      },
      {
        id: "bubble-academy",
        name: "Bubble Academy",
        url: "https://academy.bubble.io",
        stars: 4,
        cost: "free",
        bestFor: "No-Code Development, visual programming, and shipping web apps",
        skills: ["Visual Programming", "Database Design", "Workflow Logic", "API Connectors"],
        reputation: "The premier platform for building apps without writing code.",
        qualifications: ["Bubble Certified Developer / Freelance Consultant portfolio"]
      },
      {
        id: "webflow-univ",
        name: "Webflow University",
        url: "https://university.webflow.com",
        stars: 5,
        cost: "free",
        bestFor: "Visual CSS design, interaction development, and Web Design careers",
        skills: ["Visual CSS Grid", "Micro-Animations", "Flexbox Layout", "SEO Setup"],
        reputation: "Famed for its highly engaging, humorous, and clear courses.",
        qualifications: ["Webflow Certified Partner / Visual Developer Portfolio"]
      },
      {
        id: "cryptozombies",
        name: "CryptoZombies",
        url: "https://cryptozombies.io",
        stars: 5,
        cost: "free",
        bestFor: "Interactive Solidity programming for Smart Contracts & Blockchain",
        skills: ["Solidity", "Smart Contracts", "Web3.js", "Ethereum Basics"],
        reputation: "Learn coding by building a multiplayer zombie game.",
        qualifications: ["Web3 Developer Portfolio / Smart Contract Auditor credentials"]
      }
    ]
  },
  {
    id: "bcom-resistant",
    title: "B.Com Pathways: AI-Resistant Careers",
    description: "Traditional and advanced commerce roles that depend on human auditing, physical verification, regulatory law, and ethical judgement.",
    resources: [
      {
        id: "icai-bos",
        name: "ICAI Board of Studies (CA)",
        url: "https://www.icai.org",
        stars: 5,
        cost: "free",
        bestFor: "Chartered Accountancy - Statutory Audit, Forensic Audit & Tax Compliance",
        skills: ["Statutory Auditing", "Direct/Indirect Taxation", "Corporate Law", "Forensic Accounting"],
        reputation: "Regulated statutory audit must be signed by a licensed human CA.",
        aiClassification: "resistant",
        qualifications: ["Class 12 → CA Foundation", "CA Intermediate (6 Papers)", "Articleship (practical training)", "CA Final Exam"]
      },
      {
        id: "icsi-bos",
        name: "ICSI Academic Portal (CS)",
        url: "https://www.icsi.edu",
        stars: 5,
        cost: "free",
        bestFor: "Company Secretary - Legal Compliance, Corporate Governance & Board Procedures",
        skills: ["Company Law", "Corporate Governance", "Board Minutes", "Compliance Auditing"],
        reputation: "Fiduciary responsibilities and board mediation require human oversight.",
        aiClassification: "resistant",
        qualifications: ["CSEET Exam", "CS Executive Level", "CS Professional Level", "21-Month Practical Training"]
      },
      {
        id: "acfe-cfe",
        name: "ACFE (Certified Fraud Examiner)",
        url: "https://www.acfe.com",
        stars: 5,
        cost: "freemium",
        bestFor: "Forensic Accounting & Fraud Examination - investigating white-collar crime",
        skills: ["Forensic Audit", "Interrogation Techniques", "Fraud Schemes", "Legal Proceedings"],
        reputation: "Gold standard globally for financial crime investigators and corporate auditors.",
        aiClassification: "resistant",
        qualifications: ["Bachelor's Degree (B.Com/Law preferred)", "ACFE Point System (based on experience)", "CFE Exam (4 sections)"]
      },
      {
        id: "cfa-esg",
        name: "CFA ESG Investing Certificate",
        url: "https://www.cfainstitute.org/en/programs/esg-investing",
        stars: 5,
        cost: "freemium",
        bestFor: "ESG Specialist - Sustainable finance, ethical investing & green compliance",
        skills: ["ESG Integration", "Corporate Governance", "Climate Risk Audit", "Stewardship"],
        reputation: "The most respected global certificate for ethical and sustainable commerce.",
        aiClassification: "resistant",
        qualifications: ["No formal prerequisites", "Recommended 130 hours of self-study", "1 final computer-based exam"]
      },
      {
        id: "actuaries-india",
        name: "Actuarial Society of India",
        url: "https://www.actuariesindia.org",
        stars: 5,
        cost: "free",
        bestFor: "Actuarial Science - Advanced risk forecasting, insurance models & probability",
        skills: ["Risk Modeling", "Probability Statistics", "Pension Funds", "Financial Valuation"],
        reputation: "Complex mathematical risk assessment combined with legal compliance.",
        aiClassification: "resistant",
        qualifications: ["ACET Entrance Exam", "Core Principles Exams (CS/CM series)", "Core Practices & Specialist Exams"]
      },
      {
        id: "zerodha-varsity-law",
        name: "Zerodha Varsity (Corporate & Tax Law)",
        url: "https://zerodha.com/varsity",
        stars: 5,
        cost: "free",
        bestFor: "Learning foundational financial law, corporate taxes, and risk rules",
        skills: ["Corporate Taxation", "Filing Procedures", "Stock Market Rules", "Personal Finance"],
        reputation: "Best free Indian regulatory & markets study portal.",
        aiClassification: "resistant",
        qualifications: ["Excellent supplemental knowledge for CAs, CSs, and Corporate Lawyers"]
      },
      {
        id: "gst-practitioner",
        name: "GST Practitioner / Indirect Tax Advisor (CBIC)",
        url: "https://www.cbic.gov.in",
        stars: 5,
        cost: "free",
        bestFor: "GST compliance, filing tax returns, and representing clients before tax authorities",
        skills: ["GST Returns (GSTR 1/3B/9)", "Input Tax Credit Reconciliation", "Indirect Tax Advisory", "Legal Representation"],
        reputation: "Regulated by CBIC under Section 48 of the CGST Act; tax advisory and representation require human advocacy.",
        aiClassification: "resistant",
        qualifications: ["B.Com / BBA / Law Degree from a recognized university", "Enrollment on GST common portal", "NACIN GSTP Exam (must pass within 2 years of enrollment)"]
      },
      {
        id: "acca-global",
        name: "ACCA Global (Chartered Certified Accountant)",
        url: "https://www.accaglobal.com",
        stars: 5,
        cost: "freemium",
        bestFor: "Global finance, auditing, IFRS accounting, and business advisory services",
        skills: ["IFRS Reporting", "International Taxation", "Audit Assurance", "Business Ethics"],
        reputation: "Respected globally in 180+ countries; B.Com graduates receive up to 4 direct exemptions from papers.",
        aiClassification: "resistant",
        qualifications: ["Completed B.Com degree (exempts Applied Knowledge papers)", "Clear 9 remaining papers", "36 months practical experience"]
      },
      {
        id: "iibf-banking",
        name: "IIBF Commercial Banking & Credit Analyst",
        url: "https://www.iibf.org.in",
        stars: 5,
        cost: "free",
        bestFor: "Credit underwriting, corporate lending, banking risk assessment, and branch operations",
        skills: ["Credit Analysis", "Financial Ratio Analysis", "KYC & AML Compliance", "Risk Management"],
        reputation: "IIBF is the professional standard for Indian banks; loan sanctioning decisions require human credit appraisal.",
        aiClassification: "resistant",
        qualifications: ["B.Com or any Graduate degree", "Diploma in Banking & Finance (DBF) for entry level", "JAIIB / CAIIB certification once employed in a bank"]
      }
    ]
  },
  {
    id: "bcom-augmented",
    title: "B.Com Pathways: AI-Augmented / Tech Careers",
    description: "Commerce and finance roles where AI, automation, dashboards, and quantitative algorithms are heavily used.",
    resources: [
      {
        id: "us-cpa",
        name: "AICPA (US CPA Review)",
        url: "https://www.aicpa-cima.com",
        stars: 5,
        cost: "freemium",
        bestFor: "US Certified Public Accountant - Global accounting, taxation & audit standard",
        skills: ["US GAAP", "International Auditing", "IRS Tax Code", "Financial Systems"],
        reputation: "The premier global qualification for corporate accounting and multinationals.",
        aiClassification: "augmented",
        qualifications: ["B.Com/M.Com (minimum 120-150 academic credits)", "CPA Exam (4 core papers: AUD, FAR, REG, BAR/ISC/TCP)", "1 year work experience"]
      },
      {
        id: "ima-cma",
        name: "IMA Management Accountant (CMA)",
        url: "https://www.imanet.org",
        stars: 5,
        cost: "freemium",
        bestFor: "Certified Management Accountant - corporate budgeting, strategy & decision analysis",
        skills: ["Cost Management", "Budgeting & Forecasting", "Financial Decision Analysis", "Internal Controls"],
        reputation: "Respected globally for corporate finance, management accounting, and CFO paths.",
        aiClassification: "augmented",
        qualifications: ["Bachelor's Degree", "Active IMA Membership", "CMA Exam (Part 1: Financial Planning; Part 2: Strategic Management)", "2 years experience"]
      },
      {
        id: "cfa-institute",
        name: "CFA Institute (Chartered Financial Analyst)",
        url: "https://www.cfainstitute.org",
        stars: 5,
        cost: "freemium",
        bestFor: "Portfolio management, investment banking, asset valuation & research analyst",
        skills: ["Investment Valuation", "Portfolio Theory", "Quantitative Methods", "Fixed Income & Derivatives"],
        reputation: "The most prestigious credential in investment banking and fund management.",
        aiClassification: "augmented",
        qualifications: ["Final year of Bachelor's degree (or completed degree)", "CFA Exams (Level I, Level II, Level III)", "4,000 hours professional experience"]
      },
      {
        id: "maven-analytics",
        name: "Maven Analytics",
        url: "https://mavenanalytics.io",
        stars: 5,
        cost: "freemium",
        bestFor: "Business Intelligence - building Power BI, Tableau, and Excel dashboards",
        skills: ["Power BI", "Tableau", "DAX", "Data Modeling in Excel"],
        reputation: "Highly practical, project-focused business intelligence courses.",
        aiClassification: "augmented",
        qualifications: ["Open certifications / Portfolio-driven Business Analyst paths"]
      },
      {
        id: "cfi-augmented",
        name: "CFI (Corporate Finance Institute)",
        url: "https://corporatefinanceinstitute.com",
        stars: 5,
        cost: "freemium",
        bestFor: "AI-Augmented Financial Modeling, corporate valuation, and M&A analytics",
        skills: ["Financial Modeling", "Excel Automation", "Valuation Models", "AI in Finance"],
        reputation: "Gold standard for investment banking and corporate finance analysts.",
        aiClassification: "augmented",
        qualifications: ["CFI FMVA certification (Self-paced, online coursework & exams)"]
      },
      {
        id: "quantinsti",
        name: "QuantInsti (EPAT)",
        url: "https://www.quantinsti.com",
        stars: 4,
        cost: "freemium",
        bestFor: "Algorithmic Trading & Quantitative Finance models",
        skills: ["Algorithmic Trading", "Python for Finance", "Quantitative Models", "Machine Learning"],
        reputation: "Popular platform for learning automated trading strategies.",
        aiClassification: "augmented",
        qualifications: ["Quantitative / Coding portfolio / EPAT Certificate"]
      },
      {
        id: "nism-advisory",
        name: "NISM Investment Advisor & Wealth Manager",
        url: "https://www.nism.ac.in",
        stars: 5,
        cost: "free",
        bestFor: "Fiduciary investment advising, wealth management, client profiling, and financial planning",
        skills: ["Asset Allocation", "Portfolio Construction", "Client Risk Profiling", "SEBI Advisory Rules"],
        reputation: "SEBI mandated licensing exams for investment advising and mutual fund sales; client relationships remain heavily human-centered.",
        aiClassification: "augmented",
        qualifications: ["B.Com / Any Graduate degree", "NISM Series V-A (Mutual Fund Distributors) Certificate", "NISM Series X-A & X-B (Investment Adviser) Certificates"]
      }
    ]
  }
];
