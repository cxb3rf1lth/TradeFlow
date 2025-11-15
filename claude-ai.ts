import Anthropic from "@anthropic-ai/sdk";

export interface AIAnalysisResult {
  summary?: string;
  sentiment?: "positive" | "neutral" | "negative";
  priority?: "high" | "medium" | "low";
  actionItems?: string[];
  categories?: string[];
  suggestedResponse?: string;
  confidence?: number;
}

export class ClaudeAIService {
  private client: Anthropic;
  private model: string;

  constructor(apiKey: string, modelVersion?: string) {
    this.client = new Anthropic({
      apiKey,
    });
    this.model =
      modelVersion ||
      process.env.CLAUDE_MODEL_VERSION ||
      "claude-3-5-sonnet-20241022";
  }

  // ========== Email Analysis ==========

  async analyzeEmail(emailContent: string, subject: string): Promise<AIAnalysisResult> {
    try {
      const prompt = `Analyze the following email and provide:
1. A brief summary (2-3 sentences)
2. Sentiment (positive, neutral, or negative)
3. Priority level (high, medium, or low)
4. Action items (if any)
5. Suggested categories/tags

Email Subject: ${subject}
Email Content: ${emailContent}

Respond in JSON format with keys: summary, sentiment, priority, actionItems (array), categories (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        const result = JSON.parse(content.text);
        return {
          ...result,
          confidence: 0.85,
        };
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error analyzing email:", error);
      throw error;
    }
  }

  async generateEmailReply(
    emailContent: string,
    subject: string,
    context?: string
  ): Promise<string> {
    try {
      const prompt = `Generate a professional email reply to the following email.
${context ? `Context: ${context}\n` : ""}
Original Email Subject: ${subject}
Original Email Content: ${emailContent}

Generate a polite, professional reply that addresses the main points.`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return content.text;
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error generating email reply:", error);
      throw error;
    }
  }

  async summarizeEmailThread(emails: Array<{ from: string; content: string; date: string }>) {
    try {
      const threadText = emails
        .map((e) => `From: ${e.from}\nDate: ${e.date}\n${e.content}`)
        .join("\n\n---\n\n");

      const prompt = `Summarize the following email thread. Provide:
1. A brief overview of the conversation
2. Key decisions made
3. Outstanding action items
4. Next steps

Email Thread:
${threadText}

Respond in JSON format with keys: overview, decisions (array), actionItems (array), nextSteps (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error summarizing thread:", error);
      throw error;
    }
  }

  // ========== CRM Intelligence ==========

  async analyzeContact(contact: {
    name: string;
    email: string;
    company?: string;
    interactions: string[];
  }) {
    try {
      const prompt = `Analyze the following contact and their interaction history:
Name: ${contact.name}
Email: ${contact.email}
Company: ${contact.company || "N/A"}

Recent Interactions:
${contact.interactions.join("\n")}

Provide:
1. Engagement level (high, medium, low)
2. Relationship status
3. Suggested next steps
4. Tags/categories

Respond in JSON format with keys: engagementLevel, relationshipStatus, suggestedActions (array), tags (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error analyzing contact:", error);
      throw error;
    }
  }

  async suggestDealProbability(deal: {
    title: string;
    value: number;
    stage: string;
    age: number;
    contactHistory: string[];
  }) {
    try {
      const prompt = `Analyze this sales deal and suggest a win probability:
Title: ${deal.title}
Value: $${deal.value}
Current Stage: ${deal.stage}
Deal Age: ${deal.age} days

Contact History:
${deal.contactHistory.join("\n")}

Provide:
1. Win probability (0-100)
2. Risk factors
3. Recommended actions

Respond in JSON format with keys: probability (number), riskFactors (array), recommendations (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error analyzing deal:", error);
      throw error;
    }
  }

  // ========== Meeting Intelligence ==========

  async summarizeMeeting(transcript: string) {
    try {
      const prompt = `Summarize the following meeting transcript:

${transcript}

Provide:
1. Meeting summary (3-4 sentences)
2. Key discussion points
3. Decisions made
4. Action items with owners (if mentioned)
5. Follow-up needed

Respond in JSON format with keys: summary, keyPoints (array), decisions (array), actionItems (array), followUp (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error summarizing meeting:", error);
      throw error;
    }
  }

  // ========== Document Intelligence ==========

  async analyzeDocument(documentText: string, documentType?: string) {
    try {
      const prompt = `Analyze the following document${documentType ? ` (${documentType})` : ""}:

${documentText}

Provide:
1. Summary
2. Key information extracted
3. Suggested categories/tags
4. Important dates or deadlines (if any)

Respond in JSON format with keys: summary, keyInfo (object), categories (array), importantDates (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error analyzing document:", error);
      throw error;
    }
  }

  // ========== Task & Project Intelligence ==========

  async suggestTaskBreakdown(taskDescription: string) {
    try {
      const prompt = `Break down the following task into smaller, manageable subtasks:

Task: ${taskDescription}

Provide:
1. List of subtasks with descriptions
2. Estimated priority for each
3. Suggested order of execution
4. Potential dependencies

Respond in JSON format with keys: subtasks (array of {title, description, priority, order, dependencies})`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 2048,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error breaking down task:", error);
      throw error;
    }
  }

  async analyzeProjectHealth(project: {
    name: string;
    tasks: Array<{ title: string; status: string; dueDate?: string }>;
    teamMembers: number;
    startDate: string;
    targetDate: string;
  }) {
    try {
      const prompt = `Analyze the health of this project:
Name: ${project.name}
Team Size: ${project.teamMembers}
Start Date: ${project.startDate}
Target Completion: ${project.targetDate}

Tasks:
${project.tasks.map((t) => `- ${t.title}: ${t.status}${t.dueDate ? ` (due: ${t.dueDate})` : ""}`).join("\n")}

Provide:
1. Overall health status (healthy, at-risk, critical)
2. Completion percentage estimate
3. Identified risks
4. Recommendations

Respond in JSON format with keys: healthStatus, completionPercentage (number), risks (array), recommendations (array)`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error analyzing project health:", error);
      throw error;
    }
  }

  // ========== Conversational AI ==========

  async chat(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    systemContext?: string
  ) {
    try {
      const systemMessage = systemContext || "You are a helpful AI assistant integrated into TradeFlow, an enterprise business management platform. Help users with their tasks, provide insights, and assist with business operations.";

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        system: systemMessage,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      const content = response.content[0];
      if (content.type === "text") {
        return {
          content: content.text,
          tokens: response.usage,
        };
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error in chat:", error);
      throw error;
    }
  }

  // ========== Smart Suggestions ==========

  async suggestAutomation(context: {
    userActions: Array<{ action: string; timestamp: string }>;
    entityType: string;
  }) {
    try {
      const prompt = `Based on the user's recent actions, suggest automation opportunities:

Entity Type: ${context.entityType}
Recent Actions:
${context.userActions.map((a) => `- ${a.action} (${a.timestamp})`).join("\n")}

Provide:
1. Detected patterns
2. Automation suggestions
3. Expected time savings
4. Implementation complexity (low, medium, high)

Respond in JSON format with keys: patterns (array), suggestions (array of {title, description, timeSavings, complexity})`;

      const message = await this.client.messages.create({
        model: this.model,
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === "text") {
        return JSON.parse(content.text);
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error suggesting automation:", error);
      throw error;
    }
  }
}

export default ClaudeAIService;
