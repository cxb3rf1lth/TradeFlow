import crypto from 'crypto';

export class OAuthHelper {
  /**
   * Generate a secure random state parameter for OAuth
   */
  static generateState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Verify state parameter to prevent CSRF attacks
   */
  static verifyState(state: string, expectedState: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(state),
      Buffer.from(expectedState)
    );
  }

  /**
   * Calculate token expiration timestamp
   */
  static calculateExpiresAt(expiresIn?: number): Date | null {
    if (!expiresIn) return null;
    const now = new Date();
    now.setSeconds(now.getSeconds() + expiresIn);
    return now;
  }

  /**
   * Check if token is expired or about to expire (within 5 minutes)
   */
  static isTokenExpired(expiresAt: Date | null): boolean {
    if (!expiresAt) return false;
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);
    return expiresAt <= fiveMinutesFromNow;
  }

  /**
   * Generate PKCE code verifier
   */
  static generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString('base64url');
  }

  /**
   * Generate PKCE code challenge from verifier
   */
  static generateCodeChallenge(verifier: string): string {
    return crypto
      .createHash('sha256')
      .update(verifier)
      .digest('base64url');
  }

  /**
   * Parse OAuth callback query parameters
   */
  static parseCallbackParams(url: string): {
    code?: string;
    state?: string;
    error?: string;
    errorDescription?: string;
  } {
    const urlObj = new URL(url);
    return {
      code: urlObj.searchParams.get('code') || undefined,
      state: urlObj.searchParams.get('state') || undefined,
      error: urlObj.searchParams.get('error') || undefined,
      errorDescription: urlObj.searchParams.get('error_description') || undefined,
    };
  }
}

/**
 * Temporary in-memory storage for OAuth states
 * In production, use Redis or database
 */
export class OAuthStateStore {
  private static states = new Map<string, {
    state: string;
    userId: string;
    integrationId: string;
    createdAt: Date;
  }>();

  static set(state: string, userId: string, integrationId: string): void {
    this.states.set(state, {
      state,
      userId,
      integrationId,
      createdAt: new Date(),
    });

    // Clean up expired states (older than 10 minutes)
    this.cleanup();
  }

  static get(state: string): {
    userId: string;
    integrationId: string;
  } | null {
    const data = this.states.get(state);
    if (!data) return null;

    // Verify not expired (10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    if (data.createdAt < tenMinutesAgo) {
      this.states.delete(state);
      return null;
    }

    return {
      userId: data.userId,
      integrationId: data.integrationId,
    };
  }

  static delete(state: string): void {
    this.states.delete(state);
  }

  private static cleanup(): void {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    for (const [key, value] of this.states.entries()) {
      if (value.createdAt < tenMinutesAgo) {
        this.states.delete(key);
      }
    }
  }
}
