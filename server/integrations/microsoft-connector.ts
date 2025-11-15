import { BaseConnector, type SyncResult, type WebhookData } from './base-connector';
import crypto from 'crypto';

/**
 * Base class for all Microsoft integrations (OneDrive, OneNote, Outlook, Teams)
 * Uses Microsoft Graph API
 */
export abstract class MicrosoftConnector extends BaseConnector {
  protected readonly graphBaseUrl = 'https://graph.microsoft.com/v1.0';

  constructor(scopes: string[]) {
    super({
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      redirectUri: process.env.MICROSOFT_REDIRECT_URI || 'http://localhost:5000/api/integrations/microsoft/callback',
      authorizationUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
      tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      scopes,
    });
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getUserInfo();
      return true;
    } catch (error) {
      console.error('Microsoft connection test failed:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    return this.makeRequest(`${this.graphBaseUrl}/me`, {
      method: 'GET',
    });
  }

  validateWebhook(payload: string, signature: string, secret: string): boolean {
    // Microsoft uses a validation token approach
    // The actual validation depends on the subscription setup
    return true; // Implement based on specific requirements
  }
}

/**
 * OneDrive Connector for file storage and synchronization
 */
export class OneDriveConnector extends MicrosoftConnector {
  constructor() {
    super([
      'Files.ReadWrite.All',
      'Sites.ReadWrite.All',
      'offline_access',
    ]);
  }

  async syncContacts(): Promise<SyncResult> {
    // OneDrive doesn't have contacts
    return { success: true, itemsSynced: 0 };
  }

  async syncCompanies(): Promise<SyncResult> {
    // OneDrive doesn't have companies
    return { success: true, itemsSynced: 0 };
  }

  async syncDeals(): Promise<SyncResult> {
    // OneDrive doesn't have deals
    return { success: true, itemsSynced: 0 };
  }

  async syncFiles(): Promise<SyncResult> {
    try {
      const files = await this.getAllFiles();

      return {
        success: true,
        itemsSynced: files.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async getAllFiles(folderId?: string): Promise<any[]> {
    const endpoint = folderId
      ? `${this.graphBaseUrl}/me/drive/items/${folderId}/children`
      : `${this.graphBaseUrl}/me/drive/root/children`;

    const response: any = await this.makeRequest(endpoint, { method: 'GET' });
    return response.value || [];
  }

  async getFile(fileId: string): Promise<any> {
    return this.makeRequest(`${this.graphBaseUrl}/me/drive/items/${fileId}`, {
      method: 'GET',
    });
  }

  async uploadFile(fileName: string, content: Buffer, folderId?: string): Promise<any> {
    const endpoint = folderId
      ? `${this.graphBaseUrl}/me/drive/items/${folderId}:/${fileName}:/content`
      : `${this.graphBaseUrl}/me/drive/root:/${fileName}:/content`;

    return this.makeRequest(endpoint, {
      method: 'PUT',
      body: content,
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.makeRequest(`${this.graphBaseUrl}/me/drive/items/${fileId}`, {
      method: 'DELETE',
    });
  }

  async createFolder(name: string, parentId?: string): Promise<any> {
    const endpoint = parentId
      ? `${this.graphBaseUrl}/me/drive/items/${parentId}/children`
      : `${this.graphBaseUrl}/me/drive/root/children`;

    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        name,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      }),
    });
  }

  async processWebhook(data: WebhookData): Promise<void> {
    console.log('Processing OneDrive webhook:', data.event);
    await this.syncFiles();
  }
}

/**
 * OneNote Connector for notes synchronization
 */
export class OneNoteConnector extends MicrosoftConnector {
  constructor() {
    super([
      'Notes.ReadWrite.All',
      'offline_access',
    ]);
  }

