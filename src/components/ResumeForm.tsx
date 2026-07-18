/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ResumeData, WorkExperience, Education, Project, Certification, Language, Award, Reference } from "../types";
import { Plus, Trash, Wand2, Sparkles, RefreshCw, Layers, CheckCircle, ChevronDown, ChevronUp, Save, BrainCircuit, UploadCloud, FileText, X } from "lucide-react";

interface ResumeFormProps {
  data: ResumeData;
  onChange: (newData: ResumeData) => void;
  onAISkipGenerate: (generatorInputs: any) => Promise<void>;
  isGeneratingAI: boolean;
}

export default function ResumeForm({ data, onChange, onAISkipGenerate, isGeneratingAI }: ResumeFormProps) {
  const [activeTab, setActiveTab] = useState<"personal" | "summary" | "experience" | "education" | "projects" | "skills" | "other">("personal");
  
  // AI Form Quick Generation parameters
  const [quickName, setQuickName] = useState(data.personalInfo.fullName || "");
  const [quickDegree, setQuickDegree] = useState("");
  const [quickSkills, setQuickSkills] = useState("");
  const [quickGoal, setQuickGoal] = useState("");
  const [quickIndustry, setQuickIndustry] = useState("");
  const [showQuickAI, setShowQuickAI] = useState(false);

  // LinkedIn Import states
  const [showLinkedInImport, setShowLinkedInImport] = useState(false);
  const [importMode, setImportMode] = useState<"url" | "pdf">("url");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [linkedinPasteData, setLinkedinPasteData] = useState("");
  const [isScrapingLinkedin, setIsScrapingLinkedin] = useState(false);
  const [scrapingStatus, setScrapingStatus] = useState("");
  
  // PDF Import states
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsingPdf, setIsParsingPdf] = useState(false);
  const [parsingPdfStatus, setParsingPdfStatus] = useState("");

  // Field level AI loading states
  const [bulletLoadingFieldId, setBulletLoadingFieldId] = useState<string | null>(null);
  const [refiningField, setRefiningField] = useState<string | null>(null);

  const tabs = [
    { id: "personal", label: "Personal Info" },
    { id: "summary", label: "Summary" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "projects", label: "Projects" },
    { id: "skills", label: "Skills" },
    { id: "other", label: "Certifications & Extras" },
  ] as const;

  // Change handlers
  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...data,
      personalInfo: {
        ...data.personalInfo,
        [field]: value,
      },
    });
  };

  const handleListChange = <K extends keyof ResumeData>(key: K, index: number, field: string, value: any) => {
    const list = [...(data[key] as any)];
    list[index] = { ...list[index], [field]: value };
    onChange({ ...data, [key]: list });
  };

  const handleAddListItem = <K extends keyof ResumeData>(key: K, defaultValue: any) => {
    const list = [...(data[key] as any), { id: Math.random().toString(36).substr(2, 9), ...defaultValue }];
    onChange({ ...data, [key]: list });
  };

  const handleRemoveListItem = <K extends keyof ResumeData>(key: K, index: number) => {
    const list = [...(data[key] as any)];
    list.splice(index, 1);
    onChange({ ...data, [key]: list });
  };

  // Reorder list items
  const handleMoveItem = <K extends keyof ResumeData>(key: K, index: number, direction: "up" | "down") => {
    const list = [...(data[key] as any)];
    if (direction === "up" && index > 0) {
      const temp = list[index];
      list[index] = list[index - 1];
      list[index - 1] = temp;
    } else if (direction === "down" && index < list.length - 1) {
      const temp = list[index];
      list[index] = list[index + 1];
      list[index + 1] = temp;
    }
    onChange({ ...data, [key]: list });
  };

  // Call API to generate bullets for specific role
  const handleGenerateBullets = async (index: number, position: string, company: string) => {
    if (!position) {
      alert("Please provide a job title first!");
      return;
    }
    const roleDetails = `${position} at ${company || "a dynamic firm"}`;
    const targetFieldId = `job-bullet-${index}`;
    setBulletLoadingFieldId(targetFieldId);

    try {
      const res = await fetch("/api/generate-bullets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleAndCompany: roleDetails }),
      });
      const result = await res.json();
      if (result.bullets) {
        const formattedBullets = result.bullets.map((b: string) => `• ${b}`).join("\n");
        handleListChange("workExperience", index, "description", formattedBullets);
      }
    } catch (err) {
      console.error(err);
      alert("Could not generate AI bullets. Ensure your Gemini API Key is configured.");
    } finally {
      setBulletLoadingFieldId(null);
    }
  };

  // Call API to refine generic text segment
  const handleRefineField = async (textKey: "summary" | { listName: "workExperience" | "projects"; idx: number; field: string }, action: string, tone: string) => {
    let originalText = "";
    if (textKey === "summary") {
      originalText = data.professionalSummary;
    } else {
      const list = data[textKey.listName] as any[];
      originalText = list[textKey.idx][textKey.field];
    }

    if (!originalText) {
      alert("Please enter some text to optimize first!");
      return;
    }

    const fieldId = textKey === "summary" ? "summary" : `${textKey.listName}-${textKey.idx}-${textKey.field}`;
    setRefiningField(fieldId);

    try {
      const res = await fetch("/api/refine-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: originalText, action, tone }),
      });
      const result = await res.json();
      if (result.refinedText) {
        if (textKey === "summary") {
          onChange({ ...data, professionalSummary: result.refinedText });
        } else {
          handleListChange(textKey.listName, textKey.idx, textKey.field, result.refinedText);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Could not refine text. Please verify API configuration.");
    } finally {
      setRefiningField(null);
    }
  };

  // Quick AI Generate CV
  const triggerQuickAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName || !quickDegree || !quickSkills) {
      alert("Please enter Name, Degree, and some Skills first!");
      return;
    }
    await onAISkipGenerate({
      name: quickName,
      degree: quickDegree,
      experienceLevel: data.personalInfo.experienceLevel,
      skills: quickSkills,
      careerGoal: quickGoal,
      preferredIndustry: quickIndustry,
    });
    setShowQuickAI(false);
  };

  // LinkedIn Importer Scraper Handler
  const handleScrapeLinkedin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkedinUrl) {
      alert("Please enter a valid LinkedIn Profile URL first!");
      return;
    }
    
    setIsScrapingLinkedin(true);
    setScrapingStatus("Connecting to LinkedIn profile resolver...");
    
    const statusMessages = [
      "Bypassing profile access locks...",
      "Extracting professional graph nodes...",
      "Scraping roles, responsibilities, and timeline...",
      "Analyzing skill associations with AI...",
      "Synthesizing complete, ATS-friendly resume structure..."
    ];
    
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < statusMessages.length) {
        setScrapingStatus(statusMessages[msgIdx]);
        msgIdx++;
      }
    }, 2500);

    try {
      const res = await fetch("/api/scrape-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileUrl: linkedinUrl,
          pasteData: linkedinPasteData
        }),
      });
      
      clearInterval(interval);
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to scrape LinkedIn profile.");
      }
      
      const result = await res.json();
      
      if (result.personalInfo) {
        // Map scraped data directly to ResumeData!
        onChange({
          ...data,
          personalInfo: {
            fullName: result.personalInfo.fullName || data.personalInfo.fullName || "Professional Candidate",
            profession: result.personalInfo.profession || data.personalInfo.profession || "Senior Professional",
            email: result.personalInfo.email || data.personalInfo.email || "candidate@example.com",
            phone: result.personalInfo.phone || data.personalInfo.phone || "+1 (555) 019-2834",
            address: result.personalInfo.address || data.personalInfo.address || "San Francisco Bay Area",
            linkedIn: linkedinUrl,
            gitHub: data.personalInfo.gitHub || "",
            portfolio: data.personalInfo.portfolio || "",
            experienceLevel: result.personalInfo.experienceLevel || data.personalInfo.experienceLevel || "Senior",
          },
          professionalSummary: result.professionalSummary || data.professionalSummary || "",
          workExperience: (result.workExperience || []).map((w: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            company: w.company || "",
            position: w.position || "",
            location: w.location || "Remote",
            startDate: w.startDate || "2022",
            endDate: w.endDate || "Present",
            current: w.current !== undefined ? w.current : true,
            description: w.description || "",
          })),
          education: (result.education || []).map((edu: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            institution: edu.institution || "",
            degree: edu.degree || "",
            fieldOfStudy: edu.fieldOfStudy || "",
            location: edu.location || "",
            startDate: edu.startDate || "2018",
            endDate: edu.endDate || "2022",
            gpa: edu.gpa || "",
          })),
          projects: (result.projects || []).map((p: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name || "",
            role: p.role || "",
            description: p.description || "",
            technologies: p.technologies || "",
          })),
          skills: result.skills || data.skills || [],
          certifications: (result.certifications || []).map((c: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            name: c.name || "",
            issuer: c.issuer || "",
            date: c.date || "",
          })),
          awards: (result.awards || []).map((aw: any) => ({
            id: Math.random().toString(36).substr(2, 9),
            title: aw.title || "",
            issuer: aw.issuer || "",
            date: aw.date || "",
            description: aw.description || "",
          })),
        });
        
        setShowLinkedInImport(false);
        setLinkedinUrl("");
        setLinkedinPasteData("");
        alert("LinkedIn Profile successfully scraped & imported! Your resume form has been populated.");
      } else {
        alert("Scraping succeeded but returned invalid resume structure. Check server log.");
      }
    } catch (err: any) {
      clearInterval(interval);
      console.error(err);
      alert(`Scraping Error: ${err.message || "Could not scrape LinkedIn profile. Verify server is running and API key is correct."}`);
    } finally {
      setIsScrapingLinkedin(false);
      setScrapingStatus("");
    }
  };

  // PDF AI Resume Parser Handler
  const handleParsePdfResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) {
      alert("Please select or drop a PDF resume file first!");
      return;
    }

    setIsParsingPdf(true);
    setParsingPdfStatus("Reading local PDF file...");

    const reader = new FileReader();
    reader.onload = async () => {
      let interval: NodeJS.Timeout | undefined;
      try {
        const base64String = (reader.result as string).split(",")[1];
        if (!base64String) {
          throw new Error("Could not read PDF file content.");
        }

        setParsingPdfStatus("Uploading & initializing AI multi-modal parser...");

        const statusMessages = [
          "Parsing visual document layout...",
          "Analyzing font hierarchies & headers...",
          "Extracting experience timelines and roles...",
          "Validating skill graph taxonomy...",
          "Synthesizing complete, ATS-friendly resume structure..."
        ];

        let msgIdx = 0;
        interval = setInterval(() => {
          if (msgIdx < statusMessages.length) {
            setParsingPdfStatus(statusMessages[msgIdx]);
            msgIdx++;
          }
        }, 2200);

        const res = await fetch("/api/parse-pdf-resume", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pdfBase64: base64String,
            fileName: pdfFile.name
          }),
        });

        if (interval) clearInterval(interval);

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || "Failed to parse PDF resume.");
        }

        const result = await res.json();

        if (result.personalInfo) {
          onChange({
            ...data,
            personalInfo: {
              fullName: result.personalInfo.fullName || data.personalInfo.fullName || "Professional Candidate",
              profession: result.personalInfo.profession || data.personalInfo.profession || "Senior Professional",
              email: result.personalInfo.email || data.personalInfo.email || "candidate@example.com",
              phone: result.personalInfo.phone || data.personalInfo.phone || "+1 (555) 019-2834",
              address: result.personalInfo.address || data.personalInfo.address || "San Francisco Bay Area",
              linkedIn: result.personalInfo.linkedIn || data.personalInfo.linkedIn || "",
              gitHub: result.personalInfo.gitHub || data.personalInfo.gitHub || "",
              portfolio: result.personalInfo.portfolio || data.personalInfo.portfolio || "",
              experienceLevel: result.personalInfo.experienceLevel || data.personalInfo.experienceLevel || "Senior",
            },
            professionalSummary: result.professionalSummary || data.professionalSummary || "",
            workExperience: (result.workExperience || []).map((w: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              company: w.company || "",
              position: w.position || "",
              location: w.location || "Remote",
              startDate: w.startDate || "2022",
              endDate: w.endDate || "Present",
              current: w.current !== undefined ? w.current : true,
              description: w.description || "",
            })),
            education: (result.education || []).map((edu: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              institution: edu.institution || "",
              degree: edu.degree || "",
              fieldOfStudy: edu.fieldOfStudy || "",
              location: edu.location || "",
              startDate: edu.startDate || "2018",
              endDate: edu.endDate || "2022",
              gpa: edu.gpa || "",
            })),
            projects: (result.projects || []).map((p: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              name: p.name || "",
              role: p.role || "",
              description: p.description || "",
              technologies: p.technologies || "",
            })),
            skills: result.skills || data.skills || [],
            certifications: (result.certifications || []).map((c: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              name: c.name || "",
              issuer: c.issuer || "",
              date: c.date || "",
            })),
            awards: (result.awards || []).map((aw: any) => ({
              id: Math.random().toString(36).substr(2, 9),
              title: aw.title || "",
              issuer: aw.issuer || "",
              date: aw.date || "",
              description: aw.description || "",
            })),
          });

          setShowLinkedInImport(false);
          setPdfFile(null);
          alert("Resume PDF successfully parsed & imported! Your resume form has been populated.");
        } else {
          alert("Parsing succeeded but returned invalid resume structure. Check server logs.");
        }
      } catch (err: any) {
        if (interval) clearInterval(interval);
        console.error(err);
        alert(`Parsing Error: ${err.message || "Could not parse PDF. Make sure it is a valid PDF and under 10MB."}`);
      } finally {
        setIsParsingPdf(false);
        setParsingPdfStatus("");
      }
    };

    reader.onerror = () => {
      alert("Error reading file.");
      setIsParsingPdf(false);
      setParsingPdfStatus("");
    };

    reader.readAsDataURL(pdfFile);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Header with quick forge action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 dark:text-white font-display">Resume Builder Form</h2>
          <p className="text-xs text-slate-500">Auto-saves to local workspace. Tailor templates instantly.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center shrink-0">
          <button
            onClick={() => {
              setShowLinkedInImport(!showLinkedInImport);
              setShowQuickAI(false);
            }}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4" />
            <span>LinkedIn & PDF AI Importer</span>
          </button>
          <button
            onClick={() => {
              setShowQuickAI(!showQuickAI);
              setShowLinkedInImport(false);
            }}
            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
          >
            <BrainCircuit className="w-4 h-4" />
            <span>Complete Resume AI Forge</span>
          </button>
        </div>
      </div>

      {/* AI Quick Generator Drawer */}
      {showQuickAI && (
        <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border border-indigo-100 dark:border-indigo-950 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-200 uppercase font-display flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Instant AI Resume Forge Form</span>
            </h4>
            <span className="text-[10px] text-emerald-600 bg-emerald-100/50 dark:bg-emerald-950/50 font-bold px-2 py-0.5 rounded uppercase">Included Free</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Tell CareerForge your target profession and key background points. We'll automatically build and structure complete achievements, summary, projects, and certifications!
          </p>

          <form onSubmit={triggerQuickAIGenerate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Full Name</label>
              <input
                type="text"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                placeholder="e.g. Alex Carter"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Degree & Field</label>
              <input
                type="text"
                value={quickDegree}
                onChange={(e) => setQuickDegree(e.target.value)}
                placeholder="e.g. M.S. in Computer Science"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Your 3 core skills / specialties</label>
              <input
                type="text"
                value={quickSkills}
                onChange={(e) => setQuickSkills(e.target.value)}
                placeholder="e.g. TypeScript, React Architecture, AWS Scaling"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Target Industry</label>
              <input
                type="text"
                value={quickIndustry}
                onChange={(e) => setQuickIndustry(e.target.value)}
                placeholder="e.g. SaaS / Financial Tech"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">Primary Career Goal</label>
              <input
                type="text"
                value={quickGoal}
                onChange={(e) => setQuickGoal(e.target.value)}
                placeholder="e.g. Step into a Lead Software Architect role"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-2 pt-2 border-t border-indigo-100/50 dark:border-indigo-950">
              <button
                type="button"
                onClick={() => setShowQuickAI(false)}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGeneratingAI}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                {isGeneratingAI ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing & Building...</span>
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-3.5 h-3.5" />
                    <span>Forge My Entire Resume</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LinkedIn & PDF Import Drawer */}
      {showLinkedInImport && (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/20 dark:to-sky-950/20 rounded-xl border border-blue-100 dark:border-blue-950 text-left space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-extrabold text-blue-950 dark:text-blue-200 uppercase font-display flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>AI Professional Importer</span>
            </h4>
            <span className="text-[10px] text-blue-600 bg-blue-100/50 dark:bg-blue-950 font-semibold px-2 py-0.5 rounded">Multi-Modal AI</span>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex border-b border-blue-100 dark:border-blue-900/50 pb-2 gap-4">
            <button
              type="button"
              onClick={() => setImportMode("url")}
              className={`pb-1.5 text-xs font-bold border-b-2 transition-all ${
                importMode === "url"
                  ? "border-blue-600 text-blue-700 dark:text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              LinkedIn URL Scraping
            </button>
            <button
              type="button"
              onClick={() => setImportMode("pdf")}
              className={`pb-1.5 text-xs font-bold border-b-2 transition-all ${
                importMode === "pdf"
                  ? "border-blue-600 text-blue-700 dark:text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              PDF Resume File AI Parser
            </button>
          </div>

          {importMode === "url" ? (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Paste a public LinkedIn profile URL. CareerForge's AI scraper will analyze the profile slug, extract professional metadata, and synthesize a complete professional resume structure.
              </p>

              <form onSubmit={handleScrapeLinkedin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 uppercase">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://www.linkedin.com/in/username"
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-slate-950 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase">
                      Optional: Paste LinkedIn Profile Text / PDF Export Content
                    </label>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500">Improves accuracy significantly</span>
                  </div>
                  <textarea
                    value={linkedinPasteData}
                    onChange={(e) => setLinkedinPasteData(e.target.value)}
                    placeholder="Copy everything from your LinkedIn profile page or PDF export and paste it here..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-slate-950 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isScrapingLinkedin}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 disabled:from-blue-400 disabled:to-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isScrapingLinkedin ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Scraping & Building...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run AI Scraper</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLinkedInImport(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload your existing PDF resume. CareerForge's AI parser will process the file, extract work history, education, skills, and certifications, and map it perfectly to this form.
              </p>

              <form onSubmit={handleParsePdfResume} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase">
                    Upload Resume PDF
                  </label>
                  
                  {!pdfFile ? (
                    <div className="border-2 border-dashed border-blue-200 dark:border-blue-900/50 rounded-xl p-6 flex flex-col items-center justify-center bg-white/50 dark:bg-slate-950/30 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer relative">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setPdfFile(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <UploadCloud className="w-8 h-8 text-blue-500 mb-2" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Drag & drop your PDF resume here or <span className="text-blue-600">browse</span>
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">Supports PDF format up to 10MB</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-950 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                            {pdfFile.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPdfFile(null)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isParsingPdf || !pdfFile}
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-500 hover:to-sky-500 disabled:from-blue-400 disabled:to-sky-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {isParsingPdf ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Parsing & Synthesizing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Run AI PDF Parser</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLinkedInImport(false);
                      setPdfFile(null);
                    }}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}

          {isScrapingLinkedin && (
            <div className="mt-3 p-3 bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-900 rounded-lg shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Scraper status:</span>
                <span className="text-[10px] font-mono text-slate-400 animate-pulse">LIVE AGENT RUNNING</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {scrapingStatus}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-sky-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>
          )}

          {isParsingPdf && (
            <div className="mt-3 p-3 bg-white dark:bg-slate-950 border border-blue-100 dark:border-blue-900 rounded-lg shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Parser status:</span>
                <span className="text-[10px] font-mono text-slate-400 animate-pulse">AI MULTI-MODAL ACTIVE</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                {parsingPdfStatus}
              </p>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-sky-500 h-1.5 rounded-full animate-pulse" style={{ width: '85%' }}></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 overflow-x-auto no-scrollbar scroll-smooth gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors duration-200 ${
              activeTab === tab.id
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. Personal Information Tab */}
      {activeTab === "personal" && (
        <div className="space-y-4 text-left">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Personal Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Full Name</label>
              <input
                type="text"
                value={data.personalInfo.fullName}
                onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                placeholder="e.g. Sarah Jenkins"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Profession / Job Title</label>
              <input
                type="text"
                value={data.personalInfo.profession}
                onChange={(e) => updatePersonalInfo("profession", e.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Email Address</label>
              <input
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => updatePersonalInfo("email", e.target.value)}
                placeholder="e.g. sarah.j@email.com"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Phone Number</label>
              <input
                type="text"
                value={data.personalInfo.phone}
                onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                placeholder="e.g. +1 (555) 234-9876"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Location / Address</label>
              <input
                type="text"
                value={data.personalInfo.address}
                onChange={(e) => updatePersonalInfo("address", e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">LinkedIn Profile Link</label>
              <input
                type="text"
                value={data.personalInfo.linkedIn}
                onChange={(e) => updatePersonalInfo("linkedIn", e.target.value)}
                placeholder="e.g. linkedin.com/sarahj"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">GitHub Profile Link</label>
              <input
                type="text"
                value={data.personalInfo.gitHub}
                onChange={(e) => updatePersonalInfo("gitHub", e.target.value)}
                placeholder="e.g. github.com/sarahj"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Portfolio Site</label>
              <input
                type="text"
                value={data.personalInfo.portfolio}
                onChange={(e) => updatePersonalInfo("portfolio", e.target.value)}
                placeholder="e.g. sarahj.design"
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Experience Seniority</label>
              <select
                value={data.personalInfo.experienceLevel}
                onChange={(e: any) => updatePersonalInfo("experienceLevel", e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
              >
                <option value="Entry">Entry (0-2 years)</option>
                <option value="Mid">Mid Level (2-5 years)</option>
                <option value="Senior">Senior (5-8 years)</option>
                <option value="Executive">Executive (8+ years)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* 2. Professional Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-4 text-left">
          <div className="flex justify-between items-baseline">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Professional Summary</h3>
            <span className="text-[10px] text-indigo-500 font-mono">3 sentences recommended</span>
          </div>
          <div className="relative">
            <textarea
              rows={5}
              value={data.professionalSummary}
              onChange={(e) => onChange({ ...data, professionalSummary: e.target.value })}
              placeholder="Detail your accomplishments, core specialties, and what value you offer target employers..."
              className="w-full px-4 py-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950 leading-relaxed font-sans"
            />
            {refiningField === "summary" && (
              <div className="absolute inset-0 bg-white/70 dark:bg-slate-950/70 flex items-center justify-center rounded-xl">
                <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            )}
          </div>

          {/* AI Refine Panel */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-semibold">AI Refinement Tool:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleRefineField("summary", "impact", "Executive")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-[10px] font-bold transition-all"
              >
                🔥 Executive Impact
              </button>
              <button
                type="button"
                onClick={() => handleRefineField("summary", "rewrite", "Technical")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-[10px] font-bold transition-all"
              >
                💻 Make Technical
              </button>
              <button
                type="button"
                onClick={() => handleRefineField("summary", "shorten", "Professional")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-[10px] font-bold transition-all"
              >
                ✂️ Make Concise
              </button>
              <button
                type="button"
                onClick={() => handleRefineField("summary", "grammar", "Professional")}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-300 rounded-lg text-[10px] font-bold transition-all"
              >
                ✍️ Fix Grammar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Work Experience Tab */}
      {activeTab === "experience" && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Work Experience</h3>
            <button
              onClick={() =>
                handleAddListItem("workExperience", {
                  company: "",
                  position: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "• ",
                })
              }
              className="px-3 py-1.5 border border-indigo-500/20 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          <div className="space-y-6">
            {data.workExperience.map((job, idx) => (
              <div key={job.id} className="p-5 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 relative group/item bg-slate-50/20 dark:bg-slate-900/10">
                {/* Reorder / Action header */}
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-400"># EXPERIENCE {idx + 1}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMoveItem("workExperience", idx, "up")}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                      disabled={idx === 0}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveItem("workExperience", idx, "down")}
                      className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                      disabled={idx === data.workExperience.length - 1}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveListItem("workExperience", idx)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Job Title / Role</label>
                    <input
                      type="text"
                      value={job.position}
                      onChange={(e) => handleListChange("workExperience", idx, "position", e.target.value)}
                      placeholder="e.g. Frontend Team Lead"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Company Name</label>
                    <input
                      type="text"
                      value={job.company}
                      onChange={(e) => handleListChange("workExperience", idx, "company", e.target.value)}
                      placeholder="e.g. TechSphere Systems"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Location</label>
                    <input
                      type="text"
                      value={job.location}
                      onChange={(e) => handleListChange("workExperience", idx, "location", e.target.value)}
                      placeholder="e.g. Chicago, IL (Remote)"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Start Date</label>
                      <input
                        type="text"
                        value={job.startDate}
                        onChange={(e) => handleListChange("workExperience", idx, "startDate", e.target.value)}
                        placeholder="e.g. Jan 2022"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">End Date</label>
                      <input
                        type="text"
                        value={job.endDate}
                        onChange={(e) => handleListChange("workExperience", idx, "endDate", e.target.value)}
                        placeholder="e.g. Present"
                        disabled={job.current}
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold select-none cursor-pointer">
                      <input
                        type="checkbox"
                        checked={job.current}
                        onChange={(e) => handleListChange("workExperience", idx, "current", e.target.checked)}
                        className="rounded text-indigo-600"
                      />
                      <span>I currently work here</span>
                    </label>
                  </div>

                  {/* Bullet points section */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Achievements (Use bullet • symbol)</label>
                      <button
                        type="button"
                        onClick={() => handleGenerateBullets(idx, job.position, job.company)}
                        className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-300 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all shadow-sm"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>Generate Metric Bullets</span>
                      </button>
                    </div>

                    <div className="relative">
                      <textarea
                        rows={4}
                        value={job.description}
                        onChange={(e) => handleListChange("workExperience", idx, "description", e.target.value)}
                        placeholder="• Spearheaded the cloud migration, cutting database hosting expenses by 25%.&#10;• Orchestrated a major frontend system rebuild, resulting in a 40% jump in load performance."
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950 font-sans"
                      />
                      {bulletLoadingFieldId === `job-bullet-${idx}` && (
                        <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/75 flex flex-col items-center justify-center rounded-lg space-y-1">
                          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                          <span className="text-[10px] font-bold text-emerald-600 font-mono">HR Specialist is drafting...</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Education Tab */}
      {activeTab === "education" && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Education Records</h3>
            <button
              onClick={() =>
                handleAddListItem("education", {
                  institution: "",
                  degree: "",
                  fieldOfStudy: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  gpa: "",
                })
              }
              className="px-3 py-1.5 border border-indigo-500/20 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education</span>
            </button>
          </div>

          <div className="space-y-4">
            {data.education.map((edu, idx) => (
              <div key={edu.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 bg-slate-50/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-400"># EDUCATION {idx + 1}</span>
                  <button
                    onClick={() => handleRemoveListItem("education", idx)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Degree (e.g. B.S. / Master)</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleListChange("education", idx, "degree", e.target.value)}
                      placeholder="e.g. Bachelor of Science"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Field of Study</label>
                    <input
                      type="text"
                      value={edu.fieldOfStudy}
                      onChange={(e) => handleListChange("education", idx, "fieldOfStudy", e.target.value)}
                      placeholder="e.g. Computer Science & Software Engineering"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Institution / University</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleListChange("education", idx, "institution", e.target.value)}
                      placeholder="e.g. Northwestern University"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Location</label>
                    <input
                      type="text"
                      value={edu.location}
                      onChange={(e) => handleListChange("education", idx, "location", e.target.value)}
                      placeholder="e.g. Evanston, IL"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">GPA</label>
                      <input
                        type="text"
                        value={edu.gpa}
                        onChange={(e) => handleListChange("education", idx, "gpa", e.target.value)}
                        placeholder="e.g. 3.8/4.0"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Start Year</label>
                      <input
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => handleListChange("education", idx, "startDate", e.target.value)}
                        placeholder="e.g. 2018"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">End Year</label>
                      <input
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => handleListChange("education", idx, "endDate", e.target.value)}
                        placeholder="e.g. 2022"
                        className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Projects Tab */}
      {activeTab === "projects" && (
        <div className="space-y-6 text-left">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Key Projects</h3>
            <button
              onClick={() =>
                handleAddListItem("projects", {
                  name: "",
                  role: "",
                  description: "",
                  technologies: "",
                })
              }
              className="px-3 py-1.5 border border-indigo-500/20 text-indigo-600 hover:bg-indigo-50 text-xs font-semibold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Project</span>
            </button>
          </div>

          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={proj.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 bg-slate-50/20">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold font-mono text-slate-400"># PROJECT {idx + 1}</span>
                  <button
                    onClick={() => handleRemoveListItem("projects", idx)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Project Title</label>
                    <input
                      type="text"
                      value={proj.name}
                      onChange={(e) => handleListChange("projects", idx, "name", e.target.value)}
                      placeholder="e.g. AI-Powered Portfolio Platform"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Technologies (comma separated)</label>
                    <input
                      type="text"
                      value={proj.technologies}
                      onChange={(e) => handleListChange("projects", idx, "technologies", e.target.value)}
                      placeholder="e.g. Next.js, FastAPI, PostgreSQL"
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Your Role / Contributions</label>
                    <input
                      type="text"
                      value={proj.role}
                      onChange={(e) => handleListChange("projects", idx, "role", e.target.value)}
                      placeholder="e.g. Built transactional analytics pipeline and styled dashboard with Tailwind"
                      className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Short Description</label>
                    <textarea
                      rows={2}
                      value={proj.description}
                      onChange={(e) => handleListChange("projects", idx, "description", e.target.value)}
                      placeholder="e.g. Conceptualized and scaled a full-stack dashboard supporting 5,000 requests per minute with Redis caching."
                      className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Skills Tab */}
      {activeTab === "skills" && (
        <div className="space-y-4 text-left">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2">Core Skills</h3>
          <p className="text-xs text-slate-500 mb-3">Add skills as tags. Click Enter or comma to create a new tag.</p>

          <div className="flex flex-wrap gap-2 p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950/30">
            {data.skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-semibold rounded-lg"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => {
                    const sk = [...data.skills];
                    sk.splice(idx, 1);
                    onChange({ ...data, skills: sk });
                  }}
                  className="text-indigo-500 hover:text-indigo-700 text-xs font-bold font-sans"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              placeholder="Add skill..."
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim().replace(/,$/, "");
                  if (val && !data.skills.includes(val)) {
                    onChange({ ...data, skills: [...data.skills, val] });
                    e.currentTarget.value = "";
                  }
                }
              }}
              className="flex-1 min-w-[120px] bg-transparent text-xs p-1 focus:outline-none"
            />
          </div>

          <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wide">Suggested Hot Skills for {data.personalInfo.profession || "Developer"}</h4>
            <div className="flex flex-wrap gap-1.5">
              {["TypeScript", "React Architecture", "AWS Cloud", "Node.js (Express)", "GraphQL APIs", "CI/CD Orchestration", "Docker", "Database Tuning"].map((sk) => {
                const added = data.skills.includes(sk);
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => {
                      if (!added) {
                        onChange({ ...data, skills: [...data.skills, sk] });
                      }
                    }}
                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${
                      added ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 hover:bg-indigo-50 text-slate-600"
                    }`}
                  >
                    {added ? "✓ " : "+ "} {sk}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 7. Extra details (Certifications, Languages, Awards, Volunteer, References) */}
      {activeTab === "other" && (
        <div className="space-y-8 text-left">
          {/* Certifications subtab */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Certifications</h4>
              <button
                onClick={() => handleAddListItem("certifications", { name: "", issuer: "", date: "" })}
                className="px-2.5 py-1 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Cert</span>
              </button>
            </div>
            {data.certifications && data.certifications.map((cert, idx) => (
              <div key={cert.id} className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={cert.name}
                    onChange={(e) => handleListChange("certifications", idx, "name", e.target.value)}
                    placeholder="e.g. AWS Certified Solutions Architect"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={cert.issuer}
                    onChange={(e) => handleListChange("certifications", idx, "issuer", e.target.value)}
                    placeholder="e.g. Amazon Web Services"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={cert.date}
                    onChange={(e) => handleListChange("certifications", idx, "date", e.target.value)}
                    placeholder="e.g. 2024"
                    className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                  <button
                    onClick={() => handleRemoveListItem("certifications", idx)}
                    className="p-1.5 text-red-500 rounded hover:bg-red-50"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Languages subtab */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Languages</h4>
              <button
                onClick={() => handleAddListItem("languages", { name: "", proficiency: "Professional" })}
                className="px-2.5 py-1 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Lang</span>
              </button>
            </div>
            {data.languages && data.languages.map((lang, idx) => (
              <div key={lang.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => handleListChange("languages", idx, "name", e.target.value)}
                    placeholder="e.g. English, Spanish"
                    className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={lang.proficiency}
                    onChange={(e) => handleListChange("languages", idx, "proficiency", e.target.value)}
                    className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  >
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional">Professional</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Basic">Basic</option>
                  </select>
                  <button
                    onClick={() => handleRemoveListItem("languages", idx)}
                    className="p-1.5 text-red-500 rounded hover:bg-red-50"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Awards subtab */}
          <div className="space-y-4 border-t border-slate-100 dark:border-slate-800 pt-6">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Awards & Achievements</h4>
              <button
                onClick={() => handleAddListItem("awards", { title: "", issuer: "", date: "", description: "" })}
                className="px-2.5 py-1 border border-slate-200 text-slate-700 text-[10px] font-semibold rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Award</span>
              </button>
            </div>
            {data.awards && data.awards.map((award, idx) => (
              <div key={award.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/20">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Award {idx + 1}</span>
                  <button
                    onClick={() => handleRemoveListItem("awards", idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={award.title}
                    onChange={(e) => handleListChange("awards", idx, "title", e.target.value)}
                    placeholder="e.g. Innovator of the Year"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                  <input
                    type="text"
                    value={award.issuer}
                    onChange={(e) => handleListChange("awards", idx, "issuer", e.target.value)}
                    placeholder="e.g. Google Cloud Division"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                  <input
                    type="text"
                    value={award.date}
                    onChange={(e) => handleListChange("awards", idx, "date", e.target.value)}
                    placeholder="e.g. Oct 2023"
                    className="w-full px-2.5 py-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
