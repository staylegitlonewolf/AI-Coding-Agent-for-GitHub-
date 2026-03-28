"use client";
import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

export function ChatClient({ owner, repo, defaultBranch }: { owner: string; repo: string; defaultBranch: string }) {
  const [messages, setMessages] = useState([{ role: "assistant", content: `Agent Neo Matrix Mode activated for ${repo} 🕶️✨\n\nWhat would you like to update and change today?` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ owner, repo, branch: defaultBranch, prompt: input })
      });

      const data = await resp.json();
      setMessages([...newMsgs, { role: "assistant", content: data.reply || "I was unable to generate a response." }]);
    } catch (err: any) {
       console.error("OpenAI API Blocked or Errored:", err);
       setMessages([...newMsgs, { role: "assistant", content: "Error connecting to Agent API. " + (err.message || "") }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
       <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
         {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "assistant" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-white"}`}>
                 {m.role === "assistant" ? <Bot className="w-5 h-5"/> : <User className="w-5 h-5" />}
               </div>
               <div className={`max-w-3xl px-5 py-4 rounded-2xl whitespace-pre-wrap ${m.role === "assistant" ? "bg-white/5 border border-white/5 text-slate-300 shadow-xl" : "bg-indigo-600 text-white shadow-lg"}`}>
                 {m.content}
               </div>
            </div>
         ))}
         {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/20 text-indigo-400">
                 <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 animate-pulse">
                 Agent is analyzing the repository and drafting changes...
              </div>
            </div>
         )}
       </div>

       <div className="p-4 bg-slate-900 border-t border-white/10">
          <form className="max-w-4xl mx-auto relative flex items-center" onSubmit={sendMessage}>
             <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder="E.g. Fix the typo in the README..."
               disabled={loading}
               className="w-full bg-black/50 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
             />
             <button type="submit" disabled={!input.trim() || loading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full transition shadow-lg flex items-center justify-center">
                <Send className="w-4 h-4" />
             </button>
          </form>
       </div>
    </div>
  );
}
