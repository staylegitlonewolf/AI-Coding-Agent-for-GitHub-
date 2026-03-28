import * as core from '@actions/core';
import * as github from '@actions/github';

export class GitHubAgent {
  private octokit: ReturnType<typeof github.getOctokit>;
  private owner: string;
  private repo: string;

  constructor(token: string) {
    this.octokit = github.getOctokit(token);
    this.owner = github.context.repo.owner;
    this.repo = github.context.repo.repo;
  }

  // Read a single file from the repository
  async getFileContent(path: string, ref?: string): Promise<string> {
    try {
      const response = await this.octokit.rest.repos.getContent({
        owner: this.owner,
        repo: this.repo,
        path,
        ref: ref || github.context.sha,
      });

      if (Array.isArray(response.data)) {
         throw new Error("Path is a directory, not a file.");
      }

      if (response.data.type !== 'file' || !response.data.content) {
         throw new Error("Invalid response or missing content.");
      }

      return Buffer.from(response.data.content, 'base64').toString('utf8');
    } catch (error) {
      core.warning(`Could not read file ${path}. It might not exist.`);
      return '';
    }
  }

  // High-level method to create a branch, commit a change, and open a PR
  async createPullRequest(branchName: string, title: string, body: string, files: { path: string, content: string }[], baseBranch?: string) {
    baseBranch = baseBranch || (await this.getDefaultBranch());
    
    // 1. Get base branch SHA
    const baseRef = await this.octokit.rest.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${baseBranch}`,
    });
    const baseSha = baseRef.data.object.sha;

    // 2. Create new branch
    const branchRef = `refs/heads/${branchName}`;
    try {
        await this.octokit.rest.git.createRef({
            owner: this.owner,
            repo: this.repo,
            ref: branchRef,
            sha: baseSha,
        });
    } catch (error: any) {
        if (error.status !== 422) { // 422 usually means ref exists
            throw error;
        }
        core.info(`Branch ${branchName} already exists, updating it.`);
    }

    // 3. Create a tree with new files
    const treeItems: any[] = files.map(f => ({
      path: f.path,
      mode: '100644', // file
      type: 'blob',
      content: f.content,
    }));

    // Get the base tree SHA
    const baseCommit = await this.octokit.rest.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: baseSha
    });
    const baseTreeSha = baseCommit.data.tree.sha;

    const newTree = await this.octokit.rest.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: baseTreeSha,
      tree: treeItems,
    });

    // 4. Create Commit
    const newCommit = await this.octokit.rest.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: title,
      tree: newTree.data.sha,
      parents: [baseSha],
    });

    // 5. Update Ref
    await this.octokit.rest.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${branchName}`,
      sha: newCommit.data.sha,
      force: true
    });

    // 6. Create Pull Request
    try {
        const pr = await this.octokit.rest.pulls.create({
            owner: this.owner,
            repo: this.repo,
            title,
            head: branchName,
            base: baseBranch,
            body,
        });
        core.info(`Created PR: ${pr.data.html_url}`);
        return pr.data.html_url;
    } catch(error: any) {
        // Handle case where PR already exists
        if (error.status === 422 && error.message?.includes('A pull request already exists')) {
             core.info(`PR from ${branchName} to ${baseBranch} already exists.`);
             return null;
        }
        throw error;
    }
  }

  async getDefaultBranch(): Promise<string> {
    const repoInfo = await this.octokit.rest.repos.get({
        owner: this.owner,
        repo: this.repo
    });
    return repoInfo.data.default_branch;
  }
}
