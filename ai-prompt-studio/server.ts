import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "50mb" }));

// Each request carries the user's own Gemini key in the "x-api-key" header.
// The server never uses its own key — the user's quota is used, not yours.
const getUserKey = (req: express.Request): string =>
  (req.header("x-api-key") || "").trim();

const getAI = (req: express.Request) =>
  new GoogleGenAI({
    apiKey: getUserKey(req),
    httpOptions: { headers: { "User-Agent": "aistudio-build" } }
  });

const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!getUserKey(req)) {
    return res.status(401).json({
      error: "No API key found. Click the 'API Key' button at the top of the app and paste your free Google Gemini key."
    });
  }
  next();
};

// ─── EXISTING: Generate scoping questions ─────────────────────────────────────
app.post("/api/generate-questions", checkApiKey, async (req, res) => {
  try {
    const { appIdea } = req.body;
    if (!appIdea?.trim()) return res.status(400).json({ error: "Application idea is required." });

    const systemInstruction =
      "You are a master Software Architect, Academic & Career Consultant, and Prompt Engineer specializing in Claude AI.\n" +
      "Analyze the user's natural language idea and generate exactly 4 highly targeted, reflective questions that will scope down their requirements.\n" +
      "Focus on architecture/structure, feature boundaries, interaction mechanics, and output standards. Avoid generic questions.";

    const prompt = `Task / App Idea: "${appIdea}"\n\nGenerate exactly 4 essential reflective questions to narrow down the technical scope, methodology, or academic details.`;

    const response = await getAI(req).models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              helperText: { type: Type.STRING }
            },
            required: ["id", "question", "helperText"]
          }
        }
      }
    });

    const questions = JSON.parse(response.text?.trim() || "[]");
    return res.json({ questions });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate questions." });
  }
});

// ─── EXISTING: Generate optimized Claude prompt ───────────────────────────────
app.post("/api/generate-prompt", checkApiKey, async (req, res) => {
  try {
    const { appIdea, answers, profileId, attachments } = req.body;
    if (!appIdea) return res.status(400).json({ error: "Application idea is required." });

    let answersContext = Object.keys(answers || {}).length > 0
      ? Object.entries(answers).map(([k, v]) => `- [${k}]: ${v}`).join("\n")
      : "No additional answers provided.";

    let attachmentsContext = "";
    if (attachments?.length) {
      attachmentsContext = "\n\n### REFERENCE ATTACHMENTS:\n";
      attachments.forEach((att: any) => {
        const isImage = att.type?.startsWith("image/");
        attachmentsContext += `<reference_attachment name="${att.name}" type="${att.type}">\n`;
        attachmentsContext += isImage ? "[Image — visual content passed to model]\n" : `${att.content || ""}\n`;
        attachmentsContext += `</reference_attachment>\n\n`;
      });
    }

    const systemInstruction =
      "You are a World-Class Claude Prompt Engineer. Compile a natural language idea into a pristine, XML-structured prompt optimized for Claude.\n" +
      "Apply the optimization profile: token-saving = minimal output, architectural = rigorous structure, mvp-prototype = immediate utility, comprehensive = deep spec.\n" +
      "Output strictly as JSON with: optimizedPrompt (ready-to-copy markdown) and analysis (efficiencyScore, tokenEstimation, pros, cons, recommendations).";

    const textPrompt =
      `ORIGINAL IDEA:\n"${appIdea}"\n\nUSER ANSWERS:\n${answersContext}\n\n${attachmentsContext}OPTIMIZATION PROFILE: "${profileId}"\n\nGenerate the structured prompt and analysis now.`;

    const contentParts: any[] = [{ text: textPrompt }];
    if (attachments?.length) {
      attachments.forEach((att: any) => {
        if (att.type?.startsWith("image/") && att.content) {
          contentParts.push({
            inlineData: {
              mimeType: att.type,
              data: att.content.includes(",") ? att.content.split(",")[1] : att.content
            }
          });
        }
      });
    }

    const response = await getAI(req).models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: contentParts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            optimizedPrompt: { type: Type.STRING },
            analysis: {
              type: Type.OBJECT,
              properties: {
                efficiencyScore: { type: Type.INTEGER },
                tokenEstimation: {
                  type: Type.OBJECT,
                  properties: {
                    systemPromptTokens: { type: Type.INTEGER },
                    estimatedSavings: { type: Type.INTEGER },
                    reductionPercentage: { type: Type.INTEGER }
                  },
                  required: ["systemPromptTokens", "estimatedSavings", "reductionPercentage"]
                },
                pros: { type: Type.ARRAY, items: { type: Type.STRING } },
                cons: { type: Type.ARRAY, items: { type: Type.STRING } },
                recommendations: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["efficiencyScore", "tokenEstimation", "pros", "cons", "recommendations"]
            }
          },
          required: ["optimizedPrompt", "analysis"]
        }
      }
    });

    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate prompt." });
  }
});

