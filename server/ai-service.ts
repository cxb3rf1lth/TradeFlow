import Anthropic from "@anthropic-ai/sdk";
import type { Task } from "@shared/schema";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

class AIService {
  private async callClaude(prompt: string): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.warn("ANTHROPIC_API_KEY not set, returning mock response");
      return "AI service unavailable - API key not configured";
    }

    try {
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      });

      const content = message.content[0];
      return content.type === "text" ? content.text : "";
    } catch (error) {
      console.error("Claude API error:", error);
      throw new Error("AI service error");
    }
  }

  async categorizeTask(description: string): Promise<{ priority: string; category?: string }> {
    const prompt = `Analyze this task and suggest a priority level (low, medium, high, critical) and category:

Task: ${description}

Respond in JSON format:
{
  "priority": "low|medium|high|critical",
  "category": "category name",
  "reasoning": "brief explanation"
}`;

    const response = await this.callClaude(prompt);

    try {
      const parsed = JSON.parse(response);
      return {
        priority: parsed.priority || "medium",
        category: parsed.category,
      };
    } catch {
      return { priority: "medium" };
    }
  }

  async suggestPriority(description: string): Promise<{ priority: string; reasoning: string }> {
    const prompt = `Analyze this task description and suggest a priority level:

Task: ${description}

Respond in JSON format:
{
  "priority": "low|medium|high|critical",
  "reasoning": "brief explanation of why this priority was chosen"
}`;

    const response = await this.callClaude(prompt);

    try {
      const parsed = JSON.parse(response);
      return {
        priority: parsed.priority || "medium",
        reasoning: parsed.reasoning || "Standard priority",
      };
    } catch {
      return {
        priority: "medium",
        reasoning: "Unable to determine priority automatically",
      };
    }
  }

  async extractTasksFromText(text: string): Promise<Array<{ title: string; description?: string; priority?: string }>> {
    const prompt = `Extract action items and tasks from this text. Return as JSON array:

Text: ${text}

Respond in JSON format:
[
  {
    "title": "task title",
    "description": "optional description",
    "priority": "low|medium|high|critical"
  }
]`;

    const response = await this.callClaude(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  async generateEmailDraft(context: string, recipient: string, purpose: string): Promise<{ subject: string; body: string }> {
    const prompt = `Generate a professional email draft:

Context: ${context}
Recipient: ${recipient}
Purpose: ${purpose}

Respond in JSON format:
{
  "subject": "email subject line",
  "body": "email body with proper formatting"
}`;

    const response = await this.callClaude(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return {
        subject: "Email Subject",
        body: "Email content could not be generated",
      };
    }
  }

  async improveEmail(body: string): Promise<string> {
    const prompt = `Improve this email to make it more professional, clear, and concise:

${body}

Return only the improved email body, no JSON or explanation.`;

    return this.callClaude(prompt);
  }

  async summarizeNote(content: string): Promise<string> {
    const prompt = `Provide a concise summary of this note:

${content}

Keep the summary to 2-3 sentences.`;

    return this.callClaude(prompt);
  }

  async extractActionItems(content: string): Promise<string[]> {
    const prompt = `Extract action items from this note:

${content}

Respond as a JSON array of strings, each being one action item:
["action 1", "action 2", ...]`;

    const response = await this.callClaude(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return [];
    }
  }

  async generateInsights(tasks: Task[]): Promise<{ insights: string[]; summary: string }> {
    const taskSummary = tasks.map(t => `- ${t.title} (${t.status}, ${t.priority})`).join("\n");

    const prompt = `Analyze these tasks and provide insights:

${taskSummary}

Respond in JSON format:
{
  "insights": ["insight 1", "insight 2", "insight 3"],
  "summary": "overall summary of task status and recommendations"
}`;

    const response = await this.callClaude(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return {
        insights: ["Unable to generate insights"],
        summary: "Analysis unavailable",
      };
    }
  }

  async generateRecommendations(tasks: Task[]): Promise<{ recommendations: Array<{ title: string; description: string; priority: string }> }> {
    const taskSummary = tasks.map(t => `- ${t.title} (${t.status}, ${t.priority}, assigned: ${t.assigneeId || "unassigned"})`).join("\n");

    const prompt = `Based on these tasks, provide recommendations for workflow optimization:

${taskSummary}

Respond in JSON format:
{
  "recommendations": [
    {
      "title": "recommendation title",
      "description": "detailed description",
      "priority": "low|medium|high"
    }
  ]
}`;

    const response = await this.callClaude(prompt);

    try {
      return JSON.parse(response);
    } catch {
      return { recommendations: [] };
    }
  }
}

export const aiService = new AIService();
