"use client";
import { useState, useEffect } from "react";
import { Send, Bot, User, ListChecks, Check, GitCommit, X, FileCode2, Ban } from "lucide-react";

type MessageNode = {
  role: string;
  content: string;
  plan?: {
     id: string;
     tasks: { id: number; title: string; completed: boolean }[];
  }
};

export function ChatClient({ owner, repo, defaultBranch, selectedFile, onClearFile, userImage, tokensUsed, maxTokens, onDeductTokens }: { owner: string; repo: string; defaultBranch: string; selectedFile: string | null; onClearFile: () => void; userImage: string | null; tokensUsed: number; maxTokens: number; onDeductTokens: (n: number) => void; }) {
  const STORAGE_KEY = `agent_chat_${owner}_${repo}`;
  const [messages, setMessages] = useState<MessageNode[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
     const saved = localStorage.getItem(STORAGE_KEY);
     if (saved) {
        try {
           setMessages(JSON.parse(saved));
        } catch(e) {}
     } else {
        setMessages([{ role: "assistant", content: `Agent Neo Matrix Mode activated for ${repo} 🕶️✨\n\nWhat would you like to update and change today?` }]);
     }
     setHasLoaded(true);
  }, [STORAGE_KEY, repo]);

  useEffect(() => {
     if (hasLoaded && messages.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
     }
  }, [messages, hasLoaded, STORAGE_KEY]);

  const isLocked = tokensUsed >= maxTokens;

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isLocked) return;

    let finalInput = input;
    if (selectedFile) {
       finalInput = `[Target File: ${selectedFile}]\n${input}`;
    }

    const newMsgs = [...messages, { role: "user", content: finalInput }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      const resp = await fetch("/api/chat", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ owner, repo, branch: defaultBranch, prompt: finalInput })
      });

      const data = await resp.json();
      setMessages([...newMsgs, { role: "assistant", content: data.reply || "I was unable to generate a response.", plan: data.plan }]);
      onDeductTokens(15); // Deduct generic inference cost
    } catch (err: any) {
       console.error("Agent API Error:", err);
       setMessages([...newMsgs, { role: "assistant", content: "Error connecting to Agent API. " + (err.message || "") }]);
    } finally {
      setLoading(false);
    }
  };

  const executeFakeCommit = () => {
     if (isLocked) return;
     setMessages([...messages, { role: "assistant", content: "⚡ **COMMIT SUCCESSFUL**\n\nThe mock code has been dynamically committed and pushed to the repository securely.\n\n*(This was a local test because the actual OpenAI API was not triggered - you saved $0.05!)*"}]);
     onDeductTokens(45); // Expensive mock action
  }

  if (!hasLoaded) return null;

  return (
    <div className="flex flex-col h-full relative">
       <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
         {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 overflow-hidden ${m.role === "assistant" ? "bg-indigo-500/20 text-indigo-400" : "bg-white/10 text-white border border-white/20"}`}>
                 {m.role === "assistant" ? <Bot className="w-5 h-5"/> : (userImage ? <img src={userImage} className="w-full h-full object-cover" alt="User" /> : <User className="w-5 h-5" />)}
               </div>
               <div className={`max-w-3xl flex flex-col gap-3 ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-5 py-4 rounded-2xl whitespace-pre-wrap ${m.role === "assistant" ? "bg-white/5 border border-white/5 text-slate-300 shadow-xl" : "bg-indigo-600 text-white shadow-lg"}`}>
                    {m.content}
                  </div>
                  
                  {m.plan && (
                     <div className="w-full max-w-[450px] bg-slate-900 border border-indigo-500/30 rounded-xl p-5 shadow-[0_10px_30px_rgba(99,102,241,0.1)]">
                        <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2"><ListChecks className="w-5 h-5 text-indigo-400"/> Proposed Agent Execution Plan</h4>
                        <div className="space-y-2 mb-6">
                          {m.plan.tasks.map(t => (
                             <div key={t.id} className="flex gap-3 items-start text-sm text-slate-300 bg-white/5 p-3 rounded-lg border border-white/5">
                                <div className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center mt-0.5 ${t.completed ? "bg-indigo-500 border-indigo-500" : "border-slate-500 bg-slate-800"}`}>
                                   {t.completed && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className={t.completed ? "line-through opacity-50" : ""}>{t.title}</span>
                             </div>
                          ))}
                        </div>
                        <button 
                           onClick={executeFakeCommit}
                           disabled={isLocked}
                           className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:grayscale text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                           <GitCommit className="w-5 h-5" />
                           Execute Commit & Push
                        </button>
                     </div>
                  )}
               </div>
            </div>
         ))}
         {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-500/20 text-indigo-400">
                 <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="px-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-slate-400 animate-pulse">
                 Agent is analyzing the workspace...
              </div>
            </div>
         )}
       </div>

       <div className="p-4 bg-slate-900 border-t border-white/10 flex flex-col gap-2">
          {selectedFile && !isLocked && (
             <div className="flex items-center gap-2 max-w-4xl mx-auto w-full px-2">
                <span className="text-xs font-semibold text-slate-400 uppercase">Target Context:</span>
                <div className="flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs">
                   <FileCode2 className="w-3 h-3" />
                   {selectedFile}
                   <button onClick={onClearFile} className="hover:text-white transition-colors ml-1 focus:outline-none"><X className="w-3 h-3" /></button>
                </div>
             </div>
          )}
          
          <form className="max-w-4xl mx-auto w-full relative flex items-center" onSubmit={sendMessage}>
             <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={isLocked ? "Daily Quota Exceeded. Please upgrade your plan." : (selectedFile ? `Ask the Agent to edit ${selectedFile.split('/').pop()}...` : "Select a file or type a command...")}
               disabled={loading || isLocked}
               className={`w-full bg-black/50 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none ${isLocked ? "opacity-50 cursor-not-allowed border-red-500/50" : "focus:ring-2 focus:ring-indigo-500/50"}`}
             />
             <button type="submit" disabled={!input.trim() || loading || isLocked} className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition shadow-lg flex items-center justify-center ${isLocked ? "bg-red-500/20 text-red-400" : "bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white"}`}>
                {isLocked ? <Ban className="w-4 h-4" /> : <Send className="w-4 h-4" />}
             </button>
          </form>
       </div>
    </div>
  );
}
