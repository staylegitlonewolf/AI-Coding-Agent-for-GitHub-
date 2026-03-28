import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";
import { CodeSquare, Github } from "lucide-react";
import Link from "next/link";
import { ButtonLogout, ButtonLogin } from "@/components/AuthButtons";

export default async function Home() {
  const session = await getServerSession(authOptions);
  let repos: any[] = [];

  if (session && (session as any).accessToken) {
    const octokit = new Octokit({ auth: (session as any).accessToken });
    try {
      const resp = await octokit.rest.repos.listForAuthenticatedUser({ sort: "updated", per_page: 30 });
      repos = resp.data;
    } catch(e) {
      console.error("Failed to fetch GitHub repos", e);
    }
  }

  return (
    <main className="flex flex-col min-h-screen relative overflow-hidden">
      <header className="p-6 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md relative z-20">
        <div className="flex items-center gap-2">
           <CodeSquare className="text-indigo-400 w-6 h-6"/>
           <h1 className="text-xl font-bold tracking-tight">AI Control Center</h1>
        </div>
        {session ? <ButtonLogout user={session.user} /> : null}
      </header>
      
      <div className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 relative z-10">
        {!session ? (
           <div className="flex flex-col items-center justify-center pt-32 text-center">
              <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                 <Github className="w-12 h-12 text-indigo-400" />
              </div>
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                Deploy AI Agents <br/> Directly to GitHub.
              </h2>
              <p className="text-slate-400 max-w-lg mb-8 text-lg">
                Login with your GitHub account to visually select your repositories, chat with the AI, and have it deploy robust code fixes right to your codebase.
              </p>
              <ButtonLogin />
           </div>
        ) : (
           <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {session.user?.name}</h2>
                <p className="text-slate-400">Select a repository below to open the AI Agent Chat and start writing code.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {repos.map((repo: any) => (
                    <Link href={`/repo/${repo.owner.login}/${repo.name}`} key={repo.id}>
                      <div className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition group cursor-pointer h-full flex flex-col backdrop-blur-md">
                         <div className="flex items-center gap-3 mb-3">
                            <Github className="w-5 h-5 text-slate-400 group-hover:text-white transition" />
                            <h3 className="font-semibold text-white truncate">{repo.name}</h3>
                         </div>
                         <p className="text-slate-400 text-sm flex-1">{repo.description || "No description provided."}</p>
                         <div className="text-xs text-indigo-400 mt-4 flex justify-between">
                            <span>{repo.language || "Unknown repo"}</span>
                            <span>{new Date(repo.updated_at).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </Link>
                 ))}
                 {repos.length === 0 && <p className="text-slate-500">No repositories found. Did you give permission?</p>}
              </div>
           </div>
        )}
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
    </main>
  );
}