  async syncContacts(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async syncCompanies(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async syncDeals(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async syncNotes(): Promise<SyncResult> {
    try {
      const notebooks = await this.getAllNotebooks();

      return {
        success: true,
        itemsSynced: notebooks.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async getAllNotebooks(): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/me/onenote/notebooks`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async getNotebook(notebookId: string): Promise<any> {
    return this.makeRequest(
      `${this.graphBaseUrl}/me/onenote/notebooks/${notebookId}`,
      { method: 'GET' }
    );
  }

  async getSections(notebookId: string): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/me/onenote/notebooks/${notebookId}/sections`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async getPages(sectionId: string): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/me/onenote/sections/${sectionId}/pages`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async createPage(sectionId: string, title: string, content: string): Promise<any> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>${title}</title></head>
        <body>${content}</body>
      </html>
    `;

    return this.makeRequest(
      `${this.graphBaseUrl}/me/onenote/sections/${sectionId}/pages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'text/html',
        },
        body: html,
      }
    );
  }

  async processWebhook(data: WebhookData): Promise<void> {
    console.log('Processing OneNote webhook:', data.event);
    await this.syncNotes();
  }
}

/**
 * Outlook Connector for email synchronization
 */
export class OutlookConnector extends MicrosoftConnector {
  constructor() {
    super([
      'Mail.ReadWrite',
      'Mail.Send',
      'Contacts.ReadWrite',
      'Calendars.ReadWrite',
      'offline_access',
    ]);
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
    return { success: true, itemsSynced: 0 };
  }

  async syncDeals(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async getAllContacts(): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/me/contacts`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async syncEmails(): Promise<SyncResult> {
    try {
      const messages = await this.getMessages();

      return {
        success: true,
        itemsSynced: messages.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async getMessages(folderId?: string, top: number = 50): Promise<any[]> {
    const endpoint = folderId
      ? `${this.graphBaseUrl}/me/mailFolders/${folderId}/messages?$top=${top}&$orderby=receivedDateTime desc`
      : `${this.graphBaseUrl}/me/messages?$top=${top}&$orderby=receivedDateTime desc`;

    const response: any = await this.makeRequest(endpoint, { method: 'GET' });
    return response.value || [];
  }

  async sendEmail(data: {
    subject: string;
    body: string;
    to: string[];
    cc?: string[];
    bcc?: string[];
  }): Promise<void> {
    const message = {
      message: {
        subject: data.subject,
        body: {
          contentType: 'HTML',
          content: data.body,
        },
        toRecipients: data.to.map(email => ({
          emailAddress: { address: email },
        })),
        ccRecipients: data.cc?.map(email => ({
          emailAddress: { address: email },
        })),
        bccRecipients: data.bcc?.map(email => ({
          emailAddress: { address: email },
        })),
      },
    };

    await this.makeRequest(`${this.graphBaseUrl}/me/sendMail`, {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  async processWebhook(data: WebhookData): Promise<void> {
    console.log('Processing Outlook webhook:', data.event);

    if (data.event.includes('mail')) {
      await this.syncEmails();
    } else if (data.event.includes('contact')) {
      await this.syncContacts();
    }
  }
}

/**
 * Microsoft Teams Connector for team collaboration
 */
export class TeamsConnector extends MicrosoftConnector {
  constructor() {
    super([
      'Team.ReadBasic.All',
      'Channel.ReadBasic.All',
      'ChannelMessage.Read.All',
      'ChannelMessage.Send',
      'offline_access',
    ]);
  }

  async syncContacts(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async syncCompanies(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async syncDeals(): Promise<SyncResult> {
    return { success: true, itemsSynced: 0 };
  }

  async syncTeams(): Promise<SyncResult> {
    try {
      const teams = await this.getAllTeams();

      return {
        success: true,
        itemsSynced: teams.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async getAllTeams(): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/me/joinedTeams`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async getChannels(teamId: string): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/teams/${teamId}/channels`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async getMessages(teamId: string, channelId: string): Promise<any[]> {
    const response: any = await this.makeRequest(
      `${this.graphBaseUrl}/teams/${teamId}/channels/${channelId}/messages`,
      { method: 'GET' }
    );
    return response.value || [];
  }

  async sendMessage(teamId: string, channelId: string, content: string): Promise<any> {
    return this.makeRequest(
      `${this.graphBaseUrl}/teams/${teamId}/channels/${channelId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          body: {
            content,
          },
        }),
      }
    );
  }

  async processWebhook(data: WebhookData): Promise<void> {
    console.log('Processing Teams webhook:', data.event);
    await this.syncTeams();
  }
}