// ─── NEW: Forge AI-specific prompt ────────────────────────────────────────────
app.post("/api/forge-prompt", checkApiKey, async (req, res) => {
  try {
    const {
      userRequest,
      modelId,
      modelName,
      promptingStyle,
      promptingTips,
      systemPromptSupport,
      contextWindow,
      attachments,
      questionAnswers  // optional — for refinement pass
    } = req.body;

    if (!userRequest?.trim()) return res.status(400).json({ error: "User request is required." });
    if (!modelId) return res.status(400).json({ error: "Target AI model is required." });

    const isRefinementPass = questionAnswers && Object.keys(questionAnswers).length > 0;

    let answersSection = "";
    if (isRefinementPass) {
      answersSection = "\n\n### USER REFINEMENT ANSWERS (incorporate these to improve the prompt):\n";
      Object.entries(questionAnswers).forEach(([q, a]) => {
        answersSection += `- ${q}: ${a}\n`;
      });
    }

    let attachmentsSection = "";
    if (attachments?.length) {
      attachmentsSection = "\n\n### REFERENCE FILES/SCREENSHOTS PROVIDED BY USER:\n";
      attachments.forEach((att: any) => {
        const isImage = att.type?.startsWith("image/");
        attachmentsSection += `<file name="${att.name}" type="${att.type}">\n`;
        attachmentsSection += isImage ? "[Visual file — passed as inline image below]\n" : `${att.content || ""}\n`;
        attachmentsSection += `</file>\n`;
      });
    }

    const systemInstruction =
      `You are a world-class prompt engineer who specializes deeply in ${modelName}.\n\n` +
      `Your expert knowledge of ${modelName}:\n` +
      `PROMPTING STYLE: ${promptingStyle}\n\n` +
      `PROMPTING TIPS:\n${(promptingTips as string[]).map((t: string, i: number) => `${i + 1}. ${t}`).join("\n")}\n\n` +
      `CONTEXT WINDOW: ${contextWindow}\n` +
      `SYSTEM PROMPT SUPPORT: ${systemPromptSupport ? "Yes — generate separate system/user sections" : "No — single message format"}\n\n` +
      `Your task: Transform the user's natural language request into a highly optimized, ready-to-paste prompt specifically engineered for ${modelName}.\n` +
      `The prompt must:\n` +
      `1. Use the exact syntax and structure that ${modelName} responds best to\n` +
      `2. Include all necessary context, constraints, and output format specifications\n` +
      `3. Be ready to copy-paste directly into ${modelName} with zero editing\n` +
      `4. ${systemPromptSupport ? "Include a SYSTEM PROMPT section and USER MESSAGE section clearly labeled" : "Be formatted as a single, complete message"}\n\n` +
      `Also generate 3-5 focused reflective questions (based on complexity of the request) that would help refine this prompt further.\n` +
      `Questions should be specific to what was requested — not generic. They uncover: audience, constraints, edge cases, output format preferences, or success criteria.\n` +
      `Keep questions concise and answerable in 1-3 sentences. Never ask more than 5.`;

    const userPrompt =
      `USER'S REQUEST:\n"${userRequest}"\n` +
      `${attachmentsSection}${answersSection}\n\n` +
      `Generate the optimized ${modelName} prompt and reflective questions now.`;

    const contentParts: any[] = [{ text: userPrompt }];
    if (attachments?.length) {
      attachments.forEach((att: any) => {
        if (att.type?.startsWith("image/") && att.content) {
          contentParts.push({
            inlineData: {
              mimeType: att.type,
              data: att.content.includes(",") ? att.content.split(",")[1] : att.content
            }
          });
        }
      });
    }

    const response = await getAI(req).models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: contentParts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            forgedPrompt: {
              type: Type.STRING,
              description: "The complete, ready-to-paste prompt optimized for the target AI model."
            },
            promptTip: {
              type: Type.STRING,
              description: "One short, specific tip (under 20 words) about using this exact prompt effectively in the target AI."
            },
            reflectiveQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Short slug like 'output-format' or 'audience'" },
                  question: { type: Type.STRING, description: "The reflective question text" },
                  helperText: { type: Type.STRING, description: "Brief hint or 2-3 example answers" }
                },
                required: ["id", "question", "helperText"]
              },
              description: "3-5 focused questions to refine the prompt further. Fewer questions for simple requests."
            }
          },
          required: ["forgedPrompt", "promptTip", "reflectiveQuestions"]
        }
      }
    });

    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to forge prompt." });
  }
});

