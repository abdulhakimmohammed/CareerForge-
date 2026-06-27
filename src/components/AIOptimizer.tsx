/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { ATSFeedback } from "../types";
import { FileSearch, Sparkles, AlertTriangle, CheckCircle, RefreshCw, Layers, TrendingUp, Info } from "lucide-react";

interface AIOptimizerProps {
  currentResumeText: string;
}

export default function AIOptimizer({ currentResumeText }: AIOptimizerProps) {
  const [resumeText, setResumeText] = useState(currentResumeText || "");
  const [report, setReport] = useState<ATSFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeText.trim()) {
      alert("Please enter or paste your resume text to optimize.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });
      const data = await res.json();
      if (data.score !== undefined) {
        setReport(data);
      } else {
        alert("Could not extract ATS Score. Check server logs.");
      }
    } catch (err) {
      console.error(err);
      alert("Could not run ATS audit. Ensure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill text with a template for the user if they don't have one
  const handleLoadDemoText = () => {
    setResumeText(`ALEX CARTER
Lead Frontend Developer | alex@carter.com | +1 555-123-4567

PROFESSIONAL SUMMARY:
I am a software engineer with years of experience building web apps. I know Javascript, React, HTML, CSS. I worked on some databases and lead teams. Looking for a new role.

EXPERIENCE:
Software Engineer at ABC Solutions (2022 - Present)
- Worked on client websites
- Handled bug fixes
- Mentored junior devs
- Did some database queries

EDUCATION:
B.S. in Computer Science, State University`);
  };

  // Circle dynamic calculations
  const strokeDashoffset = report ? 251.2 - (251.2 * report.score) / 100 : 251.2;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-left" id="ai-optimizer">
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white font-display flex items-center gap-2">
          <FileSearch className="w-5.5 h-5.5 text-indigo-500" />
          <span>ATS Checker & AI Optimizer</span>
        </h2>
        <p className="text-xs text-slate-500">Analyze formatting, sections, readability, keyword stuffing, and weak bullet points.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Editor / Paste Area */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Paste Resume Text for Evaluation</span>
            <button
              onClick={handleLoadDemoText}
              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 font-mono"
            >
              ⚡ Load Demo Resume Text
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={12}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the full text of your CV/Resume here (including Summary, Experiences, Education)..."
              className="w-full px-4 py-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950 font-mono leading-relaxed"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Recruiter Bot is auditing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run Interactive ATS & Keyword Check</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: ATS Report Output */}
        <div className="lg:col-span-6 flex flex-col justify-center">
          {!report && !loading ? (
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/40 min-h-[300px]">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                <FileSearch className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No ATS Score Generated Yet</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Paste your resume details on the left and hit check. We'll run a complete ATS compliance mock audit.
              </p>
            </div>
          ) : loading ? (
            <div className="p-8 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 bg-slate-50/20 min-h-[300px]">
              <div className="relative w-18 h-18">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="36" cy="36" r="32" className="text-slate-100 dark:text-slate-800" strokeWidth="6" fill="transparent" />
                  <circle cx="36" cy="36" r="32" className="text-indigo-500 animate-pulse" strokeWidth="6" fill="transparent" strokeDasharray="201" strokeDashoffset="120" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-500">Evaluating</div>
              </div>
              <div className="space-y-1.5 max-w-xs">
                <p className="text-sm font-bold text-slate-800 dark:text-white">AI Auditing Live...</p>
                <p className="text-xs text-slate-500">Checking vocabulary matching, layout parsing risks, grammar, spelling, and keyword weights.</p>
              </div>
            </div>
          ) : (
            report && (
              <div className="space-y-6">
                {/* Score & Badge Panel */}
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-6 shadow-md text-white">
                  {/* Circular Score Gauge */}
                  <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="44" cy="44" r="40" className="text-slate-800" strokeWidth="8" fill="transparent" />
                      <circle
                        cx="44"
                        cy="44"
                        r="40"
                        className={report.score >= 80 ? "text-emerald-500" : report.score >= 60 ? "text-amber-500" : "text-red-500"}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="251.2"
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-black font-mono tracking-tight leading-none">{report.score}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">ATS Score</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>{report.score >= 80 ? "ATS Compliant!" : report.score >= 60 ? "Good - Needs Tweaks" : "Critical ATS Fail"}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {report.score >= 80
                        ? "Your resume has high formatting and vocabulary alignment. You have bypassed major applicant tracking system filters!"
                        : "You're missing essential industry keywords. Apply the AI recommendations below to instantly push your score past 85+."}
                    </p>
                  </div>
                </div>

                {/* Tabs / Logs of Audit reports */}
                <div className="space-y-4">
                  {/* Missing Keywords */}
                  {report.missingKeywords && report.missingKeywords.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        <span>Missing Target Keywords</span>
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {report.missingKeywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md font-semibold"
                          >
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Formatting Issues */}
                  {report.formattingIssues && report.formattingIssues.length > 0 && (
                    <div className="p-4 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/50 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        <span>Formatting Parser Risks ({report.formattingIssues.length})</span>
                      </span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {report.formattingIssues.map((issue, idx) => (
                          <li key={idx}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Weak Bullet points rewrite highlights */}
                  {report.weakBulletPoints && report.weakBulletPoints.length > 0 && (
                    <div className="space-y-2.5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>AI Suggested Bullet Rewrites</span>
                      </span>
                      <div className="space-y-3">
                        {report.weakBulletPoints.map((b, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl text-xs space-y-1.5"
                          >
                            <div>
                              <span className="text-[9px] font-mono text-red-500 font-bold uppercase block mb-0.5">❌ Original:</span>
                              <p className="text-slate-500 line-through pl-1.5 italic">{b.original}</p>
                            </div>
                            <div>
                              <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase block mb-0.5">✓ AI Metrics-Driven suggestion:</span>
                              <p className="text-slate-800 dark:text-slate-200 pl-1.5 font-medium leading-relaxed">{b.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.recommendations && report.recommendations.length > 0 && (
                    <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/50 rounded-xl space-y-2">
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>Core Action Recommendations</span>
                      </span>
                      <ul className="list-decimal pl-4 space-y-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {report.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
