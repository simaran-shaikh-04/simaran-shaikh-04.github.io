# 🚀 AI Prompt Studio — Multi-AI Prompt Engineering Workspace

> A professional, client-side-optimized workspace designed to craft, bridge, and refine high-performance prompts tailored specifically to the cognitive profiles of 8+ leading AI models. Ready for direct deployment on Hugging Face Spaces via Docker.

---

## 🎯 Project Objective

Modern generative AI models have vastly different reasoning engines, syntax preferences, and formatting constraints. A prompt that works flawlessly in Anthropic's Claude may fail or hallucinate in Google's Gemini, DeepSeek, or Grok. Furthermore, students and developers on free tiers frequently hit rate limits, losing conversational momentum when forced to switch models midway.

**AI Prompt Studio** bridges this gap. It acts as an intelligent prompt compiler and migration hub that translates natural language requests and existing chat histories into model-specific prompts. 

**The goal is to unlock the highest fidelity response from any free-tier AI model, without paid plans.**

---

## 🏗️ Core Features & Capabilities

AI Prompt Studio v2.0 is structured into **6 modular tabs**, each focusing on a distinct phase of prompt engineering, academic research, or career transition:

### 1. 🎯 Prompt Forge
* **Targeted Compiler**: Supports 8 free AI models (Gemini, NotebookLM, AI Studio, ChatGPT, Claude, Perplexity, Le Chat, DeepSeek, Grok).
* **Cognitive Optimization**: Adapts prompt structures based on the model's preferred syntax (e.g., XML tags for Claude, System/User separation for AI Studio, direct rules for Mistral).
* **Interactive Refinement**: Generates 3–5 custom reflective questions to probe audience intent, edge cases, and output formatting.
* **Context Loading**: Accepts text briefs, files, or screenshot attachments to ground the generated prompt.

### 2. 🔗 Context Bridge
* **Cross-AI Continuation**: Restores conversational state when you hit model usage limits. Paste chat text or upload screenshots from a previous session.
* **Smart Summarization**: Automatically extracts key decisions, system variables, frameworks, and progress markers into a collapsible log.
* **Bridge Generation**: Generates a custom continuation prompt for your target model, ensuring it inherits the previous AI's context.

### 3. 🎓 Student Suite
* **AI Prompt Builder**: 7 optimized student presets with full scoping flows:
  * *Study Notes & Active Recall* (Cornell & Anki card outputs)
  * *Assignment & Research Blueprint* (MLA/APA citation structuring)
  * *Skill Master Roadmap* (Step-by-step syllabus drafting)
  * *Interactive Interview Practice* (AI-driven technical/behavioral simulator)
  * *STAR-Method Resume Tailor* (ATS keyword optimization)
  * *Student LinkedIn Storyteller* (Engaging technical writing layouts)
  * *Internship Log & Performance Writer* (Formal academic report drafts)
* **NotebookLM Suite**: Creates slides, video scripts, and dual-host podcast prompts optimized for Google NotebookLM.

### 4. 🖼️ Image Studio
* **Syntax Dialect Enhancer**: Elevates simple descriptive ideas into detailed prompts for Midjourney, DALL-E 3, FLUX, Stable Diffusion, and Gemini.
* **Style Engine**: Supports distinct output dialects:
  * *Natural Dialect*: Vivid descriptive paragraphs (FLUX, Gemini).
  * *Tag Dialect*: Comma-separated descriptors with parameters like `--ar` or `--no` (Midjourney).
  * *Weighted Dialect*: Dynamic weights (e.g., `(token:1.2)`) and explicit negative prompt separation.

### 5. 📚 Resource Hub
* **Curriculum Builder**: Selected directory of high-quality free learning resources.
* **Custom Syllabus Generator**: Select resources and describe a learning goal to generate a complete markdown syllabus and copy-pasteable prompts to start studying.

### 6. 💼 Career Hub
* **SQL & Analytics Pathways**: Hands-on roadmaps for database querying and analytics.
* **Commerce-to-Tech Bridge**: Guidance tailored for B.Com and financial accounting students transitioning into data analytics, finance technology, and emerging AI roles.

---

## 🤖 Supported Models & Prompting Profiles

