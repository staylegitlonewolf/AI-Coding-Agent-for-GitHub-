"use client";
import { useSession, signOut, signIn } from "next-auth/react";
import { useState, useEffect } from "react";
import { Octokit } from "@octokit/rest";
import { CodeSquare, GitBranch, Settings, Eye, EyeOff, LayoutGrid, Key, ChevronRight, Lock, Zap } from "lucide-react";
import Link from "next/link";
import { ButtonLogin, ButtonLogout } from "@/components/AuthButtons";

export default function Home() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<any[]>([]);
  const [hiddenRepos, setHiddenRepos] = useState<string[]>([]);
  const [showManageRepos, setShowManageRepos] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [repoLoading, setRepoLoading] = useState(false);

  useEffect(() => {
    // Load hidden repos from storage
    const saved = localStorage.getItem("agent_hidden_repos");
    if (saved) setHiddenRepos(JSON.parse(saved));
    
    if (session?.accessToken) {
       fetchRepos(session.accessToken);
    }
  }, [session]);

  const fetchRepos = async (token: string) => {
    setRepoLoading(true);
    const octokit = new Octokit({ auth: token });
    try {
      const resp = await octokit.rest.repos.listForAuthenticatedUser({ sort: "updated", per_page: 50 });
      setRepos(resp.data);
    } catch (e) {
      console.error("Failed to fetch Github repos", e);
    } finally {
      setRepoLoading(false);
    }
  };

  const toggleHideRepo = (fullName: string) => {
    const updated = hiddenRepos.includes(fullName) 
      ? hiddenRepos.filter(r => r !== fullName) 
      : [...hiddenRepos, fullName];
    setHiddenRepos(updated);
    localStorage.setItem("agent_hidden_repos", JSON.stringify(updated));
  };

  const handleAccessCodeLogin = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!accessCode) return;
     setLoginLoading(true);
     const result = await signIn("access-code", {
        code: accessCode,
        redirect: false,
     });
     setLoginLoading(false);
     if (result?.error) {
        alert("Invalid access code or PAT. Please check your GitHub settings.");
     }
  };

  const filteredRepos = repos.filter(r => !hiddenRepos.includes(r.full_name));

  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden bg-slate-950">
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-2">
           <CodeSquare className="text-indigo-400 w-6 h-6"/>
           <h1 className="text-xl font-bold tracking-tight text-white">AI Control Center</h1>
        </div>
        <div className="flex items-center gap-4">
           {session && (
              <button 
                onClick={() => setShowManageRepos(!showManageRepos)}
                className={`text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full transition-all border ${showManageRepos ? 'bg-indigo-500 text-white border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
              >
                 Repos
              </button>
           )}
           {session?.user?.image && (
              <Link href="/profile" className="hover:opacity-80 transition active:scale-95">
                 <img src={session.user.image} className="w-8 h-8 rounded-full border border-indigo-500/50" alt="Avatar" />
              </Link>
           )}
           {session ? <ButtonLogout /> : null}
        </div>
      </header>
      
      <div className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        {!session ? (
           <div className="flex flex-col items-center justify-center pt-16 text-center">
              <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                 <GitBranch className="w-12 h-12 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
                Professional OPS Hub.
              </h2>
              <p className="text-slate-400 max-w-lg mb-12 text-md">
                Secure AI workspace management. Sign in with GitHub OAuth or use a personal access code for one-time sessions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
                 <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-4 group hover:bg-white/10 transition">
                    <LayoutGrid className="w-10 h-10 text-indigo-400 group-hover:scale-110 transition" />
                    <h3 className="font-bold text-lg text-white">Developer Login</h3>
                    <p className="text-xs text-slate-500 mb-4">Standard OAuth 2.0 flow for full workspace permissions.</p>
                    <ButtonLogin />
                 </div>
                 
                 <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center gap-4 group hover:bg-white/10 transition">
                    <Lock className="w-10 h-10 text-purple-400 group-hover:scale-110 transition" />
                    <h3 className="font-bold text-lg text-white">Access via Code</h3>
                    <p className="text-xs text-slate-500 mb-4">Use a Personal Access Token (classic) for client access.</p>
                    <form onSubmit={handleAccessCodeLogin} className="w-full flex flex-col gap-2">
                       <input 
                         type="password" 
                         value={accessCode}
                         onChange={(e) => setAccessCode(e.target.value)}
                         placeholder="Paste GHP Token or Proxy Code..." 
                         className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:ring-1 focus:ring-purple-500/50"
                       />
                       <button type="submit" disabled={loginLoading} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-xl text-xs transition uppercase tracking-widest">
                          {loginLoading ? "Verifying..." : "Sign In with Code"}
                       </button>
                    </form>
                 </div>
              </div>
           </div>
        ) : (
           <div>
              <div className="mb-8 p-8 rounded-3xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 border border-white/10 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                   {session.user?.image && <img src={session.user.image} className="w-20 h-20 rounded-full border-2 border-indigo-500/50 shadow-lg shadow-indigo-500/20" alt="Avatar" />}
                   <div className="flex-1">
                      <h2 className="text-3xl font-extrabold text-white mb-1">Welcome back, {session.user?.name || session.user?.email || "Agent"}</h2>
                      <p className="text-slate-400 text-sm">Workspace Sync: <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Active Neo Mode</span></p>
                   </div>
                   <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Quota</p>
                         <p className="text-lg font-bold text-white leading-tight">Mock Demo</p>
                      </div>
                      <Zap className="w-8 h-8 text-indigo-400" />
                   </div>
                </div>
              </div>

              {showManageRepos ? (
                <div className="mb-12 animate-in fade-in duration-500">
                   <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6 px-1">Repository Management</h3>
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {repos.map((repo: any) => (
                         <div key={repo.id} className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between">
                            <span className={`text-xs font-bold truncate pr-4 ${hiddenRepos.includes(repo.full_name) ? 'line-through text-slate-600 italic' : 'text-slate-300'}`}>{repo.name}</span>
                            <button onClick={() => toggleHideRepo(repo.full_name)} className={`p-1.5 rounded-md transition ${hiddenRepos.includes(repo.full_name) ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
                               {hiddenRepos.includes(repo.full_name) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                         </div>
                      ))}
                   </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-500">
                  {filteredRepos.map((repo: any) => (
                     <Link href={`/repo/${repo.owner.login}/${repo.name}`} key={repo.id} className="group">
                       <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition cursor-pointer h-full flex flex-col group-hover:translate-y--1 group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] relative">
                          <div className="absolute top-4 right-4 text-indigo-500/0 group-hover:text-indigo-400 transition transform group-hover:translate-x-1 group-hover:translate-y--1">
                             <ChevronRight className="w-5 h-5" />
                          </div>
                          <div className="flex items-center gap-4 mb-6">
                             <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ring-1 ring-white/10 group-hover:ring-indigo-500/50 group-hover:bg-indigo-500/10 transition">
                                <GitBranch className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition" />
                             </div>
                             <h3 className="font-bold text-lg text-white truncate">{repo.name}</h3>
                          </div>
                          <p className="text-slate-400 text-sm flex-1 leading-relaxed opacity-80">{repo.description || "Production workspace for agentic operations."}</p>
                          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400 mt-8 flex justify-between items-center opacity-60 group-hover:opacity-100 transition">
                             <span>{repo.language || "Native Repo"}</span>
                             <span className="bg-white/5 px-3 py-1 rounded-full">{new Date(repo.updated_at).toLocaleDateString()}</span>
                          </div>
                       </div>
                     </Link>
                  ))}
                  {filteredRepos.length === 0 && (
                     <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 opacity-40">
                        <LayoutGrid className="w-12 h-12 text-slate-600" />
                        <p className="text-sm font-bold uppercase tracking-widest text-slate-400 italic">Workspace Filter Active. No public repos showing.</p>
                     </div>
                  )}
                </div>
              )}
           </div>
        )}
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </main>
  );
}
