"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, User, ShieldCheck } from "lucide-react";

export default function StudentChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversationId(data.conversationId);
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error("Load messages failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    
    // Simple polling for a simulated chat experience (every 5 seconds)
    const interval = setInterval(() => {
      loadMessages();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Scroll to bottom on new messages
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !conversationId) return;

    setSending(true);
    const content = inputText;
    setInputText("");

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, conversationId }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (err) {
      console.error("Send message error", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Connecting to counseling hub...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
      
      {/* Top Header */}
      <div className="bg-slate-50 dark:bg-zinc-850 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-950 p-2.5 rounded-full text-indigo-650 dark:text-indigo-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-800 dark:text-zinc-200">Your Assigned Counselor</h2>
            <p className="text-xxs text-slate-400 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Active Support Guide
            </p>
          </div>
        </div>
        <div className="text-xxs text-slate-455 font-semibold flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
          <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Monitored Audited Channel
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 min-h-0 bg-slate-50/50">
        {messages.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            <MessageSquare className="h-10 w-10 mx-auto text-slate-300 mb-2" />
            No messages yet. Send a hello to your counselor to begin counseling review!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender.role === "STUDENT";
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-2xl p-4 shadow-xxs text-xs leading-relaxed ${
                  isMe 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-white border border-slate-200 text-slate-800 rounded-bl-none dark:bg-zinc-805 dark:border-zinc-750 dark:text-zinc-200"
                }`}>
                  <div className="text-xxs font-extrabold mb-1 opacity-70">
                    {msg.sender.name}
                  </div>
                  <p>{msg.content}</p>
                  <div className="text-xxxxs text-right mt-1 opacity-50">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message here..."
          required
          className="flex-1 bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 border border-slate-350 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-indigo-550 focus:ring-2 focus:ring-indigo-500/20"
        />
        <button
          type="submit"
          disabled={sending || !inputText.trim() || !conversationId}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white p-2 px-4 rounded-xl transition flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs"
        >
          {sending ? "Sending..." : "Send"} <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
