import Anthropic from '@anthropic-ai/sdk';

export interface EmailAnalysis {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  priority: 'high' | 'medium' | 'low';
  actionItems: string[];
  suggestedResponse?: string;
  topics: string[];
  keyEntities: {
    people: string[];
    companies: string[];
    dates: string[];
  };
}

export interface DealInsights {
  winProbability: number;
  riskFactors: string[];
  nextSteps: string[];
  competitorMentions: string[];
  dealHealth: 'healthy' | 'at-risk' | 'critical';
}

export interface ContactInsights {
  engagementScore: number;
  interests: string[];
  suggestedTopics: string[];
  communicationStyle: string;
  lastInteractionSummary: string;
}

export class ClaudeAIService {
  private client: Anthropic;
  private model: string = 'claude-3-5-sonnet-20241022';

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set in environment variables');
    }

    this.client = new Anthropic({
      apiKey,
    });
  }

  /**
   * Analyze an email and extract insights
   */
  async analyzeEmail(emailContent: {
    subject: string;
    body: string;
    from?: string;
    to?: string;
  }): Promise<EmailAnalysis> {
    const prompt = `Analyze the following email and provide detailed insights in JSON format.

Email Details:
Subject: ${emailContent.subject}
From: ${emailContent.from || 'Unknown'}
To: ${emailContent.to || 'Unknown'}

Body:
${emailContent.body}

Please provide a JSON response with the following structure:
{
  "summary": "Brief 1-2 sentence summary of the email",
  "sentiment": "positive, neutral, or negative",
  "priority": "high, medium, or low",
  "actionItems": ["List of action items extracted from the email"],
  "suggestedResponse": "A brief suggested response if needed",
  "topics": ["Main topics discussed"],
  "keyEntities": {
    "people": ["Names of people mentioned"],
    "companies": ["Company names mentioned"],
    "dates": ["Important dates mentioned"]
  }
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Analyze a deal and provide insights
   */
  async analyzeDeal(dealData: {
    name: string;
    value: number;
    stage: string;
    description?: string;
    notes?: string;
    contactHistory?: string[];
  }): Promise<DealInsights> {
    const prompt = `Analyze the following sales deal and provide insights in JSON format.

Deal Details:
Name: ${dealData.name}
Value: $${dealData.value}
Current Stage: ${dealData.stage}
Description: ${dealData.description || 'N/A'}
Notes: ${dealData.notes || 'N/A'}
Contact History: ${dealData.contactHistory?.join('\n') || 'N/A'}

Please provide a JSON response with:
{
  "winProbability": 0-100,
  "riskFactors": ["List of potential risks"],
  "nextSteps": ["Recommended next steps"],
  "competitorMentions": ["Any competitors mentioned"],
  "dealHealth": "healthy, at-risk, or critical"
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Generate insights about a contact
   */
  async analyzeContact(contactData: {
    name: string;
    email: string;
    company?: string;
    notes?: string;
    emailHistory?: string[];
    meetingNotes?: string[];
  }): Promise<ContactInsights> {
    const prompt = `Analyze the following contact and provide insights in JSON format.

Contact Details:
Name: ${contactData.name}
Email: ${contactData.email}
Company: ${contactData.company || 'N/A'}
Notes: ${contactData.notes || 'N/A'}
Email History: ${contactData.emailHistory?.join('\n') || 'N/A'}
Meeting Notes: ${contactData.meetingNotes?.join('\n') || 'N/A'}

Please provide a JSON response with:
{
  "engagementScore": 0-100,
  "interests": ["List of topics they're interested in"],
  "suggestedTopics": ["Topics to discuss in next conversation"],
  "communicationStyle": "Brief description of their communication style",
  "lastInteractionSummary": "Summary of last interaction"
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Generate a smart email response
   */
  async generateEmailResponse(context: {
    originalEmail: string;
    tone?: 'professional' | 'friendly' | 'casual';
    purpose?: string;
    keyPoints?: string[];
  }): Promise<string> {
    const prompt = `Generate a ${context.tone || 'professional'} email response to the following email.

Original Email:
${context.originalEmail}

${context.purpose ? `Purpose: ${context.purpose}` : ''}
${context.keyPoints ? `Key Points to Address:\n${context.keyPoints.join('\n')}` : ''}

Please provide only the email body text, ready to send.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    throw new Error('Failed to generate email response');
  }

  /**
   * Analyze meeting notes and extract action items
   */
  async analyzeMeetingNotes(notes: string): Promise<{
    summary: string;
    actionItems: Array<{
      task: string;
      assignee?: string;
      dueDate?: string;
    }>;
    decisions: string[];
    followUps: string[];
  }> {
    const prompt = `Analyze the following meeting notes and extract key information in JSON format.

Meeting Notes:
${notes}

Please provide a JSON response with:
{
  "summary": "Brief summary of the meeting",
  "actionItems": [
    {
      "task": "Description of action item",
      "assignee": "Person responsible (if mentioned)",
      "dueDate": "Due date (if mentioned)"
    }
  ],
  "decisions": ["Key decisions made"],
  "followUps": ["Follow-up items needed"]
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse AI response');
  }

  /**
   * Smart text summarization
   */
  async summarizeText(text: string, maxLength?: number): Promise<string> {
    const prompt = `Summarize the following text${maxLength ? ` in approximately ${maxLength} words` : ''}.

Text:
${text}

Provide only the summary text.`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }

    throw new Error('Failed to generate summary');
  }

  /**
   * Sentiment analysis for any text
   */
  async analyzeSentiment(text: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    confidence: number;
    emotions: string[];
  }> {
    const prompt = `Analyze the sentiment of the following text and provide a JSON response.

Text:
${text}

Please provide:
{
  "sentiment": "positive, neutral, or negative",
  "score": -1 to 1 (where -1 is very negative, 0 is neutral, 1 is very positive),
  "confidence": 0 to 1 (how confident you are in this analysis),
  "emotions": ["list of emotions detected"]
}`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse sentiment analysis');
  }

  /**
   * Generate smart suggestions for workflow automation
   */
  async suggestAutomations(context: {
    userRole: string;
    recentActivities: string[];
    painPoints?: string[];
  }): Promise<Array<{
    name: string;
    description: string;
    trigger: string;
    actions: string[];
    estimatedTimeSaved: string;
  }>> {
    const prompt = `Based on the following context, suggest workflow automations that would be helpful.

User Role: ${context.userRole}
Recent Activities:
${context.recentActivities.join('\n')}
${context.painPoints ? `Pain Points:\n${context.painPoints.join('\n')}` : ''}

Please provide a JSON array of automation suggestions:
[
  {
    "name": "Automation name",
    "description": "What it does",
    "trigger": "When it triggers",
    "actions": ["Actions it performs"],
    "estimatedTimeSaved": "Estimated time saved"
  }
]`;

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }

    throw new Error('Failed to parse automation suggestions');
  }

  /**
   * Chat interface for general queries
   */
  async chat(message: string, conversationHistory?: Array<{ role: 'user' | 'assistant', content: string }>): Promise<string> {
    const messages = [
      ...(conversationHistory || []),
      { role: 'user' as const, content: message },
    ];

    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2048,
      messages,
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text;
    }

    throw new Error('Failed to get chat response');
  }
}

// Export singleton instance
export const claudeAI = new ClaudeAIService();
