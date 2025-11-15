import crypto from 'crypto';
import type { Webhook } from '../../shared/schema';
import { IntegrationFactory, type IntegrationType } from '../integrations/integration-factory';
import { automationEngine } from './automation-engine';

export interface WebhookPayload {
  integrationId: string;
  integrationType: IntegrationType;
  event: string;
  data: any;
  timestamp: Date;
  signature?: string;
}

export class WebhookService {
  /**
   * Process incoming webhook
   */
  async processWebhook(
    payload: WebhookPayload,
    webhook: Webhook
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Validate webhook if signature is provided
      if (payload.signature && webhook.secret) {
        const isValid = this.validateSignature(
          JSON.stringify(payload.data),
          payload.signature,
          webhook.secret,
          payload.integrationType
        );

        if (!isValid) {
          return {
            success: false,
            message: 'Invalid webhook signature',
          };
        }
      }

      // Get the appropriate connector
      const connector = IntegrationFactory.createConnector(payload.integrationType);

      // Process webhook through connector
      await connector.processWebhook({
        event: payload.event,
        data: payload.data,
        timestamp: payload.timestamp,
      });

      // Trigger automation rules based on webhook event
      await this.triggerAutomations(payload);

      return {
        success: true,
        message: 'Webhook processed successfully',
      };
    } catch (error: any) {
      console.error('Webhook processing failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Validate webhook signature based on integration type
   */
  private validateSignature(
    payload: string,
    signature: string,
    secret: string,
    integrationType: IntegrationType
  ): boolean {
    try {
      const connector = IntegrationFactory.createConnector(integrationType);
      return connector.validateWebhook(payload, signature, secret);
    } catch (error) {
      console.error('Signature validation failed:', error);
      return false;
    }
  }

  /**
   * Trigger automation rules based on webhook event
   */
  private async triggerAutomations(payload: WebhookPayload): Promise<void> {
    // This would query the database for automation rules that match the webhook event
    // For now, we'll log it
    console.log('Checking for automation rules triggered by:', payload.event);

    // Example: trigger automations
    // const rules = await db.query.automationRules.findMany({
    //   where: (rule) => rule.trigger.includes(payload.event)
    // });
    //
    // for (const rule of rules) {
    //   await automationEngine.executeAutomation(rule, {
    //     trigger: { type: payload.event, data: payload.data },
    //     user: { id: rule.createdBy, role: 'user' }
    //   });
    // }
  }

  /**
   * Register a webhook with an external service
   */
  async registerWebhook(
    integrationType: IntegrationType,
    callbackUrl: string,
    events: string[],
    secret: string
  ): Promise<{ success: boolean; webhookId?: string; message: string }> {
    try {
      const connector = IntegrationFactory.createConnector(integrationType);

      // Different integrations have different webhook registration methods
      // This is a simplified version
      console.log('Registering webhook:', {
        integration: integrationType,
        url: callbackUrl,
        events,
      });

      // Generate webhook secret if not provided
      const webhookSecret = secret || crypto.randomBytes(32).toString('hex');

      return {
        success: true,
        webhookId: crypto.randomUUID(),
        message: 'Webhook registered successfully',
      };
    } catch (error: any) {
      console.error('Webhook registration failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Unregister a webhook from an external service
   */
  async unregisterWebhook(
    integrationType: IntegrationType,
    webhookId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Unregistering webhook:', {
        integration: integrationType,
        webhookId,
      });

      return {
        success: true,
        message: 'Webhook unregistered successfully',
      };
    } catch (error: any) {
      console.error('Webhook unregistration failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Test webhook delivery
   */
  async testWebhook(
    webhookUrl: string,
    integrationType: IntegrationType
  ): Promise<{ success: boolean; message: string }> {
    try {
      const testPayload = {
        event: 'test',
        data: {
          message: 'This is a test webhook from TradeFlow',
          timestamp: new Date().toISOString(),
        },
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-TradeFlow-Event': 'test',
          'X-TradeFlow-Integration': integrationType,
        },
        body: JSON.stringify(testPayload),
      });

      if (!response.ok) {
        throw new Error(`Webhook test failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Webhook test successful',
      };
    } catch (error: any) {
      console.error('Webhook test failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats(webhookId: string): Promise<{
    totalDeliveries: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    lastDelivery?: Date;
    averageResponseTime?: number;
  }> {
    // This would query the database for webhook delivery logs
    // For now, return mock data
    return {
      totalDeliveries: 0,
      successfulDeliveries: 0,
      failedDeliveries: 0,
    };
  }

  /**
   * Retry failed webhook delivery
   */
  async retryWebhook(
    webhookUrl: string,
    payload: any
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Webhook retry failed: ${response.statusText}`);
      }

      return {
        success: true,
        message: 'Webhook retry successful',
      };
    } catch (error: any) {
      console.error('Webhook retry failed:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

// Export singleton instance
export const webhookService = new WebhookService();
