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
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const llm_1 = require("./llm");
const github_1 = require("./github");
async function run() {
    try {
        const token = core.getInput('github-token', { required: true });
        const llmApiKey = core.getInput('llm-api-key', { required: true });
        const githubAgent = new github_1.GitHubAgent(token);
        const llmAgent = new llm_1.LLMAgent(llmApiKey);
        const context = github.context;
        core.info(`Received event: ${context.eventName}`);
        // Handle Issue Comments
        if (context.eventName === 'issue_comment' && context.payload.action === 'created') {
            const commentBody = context.payload.comment?.body || '';
            const issueUrl = context.payload.issue?.html_url || '';
            if (commentBody.startsWith('/ai fix')) {
                core.info(`Processing /ai fix command on issue: ${issueUrl}`);
                await handleIssueFix(githubAgent, llmAgent, context);
            }
            else if (commentBody.startsWith('/ai test')) {
                core.info(`Processing /ai test command on PR: ${issueUrl}`);
                await handlePRTest(githubAgent, llmAgent, context);
            }
            else {
                core.info('Comment did not start with an /ai command, ignoring.');
            }
        }
        else {
            core.info('Event not supported or not a comment creation.');
        }
    }
    catch (error) {
        if (error instanceof Error) {
            core.setFailed(error.message);
        }
        else {
            core.setFailed(String(error));
        }
    }
}
async function handleIssueFix(githubAgent, llmAgent, context) {
    // 1. Get the issue details
    const issueTitle = context.payload.issue?.title || '';
    const issueBody = context.payload.issue?.body || '';
    // In a real implementation, you'd likely want to fetch the whole repository, 
    // or use RAG to find relevant files. Here, as a prototype, we'll try to guess 
    // files based on text or just edit a specific file if mentioned.
    // For simplicity, let's assume we are maintaining a specific main file for now
    // or you could prompt the LLM to provide file paths along with code.
    const fileToEdit = 'index.js'; // Fallback file
    const fileContent = await githubAgent.getFileContent(fileToEdit);
    core.info(`Asking LLM to fix issue: ${issueTitle}`);
    const generatedFix = await llmAgent.generateCodeFix(`Title: ${issueTitle}\n\nDescription: ${issueBody}`, fileContent);
    if (generatedFix === fileContent || !generatedFix) {
        core.info("LLM determined no fix was needed or was unable to generate a fix.");
        return;
    }
    // 3. Create a Pull Request with the fix
    const branchName = `ai-fix-issue-${context.payload.issue?.number}`;
    await githubAgent.createPullRequest(branchName, `AI Fix: ${issueTitle}`, `This PR provides an AI-generated fix for issue #${context.payload.issue?.number}.`, [{ path: fileToEdit, content: generatedFix }]);
}
async function handlePRTest(githubAgent, llmAgent, context) {
    if (!context.payload.issue?.pull_request) {
        core.info("Command /ai test was not on a pull request.");
        return;
    }
    // In a full implementation, you'd fetch the PR diff and generate tests for the diff.
    // Here is the skeleton.
    core.info("Generating tests based on PR context...");
    // 1. Fetch PR details using Octokit
    const octokit = github.getOctokit(core.getInput('github-token'));
    const pullNumber = context.payload.issue.number;
    const { owner, repo } = context.repo;
    const prFiles = await octokit.rest.pulls.listFiles({
        owner,
        repo,
        pull_number: pullNumber
    });
    const testsToCommit = [];
    for (const file of prFiles.data) {
        if (file.filename.endsWith('.js') || file.filename.endsWith('.ts')) {
            const fileContent = await githubAgent.getFileContent(file.filename, context.payload.issue?.head?.sha); // Assuming we can get head sha
            if (fileContent) {
                const tests = await llmAgent.generateTests(fileContent);
                testsToCommit.push({
                    path: file.filename.replace(/\.(js|ts)$/, '.test.$1'),
                    content: tests
                });
            }
        }
    }
    if (testsToCommit.length > 0) {
        // Find PR branch
        const prInfo = await octokit.rest.pulls.get({
            owner, repo, pull_number: pullNumber
        });
        // This is complex - you need to create a commit on the PR's branch.
        const branchName = prInfo.data.head.ref;
        await githubAgent.createPullRequest(branchName, "Add AI tests", "Added AI generated tests.", testsToCommit, prInfo.data.base.ref);
        // Note: createPullRequest as written creates a new PR. To push to an existing branch,
        // github.ts needs a simpler `commitToBranch` method. This is a simplification for the demo.
    }
}
run();
