"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Octokit } from "@octokit/rest";
import { X, MessageSquare, AlertCircle, ExternalLink, RefreshCw } from "lucide-react";

export function IssuesSidebar({ 
  isOpen, 
  onCloseAction, 
  owner, 
  repo 
}: { 
  isOpen: boolean; 
  onCloseAction: () => void; 
  owner: string; 
  repo: string; 
}) {
  const { data: session } = useSession();
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && session?.accessToken) {
      fetchIssues();
    }
  }, [isOpen, session]);

  const fetchIssues = async () => {
    if (!session?.accessToken) return;
    setLoading(true);
    const octokit = new Octokit({ auth: session.accessToken });
    try {
      const resp = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: "open",
        sort: "updated",
        per_page: 15
      });
      // Filter out PRs if necessary, but GitHub includes them in issues
      setIssues(resp.data.filter(i => !i.pull_request));
    } catch (e) {
      console.error("Failed to fetch issues", e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-y-0 right-0 w-80 md:w-96 bg-slate-900 border-l border-white/10 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
      <header className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2 text-indigo-400">
           <MessageSquare className="w-5 h-5" />
           <h2 className="font-bold text-white text-sm uppercase tracking-wider">Repository Issues</h2>
        </div>
        <div className="flex items-center gap-1">
           <button onClick={fetchIssues} className="p-1.5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
             <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
           </button>
           <button onClick={onCloseAction} className="p-1.5 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
             <X className="w-5 h-5" />
           </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-linear-to-b from-slate-900 to-black">
        {loading && issues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
             <RefreshCw className="w-8 h-8 animate-spin opacity-20" />
             <p className="text-xs uppercase tracking-widest font-bold">Fetching Workspace Logs...</p>
          </div>
        ) : (
          <>
            {issues.map((issue) => (
              <div key={issue.id} className="p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition group">
                 <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-bold text-sm text-slate-200 leading-tight group-hover:text-indigo-300 transition-colors">#{issue.number} {issue.title}</h3>
                    <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 opacity-50" />
                 </div>
                 <p className="text-xs text-slate-500 mb-3 line-clamp-2 italic opacity-80">{issue.body || "No description provided."}</p>
                 <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{new Date(issue.created_at).toLocaleDateString()}</span>
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:text-white p-1 hover:bg-white/5 rounded-md transition flex items-center gap-1">
                       View on GitHub <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                 </div>
              </div>
            ))}
            {issues.length === 0 && !loading && (
               <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 gap-4 opacity-50">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-bold uppercase tracking-widest">No issues open in this repo.</p>
               </div>
            )}
          </>
        )}
      </div>

      <footer className="p-4 border-t border-white/10 bg-black/40">
         <a 
           href={`https://github.com/${owner}/${repo}/issues/new`} 
           target="_blank" 
           rel="noopener noreferrer" 
           className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all block text-center shadow-lg shadow-indigo-500/10"
         >
            New Issue on Github
         </a>
      </footer>
    </div>
  );
}
