"use client";
import { useState, useEffect } from "react";
import { ChatClient } from "./ChatClient";
import { FileCode2, Zap } from "lucide-react";

export function RepoWorkspace({ owner, repo, defaultBranch, treeData, userImage }: { owner: string; repo: string; defaultBranch: string; treeData: any[]; userImage: string | null }) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  // API Quota token system
  const [tokensUsed, setTokensUsed] = useState(0);
  const MAX_TOKENS = 500;

  useEffect(() => {
     // load global mock token usage
     const savedTokens = localStorage.getItem("agent_mock_tokens");
     if (savedTokens) {
        setTokensUsed(parseInt(savedTokens));
     }
  }, []);

  const deductTokens = (amount: number) => {
     setTokensUsed(prev => {
        const next = Math.min(prev + amount, MAX_TOKENS);
        localStorage.setItem("agent_mock_tokens", next.toString());
        return next;
     });
  };

  const percentage = Math.min((tokensUsed / MAX_TOKENS) * 100, 100);

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Interactive Sidebar */}
      <div className="w-64 border-r border-white/10 bg-slate-900/50 flex flex-col hidden md:flex shrink-0">
        <div className="flex-1 overflow-y-auto p-4">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Repository Files</h2>
           {treeData.length === 0 ? <p className="text-sm text-slate-600">Failed to load or empty repo.</p> : (
             <ul className="space-y-1">
               {treeData.slice(0, 150).map((file, i) => (
                 <li 
                   key={i} 
                   onClick={() => setSelectedFile(file.path)}
                   className={`flex items-start gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer transition-all ${
                     selectedFile === file.path 
                       ? "bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30" 
                       : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
                   }`}
                   title={file.path}
                 >
                   <FileCode2 className={`w-4 h-4 shrink-0 mt-0.5 ${selectedFile === file.path ? "text-indigo-400" : "text-slate-500"}`} />
                   <span className="break-all">{file.path.split('/').pop()}</span>
                 </li>
               ))}
               {treeData.length > 150 && <li className="text-xs text-indigo-400 italic mt-2 px-2">...and {treeData.length - 150} more files</li>}
             </ul>
           )}
        </div>
        
        {/* Mock API Quota Block */}
        <div className="p-4 border-t border-white/10 bg-black/20 m-2 rounded-xl border border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Zap className="w-3 h-3 text-indigo-400"/> API Quota</span>
              <span className={`text-xs font-bold ${tokensUsed >= MAX_TOKENS ? "text-red-400" : "text-slate-300"}`}>{tokensUsed} / {MAX_TOKENS}</span>
           </div>
           <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div 
                 className={`h-full transition-all duration-500 ease-out ${tokensUsed >= MAX_TOKENS ? "bg-red-500" : "bg-linear-to-r from-indigo-500 to-purple-500"}`}
                 style={{ width: `${percentage}%` }}
              />
           </div>
           {tokensUsed >= MAX_TOKENS && <p className="text-[10px] text-red-400 mt-2 text-center uppercase tracking-wider font-bold animate-pulse">Daily Limit Reached!</p>}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col bg-slate-950/50 relative">
         {treeData && owner && repo ? (
            <ChatClient 
               owner={owner} 
               repo={repo} 
               defaultBranch={defaultBranch} 
               selectedFile={selectedFile} 
               onClearFile={() => setSelectedFile(null)}
               userImage={userImage}
               tokensUsed={tokensUsed}
               maxTokens={MAX_TOKENS}
               onDeductTokens={deductTokens}
            />
         ) : <div className="p-8 text-slate-400">Loading Workspace...</div>}
      </div>
    </div>
  );
}
