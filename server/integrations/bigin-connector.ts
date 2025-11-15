import { BaseConnector, type SyncResult, type WebhookData } from './base-connector';
import crypto from 'crypto';

export class BiginConnector extends BaseConnector {
  private readonly apiBaseUrl = 'https://www.zohoapis.com/bigin/v1';

  constructor() {
    super({
      clientId: process.env.BIGIN_CLIENT_ID || '',
      clientSecret: process.env.BIGIN_CLIENT_SECRET || '',
      redirectUri: process.env.BIGIN_REDIRECT_URI || 'http://localhost:5000/api/integrations/bigin/callback',
      authorizationUrl: 'https://accounts.zoho.com/oauth/v2/auth',
      tokenUrl: 'https://accounts.zoho.com/oauth/v2/token',
      scopes: ['ZohoBigin.modules.ALL', 'ZohoBigin.settings.ALL'],
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.makeRequest(`${this.apiBaseUrl}/Contacts?per_page=1`, {
        method: 'GET',
      });
      return true;
    } catch (error) {
      console.error('Bigin connection test failed:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/users?type=CurrentUser`, {
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
      const pipelines = await this.getAllPipelines();

      return {
        success: true,
        itemsSynced: pipelines.length,
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
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: any = await this.makeRequest(
        `${this.apiBaseUrl}/Contacts?page=${page}&per_page=200`,
        { method: 'GET' }
      );

      if (response.data && response.data.length > 0) {
        contacts.push(...response.data);
        page++;
      } else {
        hasMore = false;
      }
    }

    return contacts;
  }

  private async getAllCompanies(): Promise<any[]> {
    const companies: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: any = await this.makeRequest(
        `${this.apiBaseUrl}/Companies?page=${page}&per_page=200`,
        { method: 'GET' }
      );

      if (response.data && response.data.length > 0) {
        companies.push(...response.data);
        page++;
      } else {
        hasMore = false;
      }
    }

    return companies;
  }

  private async getAllPipelines(): Promise<any[]> {
    const pipelines: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response: any = await this.makeRequest(
        `${this.apiBaseUrl}/Pipelines?page=${page}&per_page=200`,
        { method: 'GET' }
      );

      if (response.data && response.data.length > 0) {
        pipelines.push(...response.data);
        page++;
      } else {
        hasMore = false;
      }
    }

    return pipelines;
  }

  async createContact(data: {
    First_Name: string;
    Last_Name: string;
    Email: string;
    Phone?: string;
    Company?: string;
  }): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/Contacts`, {
      method: 'POST',
      body: JSON.stringify({ data: [data] }),
    });
  }

  async updateContact(contactId: string, data: any): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/Contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: [data] }),
    });
  }

  async createCompany(data: {
    Company_Name: string;
    Industry?: string;
  }): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/Companies`, {
      method: 'POST',
      body: JSON.stringify({ data: [data] }),
    });
  }

  async updateCompany(companyId: string, data: any): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/Companies/${companyId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: [data] }),
    });
  }

  async createPipeline(data: {
    Pipeline_Name: string;
    Amount?: number;
    Stage?: string;
  }): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/Pipelines`, {
      method: 'POST',
      body: JSON.stringify({ data: [data] }),
    });
  }

  async updatePipeline(pipelineId: string, data: any): Promise<any> {
    return this.makeRequest(`${this.apiBaseUrl}/Pipelines/${pipelineId}`, {
      method: 'PUT',
      body: JSON.stringify({ data: [data] }),
    });
  }

  validateWebhook(payload: string, signature: string, secret: string): boolean {
    // Zoho uses HMAC-SHA256 for webhook validation
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
    console.log('Processing Bigin webhook:', data.event);

    // Handle different webhook events
    const module = (data.data as any).module;

    switch (module) {
      case 'Contacts':
        await this.syncContacts();
        break;
      case 'Companies':
        await this.syncCompanies();
        break;
      case 'Pipelines':
        await this.syncDeals();
        break;
      default:
        console.log('Unhandled Bigin module:', module);
    }
  }
}