app.post("/api/bridge-context", checkApiKey, async (req, res) => {
  try {
    const {
      sourceModelId,
      sourceModelName,
      targetModelId,
      targetModelName,
      targetPromptingStyle,
      targetPromptingTips,
      targetSystemPromptSupport,
      chatHistory,
      continuationGoal,
      attachments,
      questionAnswers   // optional — for refinement pass
    } = req.body;

    if (!chatHistory?.trim() && (!attachments || attachments.length === 0)) {
      return res.status(400).json({ error: "Provide your chat history (text or screenshot) to bridge." });
    }
    if (!targetModelId) return res.status(400).json({ error: "Target AI model is required." });

    let answersSection = "";
    if (questionAnswers && Object.keys(questionAnswers).length > 0) {
      answersSection = "\n\n### USER CLARIFICATIONS (use to improve the bridge prompt):\n";
      Object.entries(questionAnswers).forEach(([q, a]) => {
        answersSection += `- ${q}: ${a}\n`;
      });
    }

    let attachmentsSection = "";
    if (attachments?.length) {
      attachmentsSection = "\n\n### REFERENCE SCREENSHOTS/FILES FROM PREVIOUS AI SESSION:\n";
      attachments.forEach((att: any) => {
        const isImage = att.type?.startsWith("image/");
        attachmentsSection += `<file name="${att.name}">\n`;
        attachmentsSection += isImage ? "[Screenshot — visual context passed as inline image below]\n" : `${att.content || ""}\n`;
        attachmentsSection += `</file>\n`;
      });
    }

    const systemInstruction =
      `You are an expert at preserving AI conversation context when a user switches between different AI models due to usage limits, context limits, or preference.\n\n` +
      `The user was working with ${sourceModelName || "an AI"} and needs to continue on ${targetModelName}.\n\n` +
      `Your deep knowledge of ${targetModelName}:\n` +
      `PROMPTING STYLE: ${targetPromptingStyle}\n` +
      `TIPS: ${(targetPromptingTips as string[])?.join("; ")}\n` +
      `SYSTEM PROMPT SUPPORT: ${targetSystemPromptSupport ? "Yes" : "No"}\n\n` +
      `Your task:\n` +
      `1. Read the pasted conversation history and/or screenshots carefully\n` +
      `2. Write a concise CONTEXT SUMMARY (3-6 bullet points) of: what was discussed, key decisions/conclusions, where it left off\n` +
      `3. Write a BRIDGE PROMPT optimized for ${targetModelName} that:\n` +
      `   - Opens by establishing full context from the previous session\n` +
      `   - Uses ${targetModelName}'s preferred syntax and structure\n` +
      `   - Includes the continuation goal clearly\n` +
      `   - Is ready to paste into ${targetModelName} and immediately continue work\n` +
      `   - If system prompt support: include a SYSTEM section for context + USER section for the continuation task\n` +
      `4. Generate 3-5 reflective questions to help the user refine or focus the bridge (based on what gaps or ambiguities you spotted in the history)\n` +
      `   Keep questions specific and answerable. Fewer questions for clear/short histories.\n` +
      `5. Extract a list of key variables/decisions (as 3-6 key-value pairs) from the history. Focus on: primary programming languages, frameworks, state choices, or core parameters.`;

    const userMessage =
      `PREVIOUS AI (SOURCE): ${sourceModelName || "Unknown AI"}\n` +
      `CONTINUING ON (TARGET): ${targetModelName}\n\n` +
      `CONVERSATION HISTORY:\n${chatHistory || "[See attached screenshots]"}\n` +
      `${attachmentsSection}${answersSection}\n\n` +
      `CONTINUATION GOAL:\n"${continuationGoal || "Continue from where we left off"}"\n\n` +
      `Generate context summary, bridge prompt, and reflective questions now.`;

    const contentParts: any[] = [{ text: userMessage }];
    if (attachments?.length) {
      attachments.forEach((att: any) => {
        if (att.type?.startsWith("image/") && att.content) {
          contentParts.push({
            inlineData: {
              mimeType: att.type,
              data: att.content.includes(",") ? att.content.split(",")[1] : att.content
            }
          });
        }
      });
    }

    const response = await getAI(req).models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: contentParts }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            contextSummary: {
              type: Type.STRING,
              description: "Concise bullet-point summary (3-6 points) of the previous conversation's key context."
            },
            bridgePrompt: {
              type: Type.STRING,
              description: "The complete, ready-to-paste continuation prompt optimized for the target AI model."
            },
            extractedVariables: {
              type: Type.ARRAY,
              description: "Key technical choices or parameters extracted from the conversation history.",
              items: {
                type: Type.OBJECT,
                properties: {
                  key: { type: Type.STRING, description: "e.g., Primary Language, State Management, Database" },
                  value: { type: Type.STRING, description: "e.g., TypeScript, Redux Toolkit, SQLite" }
                },
                required: ["key", "value"]
              }
            },
            reflectiveQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  helperText: { type: Type.STRING }
                },
                required: ["id", "question", "helperText"]
              },
              description: "3-5 questions to refine the bridge prompt, based on gaps found in the conversation history."
            }
          },
          required: ["contextSummary", "bridgePrompt", "extractedVariables", "reflectiveQuestions"]
        }
      }
    });

    return res.json(JSON.parse(response.text?.trim() || "{}"));
  } catch (error: any) {
    console.error("bridge-context error:", error);
    return res.status(500).json({ error: error.message || "Failed to generate bridge prompt." });
  }
});
// ─── Enhance an image prompt ─────────────────────────────────────────────
app.post("/api/enhance-image", checkApiKey, async (req, res) => {
  try {
    const { prompt, model, dialect, image } = req.body;
    if (!prompt?.trim()) return res.status(400).json({ error: "Prompt is required." });

    const systemInstruction =
      `You are an expert image-prompt engineer. Rewrite the user's prompt for ${model || "the target model"}, ` +
      `whose dialect is "${dialect || "natural"}". Preserve intent; improve specificity, structure and clarity.\n` +
      `Dialect rules: natural = one vivid descriptive paragraph, no keyword stacks, no --parameters, state aspect ratio in words; ` +
      `tags = comma-separated descriptors with the subject first, then Midjourney params like --ar and --no; ` +
      `weighted = comma tokens, optional (token:1.2) weights, then a separate line beginning "Negative prompt:".\n` +
      `Return ONLY the final prompt text.`;

    const contentParts: any[] = [{ text: prompt }];
    if (image?.data && image?.mimeType) {
      contentParts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data
        }
      });
    }

    const response = await getAI(req).models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: "user", parts: contentParts }],
      config: { systemInstruction }
    });

    const enhanced = response.text?.trim() || "";
    if (!enhanced) return res.status(500).json({ error: "Empty response." });
    return res.json({ enhanced });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to enhance prompt." });
  }
});

