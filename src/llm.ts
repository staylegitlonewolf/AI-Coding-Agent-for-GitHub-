import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

export interface ILLMAgent {
  generateCodeFix(issueDescription: string, currentCode: string): Promise<string>;
  generateTests(codeToTest: string): Promise<string>;
}

export class GeminiAgent implements ILLMAgent {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" }); 
  }

  async generateCodeFix(issueDescription: string, currentCode: string): Promise<string> {
    const prompt = this.buildFixPrompt(issueDescription, currentCode);
    try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.cleanCode(response.text());
    } catch (error) {
        console.error("Error calling Gemini API", error);
        throw error;
    }
  }

  async generateTests(codeToTest: string): Promise<string> {
    const prompt = this.buildTestPrompt(codeToTest);
    try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        return this.cleanCode(response.text());
    } catch (error) {
        console.error("Error generating tests with Gemini", error);
        throw error;
    }
  }

  private buildFixPrompt(issue: string, code: string): string {
    return `You are an expert AI coder. Fix the bug or add the feature described below.
Context:
\`\`\`
${code}
\`\`\`
Issue: "${issue}"
Provide ONLY the necessary code to replace the current code. No markdown. No explanations.`;
  }

  private buildTestPrompt(code: string): string {
      return `You are an expert tester. Write unit tests for this code.
\`\`\`
${code}
\`\`\`
Provide ONLY the test code. No markdown. No explanations.`;
  }

  private cleanCode(text: string): string {
      return text.replace(/^\`\`\`(typescript|javascript|python|.*)?\n/, "").replace(/\n\`\`\`$/, "").trim();
  }
}

export class OpenAIAgent implements ILLMAgent {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async generateCodeFix(issueDescription: string, currentCode: string): Promise<string> {
    const prompt = this.buildFixPrompt(issueDescription, currentCode);
    try {
        // Using the new Responses API primitive for OpenAI
        const response = await (this.openai as any).responses.create({
            model: "gpt-4o", // Update to gpt-5 if using the new model, keeping 4o for now.
            input: prompt
        });
        return this.cleanCode(response.output_text || "");
    } catch (error) {
        console.error("Error calling OpenAI API", error);
        throw error;
    }
  }

  async generateTests(codeToTest: string): Promise<string> {
    const prompt = this.buildTestPrompt(codeToTest);
    try {
        const response = await (this.openai as any).responses.create({
            model: "gpt-4o",
            input: prompt
        });
        return this.cleanCode(response.output_text || "");
    } catch (error) {
        console.error("Error generating tests with OpenAI", error);
        throw error;
    }
  }

  private buildFixPrompt(issue: string, code: string): string {
    return `You are an expert AI coder. Fix the bug or add the feature described below.
Context:
\`\`\`
${code}
\`\`\`
Issue: "${issue}"
Provide ONLY the exact raw code replacement. Do not wrap in markdown tags like \`\`\`javascript. Just the code.`;
  }

  private buildTestPrompt(code: string): string {
      return `You are an expert tester. Write unit tests for this code.
\`\`\`
${code}
\`\`\`
Provide ONLY the exact raw test code. Do not wrap in markdown tags.`;
  }

  private cleanCode(text: string): string {
      return text.replace(/^\`\`\`(typescript|javascript|python|.*)?\n/, "").replace(/\n\`\`\`$/, "").trim();
  }
}

export function createLLMAgent(provider: string, apiKey: string): ILLMAgent {
    const p = provider.toLowerCase();
    if (p === 'openai' || p === 'codex') {
        return new OpenAIAgent(apiKey);
    }
    return new GeminiAgent(apiKey);
}