| AI Model | Provider | Context Window | Prompting Style Profile | Best Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Google Gemini** | Google | 2M+ Tokens | Highly instruction-following; excels at massive media contexts and XML/Markdown headers. | Long document analysis, video understanding, codebases. |
| **NotebookLM** | Google | Document-Grounded | Grounded strictly in uploaded sources; uses explicit source-query framing. | Study notes, FAQs, podcast audio overviews from PDFs. |
| **Google AI Studio** | Google | 2M+ Tokens | Supports separate System Prompt (Persona/Rules) and User Message blocks. | Developer testing, API prototype testing, structured outputs. |
| **OpenAI ChatGPT** | OpenAI | 128K Tokens | Direct instructions structured with Markdown; benefits from few-shot examples. | Creative writing, quick code blocks, general inquiries. |
| **Claude AI** | Anthropic | 200K Tokens | Deep XML-tagged segmentation (`<context>`, `<thinking>`); excellent negative constraints. | Technical architecture, debugging, long reasoning chains. |
| **Perplexity AI** | Perplexity | Search-based | Research-centric; requires direct citation requests and target source filtering. | Fact-checking, competitive intelligence, academic research. |
| **Mistral / Le Chat** | Mistral AI | 128K Tokens | Direct instruction-following; responds best to numbered constraints and rules. | Multilingual translations, long drafting, coding. |
| **DeepSeek** | DeepSeek | 128K Tokens | Dual modes: V3 (direct chat) and R1 (automatic deep reasoning). | Math proofing, complex debugging, algorithmic logic. |
| **Grok** | xAI | 128K Tokens | Witty tone by default; utilizes real-time X data and Deepsearch reasoning. | X trend analysis, current event research, Aurora images. |

---

## 🛠️ Tools & Technologies

| Layer | Component | Usage / Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React 19 & TypeScript** | Component structure, strict state safety, and modal overlays. |
| **Styling** | **Tailwind CSS v4** | Dark-mode design system, glassmorphic inputs, and dot-grid backgrounds. |
| **Animations** | **Motion (Framer Motion v12)** | Interactive tab transitions, drawer slides, and error banners. |
| **Icons** | **Lucide React** | Modern, clean vector iconography. |
| **Backend** | **Express (Node.js)** | Server-side proxy handling file uploads and JSON payload parsing. |
| **Build Tools** | **Vite v6 & esbuild** | Fast frontend bundling and backend server compiling. |
| **AI Integration**| **Google Gen AI SDK** | Communicates with the `gemini-2.5-flash` model for backend processing. |
| **Container** | **Docker** | Multi-stage builder containing runtime node runner for deployment. |

---

## ⚙️ Backend API Architecture

The Node.js Express server (`server.ts`) acts as a secure intermediary. To guarantee user privacy and avoid API key abuse, the server does not store keys. Instead, it expects the user's free Gemini API key to be passed via the `x-api-key` header on every request.

Key backend routes:
* **`/api/forge-prompt`**: Compiles model-specific prompts. Takes the user query, target model specs, and optional file attachments, returning a formatted prompt, a speed tip, and scoping questions.
* **`/api/bridge-context`**: Manages session migration. Parses history text/screenshots, extracts context metrics, and structures continuation prompts.
* **`/api/enhance-image`**: Rewrites prompts into model-specific dialects (Natural, Tags, Weighted) for image generators.
* **`/api/generate-study-plan`**: Generates a week-by-week curriculum based on user learning goals and selected resources.

---

## 🗂️ Repository Structure

```
ai-prompt-studio/
├── .dockerignore
├── .gitignore
├── Dockerfile                      # Multi-stage production build config
├── package.json                    # Project dependencies & build pipelines
├── README.md                       # Documentation (Hugging Face / GitHub)
├── SETUP.md                        # Upgrade logs & troubleshooting guide
├── server.ts                       # Express.js server & Gemini API controller
├── vite.config.ts                  # Vite build and tailwind configuration
├── tsconfig.json                   # TS compiler settings
├── index.html                      # SPA entry point
├── index.css                       # Global Tailwind imports
├── src/
│   ├── main.tsx                    # React client entry point
│   ├── App.tsx                     # Main dashboard layout and tab router
│   ├── types.ts                    # TypeScript type interfaces
│   ├── data.ts                     # Models, presets, resources, and career data
│   ├── lib/
│   │   ├── api.ts                  # API fetch handlers with x-api-key management
│   │   └── history.ts              # Local storage prompt history controller
│   └── components/
│       ├── PromptForge.tsx         # AI prompt generation tab
│       ├── ContextBridge.tsx       # Session continuation and bridge prompt builder
│       ├── StudentSuite.tsx        # Presets and NotebookLM generator tab
│       ├── ImagePromptStudio.tsx   # Image dialect enhancer tab
│       ├── ResourceHub.tsx         # Learning hub and curriculum compiler
│       ├── CareerHub.tsx           # B.Com career navigation pathways
│       ├── ApiKeyModal.tsx         # Gemini API key setup modal
│       └── HistoryDrawer.tsx       # Clipboard history slide-out drawer
```

