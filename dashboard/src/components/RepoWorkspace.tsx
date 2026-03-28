"use client";
import { useState, useEffect } from "react";
import { ChatClient } from "./ChatClient";
import { LearnSidebar, LearnData } from "./LearnSidebar";
import { FileCode2, Zap, BookOpen } from "lucide-react";

export function RepoWorkspace({ 
  owner, 
  repo, 
  defaultBranch, 
  treeData, 
  userImage 
}: { 
  owner: string; 
  repo: string; 
  defaultBranch: string; 
  treeData: any[]; 
  userImage: string | null 
}) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [learnData, setLearnData] = useState<LearnData | null>(null);
  
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

  const handleOpenLearn = (data: LearnData) => {
     setLearnData(data);
     setIsLearnOpen(true);
  };

  const percentage = Math.min((tokensUsed / MAX_TOKENS) * 100, 100);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Interactive Sidebar */}
      <div className="w-64 border-r border-white/10 bg-slate-900/50 flex flex-col hidden md:flex shrink-0">
        <div className="flex-1 overflow-y-auto p-4">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
              Repository Files
              <span className="text-[10px] bg-white/5 py-0.5 px-2 rounded-full border border-white/10">{treeData.length}</span>
           </h2>
           {treeData.length === 0 ? <p className="text-sm text-slate-600 px-2 italic">No files found.</p> : (
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
             </ul>
           )}
        </div>
        
        {/* Mock API Quota Block */}
        <div className="p-4 border-t border-white/10 bg-black/20 m-2 rounded-xl border border-white/10 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
           <div className="flex justify-between items-center mb-2 px-1">
              <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5"><Zap className="w-3 h-3 text-indigo-400"/> API Quota</span>
              <span className={`text-xs font-bold ${tokensUsed >= MAX_TOKENS ? "text-red-400" : "text-slate-300"}`}>{tokensUsed} / {MAX_TOKENS}</span>
           </div>
           <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                 className={`h-full transition-all duration-700 ease-out border-r border-white/20 ${tokensUsed >= MAX_TOKENS ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-linear-to-r from-indigo-500 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]"}`}
                 style={{ width: `${percentage}%` }}
              />
           </div>
           {tokensUsed >= MAX_TOKENS && <p className="text-[10px] text-red-400 mt-2 text-center uppercase tracking-wider font-bold animate-pulse">Daily Limit Reached!</p>}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className={`flex-1 flex flex-col bg-slate-950/50 relative transition-all duration-300 ${isLearnOpen ? 'mr-0' : 'mr-0'}`}>
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
               onOpenLearn={handleOpenLearn}
            />
         ) : <div className="p-8 text-slate-400 flex flex-col items-center justify-center h-full">
            <Zap className="w-12 h-12 text-indigo-500 animate-pulse mb-4 opacity-20" />
            Loading Workspace Context...
         </div>}
      </div>

      {/* Right Learn Sidebar */}
      <LearnSidebar 
         isOpen={isLearnOpen} 
         onClose={() => setIsLearnOpen(false)} 
         data={learnData}
      />
    </div>
  );
}
