/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { InterviewQuestion } from "../types";
import { HelpCircle, Sparkles, RefreshCw, ChevronDown, ChevronUp, CheckCircle, Info, Mic } from "lucide-react";

interface InterviewPrepProps {
  resumeText: string;
}

export default function InterviewPrep({ resumeText }: InterviewPrepProps) {
  const [jobDescription, setJobDescription] = useState("");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock Practice Simulator States
  const [practiceQuestionId, setPracticeQuestionId] = useState<string | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [practicingFeedback, setPracticingFeedback] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const handleGenerateQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-interview-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeText: resumeText || "A highly skilled modern professional seeker.",
        }),
      });
      const data = await res.json();
      if (data.questions) {
        // Hydrate questions with temporary IDs
        const hydrated = data.questions.map((q: any, idx: number) => ({
          id: `question-${idx}`,
          ...q,
        }));
        setQuestions(hydrated);
        if (hydrated.length > 0) setExpandedId(hydrated[0].id);
      } else {
        alert("Could not generate interview questions.");
      }
    } catch (err) {
      console.error(err);
      alert("Error generating questions. Make sure GEMINI_API_KEY is configured.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetFeedback = async (question: string) => {
    if (!userAnswer.trim()) {
      alert("Please write your answer response draft first!");
      return;
    }
    setSubmittingAnswer(true);
    setPracticingFeedback("");

    try {
      // Hit general assistant API proxy
      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Score and review my answer to this interview question out of 100. Provide specific critiques on how to align it closer to the STAR method or list better vocabulary/phrases I should use.

Question: "${question}"
My Answer Draft: "${userAnswer}"`,
        }),
      });
      const result = await res.json();
      if (result.response) {
        setPracticingFeedback(result.response);
      }
    } catch (err) {
      console.error(err);
      alert("Error generating feedback.");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleLoadDemoJob = () => {
    setJobDescription(`Senior React/TypeScript Software Engineer
Requirements:
- Strong core JavaScript and TypeScript programming
- Experience designing and building highly customizable modular interfaces
- Knowledge of system optimization, caching strategies, and API latency reduction
- Strong leadership skills, coaching junior developers, agile methodologies`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 text-left" id="interview-prep">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 dark:text-white font-display flex items-center gap-2">
          <HelpCircle className="w-5.5 h-5.5 text-indigo-500" />
          <span>Interview Preparation Coach</span>
        </h2>
        <p className="text-xs text-slate-500">Generate likely technical or behavioral questions matching your profile, and receive grading feedback on your practice runs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left pane: job requirement specification form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Enter Target Job Requirements</span>
            <button
              onClick={handleLoadDemoJob}
              className="text-[11px] font-bold text-indigo-500 hover:text-indigo-600 font-mono"
            >
              ⚡ Load Demo Job Description
            </button>
          </div>

          <textarea
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste target job descriptions to let the AI custom tailor highly tailored interview questions..."
            className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950 font-sans leading-relaxed"
          />

          <button
            onClick={handleGenerateQuestions}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI Coach is compiling questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Aligned Interview Prep</span>
              </>
            )}
          </button>
        </div>

        {/* Right pane: questions layout and active practice simulator */}
        <div className="lg:col-span-7">
          {questions.length === 0 ? (
            <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 bg-slate-50/40 min-h-[300px]">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">No Interview Questions Ready</p>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Paste the target Job Description on the left and click "Generate Aligned Interview Prep" to start practicing.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">Your Tailored Practice Questions ({questions.length})</span>
              <div className="space-y-2.5 max-h-[350px] overflow-y-auto no-scrollbar pr-1">
                {questions.map((q) => {
                  const isExpanded = expandedId === q.id;
                  const isPracticing = practiceQuestionId === q.id;

                  return (
                    <div
                      key={q.id}
                      className={`border rounded-xl transition-all duration-200 ${
                        isExpanded
                          ? "border-indigo-500/30 bg-indigo-50/10 dark:bg-indigo-950/5 p-4"
                          : "border-slate-150 bg-white dark:bg-slate-950 hover:bg-slate-50/50 p-3"
                      }`}
                    >
                      <div
                        className="flex justify-between items-start gap-3 cursor-pointer select-none"
                        onClick={() => setExpandedId(isExpanded ? null : q.id)}
                      >
                        <div className="space-y-1">
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded uppercase ${
                            q.type === "Technical"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                              : "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                          }`}>
                            {q.type}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white leading-relaxed">{q.question}</h4>
                        </div>
                        <button className="text-slate-400 shrink-0 mt-0.5">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-4">
                          {/* Render STAR template suggested structure */}
                          {typeof q.starAnswer === "object" ? (
                            <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-150">
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono block">SUGGESTED STAR RESPONSE SCHEMA</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div>
                                  <strong className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Situation</strong>
                                  <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">{q.starAnswer.situation}</p>
                                </div>
                                <div>
                                  <strong className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Task</strong>
                                  <p className="text-slate-600 dark:text-slate-400 italic leading-relaxed">{q.starAnswer.task}</p>
                                </div>
                                <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-900 pt-2.5">
                                  <strong className="text-[9px] font-mono text-slate-500 uppercase block mb-0.5">Action</strong>
                                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{q.starAnswer.action}</p>
                                </div>
                                <div className="sm:col-span-2 border-t border-slate-100 dark:border-slate-900 pt-2.5">
                                  <strong className="text-[9px] font-mono text-emerald-500 uppercase block mb-0.5">Measurable Result</strong>
                                  <p className="text-slate-800 dark:text-slate-200 font-extrabold leading-relaxed">{q.starAnswer.result}</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-lg text-xs">
                              <span className="text-[9px] font-mono text-slate-400 uppercase">Coaching Guideline:</span>
                              <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{q.starAnswer}</p>
                            </div>
                          )}

                          {/* Quick Interactive Practice Block */}
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                            {isPracticing ? (
                              <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                  <span className="text-[10px] font-bold text-slate-500 uppercase">Write your Answer draft below</span>
                                  <button
                                    onClick={() => {
                                      setPracticeQuestionId(null);
                                      setUserAnswer("");
                                      setPracticingFeedback("");
                                    }}
                                    className="text-[9px] text-red-500 hover:text-red-700 font-semibold"
                                  >
                                    Cancel Practice
                                  </button>
                                </div>
                                <textarea
                                  rows={3}
                                  value={userAnswer}
                                  onChange={(e) => setUserAnswer(e.target.value)}
                                  placeholder="Type how you would answer this question in an interview. Use specific details..."
                                  className="w-full p-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 dark:bg-slate-950 font-sans"
                                />

                                <button
                                  type="button"
                                  onClick={() => handleGetFeedback(q.question)}
                                  disabled={submittingAnswer}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-all flex items-center gap-1"
                                >
                                  {submittingAnswer ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                      <span>AI grading response...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Mic className="w-3.5 h-3.5" />
                                      <span>Grade My Response</span>
                                    </>
                                  )}
                                </button>

                                {/* Grade Output */}
                                {practicingFeedback && (
                                  <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-950 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-2 whitespace-pre-wrap leading-relaxed">
                                    <span className="font-extrabold text-indigo-950 dark:text-indigo-200 uppercase block font-display tracking-wide">AI grading feedback</span>
                                    {practicingFeedback}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setPracticeQuestionId(q.id);
                                  setUserAnswer("");
                                  setPracticingFeedback("");
                                }}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-lg transition-all"
                              >
                                🎙️ Practice Answering this question
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
