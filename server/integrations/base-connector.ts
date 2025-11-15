import type { IntegrationToken } from "../../shared/schema";

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  authorizationUrl: string;
  tokenUrl: string;
  scopes: string[];
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors?: string[];
}

export interface WebhookData {
  event: string;
  data: any;
  timestamp: Date;
}

export abstract class BaseConnector {
  protected config: OAuthConfig;
  protected token?: IntegrationToken;

  constructor(config: OAuthConfig) {
    this.config = config;
  }

  /**
   * Generate OAuth authorization URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.scopes.join(' '),
      state,
    });

    return `${this.config.authorizationUrl}?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    scope?: string;
  }> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        redirect_uri: this.config.redirectUri,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token exchange failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      scope: data.scope,
    };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
  }> {
    const response = await fetch(this.config.tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Token refresh failed: ${error}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  /**
   * Set the current token for API requests
   */
  setToken(token: IntegrationToken): void {
    this.token = token;
  }

  /**
   * Make authenticated API request
   */
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    if (!this.token) {
      throw new Error('No token set for API request');
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${this.token.accessToken}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API request failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Validate webhook signature
   */
  abstract validateWebhook(payload: string, signature: string, secret: string): boolean;

  /**
   * Process webhook data
   */
  abstract processWebhook(data: WebhookData): Promise<void>;

  /**
   * Sync contacts from platform to local database
   */
  abstract syncContacts(): Promise<SyncResult>;

  /**
   * Sync companies from platform to local database
   */
  abstract syncCompanies(): Promise<SyncResult>;

  /**
   * Sync deals from platform to local database
   */
  abstract syncDeals(): Promise<SyncResult>;

  /**
   * Test connection to the platform
   */
  abstract testConnection(): Promise<boolean>;

  /**
   * Get platform-specific user information
   */
  abstract getUserInfo(): Promise<any>;
}
