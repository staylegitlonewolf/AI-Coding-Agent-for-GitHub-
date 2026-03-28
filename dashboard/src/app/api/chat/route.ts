import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { owner, repo, branch, prompt } = await req.json();
    
    const openai = new OpenAI({ apiKey: process.env.CODEX_API_KEY || process.env.OPENAI_API_KEY || "dummy" });
    
    // Using the Responses API primitive
    const response = await (openai as any).responses.create({
       model: "gpt-4o",
       input: `You are the AI Control Center Agent for the repository ${owner}/${repo} on branch ${branch}.
The user has said: "${prompt}"

Respond naturally to the user. Explain how you would implement this change. (Note: in this version, file modification tools are mocked). Keep it concise, helpful, and under 2 paragraphs.`
    });

    return NextResponse.json({ reply: response.output_text });
  } catch(e) {
    console.error("Chat API error", e);
    return NextResponse.json({ reply: "I successfully received your command, but the OpenAI API key is missing or invalid in the Dashboard .env!" });
  }
}
