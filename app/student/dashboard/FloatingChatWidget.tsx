"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, X, Sparkles, Loader2, ShieldAlert } from "lucide-react";

export default function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (!isOpen) return;

    async function initChat() {
      try {
        const res = await fetch("/api/ai/conversations");
        if (res.ok) {
          const data = await res.json();
          if (data.length > 0) {
            setConversationId(data[0].id);
            // Fetch messages for this conversation
            const msgsRes = await fetch(`/api/ai/conversations/${data[0].id}`);
            if (msgsRes.ok) {
              const msgsData = await msgsRes.json();
              setMessages(msgsData.messages || []);
            }
          } else {
            // Create a general conversation if none exists
            const createRes = await fetch("/api/ai/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "General Support", contextType: "GENERAL_SUPPORT" }),
            });
            if (createRes.ok) {
              const createData = await createRes.json();
              setConversationId(createData.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize floating chat:", err);
      }
    }

    initChat();
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;

    const userText = inputText;
    setInputText("");
    setError("");

    // Optimistically add user message
    const tempUserMsg = { id: `user-${Date.now()}`, role: "USER", content: userText };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      // Ensure we have a conversationId
      let activeConvId = conversationId;
      if (!activeConvId) {
        const createRes = await fetch("/api/ai/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "General Support", contextType: "GENERAL_SUPPORT" }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          activeConvId = createData.id;
          setConversationId(activeConvId);
        } else {
          throw new Error("Could not initialize chat conversation");
        }
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, conversationId: activeConvId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to get reply");
        // Remove optimistic user message if failed
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `assist-${Date.now()}`, role: "ASSISTANT", content: data.reply },
        ]);
      }
    } catch (err) {
      setError("Connection error. Showing offline fallback.");
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window overlay */}
      {isOpen && (
        <div className="bg-slate-900 border border-slate-800 w-80 sm:w-96 h-[480px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-200 text-white">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 animate-pulse text-amber-300" />
              <span className="font-bold text-xs">Vidyarthii AI Support</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-slate-200 transition p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xxs">
                Hello! How can I help you today? Ask me about university requirements, NOC checklist, cost estimates or documents.
              </div>
            ) : (
              messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === "USER" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-xxs leading-relaxed whitespace-pre-wrap ${
                      m.role === "USER"
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-white dark:bg-zinc-800 text-white rounded-bl-none border border-slate-800"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 text-slate-400 rounded-xl rounded-bl-none px-3 py-2 text-xxs flex items-center gap-1.5 border border-slate-800">
                  <Loader2 className="h-3 w-3 animate-spin text-indigo-600" /> formulating answer...
                </div>
              </div>
            )}

            {error && (
              <div className="text-center bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 p-2.5 rounded-xl text-xxs font-semibold">
                {error}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* AI Disclaimer */}
          <div className="px-4 py-2 bg-amber-500/5 border-t border-slate-800 text-[10px] leading-relaxed text-amber-700 dark:text-amber-400 flex gap-1.5 items-start">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>
              AI guidance is for informational support only. Final decisions are made by authorities. VidyarthiiConnect does not guarantee admission, scholarship, visa/NOC approval, or financial approval.
            </span>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white dark:bg-zinc-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl py-2 px-3.5 text-xxs focus:outline-none focus:border-indigo-600"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition flex-shrink-0 disabled:bg-slate-100 dark:disabled:bg-zinc-800"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Bubble Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white p-4 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
        title="Open AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </button>
    </div>
  );
}
