"use client";
import { useState } from "react";
import { Send, Bot, User, Code2 } from "lucide-react";
import { useAppContext } from "./Providers";
import OpenAI from "openai";

export function ChatClient({ owner, repo, defaultBranch }: { owner: string; repo: string; defaultBranch: string }) {
  const { openaiKey } = useAppContext();
  const [messages, setMessages] = useState([{ role: "assistant", content: `Hello! I am your AI agent for ${repo}. Tell me what you'd like to build, fix, or add, and I'll generate the code directly.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !openaiKey) return;

    const newMsgs = [...messages, { role: "user", content: input }];
    setMessages(newMsgs);
    setInput("");
    setLoading(true);

    try {
      // NOTE: Using shockingly direct client-side open AI connection for Static Web Application
      const openai = new OpenAI({ apiKey: openaiKey, dangerouslyAllowBrowser: true });
      const prompt = `You are a specialized AI Agent for the GitHub repo ${owner}/${repo} (Branch: ${defaultBranch}).
The user request is: "${input}"
Respond clearly natively assisting the user in generating or debugging code. Remember you can't push PRs natively in this exact client-only prototype, so just provide them the code they need in markdown blocks.`;

      const response = await (openai as any).responses.create({
         model: "gpt-4o",
         input: prompt
      });

      setMessages([...newMsgs, { role: "assistant", content: response.output_text || "I was unable to generate a response." }]);
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
               placeholder={openaiKey ? "E.g. Fix the typo in the README..." : "Missing OpenAI API Key from Start!"}
               disabled={!openaiKey}
               className="w-full bg-black/50 border border-white/10 rounded-full py-4 pl-6 pr-14 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
             />
             <button type="submit" disabled={!input.trim() || loading || !openaiKey} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-full transition shadow-lg flex items-center justify-center">
                <Send className="w-4 h-4" />
             </button>
          </form>
       </div>
    </div>
  );
}
