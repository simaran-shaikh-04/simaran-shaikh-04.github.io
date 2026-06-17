// src/data/studentPresets.ts
// ─────────────────────────────────────────────────────────────────────────────
// Level-organized student presets with baked-in structured prompt templates.
// Replaces the old flat STUDENT_PRESETS that lived in data.ts.
//
// Each preset carries a `promptTemplate` built on the
//   Role → Task → Context → Constraints → Output format → Tone
// skeleton, with {{tokens}} that get filled from the user's answers.
// This is the same pattern NotebookLMSuite.tsx already uses successfully.
//
// The `level` field + STUDENT_LEVELS taxonomy below is SHARED — Career Finder
// and the Resource Hub (later slices) will reuse the exact same level ids.
// ─────────────────────────────────────────────────────────────────────────────

export type StudentLevel = "school" | "college" | "competitive" | "professional";

export interface StudentLevelMeta {
  id: StudentLevel;
  label: string;
  blurb: string;
  ageHint: string;
  iconName: string;        // looked up in StudentSuite's icon map
  textClass: string;       // accent text colour (tailwind)
  activeClass: string;     // active chip styling (tailwind)
}

// Per-level accent colours encode the level (structure as information).
export const STUDENT_LEVELS: StudentLevelMeta[] = [
  {
    id: "school",
    label: "School",
    blurb: "Class 6–12 / K-12 — concepts, homework, board exams",
    ageHint: "~11–18",
    iconName: "BookOpen",
    textClass: "text-sky-400",
    activeClass: "bg-sky-950/40 text-sky-300 border-sky-800/60",
  },
  {
    id: "college",
    label: "College",
    blurb: "Undergrad / diploma — notes, assignments, projects",
    ageHint: "~17–23",
    iconName: "GraduationCap",
    textClass: "text-emerald-400",
    activeClass: "bg-emerald-950/40 text-emerald-300 border-emerald-800/60",
  },
  {
    id: "competitive",
    label: "Competitive Exams",
    blurb: "CA / CS / UPSC / GATE + GRE / GMAT / IELTS / SAT",
    ageHint: "any",
    iconName: "Target",
    textClass: "text-amber-400",
    activeClass: "bg-amber-950/40 text-amber-300 border-amber-800/60",
  },
  {
    id: "professional",
    label: "Career & Skills",
    blurb: "Skill-building, interviews, resume, internships",
    ageHint: "any",
    iconName: "Rocket",
    textClass: "text-violet-400",
    activeClass: "bg-violet-950/40 text-violet-300 border-violet-800/60",
  },
];

export interface StudentPreset {
  id: string;
  level: StudentLevel;
  iconName: string;
  title: string;
  name: string;
  description: string;
  defaultIdea: string;
  /** Full structured prompt scaffold. {{tokens}} match question ids; {{topic}} = the task box text. */
  promptTemplate: string;
  questions: { id: string; question: string; helperText: string }[];
}