---

## 🔑 Getting a Free Google Gemini API Key

AI Prompt Studio requires a Google Gemini API Key to power the backend generation services. Google offers a generous **free tier** for the Gemini API that is more than sufficient for personal use.

### Step-by-Step Guide to Get Your Key:

1. **Visit Google AI Studio:**
   Go to [Google AI Studio (aistudio.google.com)](https://aistudio.google.com/).

2. **Sign In:**
   Log in using your standard Google account (Gmail). The free tier is available to all personal Google accounts.

3. **Open the API Key Manager:**
   Click the blue **"Get API key"** button located in the top-left corner or sidebar of the interface.

4. **Create a New Key:**
   * Click the **"Create API key"** button.
   * Select **"Create API key in new project"** (this automatically sets up a free Google Cloud project in the background for your key).

5. **Copy Your Key:**
   Once generated, click **"Copy"** to save the API key to your clipboard. It will be a long string of characters starting with `AIzaSy...`.
   
   > [!WARNING]  
   > Keep your API key private. Never commit it to GitHub or share it publicly.

6. **Add the Key to AI Prompt Studio:**
   * **In the Browser:** When you open the application, click the **"Add API Key"** button in the top header and paste your key. It is saved securely in your browser's local storage and is never sent to any external server except for standard API calls.
   * **For Deployment (Hugging Face Spaces):** If you are hosting the app, save it as a Secret named `GEMINI_API_KEY` in your Space settings (see deployment instructions below).

---

## 🚀 How to Run & Deploy

### 1. Local Development (Node & Vite)
To run the server and the frontend concurrently in development mode:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Simaran-Shaikh-04/ai-prompt-studio.git
   cd ai-prompt-studio
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   *This starts the Express backend (proxied to the Vite frontend) via `tsx` on `http://localhost:3000`.*

---

### 2. Run with Docker
If you want to run the production build inside a local container:

1. **Build the Docker image:**
   ```bash
   docker build -t ai-prompt-studio .
   ```

2. **Run the container:**
   ```bash
   docker run -d -p 7860:7860 --name prompt-studio ai-prompt-studio
   ```

3. **Access the application:**
   Open your browser to `http://localhost:7860`.

---

### 3. Deploy to Hugging Face Spaces
AI Prompt Studio is optimized for direct hosting as a Hugging Face Space.

1. **Create a new Space:**
   * Go to Hugging Face → **New Space**.
   * Enter a space name.
   * Choose **Docker** as the SDK.
   * Select **Blank** or **Docker** template.

2. **Upload/Push the Files:**
   Push this entire repository (including the `Dockerfile` and `README.md`) to your Hugging Face Space repository.

3. **Configure the Gemini Key (Optional but recommended for auto-auth):**
   * Go to your Space's **Settings** tab.
   * Scroll down to **Variables and Secrets**.
   * Add a new Secret:
     * **Key:** `GEMINI_API_KEY`
     * **Value:** *Your Google Gemini API Key (obtained from [Google AI Studio](https://aistudio.google.com/app/apikey))*
   * *If set, the app will run out-of-the-box for visitors using this shared key, though they can still override it with their own key in the UI.*

---

## 🖼️ Workspace Screenshots

### 🎯 Prompt Forge
*AI-Specific Prompt Generator and Refinement Flow*
![Prompt Forge](assets/prompt-forge.png)

### 🔗 Context Bridge
*Seamless Continuation Prompt Builder*
![Context Bridge](assets/context-bridge.png)

### 🎓 Student Suite & Resource Hub
*Tailored Learning Syllabi & Study Planners*
![Student Suite](assets/student-suite.png)

> [!TIP]
> Place your high-resolution PNGs in the `/assets` directory with these filenames to auto-render them on GitHub and Hugging Face.

---

## 👤 About Me

**Simaran Shaikh** — Finance & Data Analytics  
BCom Financial Accounting · Don Bosco College, Panjim Goa · 2024–2027

📧 simaranshaikh04@gmail.com  
💼 [linkedin.com/in/simaranshaikh](https://linkedin.com/in/simaranshaikh)  
🐙 [github.com/Simaran-Shaikh-04](https://github.com/Simaran-Shaikh-04)

---

*"The right prompt doesn't just ask a question — it builds a cognitive bridge to the AI's best intelligence."*
