/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Send, 
  BrainCircuit, 
  RefreshCw, 
  Compass, 
  MessageSquare, 
  Volume2, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Globe, 
  Brain, 
  Layers, 
  ChevronRight, 
  Info,
  ExternalLink,
  ShieldCheck
} from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  groundingChunks?: {
    web?: {
      uri: string;
      title: string;
    }
  }[];
}

interface AIChatProps {
  resumeText?: string;
}

// Float32 to 16-bit PCM little-endian conversion
function floatTo16BitPCM(float32Array: Float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

// ArrayBuffer to Base64 conversion
function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export default function AIChat({ resumeText = "" }: AIChatProps) {
  // Navigation mode: "chat" or "voice"
  const [activeMode, setActiveMode] = useState<"chat" | "voice">("chat");

  // Chat Advisor settings
  const [selectedRole, setSelectedRole] = useState<"general" | "salary" | "gap" | "pivot" | "interview" | "resume">("general");
  const [highThinking, setHighThinking] = useState(false);
  const [searchGrounding, setSearchGrounding] = useState(false);

  // Text messages state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: "Hello! I am your CareerForge Recruiting Advisor. Ask me anything about negotiating offers, managing career pivots, writing competitive resume hooks, or answering stressful interview questions!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Live Voice Call State
  const [isVoiceConnected, setIsVoiceConnected] = useState<"idle" | "connecting" | "connected" | "error">("idle");
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState<number[]>(Array(15).fill(2)); // Waveform mock visualizer data

  // Audio Context and Stream References for voice call
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const isVoiceMutedRef = useRef<boolean>(false);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextStartTimeRef = useRef<number>(0);
  const waveformIntervalRef = useRef<any>(null);

  // Pre-baked starter conversation chips based on role
  const starterChips = {
    general: [
      { label: "💰 Negotiate my salary", prompt: "Give me a step-by-step negotiation script for a software engineer offer." },
      { label: "⏳ Explain a career gap", prompt: "What is the best way to explain a 1-year employment gap professionally?" },
      { label: "🔄 Pivoting into technology", prompt: "How do I frame traditional marketing skills for a Product Manager role?" }
    ],
    salary: [
      { label: "💵 Secure a counter-offer", prompt: "Provide a template counter-offer email requesting a 15% increase based on market rate." },
      { label: "🤝 Handle 'what is your salary goal?'", prompt: "How do I answer salary expectations without giving a number first?" }
    ],
    gap: [
      { label: "❤️ Gaps due to family care", prompt: "How should I structure a 6-month gap due to family illness?" },
      { label: "🎓 Gaps due to returning to school", prompt: "Explain a 1.5 year gap spent reskilling in web development." }
    ],
    pivot: [
      { label: "🎒 Teacher pivoting to Tech", prompt: "Translate my 5 years of school teaching skills into UX Design terms." },
      { label: "🏥 Nurse pivoting to Tech", prompt: "Map clinical nursing coordination skills to Customer Success Manager." }
    ],
    interview: [
      { label: "🔥 STAR Method Practice", prompt: "Give me a behavioral interview question about handling conflict and evaluate my answer." },
      { label: "💻 Technical Architecture Prep", prompt: "Draft 3 senior engineering questions about caching, databases, and microservices." }
    ],
    resume: [
      { label: "✍️ Write achievement bullet", prompt: "Help me rewrite 'maintained the legacy database' with rich metrics and action verbs." },
      { label: "🔍 ATS Compatibility check", prompt: "Review my resume details and point out passive language or weak phrasing." }
    ]
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    isVoiceMutedRef.current = isVoiceMuted;
  }, [isVoiceMuted]);

  // Clean up audio resources on unmount
  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  // Sync simulated waveform visualizer when connected
  useEffect(() => {
    if (isVoiceConnected === "connected") {
      waveformIntervalRef.current = setInterval(() => {
        setVoiceVolume((prev) =>
          prev.map(() => Math.floor(Math.random() * 24) + 2)
        );
      }, 100);
    } else {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }
      setVoiceVolume(Array(15).fill(2));
    }
  }, [isVoiceConnected]);

  // TEXT CHAT ACTIONS
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `msg-user-${Math.random().toString(36).substr(2, 9)}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Map current messages state to backend chatHistory structure
      const chatHistory = messages
        .filter((m) => m.id !== "msg-welcome")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "model",
          text: m.text,
        }));

      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend, 
          chatHistory,
          resumeContext: resumeText,
          role: selectedRole,
          highThinking,
          searchGrounding
        }),
      });
      const data = await res.json();
      if (data.response) {
        const aiMsg: Message = {
          id: `msg-ai-${Math.random().toString(36).substr(2, 9)}`,
          sender: "ai",
          text: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          groundingChunks: data.groundingChunks
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        alert("Failed to get response.");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending message to CareerForge Advisor.");
    } finally {
      setLoading(false);
    }
  };

  // REAL-TIME VOICE SESSION ACTIONS
  const startVoiceSession = async () => {
    try {
      setIsVoiceConnected("connecting");
      
      // Initialize Audio Contexts
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = 0;
      activeSourcesRef.current = [];

      // Get microphone stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // Connect socket
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const socketUrl = `${protocol}//${window.location.host}/api/voice-live`;
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsVoiceConnected("connected");
        
        // Start processing microphone input
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        audioProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isVoiceMutedRef.current) return;
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBuffer = floatTo16BitPCM(inputData);
            const base64 = arrayBufferToBase64(pcmBuffer);
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            playAudioChunk(msg.audio);
          }
          if (msg.interrupted) {
            // Stop current playback
            activeSourcesRef.current.forEach((src) => {
              try { src.stop(); } catch (err) {}
            });
            activeSourcesRef.current = [];
            nextStartTimeRef.current = 0;
          }
          if (msg.error) {
            console.error("Live API Error:", msg.error);
            stopVoiceSession();
            alert("Live Voice Assistant error: " + msg.error);
          }
        } catch (err) {
          console.error("Error processing websocket message:", err);
        }
      };

      ws.onerror = (e) => {
        console.error("Voice live WebSocket error:", e);
        setIsVoiceConnected("error");
      };

      ws.onclose = () => {
        console.log("Voice live WebSocket closed.");
        stopVoiceSession();
      };

    } catch (err: any) {
      console.error("Error starting voice call:", err);
      setIsVoiceConnected("error");
      alert("Could not access microphone or connect to voice server: " + (err.message || err));
      stopVoiceSession();
    }
  };

  const stopVoiceSession = () => {
    setIsVoiceConnected("idle");
    
    // Close WebSocket
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {}
      wsRef.current = null;
    }

    // Stop and disconnect processor
    if (audioProcessorRef.current) {
      try {
        audioProcessorRef.current.disconnect();
      } catch (e) {}
      audioProcessorRef.current = null;
    }

    // Stop mic stream track
    if (audioStreamRef.current) {
      try {
        audioStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch (e) {}
      audioStreamRef.current = null;
    }

    // Close AudioContexts
    if (inputAudioCtxRef.current) {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      try {
        outputAudioCtxRef.current.close();
      } catch (e) {}
      outputAudioCtxRef.current = null;
    }

    // Stop any playing sound
    activeSourcesRef.current.forEach((src) => {
      try { src.stop(); } catch (err) {}
    });
    activeSourcesRef.current = [];
    nextStartTimeRef.current = 0;
  };

  const playAudioChunk = (base64Data: string) => {
    const audioCtx = outputAudioCtxRef.current;
    if (!audioCtx) return;

    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;
      const int16Array = new Int16Array(arrayBuffer);
      
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }
      
      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== source);
      };
      activeSourcesRef.current.push(source);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
    } catch (err) {
      console.error("Error playing audio chunk:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[650px] text-left relative" id="career-ai-copilot">
      {/* Tab Switcher Mode */}
      <div className="flex bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200/50 dark:border-slate-900 mb-4 shrink-0">
        <button
          onClick={() => {
            setActiveMode("chat");
            stopVoiceSession();
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === "chat"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Interactive Text Coach</span>
        </button>
        <button
          onClick={() => {
            setActiveMode("voice");
          }}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
            activeMode === "voice"
              ? "bg-indigo-600 text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Live Real-Time Voice Call</span>
          <span className="text-[8px] bg-indigo-200 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 font-extrabold uppercase px-1.5 py-0.5 rounded-full tracking-wider animate-pulse">Live</span>
        </button>
      </div>

      {activeMode === "chat" ? (
        <>
          {/* Text advisor header & Settings */}
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 mb-3 shrink-0 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-bold text-slate-950 dark:text-white font-display flex items-center gap-1.5 uppercase tracking-wide">
                  <BrainCircuit className="w-5 h-5 text-indigo-500 animate-pulse" />
                  <span>AI Career Strategy Copilot</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Customized multi-turn advising powered by Gemini multimodal engines.</p>
              </div>
              <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded shrink-0 self-start sm:self-center">Multi-Turn Advisor</span>
            </div>

            {/* Quick settings toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-950/20 p-2 rounded-xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Advisor Profile:</span>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="general">🤖 General Recruiter Expert</option>
                  <option value="salary">💰 Salary Package Negotiator</option>
                  <option value="gap">⏳ Gap Explanation Strategist</option>
                  <option value="pivot">🔄 Career Pivot Specialist</option>
                  <option value="interview">🧠 Stress-Test Technical Interviewer</option>
                  <option value="resume">📝 Accomplishment Resume Critic</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4">
                {/* Search Grounding */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={searchGrounding}
                    onChange={(e) => {
                      setSearchGrounding(e.target.checked);
                      if (e.target.checked) setHighThinking(false); // Exclusive
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Globe className="w-3 h-3 text-sky-500" />
                    Web Grounding
                  </span>
                </label>

                {/* High Thinking Mode */}
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={highThinking}
                    onChange={(e) => {
                      setHighThinking(e.target.checked);
                      if (e.target.checked) setSearchGrounding(false); // Exclusive
                    }}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                  />
                  <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Brain className="w-3 h-3 text-fuchsia-500 animate-pulse" />
                    Expert Reasoning
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Messages Output */}
          <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-4 pr-1" ref={scrollRef}>
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

                  {/* Grounding chunks display */}
                  {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-slate-200/50 dark:border-slate-800/80 space-y-1">
                      <div className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        <span>VERIFIED WEB SOURCES USED</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingChunks.map((chunk, idx) => (
                          chunk.web && (
                            <a
                              key={idx}
                              href={chunk.web.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/30 dark:hover:bg-sky-950/60 text-[9px] text-sky-600 dark:text-sky-400 font-semibold rounded-md border border-sky-100 dark:border-sky-900/40 inline-flex items-center gap-1"
                            >
                              <span>{chunk.web.title || "Web Link"}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          )
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {/* Timestamp */}
                <span className="text-[9px] font-mono text-slate-400 mt-1 px-1">{msg.timestamp}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-indigo-500 font-bold mr-auto bg-indigo-50/50 dark:bg-slate-950/50 p-3 rounded-2xl border border-indigo-100/30">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {highThinking 
                    ? "Deep-thinking reasoning models are analyzing your strategy..." 
                    : searchGrounding 
                    ? "Searching global database & live sources..." 
                    : "AI Advisor is drafting coaching advice..."
                  }
                </span>
              </div>
            )}
          </div>

          {/* Suggestion Chips */}
          <div className="py-2.5 space-y-2 shrink-0 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 select-none">
              <Compass className="w-3.5 h-3.5" />
              <span>Recommended Quick Starters</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {starterChips[selectedRole].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-950/20 text-[10px] font-semibold text-slate-600 dark:text-slate-400 hover:dark:text-indigo-400 rounded-lg transition-all border border-slate-150 text-left shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

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
              placeholder={
                selectedRole === "salary" ? "Ask how to ask for sign-on bonus..." :
                selectedRole === "gap" ? "Ask how to frame maternity leave..." :
                selectedRole === "pivot" ? "Ask how to transfer marketing to product..." :
                "Ask your career advisor anything..."
              }
              className="flex-1 px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 dark:bg-slate-950 text-slate-900 dark:text-white"
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
        </>
      ) : (
        /* VOICE COACH PANEL */
        <div className="flex-1 flex flex-col items-center justify-center space-y-6">
          <div className="text-center max-w-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-center gap-1.5">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              <span>Real-Time Auditory Mock Interview</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Activate your microphone. Practice your vocal articulation, speed, and content with a real-time responsive coach via Gemini Live.
            </p>
          </div>

          {/* Visual Caller Avatar Card */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* Ambient ripples */}
            {isVoiceConnected === "connected" && (
              <>
                <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-20 animate-ping"></span>
                <span className="absolute inline-flex h-[80%] w-[80%] rounded-full bg-indigo-500 opacity-10 animate-pulse"></span>
              </>
            )}
            <div className={`w-32 h-32 rounded-full flex flex-col items-center justify-center shadow-lg border relative z-10 transition-all ${
              isVoiceConnected === "connected" 
                ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 border-indigo-400 text-white"
                : isVoiceConnected === "connecting"
                ? "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-950"
                : "bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-950 dark:border-slate-800"
            }`}>
              {isVoiceConnected === "connecting" ? (
                <RefreshCw className="w-8 h-8 animate-spin text-indigo-500" />
              ) : (
                <Mic className={`w-10 h-10 ${isVoiceConnected === "connected" ? "text-white" : "text-slate-400"}`} />
              )}
              <span className="text-[10px] font-bold mt-2 uppercase tracking-widest font-mono">
                {isVoiceConnected === "connected" ? "COACH LIVE" : "OFFLINE"}
              </span>
            </div>
          </div>

          {/* Voice Waveform Sim Visualizer */}
          {isVoiceConnected === "connected" && (
            <div className="flex items-center gap-1 h-8">
              {voiceVolume.map((val, idx) => (
                <span
                  key={idx}
                  className="w-1 bg-indigo-500 rounded-full transition-all duration-75"
                  style={{ height: `${val}px` }}
                ></span>
              ))}
            </div>
          )}

          {/* Status line */}
          <div className="text-center font-mono">
            {isVoiceConnected === "idle" && (
              <span className="text-xs text-slate-400 uppercase tracking-widest">TAP START CALL TO BEGIN COACHING</span>
            )}
            {isVoiceConnected === "connecting" && (
              <span className="text-xs text-indigo-500 font-bold uppercase tracking-widest animate-pulse">ESTABLISHING HIGH-SPEED VOICE STREAM...</span>
            )}
            {isVoiceConnected === "connected" && (
              <div className="space-y-1">
                <span className="text-xs text-emerald-500 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>CALL SECURED</span>
                </span>
                <p className="text-[10px] text-slate-400">Speaker is 'Zephyr'. Speak normally; interrupt at any time!</p>
              </div>
            )}
            {isVoiceConnected === "error" && (
              <span className="text-xs text-rose-500 font-bold uppercase tracking-widest">COULD NOT CONNECT. RETRY.</span>
            )}
          </div>

          {/* Microphone control tray */}
          <div className="flex items-center gap-4">
            {isVoiceConnected === "connected" && (
              <button
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className={`p-3.5 rounded-full border transition-all ${
                  isVoiceMuted 
                    ? "bg-rose-50 border-rose-200 text-rose-500 dark:bg-rose-950/20 dark:border-rose-900"
                    : "bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-950 hover:bg-slate-100 dark:border-slate-850"
                }`}
                title={isVoiceMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isVoiceMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {isVoiceConnected === "idle" || isVoiceConnected === "error" ? (
              <button
                onClick={startVoiceSession}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
              >
                <Phone className="w-4 h-4" />
                <span>Start Audio Interview Call</span>
              </button>
            ) : (
              <button
                onClick={stopVoiceSession}
                className="px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 uppercase tracking-wider"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Disconnect Call</span>
              </button>
            )}
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800/80 max-w-md text-left flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">How it works</span>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal">
                This voice assistant uses raw, high-frequency 16-bit PCM little-endian audio streams directly between your browser and Gemini Live API at <strong className="text-slate-800 dark:text-white">1 FPS multimodal video sync capabilities</strong>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
