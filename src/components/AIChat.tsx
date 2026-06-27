/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, BrainCircuit, RefreshCw, Compass, ArrowRight } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Hello! I am your CareerForge AI Recruiting Advisor. Ask me anything about negotiating offers, managing career pivots, writing competitive resume hooks, or answering stressful interview questions!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Pre-baked starter conversation chips
  const starterChips = [
    { label: "💰 Negotiate my salary offer", prompt: "Give me a step-by-step scripts or templates to negotiate a software engineering salary offer of $130,000 up to $150,000." },
    { label: "⏳ Explain an employment gap", prompt: "What is the best professional way to explain a 1-year employment gap due to family care in an interview?" },
    { label: "🔄 Pivoting into tech", prompt: "Provide 3 concrete CV framing adjustments for transitioning from traditional marketing to an entry-level Product Manager role." },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Math.random().toString(36).substr(2, 9)}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      if (data.response) {
        const aiMsg: Message = {
          id: `msg-ai-${Math.random().toString(36).substr(2, 9)}`,
          sender: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        alert("Failed to get response.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending message to CareerForge AI Advisor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[500px] text-left" id="career-ai-copilot">
      {/* Header */}
      <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-950 dark:text-white font-display flex items-center gap-1.5 uppercase tracking-wide">
            <BrainCircuit className="w-5 h-5 text-indigo-500" />
            <span>AI Career Strategy Copilot</span>
          </h2>
          <p className="text-[11px] text-slate-500">Ask strategic questions about resume structure, gap justifications, salary negotiation, etc.</p>
        </div>
        <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded">Recruiter Advisor Bot</span>
      </div>

      {/* Messages Output */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4 space-y-4 pr-1" ref={scrollRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col max-w-[85%] ${
              msg.sender === "user" ? "ml-auto items-end" : "mr-auto items-start"
            }`}
          >
            {/* Bubble */}
            <div
              className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none shadow-sm"
                  : "bg-slate-50 dark:bg-slate-950/40 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
            {/* Timestamp */}
            <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-indigo-500 font-bold mr-auto bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 dark:bg-slate-950">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Recruiting Coach is brainstorming advice...</span>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      {messages.length === 1 && (
        <div className="py-2.5 space-y-2 shrink-0 border-t border-slate-50 dark:border-slate-900">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" />
            <span>Starter Strategy Suggestions</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {starterChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(chip.prompt)}
                className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950/20 text-[10px] font-semibold text-slate-600 rounded-lg transition-all border border-slate-150 text-left shrink-0"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="pt-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. Write a salary negotiation letter script..."
          className="flex-1 px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
