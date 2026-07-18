/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LandingPage from "./components/LandingPage";
import ResumeForm from "./components/ResumeForm";
import ResumeTemplates from "./components/ResumeTemplates";
import AIOptimizer from "./components/AIOptimizer";
import CoverLetterGenerator from "./components/CoverLetterGenerator";
import JobTracker from "./components/JobTracker";
import InterviewPrep from "./components/InterviewPrep";
import AIChat from "./components/AIChat";
import LegalModal, { LegalTab } from "./components/LegalModal";
import { ResumeData, CoverLetterData, JobApplication } from "./types";
import {
  FileText,
  Sparkles,
  FileSearch,
  ClipboardList,
  HelpCircle,
  BrainCircuit,
  Settings,
  Download,
  Eye,
  Monitor,
  Tablet,
  Printer,
  Home,
  LogOut,
  Moon,
  Sun,
  Palette,
  CheckCircle,
  RefreshCw,
  FolderLock
} from "lucide-react";

// Initial Demo State for empty users
const INITIAL_RESUME_DATA: ResumeData = {
  id: "initial-id",
  title: "My Master Resume",
  updatedAt: "2026-06-27",
  personalInfo: {
    fullName: "Alex Rivera",
    profession: "Senior Full-Stack Engineer",
    email: "alex.rivera@gmail.com",
    phone: "+1 (555) 342-9180",
    address: "Austin, TX (Hybrid)",
    linkedIn: "linkedin.com/in/alexrivera",
    gitHub: "github.com/alexrivera",
    portfolio: "alexrivera.dev",
    experienceLevel: "Senior",
  },
  professionalSummary: "Results-driven Senior Full-Stack Engineer with 6+ years of experience specialized in building modular React/TypeScript architectures and optimizing server performance. Proven track record leading agile developer squads and driving database queries down by 30% latency. Passionate about automated testing, CI/CD safety, and user-centric design.",
  workExperience: [
    {
      id: "exp-1",
      company: "InnovateTech Global",
      position: "Lead UI Developer",
      location: "Austin, TX",
      startDate: "Mar 2022",
      endDate: "Present",
      current: true,
      description: "• Spearheaded frontend engineering overhaul with React 18, improving Web Vitals scores by 40%.\n• Built and scaled a custom design token library using Tailwind CSS, streamlining design handoffs.\n• Coached 5 junior developers, establishing clean code guidelines and decreasing sprint delays by 15%.",
    },
    {
      id: "exp-2",
      company: "CloudCore Systems",
      position: "Software Engineer II",
      location: "San Francisco, CA",
      startDate: "Sep 2019",
      endDate: "Feb 2022",
      current: false,
      description: "• Designed transactional database schemas in PostgreSQL, supporting 20,000+ daily concurrent client requests.\n• Configured Express server middleware caching, shaving API latency down from 250ms to 80ms.\n• Implemented robust Cypress suite coverage, mitigating critical regression issues by 22%.",
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of Texas at Austin",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Science",
      location: "Austin, TX",
      startDate: "2015",
      endDate: "2019",
      gpa: "3.75/4.00",
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "SaaS Analytics Engine",
      role: "Lead Systems Designer",
      description: "Built a high-throughput event processing platform tracking 5 million ticks daily. Integrated Redis cache queues and visually mapped metrics onto an animated Recharts panel.",
      technologies: "Next.js, Tailwind, Redis, Express",
    },
  ],
  skills: ["TypeScript", "React Architecture", "Node.js (Express)", "Tailwind CSS", "PostgreSQL", "System Latency Optimization", "CI/CD Orchestration", "Cypress E2E Testing"],
  languages: [
    { id: "lang-1", name: "English", proficiency: "Native" },
    { id: "lang-2", name: "Spanish", proficiency: "Professional" },
  ],
  certifications: [
    { id: "cert-1", name: "AWS Solutions Architect", issuer: "Amazon Web Services", date: "2024" },
  ],
  awards: [
    { id: "award-1", title: "Engineering Impact Star", issuer: "InnovateTech Hub", date: "2023", description: "" },
  ],
  volunteerExperience: [],
  references: [],
  template: "modern",
};

const INITIAL_APPLICATIONS: JobApplication[] = [
  {
    id: "app-1",
    company: "Stripe",
    position: "Senior Frontend Engineer",
    salary: "$160k - $180k",
    deadline: "July 15, 2026",
    status: "applied",
    notes: "Applied via internal referral. Resume customized for developer tools focus.",
    updatedAt: "2026-06-25",
  },
  {
    id: "app-2",
    company: "Figma",
    position: "Product UI Engineer",
    salary: "$155k - $175k",
    deadline: "July 22, 2026",
    status: "interview",
    notes: "Recruiter phone screen complete. Technical stage scheduled for next Tuesday.",
    updatedAt: "2026-06-26",
  },
];

