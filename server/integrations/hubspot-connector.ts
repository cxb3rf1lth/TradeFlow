import { BaseConnector, type SyncResult, type WebhookData } from './base-connector';
import crypto from 'crypto';

export class HubSpotConnector extends BaseConnector {
  private readonly apiBaseUrl = 'https://api.hubapi.com';

  constructor() {
    super({
      clientId: process.env.HUBSPOT_CLIENT_ID || '',
      clientSecret: process.env.HUBSPOT_CLIENT_SECRET || '',
      redirectUri: process.env.HUBSPOT_REDIRECT_URI || 'http://localhost:5000/api/integrations/hubspot/callback',
      authorizationUrl: 'https://app.hubspot.com/oauth/authorize',
      tokenUrl: 'https://api.hubapi.com/oauth/v1/token',
      scopes: ['crm.objects.contacts.read', 'crm.objects.contacts.write',
               'crm.objects.companies.read', 'crm.objects.companies.write',
               'crm.objects.deals.read', 'crm.objects.deals.write'],
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/contacts?limit=1`, {
        method: 'GET',
      });
      return true;
    } catch (error) {
      console.error('HubSpot connection test failed:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/oauth/v1/access-tokens/${this.token?.accessToken}`, {
      method: 'GET',
    });
  }

  async syncContacts(): Promise<SyncResult> {
    try {
      const contacts = await this.getAllContacts();

      return {
        success: true,
        itemsSynced: contacts.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async syncCompanies(): Promise<SyncResult> {
    try {
      const companies = await this.getAllCompanies();

      return {
        success: true,
        itemsSynced: companies.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async syncDeals(): Promise<SyncResult> {
    try {
      const deals = await this.getAllDeals();

      return {
        success: true,
        itemsSynced: deals.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  private async getAllContacts(): Promise<any[]> {
    const contacts: any[] = [];
    let after: string | undefined;

    do {
      const url = `${this.apiBaseUrl}/crm/v3/objects/contacts?limit=100${after ? `&after=${after}` : ''}`;
      const response: any = await this.makeRequest(url, { method: 'GET' });

      contacts.push(...response.results);
      after = response.paging?.next?.after;
    } while (after);

    return contacts;
  }

  private async getAllCompanies(): Promise<any[]> {
    const companies: any[] = [];
    let after: string | undefined;

    do {
      const url = `${this.apiBaseUrl}/crm/v3/objects/companies?limit=100${after ? `&after=${after}` : ''}`;
      const response: any = await this.makeRequest(url, { method: 'GET' });

      companies.push(...response.results);
      after = response.paging?.next?.after;
    } while (after);

    return companies;
  }

  private async getAllDeals(): Promise<any[]> {
    const deals: any[] = [];
    let after: string | undefined;

    do {
      const url = `${this.apiBaseUrl}/crm/v3/objects/deals?limit=100${after ? `&after=${after}` : ''}`;
      const response: any = await this.makeRequest(url, { method: 'GET' });

      deals.push(...response.results);
      after = response.paging?.next?.after;
    } while (after);

    return deals;
  }

  async createContact(data: {
    firstname: string;
    lastname: string;
    email: string;
    phone?: string;
    company?: string;
  }): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/contacts`, {
      method: 'POST',
      body: JSON.stringify({ properties: data }),
    });
  }

  async updateContact(contactId: string, data: any): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/contacts/${contactId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: data }),
    });
  }

  async createCompany(data: {
    name: string;
    domain?: string;
    industry?: string;
  }): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/companies`, {
      method: 'POST',
      body: JSON.stringify({ properties: data }),
    });
  }

  async updateCompany(companyId: string, data: any): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/companies/${companyId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: data }),
    });
  }

  async createDeal(data: {
    dealname: string;
    amount: number;
    dealstage: string;
    pipeline?: string;
  }): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/deals`, {
      method: 'POST',
      body: JSON.stringify({ properties: data }),
    });
  }

  async updateDeal(dealId: string, data: any): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/crm/v3/objects/deals/${dealId}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties: data }),
    });
  }

  validateWebhook(payload: string, signature: string, secret: string): boolean {
    const hash = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hash)
    );
  }

  async processWebhook(data: WebhookData): Promise<void> {
    console.log('Processing HubSpot webhook:', data.event);

    // Handle different webhook events
    switch (data.event) {
      case 'contact.creation':
      case 'contact.propertyChange':
        await this.syncContacts();
        break;
      case 'company.creation':
      case 'company.propertyChange':
        await this.syncCompanies();
        break;
      case 'deal.creation':
      case 'deal.propertyChange':
        await this.syncDeals();
        break;
      default:
        console.log('Unhandled webhook event:', data.event);
    }
  }

  async setupWebhook(webhookUrl: string, events: string[]): Promise<any> {
    // HubSpot webhooks are configured through the UI or app settings
    // This is a placeholder for future implementation
    throw new Error('HubSpot webhook setup must be done through the HubSpot app settings');
  }
}
