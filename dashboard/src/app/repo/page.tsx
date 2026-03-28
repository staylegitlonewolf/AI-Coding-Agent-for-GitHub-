"use client";
import { useEffect, useState, Suspense } from "react";
import { useAppContext } from "@/components/Providers";
import { Octokit } from "@octokit/rest";
import { ChatClient } from "@/components/ChatClient";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useSearchParams } from "next/navigation";

function RepoViewer() {
  const { githubToken, isLoaded } = useAppContext();
  const searchParams = useSearchParams();
  
  const owner = searchParams.get("owner");
  const name = searchParams.get("name");

  const [repoData, setRepoData] = useState<any>(null);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !githubToken || !owner || !name) return;

    const octokit = new Octokit({ auth: githubToken });
    
    octokit.rest.repos.get({ owner, repo: name }).then(res => {
       setRepoData(res.data);
       return octokit.rest.repos.getBranch({ owner, repo: name, branch: res.data.default_branch });
    }).then(branchRes => {
       return octokit.rest.git.getTree({ owner, repo: name, tree_sha: branchRes.data.commit.sha, recursive: "1" });
    }).then(treeRes => {
       setTreeData(treeRes.data.tree.filter((t: any) => t.type === "blob"));
       setLoading(false);
    }).catch(e => {
       console.error("Error fetching repo or tree", e);
       setLoading(false);
    });
  }, [githubToken, isLoaded, owner, name]);

  if (!isLoaded) return null;

  if (!githubToken) {
    return (
      <div className="p-12 text-center text-white">
        <h2>You must provide a PAT to view repositories.</h2>
        <Link href="/" className="text-indigo-400">Go Home</Link>
      </div>
    );
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
           {loading ? <p className="text-sm text-slate-600 animate-pulse">Loading tree...</p> : (
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
            ) : null}
         </div>
      </div>
    </div>
  );
}

export default function RepoPage() {
  return (
    <Suspense fallback={<div className="p-8 text-white">Loading interface...</div>}>
      <RepoViewer />
    </Suspense>
  );
}
