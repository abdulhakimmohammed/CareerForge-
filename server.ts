/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const geminiApiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY is not defined in the environment. AI features will be unavailable.");
}

// Reusable Helper to make sure AI is available
function getAIClient() {
  if (!ai) {
    throw new Error("Gemini AI API Key is missing. Please add GEMINI_API_KEY in Settings > Secrets.");
  }
  return ai;
}

// API Routes

// Route 1: AI Resume Generator (Generate from small form)
app.post("/api/generate-resume", async (req, res) => {
  try {
    const { name, degree, experienceLevel, skills, careerGoal, preferredIndustry } = req.body;
    const client = getAIClient();

    const prompt = `
      You are an expert HR manager and resume writer. Based on the user's brief details, generate a complete, ATS-friendly, highly professional, and achievement-based resume dataset.
      
      User Information:
      - Name: ${name || "Professional"}
      - Degree/Education: ${degree || "Relevant Degree"}
      - Experience Level: ${experienceLevel || "Mid"}
      - Skills: ${skills || "Key Professional Skills"}
      - Career Goal: ${careerGoal || "Advance in my career"}
      - Preferred Industry: ${preferredIndustry || "Technology"}

      Generate realistic, beautifully formatted, and impactful data including:
      1. A Professional Summary (3 sentences, packed with key metrics and action verbs)
      2. 2 Work Experiences with 3 achievements each (use strong action verbs and metrics like "improved performance by 30%")
      3. 1 Education record matching the degree
      4. 2 Projects with role and descriptions
      5. An expanded array of 8-10 skills (including the user's provided skills plus relevant industry standard skills)
      6. 2 relevant professional Certifications
      7. 1 Award
      8. 1 Volunteer Experience

      Ensure the output exactly conforms to the specified JSON schema.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["professionalSummary", "workExperience", "education", "projects", "skills", "certifications", "awards", "volunteerExperience"],
          properties: {
            professionalSummary: { type: Type.STRING },
            workExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["company", "position", "location", "startDate", "endDate", "current", "description"],
                properties: {
                  company: { type: Type.STRING },
                  position: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  current: { type: Type.BOOLEAN },
                  description: { type: Type.STRING, description: "Multiline string containing 3 bullet points starting with bullet symbol (•) detailing measurable achievements." }
                }
              }
            },
            education: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["institution", "degree", "fieldOfStudy", "location", "startDate", "endDate"],
                properties: {
                  institution: { type: Type.STRING },
                  degree: { type: Type.STRING },
                  fieldOfStudy: { type: Type.STRING },
                  location: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  gpa: { type: Type.STRING }
                }
              }
            },
            projects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "role", "description", "technologies"],
                properties: {
                  name: { type: Type.STRING },
                  role: { type: Type.STRING },
                  description: { type: Type.STRING },
                  technologies: { type: Type.STRING }
                }
              }
            },
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            certifications: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["name", "issuer", "date"],
                properties: {
                  name: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING }
                }
              }
            },
            awards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["title", "issuer", "date", "description"],
                properties: {
                  title: { type: Type.STRING },
                  issuer: { type: Type.STRING },
                  date: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            volunteerExperience: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["organization", "role", "startDate", "endDate", "description"],
                properties: {
                  organization: { type: Type.STRING },
                  role: { type: Type.STRING },
                  startDate: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    res.json(data);
  } catch (error: any) {
    console.error("Error generating resume:", error);
    res.status(500).json({ error: error.message || "Failed to generate resume" });
  }
});

// Route 2: AI Resume Optimizer & ATS Analyzer
app.post("/api/analyze-resume", async (req, res) => {
  try {
    const { resumeText } = req.body;
    if (!resumeText) {
      return res.status(400).json({ error: "Resume text is required" });
    }

    const client = getAIClient();
    const prompt = `
      You are an expert ATS (Applicant Tracking System) evaluator and recruiter. Score this resume text out of 100.
      Identify missing keywords, formatting errors, list weak bullet points with specific action-based metric improvements, and recommend specific changes to make it stand out.

      Resume Content:
      ${resumeText}

      Ensure your response strictly complies with the following JSON schema.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["score", "missingKeywords", "formattingIssues", "weakBulletPoints", "recommendations"],
          properties: {
            score: { type: Type.INTEGER, description: "A realistic ATS score out of 100." },
            missingKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A list of industry-standard keywords/skills missing from this resume."
            },
            formattingIssues: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Formatting risks (e.g., poor headings, wrong date formats, missing contacts)."
            },
            weakBulletPoints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["original", "suggestion"],
                properties: {
                  original: { type: Type.STRING },
                  suggestion: { type: Type.STRING, description: "A highly improved, metrics-driven and action-verb-heavy rewrite." }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific action points (e.g., 'Expand technical projects section', 'Include quantifiable metrics')."
            }
          }
        }
      }
    });

    const report = JSON.parse(response.text || "{}");
    res.json(report);
  } catch (error: any) {
    console.error("Error analyzing resume:", error);
    res.status(500).json({ error: error.message || "Failed to analyze resume" });
  }
});

