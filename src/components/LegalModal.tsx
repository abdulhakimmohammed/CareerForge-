import React from "react";
import { X, Shield, FileText, Phone, Mail, Clock, MessageSquare } from "lucide-react";

export type LegalTab = "privacy" | "terms" | "support";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab: LegalTab;
}

export default function LegalModal({ isOpen, onClose, initialTab }: LegalModalProps) {
  const [activeTab, setActiveTab] = React.useState<LegalTab>(initialTab);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div id="legal-modal-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="legal-modal-container"
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-indigo-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              CareerForge Legal & Support Center
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-1.5 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "privacy"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "terms"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>
          <button
            onClick={() => setActiveTab("support")}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "support"
                ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact Support</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {activeTab === "privacy" && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                Privacy Policy
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last Updated: July 18, 2026
              </p>
              
              <p>
                Privacy is of paramount importance to <strong>CareerForge</strong>. We are committed to maintaining the security, integrity, and confidentiality of your personal information.
              </p>

              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl space-y-1.5">
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block uppercase tracking-wide">
                  🔒 Offline Sandboxed Architecture
                </span>
                <p className="text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">
                  Your resume inputs, contact details, work experiences, and education logs are stored and processed <strong>directly inside your browser's sandboxed local storage</strong>. We do not run background telemetry or upload your documents to persistent central cloud databases, meaning you retain complete ownership and control over your data.
                </p>
              </div>

              <div className="space-y-3 mt-4">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">1. Data We Process</h5>
                <p>
                  To provide full-scale CV formulation, optimization, and simulation features, we process:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong>Personal Profile Data:</strong> Full name, professional summary, contact numbers, and emails.</li>
                  <li><strong>Career Records:</strong> Employment histories, educational accomplishments, key projects, and certifications.</li>
                  <li><strong>AI Prompts:</strong> Custom text provided for cover letter generation or interview simulations.</li>
                </ul>

                <h5 className="font-semibold text-slate-800 dark:text-slate-200">2. How AI Generates Your Content</h5>
                <p>
                  When you use our AI Forge, AI Rewrite, or interview voice prep simulator, we route requests securely via server-side endpoints directly to official Gemini API frameworks. Your prompt strings are parsed purely in memory to synthesize the text replies, and are never saved or harvested for AI model training loops.
                </p>

                <h5 className="font-semibold text-slate-800 dark:text-slate-200">3. Deleting and Retrieving Your Data</h5>
                <p>
                  Because all configurations live strictly on your hardware, clearing your browser's local application storage or site cache will immediately wipe all resumes and cover letters. You can use our PDF export tool to back up your resumes locally at any time.
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-4 animate-fade-in">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                Terms of Service
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Last Updated: July 18, 2026
              </p>

              <p>
                By accessing, compiling, or using <strong>CareerForge</strong>, you agree to comply with and be bound by the following Terms of Service.
              </p>

              <div className="space-y-3">
                <h5 className="font-semibold text-slate-800 dark:text-slate-200">1. Eligibility & Scope of Use</h5>
                <p>
                  CareerForge is fully unlocked and 100% free for individual candidates, job seekers, and students. You may build as many resumes and cover letters as desired, perform unlimited ATS checks, and run interview prep scenarios without fees or limits. Commercial redistribution of the app's software is prohibited.
                </p>

                <h5 className="font-semibold text-slate-800 dark:text-slate-200">2. Accuracy & AI Code Disclaimers</h5>
                <p>
                  CareerForge utilizes state-of-the-art server-side language models to generate resume improvements, STAR schemas, and cover letters. However, language models can occasionally produce inaccurate or suboptimal phrasings. You are strictly responsible for inspecting all outputs, confirming factual dates, metrics, and experiences before submitting documents to actual recruiters.
                </p>

                <h5 className="font-semibold text-slate-800 dark:text-slate-200">3. Platform Warranties</h5>
                <p>
                  The CareerForge application is provided on an "as is" and "as available" basis. While we strive to maintain perfect compatibility with modern applicant tracking systems (ATS), we do not warrant or guarantee that utilizing our generated outputs will result in interviews, hiring, or employment offers.
                </p>

                <h5 className="font-semibold text-slate-800 dark:text-slate-200">4. Third-Party Web Services</h5>
                <p>
                  This application includes interactive web features (such as live audio synthesis). Standard carrier internet fees may apply. Users are responsible for maintaining a stable network connection during voice simulation runs.
                </p>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-5 animate-fade-in">
              <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 font-display">
                Contact Support
              </h4>
              <p>
                Have questions about formatting your resume, utilizing our AI ATS optimizer, or resolving issues? Our specialized support team is here to help you get hired.
              </p>

              {/* Direct Support Card */}
              <div className="p-5 bg-gradient-to-r from-indigo-50 to-indigo-100/40 dark:from-indigo-950/40 dark:to-slate-900 border border-indigo-100/70 dark:border-indigo-900/40 rounded-2xl space-y-4">
                <div className="flex items-start gap-3.5">
                  <Phone className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Direct Support Line
                    </span>
                    <a 
                      href="tel:+233592046641" 
                      className="text-lg font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1.5"
                    >
                      +233 59 204 6641
                    </a>
                    <span className="text-[11px] text-slate-400 dark:text-slate-400 block mt-0.5">
                      Available for Calls, WhatsApp, and SMS inquiries.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                  <Mail className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Email Help Desk
                    </span>
                    <a 
                      href="mailto:support@careerforge-ai.com" 
                      className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-450 hover:underline"
                    >
                      support@careerforge-ai.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3.5 pt-3 border-t border-slate-200/50 dark:border-slate-800/60">
                  <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Operating Hours
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                      Monday to Friday: 09:00 AM – 18:00 UTC
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Average response time is under 12 hours.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl flex items-start gap-3">
                <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tip: For quick resume refinements, you can also use our built-in <strong>AI Recruiting Consultant Chat</strong> (located in the app tabs), which has full local context on your drafted CV and can instantly provide targeted feedback.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 dark:bg-slate-750 dark:hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
