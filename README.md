<div align="center">
  <img src="https://img.shields.io/badge/Agent-Neo_Matrix_Mode-indigo?style=for-the-badge" alt="AI Agent Badge" />
  <h1>AI Coding Agent & Control Center 🕶️✨</h1>

  <p><strong>A fully autonomous, dual-architecture AI Coding Agent that integrates directly into your GitHub repositories. Execute complex coding tasks securely from a premium Next.js UI, or let the bot autonomously handle GitHub Action PRs!</strong></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" /></a>
    <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss" /></a>
    <a href="https://openai.com"><img src="https://img.shields.io/badge/OpenAI-Codex%20%7C%20GPT--4o-412991?style=flat-square&logo=openai" /></a>
  </p>
</div>

---

## ⚡ Architecture Overview

This project is divided into two extremely powerful ecosystems that give you total control over your code generation:

1. **The AI Control Center (Web Dashboard)**: Located in the `dashboard/` directory. This is a secure, server-backed React Next.js application designed with Glassmorphic syntax. It hooks into GitHub OAuth so you (and invited collaborators) can authenticate with 1-click, select repositories, view the live file tree, and request direct code changes via the chat agent.
2. **The Asynchronous GitHub Agent (Backend)**: Located in the project root. This is a highly robust GitHub Action. By dropping it into any repo, the Action can listen asynchronously for code requests via Issues or PRs, spin up `OpenAI`, and automatically push functional code commits without involving the frontend.

## 🚀 The Control Center (Dashboard)

The frontend SaaS relies on `NextAuth.js` to provide 1-Click logging into your GitHub account securely. 

### Why Vercel?
For maximum security, this project is fully deployable via Vercel. This allows the backend Node/API proxy routes (`/api/auth` and `/api/chat`) to completely hide your `CODEX_API_KEY` from the browser. Your colleagues can use the "Login with GitHub" button smoothly, while the OpenAI API keys remain permanently hidden server-side.

### Local Setup & Deployment
To run the dashboard locally on your own machine:
```bash
git clone https://github.com/staylegitlonewolf/AI-Coding-Agent-for-GitHub-
cd dashboard
npm install
npm run dev
```

### 🌍 Vercel Production Deployment
To spin this up as a live SaaS application for your team:
1. Create a free project on [Vercel](https://vercel.com) and import this repository.
2. **Crucial:** Change the "Root Directory" dropdown inside Vercel setup to `dashboard/`.
3. In the Environment Variables section, configure the following keys:
    - `GITHUB_CLIENT_ID`: Create this in your GitHub Developer Settings (OAuth Apps).
    - `GITHUB_CLIENT_SECRET`: Generated securely from the OAuth Apps screen.
    - `CODEX_API_KEY`: Your valid OpenAI API string (sk-...).
    - `NEXTAUTH_SECRET`: A random combination of characters used to hash the encrypted web sessions.
4. Click Deploy. Enter the Matrix! 🟩

---

## 🤖 The Autonomous Agent (GitHub Actions)

If you'd like the Agent to run automatically entirely inside the GitHub UI:
1. Create an `action.yml` leveraging the built script inside `dist/index.js`.
2. Map your repository secrets.

<br>
<p align="center"><i>"Hello! I am your AI agent... Tell me what you'd like to build, fix, or add, and I'll generate the code directly."</i> 😎</p>