export const STUDENT_PRESETS: StudentPreset[] = [
  // ─── SCHOOL ────────────────────────────────────────────────────────────────
  {
    id: "sch-concept",
    level: "school",
    iconName: "Lightbulb",
    title: "🧠 Concept Explainer",
    name: "Concept Explainer & Doubt Solver",
    description: "Explains any school topic from scratch with an everyday analogy, a worked example, and quick self-test questions.",
    defaultIdea: "Explain photosynthesis — the light and dark reactions — for a Class 10 student.",
    promptTemplate: `**Role:** You are a patient {{subject}} teacher who explains ideas to a {{grade}} student clearly, without dumbing them down.

**Task:** Help me genuinely understand the topic below, then check my understanding.

**Topic:** {{topic}}

**Context:**
- Student level: {{grade}}
- What I already find confusing: {{confusion}}

**Constraints:**
- Open with ONE everyday analogy before any technical wording.
- Define every new term the first time it appears.
- For homework-style problems, show the *method* step by step — do not just hand over the final answer.

**Output format:**
1. Plain-language explanation (≤150 words)
2. One worked example, step by step
3. Three active-recall questions (answers listed separately at the end)
4. One common mistake students make on this topic

**Tone:** Encouraging, concrete, no filler.`,
    questions: [
      { id: "subject", question: "Which subject is this?", helperText: "e.g., Biology, Physics, History, Maths." },
      { id: "grade", question: "Which class / grade are you in?", helperText: "e.g., Class 9 (CBSE), Grade 11, IGCSE Year 10." },
      { id: "confusion", question: "What part is confusing you most?", helperText: "Be specific — e.g., 'I mix up mitosis and meiosis stages.'" },
    ],
  },
  {
    id: "sch-essay",
    level: "school",
    iconName: "PenLine",
    title: "✍️ Essay & Writing Coach",
    name: "Essay Structurer (Coach, Not Ghostwriter)",
    description: "Builds an outline, thesis, and paragraph plan and gives feedback on your draft — without writing the essay for you.",
    defaultIdea: "Help me plan a 500-word essay on whether social media does more harm than good for teenagers.",
    promptTemplate: `**Role:** You are a writing coach for a {{grade}} student. You guide and critique; you do NOT write the essay for the student (academic integrity).

**Task:** Help me plan and strengthen my own essay on the topic below.

**Topic / question:** {{topic}}

**Context:**
- Class / grade: {{grade}}
- Word limit & type: {{format}}

**Constraints:**
- Never write full paragraphs I can copy-paste. Provide structure, prompts, and feedback only.
- Push me to back claims with reasons and examples.

**Output format:**
1. Two possible thesis statements (so I pick a stance)
2. A paragraph-by-paragraph outline (one line each)
3. Three guiding questions to develop my strongest argument
4. A short checklist to self-edit before submitting

**Tone:** Supportive, Socratic, honest about weak arguments.`,
    questions: [
      { id: "grade", question: "Which class / grade?", helperText: "e.g., Class 8, Grade 12." },
      { id: "format", question: "Essay type and word limit?", helperText: "e.g., 'Argumentative, ~500 words' or 'Narrative, 2 pages.'" },
    ],
  },
  {
    id: "sch-revision",
    level: "school",
    iconName: "FileCheck",
    title: "📋 Board Exam Revision Sheet",
    name: "Active-Recall Revision Sheet",
    description: "Turns a chapter into a one-page revision sheet: key points, formulae, likely exam questions, and a recall quiz.",
    defaultIdea: "Make a revision sheet for the Class 12 chapter on Electrochemistry for my board exam.",
    promptTemplate: `**Role:** You are an exam-prep tutor familiar with the {{board}} pattern.

**Task:** Compress the chapter below into a single high-yield revision sheet I can review the night before.

**Chapter / topic:** {{topic}}

**Context:**
- Board / curriculum: {{board}}
- Class / grade: {{grade}}

**Constraints:**
- Prioritise what is frequently asked; flag low-yield material as optional.
- Keep formulae and definitions exact.

**Output format:**
1. 8–10 must-know key points (one line each)
2. All formulae / dates / reactions in a compact list
3. Three likely exam questions in the board's typical style
4. A 5-question rapid recall quiz (answers at the very end)

**Tone:** Tight, exam-focused, no padding.`,
    questions: [
      { id: "board", question: "Which board / curriculum?", helperText: "e.g., CBSE, ICSE, State Board, IGCSE." },
      { id: "grade", question: "Which class?", helperText: "e.g., Class 10, Class 12." },
    ],
  },

  // ─── COLLEGE ─────────────────────────────────────────────────────────────────
  {
    id: "col-notes",
    level: "college",
    iconName: "BookOpen",
    title: "📝 Lecture Notes & Active Recall",
    name: "Academic Notes Generator",
    description: "Structured active-recall notes, Anki-ready flashcards, and conceptual cheat sheets from a lecture or transcript.",
    defaultIdea: "Generate active-recall notes and Anki cloze flashcards from my lecture on the Mundell-Fleming model and open-economy macroeconomics.",
    promptTemplate: `**Role:** You are an academic note-taking specialist who optimises for active recall and spaced repetition.

**Task:** Convert the material below into structured study notes plus flashcards.

**Material / topic:** {{topic}}

**Context:**
- Course level: {{depth}}
- Note style I prefer: {{note-format}}
- Flashcard format: {{flashcard-format}}

**Constraints:**
- Notes must be skimmable (hierarchy, not prose walls).
- Flashcards must be atomic — one fact per card.

**Output format:**
1. Hierarchical notes in the chosen style
2. A flashcard list in the chosen format (ready to paste into Anki)
3. A short "connections" section linking this topic to adjacent concepts
4. Five test-yourself questions

**Tone:** Precise, academic, efficient.`,
    questions: [
      { id: "note-format", question: "Preferred note style?", helperText: "Cornell, hierarchical outline, or Q&A active-recall." },
      { id: "flashcard-format", question: "Flashcard format?", helperText: "Anki basic Q&A, cloze deletion, or matching pairs." },
      { id: "depth", question: "Academic depth?", helperText: "Foundational undergrad, advanced undergrad, or graduate rigour." },
    ],
  },
  {
    id: "col-research",
    level: "college",
    iconName: "FlaskConical",
    title: "🔍 Assignment & Research Blueprint",
    name: "Research Blueprint + Citations",
    description: "Drafts a thesis skeleton, methodology, counter-arguments, and citation guidance (APA / MLA / IEEE).",
    defaultIdea: "Build a research skeleton and methodology on the impact of localized crypto-mining on regional power-grid stability.",
    promptTemplate: `**Role:** You are a research supervisor guiding an undergraduate through a rigorous assignment.

**Task:** Build a research blueprint for the topic below — structure and method, not a finished paper.

**Topic / question:** {{topic}}

**Context:**
- Citation style required: {{citation-style}}
- Methodology preference: {{analysis-criteria}}
- My working thesis: {{argumentative-depth}}

**Constraints:**
- Do not fabricate sources or statistics. Where a citation is needed, describe the *type* of source to find and how to verify it.
- Include at least one credible counter-argument.

**Output format:**
1. Refined thesis statement
2. Section-by-section outline with the claim each section must prove
3. Methodology paragraph (matched to my preference)
4. Two counter-arguments + how to address them
5. Citation checklist in the required style

**Tone:** Rigorous, neutral, intellectually honest.`,
    questions: [
      { id: "citation-style", question: "Citation style?", helperText: "APA 7th, MLA 9th, IEEE, or Chicago." },
      { id: "analysis-criteria", question: "Research methodology?", helperText: "Lit review, qualitative, statistical, or comparative case study." },
      { id: "argumentative-depth", question: "Your core thesis / argument?", helperText: "One sentence — the claim you want to defend." },
    ],
  },
  {
    id: "col-project",
    level: "college",
    iconName: "Presentation",
    title: "🛠️ Project & Lab Report Structurer",
    name: "Project / Lab Report Architect",
    description: "Organises a project or lab report into a clear, gradable structure with results framing and discussion prompts.",
    defaultIdea: "Help me structure a lab report on the determination of the rate constant of a reaction using the iodine-clock method.",
    promptTemplate: `**Role:** You are a lab demonstrator / project guide who marks reports for clarity and rigour.

**Task:** Give me a complete structure and framing for the project/report below.

**Project / experiment:** {{topic}}

**Context:**
- Type: {{project-type}}
- Key result or deliverable: {{key-result}}

**Constraints:**
- Keep aim, method, results, and discussion clearly separated.
- Prompt me to interpret results, not just report them.

**Output format:**
1. Title + one-line aim
2. Section structure (Abstract → Method → Results → Discussion → Conclusion) with what each must contain
3. Three discussion questions that show deeper understanding
4. A rubric-style self-check (what a top grade needs)

**Tone:** Practical, structured, marker's-eye view.`,
    questions: [
      { id: "project-type", question: "What kind of project?", helperText: "Lab report, software project, field study, design project." },
      { id: "key-result", question: "What's the main result/deliverable?", helperText: "e.g., 'a working REST API' or 'measured rate constant ± error.'" },
    ],
  },

  // ─── COMPETITIVE EXAMS ───────────────────────────────────────────────────────
  {
    id: "cmp-india",
    level: "competitive",
    iconName: "Landmark",
    title: "🏛️ Indian Exam Prep (CA / CS / UPSC / GATE)",
    name: "Indian Competitive Exam Coach",
    description: "Syllabus-aligned concept drilling, previous-year-pattern questions, and a tight revision plan for Indian professional exams.",
    defaultIdea: "Drill me on 'Charges and their registration' under the Companies Act for the CS Executive Company Law paper.",
    promptTemplate: `**Role:** You are a coach for the {{exam}} exam who knows its syllabus weighting and question pattern.

**Task:** Help me master the topic below to exam standard.

**Topic / section:** {{topic}}

**Context:**
- Exam: {{exam}}
- Paper / subject: {{subject}}

**Constraints:**
- Stick to the official syllabus scope; flag anything out of scope.
- For legal/accounting topics, cite the exact section/standard number where one applies. Do NOT invent section numbers — if unsure, say so.
- Mirror the real exam's answer style (e.g., section number → numbered points → bold key terms).

**Output format:**
1. Crisp concept summary in the exam's expected answer format
2. The 5 most exam-relevant points, ranked by how often they're asked
3. Three previous-year-style questions with model answer skeletons
4. One trap / commonly-confused distinction examiners exploit

**Tone:** Exam-focused, factual, no fluff.`,
    questions: [
      { id: "exam", question: "Which exam?", helperText: "e.g., CS Executive, CA Inter, UPSC CSE, GATE CS." },
      { id: "subject", question: "Which paper / subject?", helperText: "e.g., Company Law, Tax Laws, General Studies Paper II." },
    ],
  },
  {
    id: "cmp-intl",
    level: "competitive",
    iconName: "Globe",
    title: "🌐 International Exams (GRE / GMAT / IELTS / SAT)",
    name: "International Test Prep Coach",
    description: "Targeted practice and strategy for standardized international tests, tuned to the section and scoring rubric.",
    defaultIdea: "Coach me on GRE Quant data-interpretation sets — strategy plus three practice problems with explanations.",
    promptTemplate: `**Role:** You are a test-prep coach for the {{exam}}, fluent in its scoring rubric and timing.

**Task:** Improve my performance on the section below.

**Section / skill:** {{topic}}

**Context:**
- Exam: {{exam}}
- My current level / target: {{level-target}}

**Constraints:**
- Teach the *strategy and timing*, not just the answer.
- Match the real test's difficulty and format exactly.

**Output format:**
1. The section's scoring logic + the single highest-leverage strategy
2. A worked example showing the strategy in action
3. Three practice questions at target difficulty (full explanations after)
4. One timing / pacing tip specific to this section

**Tone:** Coach-like, strategic, encouraging but realistic.`,
    questions: [
      { id: "exam", question: "Which test?", helperText: "GRE, GMAT, IELTS, TOEFL, SAT." },
      { id: "level-target", question: "Current level and target score?", helperText: "e.g., 'GRE Quant ~155 now, target 165.'" },
    ],
  },
  {
    id: "cmp-current-affairs",
    level: "competitive",
    iconName: "Newspaper",
    title: "📰 Current Affairs Digest",
    name: "Current Affairs & GK Synthesiser",
    description: "Turns a topic or time-window into an exam-ready current-affairs note — strictly facts you can verify.",
    defaultIdea: "Make an exam-ready note on the key points of the latest Union Budget relevant to UPSC Economy.",
    promptTemplate: `**Role:** You are a current-affairs editor preparing notes for {{exam}} aspirants.

**Task:** Build a concise, exam-relevant note on the topic below.

**Topic:** {{topic}}

**Context:**
- Exam focus: {{exam}}

**Constraints:**
- State only facts you are confident are accurate. If a figure or date is uncertain, write "verify" beside it rather than guessing.
- No opinion or prediction — facts and their direct implications only.
- Note that current-affairs facts change; tell me to cross-check against a primary source before relying on it.

**Output format:**
1. 6–8 factual key points (one line each)
2. Why each matters for the exam (linkage to syllabus)
3. Likely question angle
4. A "verify before trusting" flag on anything time-sensitive

**Tone:** Factual, neutral, dense.`,
    questions: [
      { id: "exam", question: "Which exam's syllabus?", helperText: "e.g., UPSC, Banking (IBPS), SSC, State PSC." },
    ],
  },

  // ─── CAREER & SKILLS ─────────────────────────────────────────────────────────
  {
    id: "pro-skill",
    level: "professional",
    iconName: "Rocket",
    title: "🚀 Skill Roadmap & Free Resources",
    name: "Skill Master Roadmap",
    description: "A step-by-step roadmap from your current level to your goal, with the type of free resource to use at each stage.",
    defaultIdea: "Build a roadmap to go from beginner to job-ready in data analysis (Python + SQL + Excel).",
    promptTemplate: `**Role:** You are a mentor who has taken many beginners to job-ready in this field.

**Task:** Build a realistic learning roadmap for the goal below.

**Skill / goal:** {{topic}}

**Context:**
- My starting point: {{current-level}}
- Time I can commit: {{time-budget}}

**Constraints:**
- Sequence the roadmap so each stage unlocks the next (no jumping ahead).
- Recommend the *type* of resource per stage (e.g., interactive sandbox, project, docs) and what to build to prove the skill. Avoid naming specific paid courses.
- Be honest about realistic timelines.

**Output format:**
1. Stage-by-stage roadmap (Foundations → Core → Applied → Portfolio)
2. One concrete project per stage that proves the skill
3. What "job-ready" actually looks like for this skill
4. The most common reason people stall — and how to avoid it

**Tone:** Direct, motivating, realistic.`,
    questions: [
      { id: "current-level", question: "Your starting baseline?", helperText: "e.g., 'Complete beginner' or 'know basic Python, no SQL.'" },
      { id: "time-budget", question: "Time you can commit?", helperText: "e.g., '1 hr/day for 3 months.'" },
    ],
  },
  {
    id: "pro-interview",
    level: "professional",
    iconName: "Brain",
    title: "💼 Interview Practice Coach",
    name: "Interactive Interview Simulator",
    description: "Runs a realistic mock interview (technical / behavioural / case) and scores you against a clear rubric.",
    defaultIdea: "Run a behavioural interview for a product-management internship and give me STAR-based feedback.",
    promptTemplate: `**Role:** You are a senior interviewer conducting a realistic {{interview-type}} interview for the role below.

**Task:** Interview me one question at a time, then score me.

**Role / position:** {{topic}}

**Context:**
- Interview type: {{interview-type}}
- My experience level: {{experience}}

**Constraints:**
- Ask ONE question at a time and wait for my answer before the next.
- After each answer, give a score (1–5) and one specific improvement.
- Stay in character as the interviewer until I say "end interview".

**Output format:**
- Start with a brief intro + your first question.
- After each of my replies: score + targeted feedback + next question.
- On "end interview": overall rubric scores + top 3 things to fix.

**Tone:** Professional, fair, constructively tough.`,
    questions: [
      { id: "interview-type", question: "Interview type?", helperText: "Technical/coding, system design, behavioural (STAR), or case." },
      { id: "experience", question: "Your experience level?", helperText: "e.g., 'final-year student, one internship.'" },
    ],
  },
  {
    id: "pro-resume",
    level: "professional",
    iconName: "FileText",
    title: "📄 Resume & Cover Letter Builder",
    name: "Resume Bullet & Cover Letter Coach",
    description: "Turns your raw experience into sharp, quantified resume bullets and a tailored cover-letter structure.",
    defaultIdea: "Help me write strong resume bullets for a software internship from my project and coursework experience.",
    promptTemplate: `**Role:** You are a recruiter who screens hundreds of resumes for {{target-role}} and knows what gets a callback.

**Task:** Sharpen my experience into resume bullets and a cover-letter structure.

**Target role:** {{topic}}

**Context:**
- Role I'm applying for: {{target-role}}
- Raw experience I'll paste: {{experience}}

**Constraints:**
- Every bullet: action verb → what I did → measurable impact. No vague duties.
- Don't invent achievements or numbers — ask me for the metric if it's missing.
- Keep it ATS-friendly (plain phrasing, relevant keywords).

**Output format:**
1. 4–6 rewritten resume bullets (flag any where I need to supply a number)
2. A cover-letter skeleton: hook → fit → proof → close
3. The top 3 keywords this role's screeners look for
4. One thing to cut from a typical student resume

**Tone:** Sharp, recruiter-realistic, encouraging.`,
    questions: [
      { id: "target-role", question: "What role are you applying for?", helperText: "e.g., 'Frontend intern', 'Audit associate', 'Data analyst.'" },
      { id: "experience", question: "Briefly, your relevant experience?", helperText: "Projects, internships, coursework — raw is fine, I'll sharpen it." },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: fill a preset's promptTemplate with the user's answers.
// {{topic}} → the task-box text; {{questionId}} → that answer (or a soft hint).
// ─────────────────────────────────────────────────────────────────────────────
export function fillPresetTemplate(
  preset: StudentPreset,
  topic: string,
  answers: Record<string, string>
): string {
  let out = preset.promptTemplate.replace(/\{\{topic\}\}/g, topic.trim() || "[describe your topic in the task box above]");
  preset.questions.forEach(q => {
    const val = (answers[q.id] || "").trim();
    out = out.replace(new RegExp(`\\{\\{${q.id}\\}\\}`, "g"), val || `[${q.question.toLowerCase().replace(/\?$/, "")}]`);
  });
  // Any leftover tokens → neutral placeholder so nothing renders as raw {{x}}.
  out = out.replace(/\{\{[^}]+\}\}/g, "[not specified]");
  return out;
}
