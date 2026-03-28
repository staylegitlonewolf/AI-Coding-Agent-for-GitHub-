"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitHubAgent = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
class GitHubAgent {
    octokit;
    owner;
    repo;
    constructor(token) {
        this.octokit = github.getOctokit(token);
        this.owner = github.context.repo.owner;
        this.repo = github.context.repo.repo;
    }
    // Read a single file from the repository
    async getFileContent(path, ref) {
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
        }
        catch (error) {
            core.warning(`Could not read file ${path}. It might not exist.`);
            return '';
        }
    }
    // High-level method to create a branch, commit a change, and open a PR
    async createPullRequest(branchName, title, body, files, baseBranch) {
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
        }
        catch (error) {
            if (error.status !== 422) { // 422 usually means ref exists
                throw error;
            }
            core.info(`Branch ${branchName} already exists, updating it.`);
        }
        // 3. Create a tree with new files
        const treeItems = files.map(f => ({
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
        }
        catch (error) {
            // Handle case where PR already exists
            if (error.status === 422 && error.message?.includes('A pull request already exists')) {
                core.info(`PR from ${branchName} to ${baseBranch} already exists.`);
                return null;
            }
            throw error;
        }
    }
    async getDefaultBranch() {
        const repoInfo = await this.octokit.rest.repos.get({
            owner: this.owner,
            repo: this.repo
        });
        return repoInfo.data.default_branch;
    }
}
exports.GitHubAgent = GitHubAgent;
