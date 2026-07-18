/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, FileText, FileCheck, CheckCircle, ArrowRight, Star, Cpu, Briefcase, Award, GraduationCap } from "lucide-react";
import LegalModal, { LegalTab } from "./LegalModal";

interface LandingPageProps {
  onEnterApp: () => void;
}

export default function LandingPage({ onEnterApp }: LandingPageProps) {
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [selectedLegalTab, setSelectedLegalTab] = useState<LegalTab>("privacy");

  const openLegalModal = (tab: LegalTab) => {
    setSelectedLegalTab(tab);
    setLegalModalOpen(true);
  };

  const stats = [
    { value: "450K+", label: "Resumes Built" },
    { value: "98.2%", label: "ATS Pass Rate" },
    { value: "40%", label: "Average Salary Boost" },
    { value: "12 mins", label: "Average Creation Time" },
  ];

  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "Senior Product Designer",
      company: "Stripe",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
      quote: "CareerForge completely transformed my resume. The ATS scorer found keywords I hadn't even thought about. Within 2 weeks of updating, I landed interviews with Stripe and Figma!",
    },
    {
      name: "David Chen",
      role: "Software Engineer",
      company: "Atlassian",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
      quote: "The cover letter tailoring feature is pure magic. Writing bespoke letters for 20+ jobs was exhausting, but this generated hyper-personalized, high-quality drafts in seconds.",
    },
  ];

  const faqs = [
    {
      question: "What makes CareerForge different from standard resume builders?",
      answer: "Unlike traditional builders that just offer templates, CareerForge uses advanced intelligence (powered by Gemini) to analyze your experiences, generate quantifiable, achievement-driven bullet points, suggest keywords, and calculate a live ATS compatibility score to ensure you bypass recruiter filters.",
    },
    {
      question: "Is the resume output fully ATS-compliant?",
      answer: "Absolutely. Our templates are designed strictly following ATS industry-standard parsers—avoiding complex columns, graphics, or text elements that trip up scanning algorithms. The builder automatically recommends adjustments based on real-world parser tests.",
    },
    {
      question: "Can I try it for free?",
      answer: "Yes! CareerForge is 100% free with unlimited access. Create as many resumes, CVs, and cover letters as you need, run unlimited live ATS checks, use the AI Rewrite assistant, track your jobs in the kanban board, and practice with the real-time AI live voice simulator without any subscriptions or fees.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 overflow-x-hidden" id="landing-page">
      {/* Decorative Grid and Background Orbs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 right-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navigation */}
      <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-indigo-400 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-display text-xl font-bold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
              CareerForge
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</a>
            <button
              onClick={onEnterApp}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 sm:pt-28 sm:pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide mb-8"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Next-Gen Career SaaS Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Build a Professional <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
              Resume in Minutes
            </span>{" "}
            with AI
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed"
          >
            Generate ATS-friendly resumes, personalized cover letters, and optimize your CV using artificial intelligence.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-base font-bold transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-3 group"
            >
              <span>Create My Resume Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700/80 text-white border border-slate-700 rounded-xl text-base font-bold transition-all flex items-center justify-center space-x-2"
            >
              <span>Watch Demo</span>
            </button>
          </motion.div>

          {/* Floating Application Preview Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative rounded-2xl border border-slate-700/80 bg-slate-800/40 p-2.5 shadow-2xl shadow-indigo-500/5 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="h-6 w-full bg-slate-800/90 rounded-t-xl px-4 flex items-center space-x-2 border-b border-slate-700/50">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              <div className="text-[10px] text-slate-500 font-mono ml-4">careerforge-ai.com/dashboard</div>
            </div>
            <div className="relative bg-slate-950 p-6 sm:p-10 rounded-b-xl text-left border border-slate-800/40">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual Left pane representing builder inputs */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                    <span className="text-xs font-semibold text-indigo-400 font-mono">STEP 1: USER DETAILS</span>
                    <div className="h-4 w-1/3 bg-slate-800 rounded" />
                    <div className="h-8 w-full bg-slate-950 rounded border border-slate-800 flex items-center px-3 text-xs text-slate-500">Alex Carter - Tech Lead</div>
                    <div className="h-4 w-1/2 bg-slate-800 rounded" />
                    <div className="h-14 w-full bg-slate-950 rounded border border-slate-800 flex items-center px-3 text-xs text-slate-500">Scaled software architecture by 40% and mentored 5 junior engineers...</div>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-emerald-400 font-mono mb-1">LIVE ATS SCORER</div>
                      <div className="text-2xl font-bold text-white">87/100</div>
                    </div>
                    <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-r-transparent animate-spin-slow flex items-center justify-center text-[10px] font-bold text-emerald-400">ATS</div>
                  </div>
                </div>
                {/* Visual Right pane representing rendered CV */}
                <div className="lg:col-span-7 bg-white text-slate-900 p-6 rounded-xl shadow-lg border border-slate-200">
                  <div className="border-b-2 border-slate-800 pb-3 mb-4">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">ALEX CARTER</h3>
                    <p className="text-xs text-slate-500 font-mono">alex.carter@email.com | +1 (555) 234-9876 | linkedin.com/in/alexcarter</p>
                  </div>
                  <div className="mb-4">
                    <h4 className="text-xs font-bold text-slate-800 tracking-wider mb-1.5 uppercase">Professional Summary</h4>
                    <p className="text-[10px] text-slate-600 leading-relaxed font-sans">
                      Performance-driven Software Engineering Leader with over 6 years of experience scaling modern web architectures. Proven track record of improving system latency by 35% and mentoring cross-functional product teams.
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 tracking-wider mb-2 uppercase">Work Experience</h4>
                    <div className="mb-3">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <span className="text-[11px] font-bold text-slate-900">Lead Frontend Engineer</span>
                        <span className="text-[9px] text-slate-500 font-mono">2024 - Present</span>
                      </div>
                      <p className="text-[9px] text-indigo-600 font-semibold mb-1">TechSphere Systems</p>
                      <ul className="list-disc pl-3.5 space-y-1 text-[9px] text-slate-600 leading-relaxed">
                        <li>Directed the redesign of the core transaction board, boosting system speed by 40%.</li>
                        <li>Spearheaded transition to modular micro-frontends, cutting integration errors by 50%.</li>
                        <li>Fostered agile software practices and coordinated technical training for 8 junior coders.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 border-y border-slate-800/80 bg-slate-950/40 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent font-mono">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-400 uppercase font-semibold tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Unleash the Power of AI on Your Job Hunt
            </h2>
            <p className="text-slate-400 text-base">
              Everything you need to bypass standard barriers, craft outstanding cover letters, and secure your dream job interview.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-indigo-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">AI Resume Generator</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Provide basic career details and our AI instantly drafts structured, high-impact descriptions using strong action verbs and metrics.
              </p>
            </div>

            <div className="p-8 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-emerald-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Live ATS Compatibility Scorer</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analyze your resume formatting, keywords, sections, and margins. Instantly receive an actionable score out of 100 with optimization logs.
              </p>
            </div>

            <div className="p-8 bg-slate-800/40 border border-slate-800 rounded-2xl hover:border-purple-500/30 transition-all duration-300">
              <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-6 border border-purple-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-3">Bespose Cover Letter Tailor</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Paste any target job description. The AI extracts requirements and crafts a bespoke, professionally aligned cover letter instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 py-16 bg-slate-950/50 border-y border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">Loved by Modern Job Seekers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
                <div className="flex items-center space-x-1.5 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <p className="text-slate-300 text-sm italic leading-relaxed">"{t.quote}"</p>
                <div className="flex items-center space-x-3 pt-2">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                    <p className="text-xs text-slate-500">{t.role} at {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Table */}
      <section id="pricing" className="relative z-10 py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white mb-4">
              100% Free & Unlimited Access
            </h2>
            <p className="text-slate-400 text-sm">
              Launch your career upgrade today. Everything is fully unlocked and ready to use. No credit cards, no subscriptions, and no locked features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-3xl mx-auto">
            {/* Free tier */}
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-300 mb-1">Standard Tools</h3>
                <p className="text-xs text-slate-500 mb-6">Perfect for quick, professional resumes</p>
                <div className="text-3xl font-bold text-white mb-8">$0 <span className="text-sm text-slate-500 font-normal">/ forever</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-2.5 text-xs text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Create unlimited distinct Resumes</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Create unlimited Cover Letters</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Standard formatting templates</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Manual edits & TXT exports</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white font-semibold text-sm transition-colors"
              >
                Access Free Tools
              </button>
            </div>

            {/* Premium Tier */}
            <div className="p-8 bg-gradient-to-b from-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl flex flex-col justify-between relative shadow-2xl">
              <div className="absolute top-0 right-6 -translate-y-1/2 px-3 py-1 bg-emerald-600 rounded-full text-[10px] font-bold tracking-wide uppercase text-white animate-pulse">
                Fully Unlocked
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">AI Pro Suite</h3>
                <p className="text-xs text-indigo-300 mb-6 font-medium">Uncapped access to our smartest features</p>
                <div className="text-3xl font-bold text-white mb-8">$0 <span className="text-sm text-slate-450 font-normal">/ forever</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-2.5 text-xs text-slate-300 font-medium">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Unlimited resumes & cover letters</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Live ATS Compatibility score check</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>AI Rewrite Assistant & Bullet Generator</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Interactive Interview prep & live voice simulator</span>
                  </li>
                  <li className="flex items-center space-x-2.5 text-xs text-slate-300">
                    <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Job application kanban pipeline</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={onEnterApp}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/30"
              >
                Access AI Pro Suite (Free)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative z-10 py-16 bg-slate-950/20 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl">
                <h4 className="font-bold text-white mb-2 text-base">{faq.question}</h4>
                <p className="text-slate-400 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-slate-950 py-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-bold text-slate-300">CareerForge</span>
          </div>
          <p>© 2026 CareerForge. All rights reserved. Deguyguy</p>
          <div className="flex space-x-6">
            <button onClick={() => openLegalModal("privacy")} className="hover:text-slate-300 cursor-pointer transition-colors bg-transparent border-0 p-0 text-slate-500 font-normal">Privacy Policy</button>
            <button onClick={() => openLegalModal("terms")} className="hover:text-slate-300 cursor-pointer transition-colors bg-transparent border-0 p-0 text-slate-500 font-normal">Terms of Service</button>
            <button onClick={() => openLegalModal("support")} className="hover:text-slate-300 cursor-pointer transition-colors bg-transparent border-0 p-0 text-slate-500 font-normal">Contact Support</button>
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
