/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CoverLetterData } from "../types";
import { FileText, Sparkles, RefreshCw, Copy, Download, Trash, Plus, Check } from "lucide-react";

interface CoverLetterGeneratorProps {
  onAddLetter: (newLetter: CoverLetterData) => void;
  onRemoveLetter: (id: string) => void;
  lettersList: CoverLetterData[];
  resumeText: string;
}

export default function CoverLetterGenerator({
  onAddLetter,
  onRemoveLetter,
  lettersList,
  resumeText,
}: CoverLetterGeneratorProps) {
  const [activeLetterId, setActiveLetterId] = useState<string | null>(
    lettersList.length > 0 ? lettersList[0].id : null
  );

  // Form Inputs
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<CoverLetterData["tone"]>("Professional");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeLetter = lettersList.find((l) => l.id === activeLetterId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !jobTitle) {
      alert("Please provide the company name and target job title.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          jobTitle,
          hiringManager,
          jobDescription,
          resumeContext: resumeText || "A highly qualified professional with modern tech skills",
          tone,
        }),
      });
      const data = await res.json();
      if (data.content) {
        const newLetter: CoverLetterData = {
          id: Math.random().toString(36).substr(2, 9),
          title: `Cover Letter - ${jobTitle} at ${companyName}`,
          companyName,
          jobTitle,
          hiringManager,
          jobDescription,
          resumeContext: resumeText,
          tone,
          content: data.content,
          updatedAt: new Date().toLocaleDateString(),
        };
        onAddLetter(newLetter);
        setActiveLetterId(newLetter.id);
        
        // Reset minor inputs
        setCompanyName("");
        setJobTitle("");
        setHiringManager("");
        setJobDescription("");
      } else {
        alert("Failed to create Cover Letter. Ensure your API is working.");
      }
    } catch (err) {
      console.error(err);
      alert("Error tailoring cover letter. Please verify server connection and API keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (activeLetter) {
      navigator.clipboard.writeText(activeLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (activeLetter) {
      const element = document.createElement("a");
      const file = new Blob([activeLetter.content], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${activeLetter.title.replace(/\s+/g, "_")}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-left" id="ai-cover-letters">
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white font-display flex items-center gap-2">
          <FileText className="w-5.5 h-5.5 text-indigo-500" />
          <span>Tailor AI Cover Letters</span>
        </h2>
        <p className="text-xs text-slate-500">Auto-tailor tailored, natural-sounding letters aligned directly to any target role.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Create Letter form or list switcher */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active / Previous Documents Selector list */}
          {lettersList.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Generated Drafts ({lettersList.length})</span>
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl p-1 bg-slate-50/50">
                {lettersList.map((letDoc) => (
                  <div
                    key={letDoc.id}
                    className={`p-2.5 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-all ${
                      activeLetterId === letDoc.id
                        ? "bg-white dark:bg-slate-900 border border-indigo-500/20 shadow-sm font-semibold text-indigo-600 dark:text-indigo-300"
                        : "hover:bg-slate-100 text-slate-600 dark:text-slate-400"
                    }`}
                    onClick={() => setActiveLetterId(letDoc.id)}
                  >
                    <span className="truncate max-w-[180px]">{letDoc.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-slate-400">{letDoc.updatedAt}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveLetter(letDoc.id);
                          if (activeLetterId === letDoc.id) {
                            setActiveLetterId(lettersList.length > 1 ? lettersList[0].id : null);
                          }
                        }}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Tailor Draft Form */}
          <form onSubmit={handleGenerate} className="p-5 border border-slate-100 dark:border-slate-800 rounded-xl space-y-4 bg-slate-50/20">
            <span className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wide flex items-center gap-1.5 font-display">
              <Plus className="w-4 h-4 text-indigo-500" />
              <span>Tailor a New Cover Letter</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Stripe, Figma"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hiring Manager</label>
                <input
                  type="text"
                  value={hiringManager}
                  onChange={(e) => setHiringManager(e.target.value)}
                  placeholder="e.g. Ms. Sarah Jenkins"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Tone Choice</label>
                <select
                  value={tone}
                  onChange={(e: any) => setTone(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                >
                  <option value="Professional">👔 Professional</option>
                  <option value="Enthusiastic">🔥 Enthusiastic</option>
                  <option value="Executive">🌟 Executive</option>
                  <option value="Creative">💡 Creative</option>
                  <option value="Technical">💻 Technical</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Job Description or core requirements</label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job descriptions to let AI pull critical keyword requirements..."
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI Drafting & Tailoring...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Draft Bespoke Cover Letter</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Render / Edit area */}
        <div className="lg:col-span-7">
          {activeLetter ? (
            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{activeLetter.title}</h3>
                  <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                    <span>Tone: <strong className="text-indigo-600 dark:text-indigo-400">{activeLetter.tone}</strong></span>
                    <span>•</span>
                    <span>Generated: {activeLetter.updatedAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-semibold"
                    title="Copy letter to clipboard"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 hover:bg-slate-50 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-indigo-600 flex items-center gap-1 text-[11px] font-semibold"
                    title="Export as TXT file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>TXT</span>
                  </button>
                </div>
              </div>

              {/* Editable area */}
              <textarea
                rows={14}
                value={activeLetter.content}
                onChange={(e) => {
                  const updated = lettersList.map((item) =>
                    item.id === activeLetter.id ? { ...item, content: e.target.value } : item
                  );
                  // Trigger state sync on app level if necessary
                  // Wait, let's allow inline edits
                  activeLetter.content = e.target.value;
                }}
                className="w-full text-xs bg-transparent border-0 focus:ring-0 leading-relaxed font-sans text-slate-700 dark:text-slate-300 resize-none"
              />
            </div>
          ) : (
            <div className="p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/40 min-h-[350px]">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Drafts Tailored Yet</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Fill the tailoring fields on the left and click "Draft Bespoke Cover Letter" to see results.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
