import { BaseConnector, type SyncResult, type WebhookData } from './base-connector';
import crypto from 'crypto';

export class TrelloConnector extends BaseConnector {
  private readonly apiBaseUrl = 'https://api.trello.com/1';
  private apiKey: string;

  constructor() {
    super({
      clientId: process.env.TRELLO_API_KEY || '',
      clientSecret: process.env.TRELLO_API_SECRET || '',
      redirectUri: process.env.TRELLO_REDIRECT_URI || 'http://localhost:5000/api/integrations/trello/callback',
      authorizationUrl: 'https://trello.com/1/authorize',
      tokenUrl: 'https://trello.com/1/OAuthGetAccessToken',
      scopes: ['read', 'write'],
    });

    this.apiKey = process.env.TRELLO_API_KEY || '';
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      console.error('Trello connection test failed:', error);
      return false;
    }
  }

  async getUserInfo(): Promise<any> {
    return this.getCurrentUser();
  }

  private async getCurrentUser(): Promise<any> {
    return this.makeRequest(
      `${this.apiBaseUrl}/members/me?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'GET' }
    );
  }

  async syncContacts(): Promise<SyncResult> {
    // Trello doesn't have contacts - boards are the main entity
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  async syncCompanies(): Promise<SyncResult> {
    // Trello doesn't have companies
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  async syncDeals(): Promise<SyncResult> {
    // Trello doesn't have deals
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  async syncBoards(): Promise<SyncResult> {
    try {
      const boards = await this.getAllBoards();

      return {
        success: true,
        itemsSynced: boards.length,
      };
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  private async getAllBoards(): Promise<any[]> {
    return this.makeRequest(
      `${this.apiBaseUrl}/members/me/boards?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'GET' }
    );
  }

  async getBoard(boardId: string): Promise<any> {
    return this.makeRequest(
      `${this.apiBaseUrl}/boards/${boardId}?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'GET' }
    );
  }

  async getBoardLists(boardId: string): Promise<any[]> {
    return this.makeRequest(
      `${this.apiBaseUrl}/boards/${boardId}/lists?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'GET' }
    );
  }

  async getListCards(listId: string): Promise<any[]> {
    return this.makeRequest(
      `${this.apiBaseUrl}/lists/${listId}/cards?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'GET' }
    );
  }

  async createBoard(name: string, description?: string): Promise<any> {
    const params = new URLSearchParams({
      key: this.apiKey,
      token: this.token?.accessToken || '',
      name,
      ...(description && { desc: description }),
    });

    return this.makeRequest(
      `${this.apiBaseUrl}/boards?${params.toString()}`,
      { method: 'POST' }
    );
  }

  async createList(boardId: string, name: string): Promise<any> {
    const params = new URLSearchParams({
      key: this.apiKey,
      token: this.token?.accessToken || '',
      name,
      idBoard: boardId,
    });

    return this.makeRequest(
      `${this.apiBaseUrl}/lists?${params.toString()}`,
      { method: 'POST' }
    );
  }

  async createCard(listId: string, name: string, description?: string): Promise<any> {
    const params = new URLSearchParams({
      key: this.apiKey,
      token: this.token?.accessToken || '',
      idList: listId,
      name,
      ...(description && { desc: description }),
    });

    return this.makeRequest(
      `${this.apiBaseUrl}/cards?${params.toString()}`,
      { method: 'POST' }
    );
  }

  async updateCard(cardId: string, data: {
    name?: string;
    desc?: string;
    idList?: string;
    due?: string;
  }): Promise<any> {
    const params = new URLSearchParams({
      key: this.apiKey,
      token: this.token?.accessToken || '',
      ...data,
    });

    return this.makeRequest(
      `${this.apiBaseUrl}/cards/${cardId}?${params.toString()}`,
      { method: 'PUT' }
    );
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.makeRequest(
      `${this.apiBaseUrl}/cards/${cardId}?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'DELETE' }
    );
  }

  async addComment(cardId: string, text: string): Promise<any> {
    const params = new URLSearchParams({
      key: this.apiKey,
      token: this.token?.accessToken || '',
      text,
    });

    return this.makeRequest(
      `${this.apiBaseUrl}/cards/${cardId}/actions/comments?${params.toString()}`,
      { method: 'POST' }
    );
  }

  async createWebhook(callbackUrl: string, idModel: string): Promise<any> {
    const params = new URLSearchParams({
      key: this.apiKey,
      token: this.token?.accessToken || '',
      callbackURL: callbackUrl,
      idModel,
    });

    return this.makeRequest(
      `${this.apiBaseUrl}/webhooks?${params.toString()}`,
      { method: 'POST' }
    );
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.makeRequest(
      `${this.apiBaseUrl}/webhooks/${webhookId}?key=${this.apiKey}&token=${this.token?.accessToken}`,
      { method: 'DELETE' }
    );
  }

  validateWebhook(payload: string, signature: string, secret: string): boolean {
    // Trello uses a different webhook validation
    const base64Digest = crypto
      .createHmac('sha1', secret)
      .update(payload)
      .digest('base64');

    return signature === base64Digest;
  }

  async processWebhook(data: WebhookData): Promise<void> {
    console.log('Processing Trello webhook:', data.event);

    const action = (data.data as any).action;

    switch (action?.type) {
      case 'createCard':
      case 'updateCard':
      case 'deleteCard':
        // Sync the affected board
        await this.syncBoards();
        break;
      case 'createBoard':
      case 'updateBoard':
        await this.syncBoards();
        break;
      default:
        console.log('Unhandled Trello action:', action?.type);
    }
  }

  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Override to handle Trello's authentication in URL params
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Trello API request failed: ${error}`);
    }

    return response.json();
  }
}
