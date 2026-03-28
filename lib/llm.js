"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMAgent = void 0;
const generative_ai_1 = require("@google/generative-ai");
class LLMAgent {
    genAI;
    model;
    constructor(apiKey) {
        this.genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
        // Use gemini-2.5-flash as default, it's fast and good for code
        this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    }
    async generateCodeFix(issueDescription, currentCode) {
        const prompt = `
You are an expert AI coder. You are tasked with fixing a bug or adding a feature described below.
Here is the current code context:
\`\`\`
${currentCode}
\`\`\`

Here is the issue/request description:
"${issueDescription}"

Please provide ONLY the necessary code to replace the current code or add to it. Do not include markdown formatting or explanations, just the raw code. If the code should be completely replaced, provide the full final file. If no changes are needed, return the original code.
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Strip markdown blocks if the model included them despite instructions
            return text.replace(/^\`\`\`(typescript|javascript|python|.*)?\n/, "").replace(/\n\`\`\`$/, "").trim();
        }
        catch (error) {
            console.error("Error calling Gemini API", error);
            throw error;
        }
    }
    async generateTests(codeToTest) {
        const prompt = `
You are an expert AI software tester. Write robust unit tests for the following code. Use a standard testing framework appropriate for the language (e.g., Jest for JS/TS, PyTest for Python).

\`\`\`
${codeToTest}
\`\`\`

Provide ONLY the test code without markdown wrappers.
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            return text.replace(/^\`\`\`(typescript|javascript|python|.*)?\n/, "").replace(/\n\`\`\`$/, "").trim();
        }
        catch (error) {
            console.error("Error generating tests", error);
            throw error;
        }
    }
}
exports.LLMAgent = LLMAgent;
