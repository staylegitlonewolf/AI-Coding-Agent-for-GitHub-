import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Octokit } from "@octokit/rest";
import { RepoWorkspace } from "@/components/RepoWorkspace";
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

      <RepoWorkspace 
         owner={owner} 
         repo={name} 
         defaultBranch={repoData?.default_branch || "main"} 
         treeData={treeData} 
         userImage={session.user?.image || null}
      />
    </div>
  );
}
