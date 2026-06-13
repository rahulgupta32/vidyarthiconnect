"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Sparkles, 
  Send, 
  Trash2, 
  ShieldAlert, 
  ChevronRight, 
  HelpCircle, 
  FileText, 
  Award, 
  ShieldCheck, 
  DollarSign, 
  UserCheck, 
  Info,
  Loader2
} from "lucide-react";

export default function StudentAIAssistant() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Consent States
  const [profileConsent, setProfileConsent] = useState(false);
  const [docConsent, setDocConsent] = useState(false);
  const [sopConsent, setSOPConsent] = useState(false);
  const [recConsent, setRecConsent] = useState(false);
  const [scholarshipConsent, setScholarshipConsent] = useState(false);
  const [financeConsent, setFinanceConsent] = useState(false);
  const [chatHistoryConsent, setChatHistoryConsent] = useState(true);

  const [notif, setNotif] = useState("");
  const [notifError, setNotifError] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load chat history & consent logs
  useEffect(() => {
    async function init() {
      try {
        const [convsRes, consentRes] = await Promise.all([
          fetch("/api/ai/conversations"),
          fetch("/api/ai/consent")
        ]);

        if (convsRes.ok) {
          const convsData = await convsRes.json();
          setConversations(convsData);
          if (convsData.length > 0) {
            setActiveConvId(convsData[0].id);
          } else {
            // Auto create first general support conversation
            await handleNewConversation("General Support", "GENERAL_SUPPORT");
          }
        }

        if (consentRes.ok) {
          const consentData = await consentRes.json();
          consentData.forEach((rec: any) => {
            if (rec.consentType === "PROFILE_ANALYSIS") setProfileConsent(rec.granted);
            if (rec.consentType === "DOCUMENT_METADATA_ANALYSIS") setDocConsent(rec.granted);
            if (rec.consentType === "SOP_TEXT_REVIEW") setSOPConsent(rec.granted);
            if (rec.consentType === "RECOMMENDATION_EXPLANATION") setRecConsent(rec.granted);
            if (rec.consentType === "SCHOLARSHIP_ANALYSIS") setScholarshipConsent(rec.granted);
            if (rec.consentType === "SELF_FINANCE_ANALYSIS") setFinanceConsent(rec.granted);
            if (rec.consentType === "CHAT_HISTORY") setChatHistoryConsent(rec.granted);
          });
        }
      } catch (err) {
        console.error("Failed to load initial assistant parameters", err);
      }
    }
    init();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;

    async function loadMessages() {
      setLoadingHistory(true);
      try {
        const res = await fetch(`/api/ai/conversations/${activeConvId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadMessages();
  }, [activeConvId]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = async (title: string, contextType: string) => {
    try {
      const res = await fetch("/api/ai/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contextType }),
      });

      if (res.ok) {
        const data = await res.json();
        setConversations(prev => [data, ...prev]);
        setActiveConvId(data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !activeConvId) return;

    // Optimistic UI update
    const userMsg = { id: `user-temp-${Date.now()}`, role: "USER", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setLoading(true);
    setNotif("");
    setNotifError("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, conversationId: activeConvId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotifError(data.error || "Failed to query AI assistant.");
        setMessages(prev => prev.filter(m => m.id !== userMsg.id));
      } else {
        setMessages(prev => [
          ...prev.filter(m => m.id !== userMsg.id),
          { id: `user-${Date.now()}`, role: "USER", content: text },
          { id: `assist-${Date.now()}`, role: "ASSISTANT", content: data.reply }
        ]);

        if (data.handoffTriggered) {
          setNotif("Advisory Escalation: This query contains sensitive parameters. A counselor handoff task was automatically logged.");
        }
      }
    } catch (err) {
      setNotifError("Server connection failed. Showing offline fallback suggestions.");
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to permanently clear all your AI chat history? This cannot be undone.")) return;

    try {
      const res = await fetch("/api/ai/clear-history", { method: "POST" });
      if (res.ok) {
        setMessages([]);
        setConversations([]);
        setActiveConvId(null);
        setNotif("Chat history cleared successfully.");
        // Re-create general chat
        await handleNewConversation("General Support", "GENERAL_SUPPORT");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConsentToggle = async (consentType: string, currentVal: boolean, setter: (val: boolean) => void) => {
    try {
      const res = await fetch("/api/ai/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consentType, granted: !currentVal }),
      });

      if (res.ok) {
        setter(!currentVal);
        setNotif(`Consent preference for ${consentType.replace(/_/g, " ")} updated!`);
        setTimeout(() => setNotif(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Action triggers
  const triggerQuickAction = (text: string, contextType: string) => {
    if (activeConvId) {
      handleSendMessage(text);
    } else {
      handleNewConversation(contextType.replace(/_/g, " "), contextType).then(() => {
        handleSendMessage(text);
      });
    }
  };

  const quickActions = [
    { label: "Check my missing documents", prompt: "Check my missing documents checklist", context: "DOCUMENT_CHECKLIST", icon: FileText },
    { label: "Explain my recommendations", prompt: "Explain my university recommendations", context: "UNIVERSITY_RECOMMENDATION", icon: Sparkles },
    { label: "Help with SOP", prompt: "Provide SOP writing guidance", context: "SOP_HELP", icon: HelpCircle },
    { label: "Visa/NOC checklist", prompt: "Explain Nepal MoEST NOC application steps and student visa checklist", context: "VISA_NOC", icon: ShieldCheck },
    { label: "Find scholarships", prompt: "Find available scholarships matching my profile", context: "SCHOLARSHIP_HELP", icon: Award },
    { label: "Explain self-finance cost", prompt: "Explain self-finance total estimated costs", context: "SELF_FINANCE_HELP", icon: DollarSign },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-indigo-600" /> AI Support Assistant
        </h1>
        <p className="text-sm text-slate-400">
          Personalized AI advisory for document checklists, SOP structure, visa filing, and scholarship matching.
        </p>
      </div>

      {notif && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 text-xs rounded-xl p-4 font-semibold">
          {notif}
        </div>
      )}

      {notifError && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400 text-xs rounded-xl p-4 font-semibold">
          {notifError}
        </div>
      )}

      {/* Main Grid: Left sidebar chat list, middle active chat panel, right settings card */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Chat List */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-slate-900/80 border border-slate-800 shadow-xl p-4 rounded-2xl shadow-xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chat Threads</span>
              <button 
                onClick={() => handleNewConversation("New Support Chat", "GENERAL_SUPPORT")}
                className="text-indigo-600 hover:text-indigo-700 text-xxs font-extrabold"
              >
                + New
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full text-left p-2.5 rounded-xl text-xxs font-semibold transition border ${
                    activeConvId === conv.id 
                      ? "bg-indigo-600 text-white border-indigo-600" 
                      : "bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 border-transparent text-slate-300"
                  }`}
                >
                  <div className="truncate font-bold">{conv.title}</div>
                  <div className={`text-xxxxs uppercase mt-0.5 ${activeConvId === conv.id ? "text-indigo-200" : "text-slate-400"}`}>
                    {conv.contextType.replace(/_/g, " ")}
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={handleClearHistory}
              className="w-full flex items-center justify-center gap-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 py-2 rounded-xl text-xxs font-bold transition"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear Chat History
            </button>
          </div>
        </div>

        {/* Chat Window */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 shadow-xl rounded-2xl shadow-xs flex flex-col justify-between h-[550px] relative overflow-hidden">
          
          {/* Messages list */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {loadingHistory ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs">
                Send a message or select a quick action to start AI consultation.
              </div>
            ) : (
              messages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                    m.role === "USER"
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-slate-100 dark:bg-zinc-800 text-white rounded-bl-none border border-slate-800/50"
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-50 dark:bg-zinc-800 text-slate-400 rounded-2xl rounded-bl-none p-3 text-xs flex items-center gap-2 border border-slate-100">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" /> AI is formulating advice...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Actions Panel */}
          {messages.length < 3 && (
            <div className="px-6 py-2 border-t border-slate-50 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
              <span className="text-xxxxs font-bold text-slate-400 uppercase tracking-widest block mb-2">Suggestions</span>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => triggerQuickAction(act.prompt, act.context)}
                    className="flex items-center gap-1 bg-white dark:bg-zinc-800 hover:bg-indigo-50/40 border border-slate-800 px-2.5 py-1.5 rounded-lg text-xxxxs font-bold text-slate-600 dark:text-zinc-300 transition"
                  >
                    <act.icon className="h-3 w-3 text-indigo-600" /> {act.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input form */}
          <div className="p-4 border-t border-slate-800 bg-slate-950 flex gap-2 items-center">
            <input
              type="text"
              placeholder="Ask about NOC, SOP review, financial balance proof, or visa checklists..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage(inputText)}
              className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={loading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-100 dark:disabled:bg-zinc-800 text-white p-2.5 rounded-xl transition flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* AI Preferences & Legal Notice panel */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Legal Notice */}
          <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl text-xxxxs leading-relaxed text-amber-700 dark:text-amber-400 space-y-2 shadow-2xs">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> AI Disclaimer
            </div>
            <p>
              AI guidance is for informational support only. Final decisions are made by universities, embassies, government authorities, and relevant institutions. VidyarthiiConnect does not guarantee admission, scholarship, visa approval, NOC approval, or financial approval.
            </p>
          </div>

          {/* Consent Configurations */}
          <div className="bg-slate-900/80 border border-slate-800 shadow-xl p-5 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 border-b border-slate-50 pb-2">AI Privacy Consent</h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={profileConsent}
                  onChange={() => handleConsentToggle("PROFILE_ANALYSIS", profileConsent, setProfileConsent)}
                  className="rounded mt-0.5 accent-indigo-600"
                />
                <div className="text-xxxxs text-slate-500 leading-normal">
                  <strong>Profile Analysis</strong>
                  <span className="block mt-0.5 text-slate-400">Allow AI to access GPA, score averages, and intended degrees.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={docConsent}
                  onChange={() => handleConsentToggle("DOCUMENT_METADATA_ANALYSIS", docConsent, setDocConsent)}
                  className="rounded mt-0.5 accent-indigo-600"
                />
                <div className="text-xxxxs text-slate-500 leading-normal">
                  <strong>Document Metadata</strong>
                  <span className="block mt-0.5 text-slate-400">Allow AI to inspect vault file types and verification checklist status.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sopConsent}
                  onChange={() => handleConsentToggle("SOP_TEXT_REVIEW", sopConsent, setSOPConsent)}
                  className="rounded mt-0.5 accent-indigo-600"
                />
                <div className="text-xxxxs text-slate-500 leading-normal">
                  <strong>SOP Draft Reviews</strong>
                  <span className="block mt-0.5 text-slate-400">Allow AI to parse inputted SOP paragraphs for editing feedback.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recConsent}
                  onChange={() => handleConsentToggle("RECOMMENDATION_EXPLANATION", recConsent, setRecConsent)}
                  className="rounded mt-0.5 accent-indigo-600"
                />
                <div className="text-xxxxs text-slate-500 leading-normal">
                  <strong>Explanations Matcher</strong>
                  <span className="block mt-0.5 text-slate-400">Allow AI to generate matching reports for shortlisted courses.</span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={chatHistoryConsent}
                  onChange={() => handleConsentToggle("CHAT_HISTORY", chatHistoryConsent, setChatHistoryConsent)}
                  className="rounded mt-0.5 accent-indigo-600"
                />
                <div className="text-xxxxs text-slate-500 leading-normal">
                  <strong>Save Chat History</strong>
                  <span className="block mt-0.5 text-slate-400">Save conversation logs in the database for later retrieval. Uncheck to disable.</span>
                </div>
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