const INITIAL_LETTERS: CoverLetterData[] = [
  {
    id: "letter-1",
    title: "Tailored Pitch - Stripe",
    companyName: "Stripe",
    jobTitle: "Senior Frontend Engineer",
    hiringManager: "Stripe Recruiting Team",
    jobDescription: "Requires expertise in modular React frameworks, dashboard API speed, and customer-centric design solutions.",
    resumeContext: "Senior React builder",
    tone: "Professional",
    content: `Dear Stripe Recruiting Team,

I am writing to express my strong enthusiasm for the Senior Frontend Engineer position at Stripe. With over six years of experience building high-performance developer-focused architectures, I have long admired Stripe's world-class standard for API design and visual clarity.

In my current role at InnovateTech Global, I spearheaded an engineering overhaul that improved system core Web Vitals by 40% and designed customizable interfaces that reduced dashboard load times significantly. I pride myself on bridging backend scalability with intuitive user interactions.

I would love to bring my expertise in modular React system design and system performance optimization to Stripe's frontend products. Thank you for your time and consideration.

Warm regards,
Alex Rivera`,
    updatedAt: "2026-06-26",
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<"landing" | "dashboard">("landing");
  const [activeTab, setActiveTab] = useState<"builder" | "ats" | "letters" | "tracker" | "prep" | "copilot">("builder");

  // Main Persistent States
  const [resumeData, setResumeData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_APPLICATIONS);
  const [coverLetters, setCoverLetters] = useState<CoverLetterData[]>(INITIAL_LETTERS);

  // Styling States
  const [darkMode, setDarkMode] = useState(false);
  const [previewView, setPreviewView] = useState<"desktop" | "tablet" | "print">("desktop");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [selectedLegalTab, setSelectedLegalTab] = useState<LegalTab>("privacy");

  const openLegalModal = (tab: LegalTab) => {
    setSelectedLegalTab(tab);
    setLegalModalOpen(true);
  };

  // Load from LocalStorage
  useEffect(() => {
    const savedResume = localStorage.getItem("careerforge_resume");
    const savedApps = localStorage.getItem("careerforge_apps");
    const savedLetters = localStorage.getItem("careerforge_letters");

    if (savedResume) setResumeData(JSON.parse(savedResume));
    if (savedApps) setApplications(JSON.parse(savedApps));
    if (savedLetters) setCoverLetters(JSON.parse(savedLetters));
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem("careerforge_resume", JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem("careerforge_apps", JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem("careerforge_letters", JSON.stringify(coverLetters));
  }, [coverLetters]);

  // Dark Mode side effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Complete resume builder forge with AI
  const handleAISkipGenerate = async (generatorInputs: any) => {
    setIsGeneratingAI(true);
    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatorInputs),
      });
      const data = await res.json();
      if (data.fullName) {
        // Successfully got structured resume back
        setResumeData({
          ...resumeData,
          personalInfo: {
            fullName: data.fullName,
            profession: data.profession || generatorInputs.degree,
            email: resumeData.personalInfo.email,
            phone: resumeData.personalInfo.phone,
            address: resumeData.personalInfo.address,
            linkedIn: resumeData.personalInfo.linkedIn,
            gitHub: resumeData.personalInfo.gitHub,
            portfolio: resumeData.personalInfo.portfolio,
            experienceLevel: generatorInputs.experienceLevel || "Mid",
          },
          professionalSummary: data.professionalSummary || "",
          workExperience: data.workExperience || [],
          education: data.education || [],
          projects: data.projects || [],
          skills: data.skills || generatorInputs.skills.split(",").map((s: string) => s.trim()),
          certifications: data.certifications || [],
          languages: data.languages || [],
          awards: data.awards || [],
        });
      } else {
        alert("Could not forge CV. Check server console output or Gemini API status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error forging entire CV. Please verify Gemini API configuration.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // List additions
  const handleAddApplication = (newApp: JobApplication) => {
    setApplications((prev) => [newApp, ...prev]);
  };

  const handleUpdateApplication = (updatedApp: JobApplication) => {
    setApplications((prev) => prev.map((item) => (item.id === updatedApp.id ? updatedApp : item)));
  };

  const handleRemoveApplication = (id: string) => {
    setApplications((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddLetter = (newLetter: CoverLetterData) => {
    setCoverLetters((prev) => [newLetter, ...prev]);
  };

  const handleRemoveLetter = (id: string) => {
    setCoverLetters((prev) => prev.filter((item) => item.id !== id));
  };

  // Convert current resume state into a clean copyable text blob for ATS pasting
  const getResumeAsText = () => {
    const s = resumeData;
    return `${s.personalInfo.fullName}
${s.personalInfo.profession} | ${s.personalInfo.email} | ${s.personalInfo.phone} | ${s.personalInfo.address}

SUMMARY:
${s.professionalSummary}

EXPERIENCE:
${s.workExperience.map((w) => `${w.position} at ${w.company} (${w.startDate} - ${w.current ? "Present" : w.endDate})\n${w.description}`).join("\n\n")}

EDUCATION:
${s.education.map((e) => `${e.degree} in ${e.fieldOfStudy} from ${e.institution} (${e.startDate} - ${e.endDate})`).join("\n\n")}

SKILLS:
${s.skills.join(", ")}`;
  };

  // Trigger browser print for the locked container target
  const handlePrint = () => {
    setPreviewView("print");
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Export CV directly as high-fidelity PDF using jsPDF + html2canvas
  const handleExportPDF = async () => {
    const element = document.getElementById("cv-template-preview");
    if (!element) {
      alert("Resume preview element not found.");
      return;
    }

    setIsExportingPDF(true);
    try {
      // Temporarily switch previewView to desktop mode to capture the exact layout structure cleanly
      const currentViewMode = previewView;
      setPreviewView("desktop");

      // Give React 300ms to re-render in full high-fidelity layout
      await new Promise((resolve) => setTimeout(resolve, 300));

      const opt = {
        scale: 2.5, // Crisp high-definition text rendering (not pixelated)
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff"
      };

      const canvas = await html2canvas(element, opt);
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      // Standard A4 dimensions in mm (210mm x 297mm)
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      const pdf = new jsPDF("p", "mm", "a4");
      let position = 0;

      // Add first page
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Handle multi-page documents if any overflow occurs
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const rawName = resumeData.personalInfo.fullName || "Resume";
      const sanitizedName = rawName.trim().replace(/\s+/g, "_");
      pdf.save(`${sanitizedName}_CareerForge_CV.pdf`);

      // Restore original view mode
      setPreviewView(currentViewMode);
    } catch (err) {
      console.error("Failed to generate PDF via jsPDF:", err);
      alert("Direct PDF export failed. As an alternative, you can use the 'Print/Print PDF' button to print or save via your browser.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (currentView === "landing") {
    return <LandingPage onEnterApp={() => setCurrentView("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 flex flex-col font-sans print:bg-white print:text-black">
      {/* 1. SaaS Main Workspace Topbar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 px-6 py-3.5 flex items-center justify-between shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-600/15">
            <Sparkles className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-950 dark:text-white font-display">CareerForge</h1>
            <p className="text-[10px] text-indigo-500 font-bold font-mono uppercase tracking-widest mt-0.5">SaaS Builder Suite</p>
          </div>
        </div>

        {/* Global Toolbar and Toggles */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 transition-all"
            title="Toggle theme color"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setCurrentView("landing")}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            title="Return to home page"
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </button>
        </div>
      </header>

      {/* 2. Suite Workspace Tabs bar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-850 px-6 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0 print:hidden">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "builder"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Interactive CV Builder</span>
        </button>

        <button
          onClick={() => setActiveTab("ats")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "ats"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>ATS Checker & Keyword Optimizer</span>
        </button>

        <button
          onClick={() => setActiveTab("letters")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "letters"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Tailor Cover Letters</span>
        </button>

        <button
          onClick={() => setActiveTab("tracker")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "tracker"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Job Applications Board</span>
        </button>

        <button
          onClick={() => setActiveTab("prep")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "prep"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Interview Coaching Hub</span>
        </button>

        <button
          onClick={() => setActiveTab("copilot")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === "copilot"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          <BrainCircuit className="w-4 h-4" />
          <span>AI Recruiting Consultant</span>
        </button>
      </nav>

      {/* 3. Main Stage Content Area */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full print:p-0 print:m-0">
        
        {/* TAB 1: CV BUILDER (Split Form and Preview) */}
        {activeTab === "builder" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start print:grid-cols-1 print:gap-0">
            
            {/* Left Hand Inputs Form */}
            <div className="xl:col-span-6 print:hidden">
              <ResumeForm
                data={resumeData}
                onChange={setResumeData}
                onAISkipGenerate={handleAISkipGenerate}
                isGeneratingAI={isGeneratingAI}
              />
            </div>

            {/* Right Hand Live Real-Time CV Preview Frame */}
            <div className="xl:col-span-6 space-y-4 print:col-span-1 print:space-y-0">
              {/* Template Configuration Toolbar */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Design Template:</span>
                  <select
                    value={resumeData.template}
                    onChange={(e: any) => setResumeData({ ...resumeData, template: e.target.value })}
                    className="px-2 py-1 text-xs bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-lg text-slate-800 dark:text-white"
                  >
                    <option value="modern">Teal Modern</option>
                    <option value="executive">Navy Executive</option>
                    <option value="creative">Violet Gradient</option>
                    <option value="minimal">Minimal Slate</option>
                    <option value="classic">Amber Serif</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 px-2 py-1 rounded-lg">
                    <button
                      onClick={() => setPreviewView("desktop")}
                      className={`p-1 rounded ${previewView === "desktop" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-500" : "text-slate-400"}`}
                      title="Desktop view fit"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewView("tablet")}
                      className={`p-1 rounded ${previewView === "tablet" ? "bg-white dark:bg-slate-900 shadow-sm text-indigo-500" : "text-slate-400"}`}
                      title="Tablet view fit"
                    >
                      <Tablet className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={handleExportPDF}
                    disabled={isExportingPDF}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-700/60 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 disabled:opacity-80 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isExportingPDF ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-white" />
                    )}
                    <span>{isExportingPDF ? "Exporting PDF..." : "Download PDF"}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                    title="Open print panel for browser print-to-PDF"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-400" />
                    <span>Print/Print PDF</span>
                  </button>
                </div>
              </div>

              {/* Aspect Ratio Locked container box */}
              <div className="bg-slate-100 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 sm:p-6 overflow-x-auto print:border-0 print:p-0">
                <ResumeTemplates data={resumeData} activeView={previewView} />
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: ATS OPTIMIZER */}
        {activeTab === "ats" && (
          <AIOptimizer currentResumeText={getResumeAsText()} />
        )}

        {/* TAB 3: COVER LETTERS */}
        {activeTab === "letters" && (
          <CoverLetterGenerator
            onAddLetter={handleAddLetter}
            onRemoveLetter={handleRemoveLetter}
            lettersList={coverLetters}
            resumeText={getResumeAsText()}
          />
        )}

        {/* TAB 4: JOB PIPELINE TRACKER */}
        {activeTab === "tracker" && (
          <JobTracker
            applications={applications}
            onAddApplication={handleAddApplication}
            onUpdateApplication={handleUpdateApplication}
            onRemoveApplication={handleRemoveApplication}
          />
        )}

        {/* TAB 5: INTERVIEW PREP COACH */}
        {activeTab === "prep" && (
          <InterviewPrep resumeText={getResumeAsText()} />
        )}

        {/* TAB 6: CAREER ADVISOR CHAT */}
        {activeTab === "copilot" && (
          <AIChat resumeText={getResumeAsText()} />
        )}

      </main>

      {/* Workspace Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 px-6 text-xs text-slate-400 dark:text-slate-500 shrink-0 mt-8 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between max-w-7xl mx-auto gap-4">
          <div className="space-y-1 text-center md:text-left">
            <p>© 2026 CareerForge Suite. All resume inputs securely persisted offline in sandboxed localStorage.</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-slate-400 dark:text-slate-500 font-medium">
              <button onClick={() => openLegalModal("privacy")} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors bg-transparent border-0 p-0 text-xs font-normal">Privacy Policy</button>
              <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
              <button onClick={() => openLegalModal("terms")} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors bg-transparent border-0 p-0 text-xs font-normal">Terms of Service</button>
              <span className="text-slate-300 dark:text-slate-800 hidden sm:inline">•</span>
              <button onClick={() => openLegalModal("support")} className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors bg-transparent border-0 p-0 text-xs font-semibold text-slate-500 dark:text-slate-400">Contact Support</button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 text-emerald-500 font-mono font-bold text-[10px]">
            <FolderLock className="w-3.5 h-3.5" />
            <span>SANDBOX STORAGE ENABLED</span>
          </div>
        </div>
      </footer>

      <LegalModal 
        isOpen={legalModalOpen} 
        onClose={() => setLegalModalOpen(false)} 
        initialTab={selectedLegalTab} 
      />
    </div>
  );
}
