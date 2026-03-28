"use client";
import { X, BookOpen, Layers, AlertCircle, Terminal, CheckCircle2, FileJson, Info } from "lucide-react";

export type LearnData = {
  version: string;
  target: string;
  purpose: string;
  action: string;
  problems: string;
  plan: string;
  fix: string;
  warnings: string;
  neoMessage: string;
};

export function LearnSidebar({ 
  isOpen, 
  onClose, 
  data 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  data: LearnData | null 
}) {
  if (!isOpen) return null;

  const sections = [
    { title: "PURPOSE", icon: <Info className="w-4 h-4 text-blue-400" />, content: data?.purpose },
    { title: "ACTION", icon: <Terminal className="w-4 h-4 text-emerald-400" />, content: data?.action },
    { title: "PROBLEMS", icon: <AlertCircle className="w-4 h-4 text-red-400" />, content: data?.problems },
    { title: "PLAN", icon: <Layers className="w-4 h-4 text-amber-400" />, content: data?.plan },
    { title: "FIX", icon: <CheckCircle2 className="w-4 h-4 text-indigo-400" />, content: data?.fix },
    { title: "WARNINGS", icon: <AlertCircle className="w-4 h-4 text-rose-500" />, content: data?.warnings },
  ];

  return (
    <div className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
           <BookOpen className="w-5 h-5 text-indigo-400" />
           <h2 className="font-bold text-white text-sm uppercase tracking-wider">LEARN.md <span className="text-slate-500 text-xs ml-1">{data?.version || "v1.0"}</span></h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-linear-to-b from-slate-900 to-black">
        {data?.target && (
          <div className="bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
             <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Target Context</span>
             <div className="flex items-center gap-2 text-indigo-300 font-mono text-xs">
                <FileJson className="w-3.5 h-3.5" />
                {data.target}
             </div>
          </div>
        )}

        {sections.map((sec, idx) => (
          <section key={idx} className="space-y-2">
            <div className="flex items-center gap-2 opacity-60">
               {sec.icon}
               <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{sec.title}</h3>
            </div>
            <div className="p-3 bg-white/5 border border-white/5 rounded-xl text-sm text-slate-300 leading-relaxed font-light">
               {sec.content || "Generating data..."}
            </div>
          </section>
        ))}

        {data?.neoMessage && (
           <section className="space-y-2 pt-4">
              <div className="flex items-center gap-2 text-indigo-400">
                 <Terminal className="w-4 h-4" />
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]">NEOMATRIXMODE</h3>
              </div>
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/30 rounded-xl text-sm text-indigo-200 leading-relaxed italic border-dashed">
                 "{data.neoMessage}"
              </div>
           </section>
        )}
      </div>

      <footer className="p-4 border-t border-white/10 bg-black/40">
         <button className="w-full bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
            Export to LEARN.md
         </button>
      </footer>
    </div>
  );
}
