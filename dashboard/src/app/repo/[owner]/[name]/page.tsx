import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Octokit } from "@octokit/rest";
import { ChatClient } from "@/components/ChatClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function RepoPage({ params }: { params: { owner: string; name: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) redirect("/");

  const octokit = new Octokit({ auth: (session as any).accessToken });
  let repoData = null;
  let treeData: any[] = [];

  try {
     const { data: repo } = await octokit.rest.repos.get({ owner: params.owner, repo: params.name });
     repoData = repo;
     
     // Fetch default branch tree
     const { data: branch } = await octokit.rest.repos.getBranch({ owner: params.owner, repo: params.name, branch: repo.default_branch });
     const { data: tree } = await octokit.rest.git.getTree({ owner: params.owner, repo: params.name, tree_sha: branch.commit.sha, recursive: "1" });
     treeData = tree.tree.filter((t: any) => t.type === "blob"); // Only files
  } catch (e) {
     console.error("Error fetching repo or tree", e);
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0 hover:bg-white/10 transition">
        <div className="flex items-center gap-4">
           <Link href="/" className="p-2 hover:bg-white/10 rounded-full transition text-slate-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
           </Link>
           <h1 className="font-semibold text-white text-lg">{params.owner} / <span className="text-indigo-400">{params.name}</span></h1>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
         {/* Sidebar: File Tree */}
         <div className="w-64 border-r border-white/10 bg-slate-900/50 overflow-y-auto p-4 hidden md:block shrink-0">
           <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Repository Files</h2>
           <ul className="space-y-1">
             {treeData.slice(0, 50).map((file, i) => (
               <li key={i} className="text-sm text-slate-400 truncate opacity-80" title={file.path}>{file.path}</li>
             ))}
             {treeData.length > 50 && <li className="text-xs text-indigo-400 italic mt-2">...and {treeData.length - 50} more files</li>}
           </ul>
         </div>

         {/* Main Content: Chat Interface */}
         <div className="flex-1 flex flex-col bg-slate-950/50 relative">
            <ChatClient owner={params.owner} repo={params.name} defaultBranch={repoData?.default_branch || "main"} />
         </div>
      </div>
    </div>
  );
}