// Route 3: AI Rewrite Assistant (Field level refinement)
app.post("/api/refine-text", async (req, res) => {
  try {
    const { text, action, tone } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required to refine" });
    }

    const client = getAIClient();
    const prompt = `
      You are an expert copywriter and professional CV editor.
      Take the following text, and refine it based on these parameters:
      - Action requested: ${action || "Improve grammar"} (Choose from: rewrite, expand, shorten, impact, grammar)
      - Desired Tone: ${tone || "Professional"} (Choose from: Executive, Technical, Friendly, Professional)

      Original Text:
      "${text}"

      Return ONLY the direct refined text string. Do not include quotes, conversational introductory sentences, or labels.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const refinedText = response.text ? response.text.trim() : text;
    res.json({ refinedText });
  } catch (error: any) {
    console.error("Error refining text:", error);
    res.status(500).json({ error: error.message || "Failed to refine text" });
  }
});

// Route 4: Smart Bullet Generator
app.post("/api/generate-bullets", async (req, res) => {
  try {
    const { roleAndCompany } = req.body;
    if (!roleAndCompany) {
      return res.status(400).json({ error: "Role and company details are required" });
    }

    const client = getAIClient();
    const prompt = `
      You are an elite professional resume writer.
      Generate 4 highly impactful, achievement-oriented, action-verb-heavy, and metrics-driven resume bullet points for the following role:
      "${roleAndCompany}"

      Example metrics: "boosted performance by 35%", "scaled operations by 4x", "saved $12,000 annually", "reduced page load times by 1.2s".
      Return a flat JSON array of 4 strings.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const bullets = JSON.parse(response.text || "[]");
    res.json({ bullets });
  } catch (error: any) {
    console.error("Error generating bullets:", error);
    res.status(500).json({ error: error.message || "Failed to generate bullets" });
  }
});

