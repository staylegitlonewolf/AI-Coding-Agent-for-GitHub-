import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";
import { ChatClient } from "@/components/ChatClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { redirect } from "next/navigation";

export default async function RepoPage({ params }: { params: Promise<{ owner: string; repo: string }> | { owner: string; repo: string } }) {
  // In Next.js 15, params is a promise
  const resolvedParams = await Promise.resolve(params);
  const owner = resolvedParams.owner || resolvedParams.owner;
  const name = resolvedParams.repo || (resolvedParams as any).name;

  const session = await getServerSession(authOptions);
  
  if (!session || !(session as any).accessToken) {
    redirect("/");
  }

  const octokit = new Octokit({ auth: (session as any).accessToken });
  let repoData = null;
  let treeData: any[] = [];

  try {
     const res = await octokit.rest.repos.get({ owner, repo: name });
     repoData = res.data;
     
     const branchRes = await octokit.rest.repos.getBranch({ owner, repo: name, branch: repoData.default_branch });
     const treeRes = await octokit.rest.git.getTree({ owner, repo: name, tree_sha: branchRes.data.commit.sha, recursive: "1" });
     treeData = treeRes.data.tree.filter((t: any) => t.type === "blob");
  } catch(e) {
     console.error("Error fetching repo or tree data server side:", e);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden text-slate-100 bg-slate-950">
      <header className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0 hover:bg-white/10 transition">
        <div className="flex items-center gap-4">
           <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
           </Link>
           <h1 className="font-semibold text-white text-lg">{owner} / <span className="text-indigo-400">{name}</span></h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
         <div className="w-64 border-r border-white/10 bg-slate-900/50 overflow-y-auto p-4 hidden md:block shrink-0">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Repository Files</h2>
           {treeData.length === 0 ? <p className="text-sm text-slate-600">Failed to load or empty repo.</p> : (
             <ul className="space-y-1">
               {treeData.slice(0, 50).map((file, i) => (
                 <li key={i} className="text-sm text-slate-400 truncate opacity-80 hover:opacity-100 cursor-default" title={file.path}>{file.path}</li>
               ))}
               {treeData.length > 50 && <li className="text-xs text-indigo-400 italic mt-2">...and {treeData.length - 50} more files</li>}
             </ul>
           )}
         </div>

         <div className="flex-1 flex flex-col bg-slate-950/50 relative">
            {repoData && owner && name ? (
               <ChatClient owner={owner} repo={name} defaultBranch={repoData.default_branch || "main"} />
            ) : <div className="p-8">Repo not found or permission denied.</div>}
         </div>
      </div>
    </div>
  );
}