// ─── NEW: Generate study plan ─────────────────────────────────────────────────
app.post("/api/generate-study-plan", checkApiKey, async (req, res) => {
  try {
    const { resources, studyGoal } = req.body;
    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return res.status(400).json({ error: "Select at least one learning resource." });
    }
    if (!studyGoal?.trim()) return res.status(400).json({ error: "Study goal is required." });

    const systemInstruction =
      "You are a master Academic Advisor and Curriculum Designer.\n" +
      "Your task is to generate a comprehensive, highly structured study plan and prompt based *only* on the selected learning resources and the user's study goal.\n" +
      "The plan must include: a weekly syllabus, specific projects/checkpoints to build, and direct instructions on how to use each selected resource.\n" +
      "Return the response in markdown format, wrapping the final study syllabus prompt inside a copy-pasteable box.";

    const promptText =
      `STUDY GOAL: "${studyGoal}"\n\n` +
      `SELECTED RESOURCES:\n` +
      resources.map((r: any) => `- ${r.name} (${r.url}): ${r.bestFor}`).join("\n") +
      `\n\nGenerate the complete structured study plan and copy-pasteable prompt now.`;

    const response = await getAI(req).models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptText,
      config: { systemInstruction }
    });

    const studyPlanPrompt = response.text?.trim() || "";
    if (!studyPlanPrompt) return res.status(500).json({ error: "Empty response from AI." });
    return res.json({ studyPlanPrompt });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate study plan." });
  }
});

// ─── Serve frontend ───────────────────────────────────────────────────────────
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Prompt Studio server running on http://0.0.0.0:${PORT}`);
  });
}

setupServer();