// Route 5: AI Cover Letter Generator
app.post("/api/generate-cover-letter", async (req, res) => {
  try {
    const { companyName, jobTitle, hiringManager, jobDescription, resumeContext, tone } = req.body;
    const client = getAIClient();

    const prompt = `
      You are a senior hiring manager and premium copywriter. Write a personalized, engaging, ATS-friendly cover letter tailored specifically to the job and user's profile.
      
      Details:
      - Job Title: ${jobTitle || "the position"}
      - Company Name: ${companyName || "the company"}
      - Hiring Manager: ${hiringManager || "Hiring Team / Hiring Manager"}
      - Job Description/Requirements:
        ${jobDescription || "Standard job requirements"}
      - User Profile/Skills Context:
        ${resumeContext || "A highly qualified professional"}
      - Tone: ${tone || "Professional"} (Options: Professional, Enthusiastic, Executive, Creative, Technical)

      Guidelines:
      - Write in clear, modern, natural, human paragraph format (3 to 4 paragraphs).
      - Include a standard professional layout header (date, addresses can be placeholders like [Your Address]).
      - Anchor experience directly to requirements in the job description.
      - Make it look polished, highly compelling, and persuasive.
      
      Return ONLY the final cover letter text. Do not include any JSON markers or meta comments.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    const content = response.text ? response.text.trim() : "Failed to generate cover letter.";
    res.json({ content });
  } catch (error: any) {
    console.error("Error generating cover letter:", error);
    res.status(500).json({ error: error.message || "Failed to generate cover letter" });
  }
});

// Route 6: Job Description Analyzer
app.post("/api/analyze-job", async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;
    if (!jobDescription || !resumeText) {
      return res.status(400).json({ error: "Both job description and resume text are required for matching." });
    }

    const client = getAIClient();
    const prompt = `
      You are an expert HR sourcer. Compare the following Job Description against the User's Resume and provide an in-depth analysis:
      
      Job Description:
      ${jobDescription}

      User's Resume:
      ${resumeText}

      Structure the response as a JSON containing:
      1. matchPercentage: realistic integer match score (0-100)
      2. requiredSkills: list of critical skills found in the job description
      3. missingSkills: list of required skills that are NOT present in the user's resume
      4. responsibilities: summary of core responsibilities
      5. softSkills: key soft skills requested
      6. recommendedImprovements: 3 specific resume editing steps to double the match percentage
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["matchPercentage", "requiredSkills", "missingSkills", "responsibilities", "softSkills", "recommendedImprovements"],
          properties: {
            matchPercentage: { type: Type.INTEGER },
            requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            responsibilities: { type: Type.ARRAY, items: { type: Type.STRING } },
            softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommendedImprovements: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const analysis = JSON.parse(response.text || "{}");
    res.json(analysis);
  } catch (error: any) {
    console.error("Error analyzing job:", error);
    res.status(500).json({ error: error.message || "Failed to analyze job" });
  }
});

// Route 7: Interview Prep Generator
app.post("/api/generate-interview-questions", async (req, res) => {
  try {
    const { jobDescription, resumeText } = req.body;
    const client = getAIClient();

    const prompt = `
      You are an elite career coach and recruiter. Based on the provided resume and target job description, generate 5 highly probable interview questions.
      Categorize them (Technical, Behavioral, General).
      For each, provide a professional sample answer or a structured framework following the STAR (Situation, Task, Action, Result) methodology.

      Job Description:
      ${jobDescription || "General Industry Role"}

      Resume/Experience Context:
      ${resumeText || "Job Seeker"}

      Structure your output as a JSON array of objects.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["question", "type", "starAnswer"],
            properties: {
              question: { type: Type.STRING },
              type: { type: Type.STRING, description: "Technical, Behavioral, or General" },
              starAnswer: {
                type: Type.OBJECT,
                required: ["situation", "task", "action", "result"],
                properties: {
                  situation: { type: Type.STRING },
                  task: { type: Type.STRING },
                  action: { type: Type.STRING },
                  result: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const questions = JSON.parse(response.text || "[]");
    res.json({ questions });
  } catch (error: any) {
    console.error("Error generating interview prep:", error);
    res.status(500).json({ error: error.message || "Failed to generate interview prep" });
  }
});

// Route 8: AI Chat Assistant
app.post("/api/chat-assistant", async (req, res) => {
  try {
    const { message, chatHistory, resumeContext } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const client = getAIClient();

    const systemInstruction = `
      You are CareerForge AI Assistant, a world-class career coach and expert resume advisor.
      Help the user with:
      - Resume and CV optimizations
      - Career directions, roadmap, and skill gaps
      - Interview preparation and practice
      - Salary negotiation tips
      - Cover letter edits
      - LinkedIn profile optimizations

      Resume Context:
      ${resumeContext ? JSON.stringify(resumeContext) : "No resume created yet. Guide them to build or optimize one."}

      Respond with concise, actionable, and encouraging insights. Keep answers highly professional, formatted with bolding and bullet points for easy reading.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...(chatHistory || []).map((msg: any) => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        })),
        { role: "user", parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      }
    });

    res.json({ response: response.text ? response.text.trim() : "I'm here to support your career path. Ask me anything!" });
  } catch (error: any) {
    console.error("Error in chat assistant:", error);
    res.status(500).json({ error: error.message || "Failed to generate chat response" });
  }
});

// Mount Vite middleware in development, serve build directory in production
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerForge AI Full Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error("Error starting full stack server:", err);
});
