import type { AutomationRule } from '../../shared/schema';
import { claudeAI } from './claude-ai';
import { IntegrationFactory } from '../integrations/integration-factory';

export interface AutomationContext {
  trigger: {
    type: string;
    data: any;
  };
  user: {
    id: string;
    role: string;
  };
}

export interface AutomationAction {
  type: string;
  config: any;
}

export class AutomationEngine {
  /**
   * Execute an automation rule
   */
  async executeAutomation(
    rule: AutomationRule,
    context: AutomationContext
  ): Promise<{ success: boolean; message: string }> {
    if (!rule.enabled) {
      return {
        success: false,
        message: 'Automation is disabled',
      };
    }

    try {
      // Parse trigger and action from JSON strings
      const trigger = typeof rule.trigger === 'string' ? JSON.parse(rule.trigger) : rule.trigger;
      const action = typeof rule.action === 'string' ? JSON.parse(rule.action) : rule.action;

      // Check if trigger matches
      if (!this.checkTrigger(trigger, context.trigger)) {
        return {
          success: false,
          message: 'Trigger condition not met',
        };
      }

      // Execute the action
      await this.executeAction(action, context);

      return {
        success: true,
        message: 'Automation executed successfully',
      };
    } catch (error: any) {
      console.error('Automation execution failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Check if trigger condition is met
   */
  private checkTrigger(
    trigger: any,
    contextTrigger: { type: string; data: any }
  ): boolean {
    if (trigger.type !== contextTrigger.type) {
      return false;
    }

    // Check conditions if specified
    if (trigger.conditions) {
      for (const condition of trigger.conditions) {
        if (!this.evaluateCondition(condition, contextTrigger.data)) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Evaluate a condition
   */
  private evaluateCondition(condition: any, data: any): boolean {
    const { field, operator, value } = condition;
    const fieldValue = this.getNestedValue(data, field);

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'not_equals':
        return fieldValue !== value;
      case 'contains':
        return String(fieldValue).includes(value);
      case 'not_contains':
        return !String(fieldValue).includes(value);
      case 'greater_than':
        return Number(fieldValue) > Number(value);
      case 'less_than':
        return Number(fieldValue) < Number(value);
      case 'is_empty':
        return !fieldValue || fieldValue === '';
      case 'is_not_empty':
        return fieldValue && fieldValue !== '';
      default:
        return false;
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Execute an automation action
   */
  private async executeAction(
    action: AutomationAction,
    context: AutomationContext
  ): Promise<void> {
    switch (action.type) {
      case 'send_email':
        await this.sendEmail(action.config, context);
        break;

      case 'create_task':
        await this.createTask(action.config, context);
        break;

      case 'update_crm':
        await this.updateCRM(action.config, context);
        break;

      case 'sync_integration':
        await this.syncIntegration(action.config, context);
        break;

      case 'ai_analysis':
        await this.performAIAnalysis(action.config, context);
        break;

      case 'send_notification':
        await this.sendNotification(action.config, context);
        break;

      case 'webhook':
        await this.callWebhook(action.config, context);
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Send email action
   */
  private async sendEmail(
    config: {
      to: string;
      subject: string;
      body: string;
      useAI?: boolean;
    },
    context: AutomationContext
  ): Promise<void> {
    let body = config.body;

    // Use AI to generate personalized email if enabled
    if (config.useAI) {
      body = await claudeAI.generateEmailResponse({
        originalEmail: config.body,
        tone: 'professional',
      });
    }

    // Replace template variables
    body = this.replaceTemplateVariables(body, context);

    console.log('Sending automated email:', { to: config.to, subject: config.subject });
    // Actual email sending would be implemented here using the email service
  }

  /**
   * Create task action
   */
  private async createTask(
    config: {
      title: string;
      description?: string;
      assignee?: string;
      priority?: string;
      dueDate?: string;
    },
    context: AutomationContext
  ): Promise<void> {
    const task = {
      ...config,
      title: this.replaceTemplateVariables(config.title, context),
      description: config.description
        ? this.replaceTemplateVariables(config.description, context)
        : undefined,
    };

    console.log('Creating automated task:', task);
    // Task creation would be implemented here
  }

  /**
   * Update CRM action
   */
  private async updateCRM(
    config: {
      entity: 'contact' | 'company' | 'deal';
      entityId?: string;
      updates: any;
    },
    context: AutomationContext
  ): Promise<void> {
    console.log('Updating CRM entity:', config.entity, config.updates);
    // CRM update would be implemented here
  }

  /**
   * Sync integration action
   */
  private async syncIntegration(
    config: {
      integration: string;
      syncType: 'contacts' | 'companies' | 'deals' | 'boards';
    },
    context: AutomationContext
  ): Promise<void> {
    console.log('Syncing integration:', config.integration, config.syncType);

    try {
      const connector = IntegrationFactory.createConnector(config.integration as any);

      switch (config.syncType) {
        case 'contacts':
          await connector.syncContacts();
          break;
        case 'companies':
          await connector.syncCompanies();
          break;
        case 'deals':
          await connector.syncDeals();
          break;
      }
    } catch (error) {
      console.error('Integration sync failed:', error);
    }
  }

  /**
   * Perform AI analysis action
   */
  private async performAIAnalysis(
    config: {
      analysisType: 'email' | 'deal' | 'contact' | 'sentiment';
      data: any;
    },
    context: AutomationContext
  ): Promise<void> {
    console.log('Performing AI analysis:', config.analysisType);

    switch (config.analysisType) {
      case 'email':
        const emailAnalysis = await claudeAI.analyzeEmail(config.data);
        console.log('Email analysis result:', emailAnalysis);
        break;

      case 'deal':
        const dealInsights = await claudeAI.analyzeDeal(config.data);
        console.log('Deal insights:', dealInsights);
        break;

      case 'contact':
        const contactInsights = await claudeAI.analyzeContact(config.data);
        console.log('Contact insights:', contactInsights);
        break;

      case 'sentiment':
        const sentiment = await claudeAI.analyzeSentiment(config.data.text);
        console.log('Sentiment analysis:', sentiment);
        break;
    }
  }

  /**
   * Send notification action
   */
  private async sendNotification(
    config: {
      channel: 'email' | 'teams' | 'slack';
      message: string;
      recipients: string[];
    },
    context: AutomationContext
  ): Promise<void> {
    const message = this.replaceTemplateVariables(config.message, context);
    console.log('Sending notification:', { channel: config.channel, message });
    // Notification sending would be implemented here
  }

  /**
   * Call webhook action
   */
  private async callWebhook(
    config: {
      url: string;
      method: 'GET' | 'POST' | 'PUT' | 'DELETE';
      headers?: Record<string, string>;
      body?: any;
    },
    context: AutomationContext
  ): Promise<void> {
    const response = await fetch(config.url, {
      method: config.method,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      body: config.body ? JSON.stringify(config.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Webhook call failed: ${response.statusText}`);
    }

    console.log('Webhook called successfully');
  }

  /**
   * Replace template variables in string
   */
  private replaceTemplateVariables(
    template: string,
    context: AutomationContext
  ): string {
    let result = template;

    // Replace {{trigger.field}} variables
    result = result.replace(/\{\{trigger\.(\w+)\}\}/g, (_, field) => {
      return this.getNestedValue(context.trigger.data, field) || '';
    });

    // Replace {{user.field}} variables
    result = result.replace(/\{\{user\.(\w+)\}\}/g, (_, field) => {
      return context.user[field as keyof typeof context.user] || '';
    });

    return result;
  }

  /**
   * Get automation suggestions based on user activity
   */
  async getAutomationSuggestions(
    userId: string,
    userRole: string,
    recentActivities: string[]
  ): Promise<any[]> {
    return claudeAI.suggestAutomations({
      userRole,
      recentActivities,
    });
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();
