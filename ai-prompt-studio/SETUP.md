# AI Prompt Studio v2.0 — Setup Guide

## What Changed

| Feature | Status |
|---|---|
| Prompt Forge (multi-AI prompt generator) | ✅ NEW |
| Context Bridge (cross-AI continuation) | ✅ NEW |
| Student Suite (optimized) | ✅ REWORKED |
| Image Studio | ✅ KEPT AS-IS |
| Before/After Diff | ❌ REMOVED |
| Expert Settings Guide | ❌ REMOVED |
| User Manual & Alternatives | ❌ REMOVED |
| Claude Memory Guard | ❌ REMOVED (replaced by Context Bridge) |

---

## Step 1 — Delete Old Files

Remove these files from your HuggingFace Space:

```
src/components/BeforeAfterDiff.tsx
src/components/ExpertSettingsGuide.tsx
src/components/UserManualAndAlternatives.tsx
src/components/ClaudeMemoryGuard.tsx
```

---

## Step 2 — Upload / Replace These Files

Replace every file listed below with the new version from this build.

### Root level
```
index.html          → replace
metadata.json       → replace
Dockerfile          → replace
server.ts           → replace
```

### src/
```
src/App.tsx         → replace
src/index.css       → replace
src/types.ts        → replace
src/data.ts         → replace
```

### src/components/  (new files — upload)
```
src/components/PromptForge.tsx    → UPLOAD (new)
src/components/ContextBridge.tsx  → UPLOAD (new)
src/components/StudentSuite.tsx   → UPLOAD (new)
```

### src/components/  (keep unchanged — do NOT replace)
```
src/components/NotebookLMSuite.tsx   ← keep your existing file
src/components/ImagePromptStudio.tsx ← keep your existing file
```

### Other files — keep unchanged
```
src/main.tsx
package.json
package-lock.json
tsconfig.json
vite.config.ts
.gitignore
.dockerignore
```

---

## Step 3 — Set Environment Secret

In your HuggingFace Space Settings → **Secrets**, ensure:

```
GEMINI_API_KEY = your_gemini_api_key_here
```

Get a free key at: https://aistudio.google.com/app/apikey

---

## Step 4 — Rebuild

After uploading all files, the Space will auto-rebuild. Watch the **Logs** tab.
Build takes ~60–90 seconds. If it fails, check logs for missing dependencies.

---

## New Features Overview

### 🎯 Prompt Forge
- Select any of 8 free AI models (Gemini, NotebookLM, AI Studio, Claude, Perplexity, Mistral, DeepSeek, Grok)
- Describe your request in plain language
- Optionally attach files or screenshots as context
- Generates a prompt optimized specifically for how that AI thinks
- After generation: 3–5 optional reflective questions to refine further
- Skip questions anytime — they're never required

### 🔗 Context Bridge
- Paste your conversation history from an AI that hit its limit
- Or upload a screenshot of the conversation
- Select where you were (source) and where you're continuing (target)
- Generates a context-preserving bridge prompt for the new AI
- Includes a collapsible summary of what the AI extracted
- Optional 3–5 reflective questions to sharpen the bridge

### 🎓 Student Suite
Two sub-tabs:
- **AI Prompt Builder** — 7 student presets (notes, research, resume, interview, etc.) with full question-scoping flow
- **NotebookLM Suite** — slides, video scripts, and dual-host podcast prompts

### 🖼️ Image Studio
Unchanged from v1. All your existing image prompt templates work as before.

---

## Troubleshooting

**Build fails with "cannot find module"**
→ Make sure `package.json` was NOT replaced (it's unchanged from v1)

**"Missing GEMINI_API_KEY" error at runtime**
→ Add the secret in HuggingFace Space Settings → Secrets

**Blank screen after deploy**
→ Check browser console. Usually a missing component import. Verify all 3 new component files were uploaded.

**Context Bridge returns empty**
→ Ensure you pasted chat history OR uploaded at least one screenshot before clicking Generate.
