import { storage } from "./db-storage";
import type { Integration } from "@shared/schema";

interface IntegrationCredentials {
  apiKey?: string;
  apiToken?: string;
  accessToken?: string;
  clientId?: string;
  clientSecret?: string;
  [key: string]: any;
}

interface SyncResult {
  success: boolean;
  itemsSynced: number;
  errors?: string[];
}

class IntegrationManager {
  async connect(type: string, credentials: IntegrationCredentials): Promise<Integration> {
    // Validate credentials based on type
    this.validateCredentials(type, credentials);

    // Create or update integration
    const existing = await storage.getIntegrationByType(type);

    if (existing) {
      const updated = await storage.updateIntegration(existing.id, {
        status: "connected",
        lastSync: new Date(),
      });
      return updated!;
    }

    const integration = await storage.createIntegration({
      name: this.getIntegrationName(type),
      type,
      status: "connected",
    });

    // Store credentials securely (in production, use encryption)
    // For now, we'll just mark as connected

    return integration;
  }

  async disconnect(integrationId: string): Promise<void> {
    await storage.updateIntegration(integrationId, {
      status: "disconnected",
    });
  }

  async sync(integrationId: string): Promise<SyncResult> {
    const integration = await storage.getIntegration(integrationId);

    if (!integration) {
      throw new Error("Integration not found");
    }

    if (integration.status !== "connected") {
      throw new Error("Integration not connected");
    }

    try {
      let result: SyncResult;

      switch (integration.type) {
        case "trello":
          result = await this.syncTrello(integration);
          break;
        case "jira":
          result = await this.syncJira(integration);
          break;
        case "hubspot":
          result = await this.syncHubSpot(integration);
          break;
        case "onedrive":
          result = await this.syncOneDrive(integration);
          break;
        case "teams":
          result = await this.syncTeams(integration);
          break;
        case "onenote":
          result = await this.syncOneNote(integration);
          break;
        case "netsuite":
          result = await this.syncNetSuite(integration);
          break;
        default:
          result = { success: false, itemsSynced: 0, errors: ["Unsupported integration type"] };
      }

      // Update last sync time
      await storage.updateIntegration(integrationId, {
        lastSync: new Date(),
      });

      return result;
    } catch (error: any) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [error.message],
      };
    }
  }

  async getStatus(integrationId: string): Promise<{ status: string; lastSync: Date | null; health: string }> {
    const integration = await storage.getIntegration(integrationId);

    if (!integration) {
      throw new Error("Integration not found");
    }

    return {
      status: integration.status,
      lastSync: integration.lastSync,
      health: this.determineHealth(integration),
    };
  }

  // Integration-specific sync methods
  private async syncTrello(integration: Integration): Promise<SyncResult> {
    // In production, this would use the Trello API
    // For now, return mock success
    console.log(`Syncing Trello integration: ${integration.id}`);

    // Simulate API call
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private async syncJira(integration: Integration): Promise<SyncResult> {
    console.log(`Syncing Jira integration: ${integration.id}`);
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private async syncHubSpot(integration: Integration): Promise<SyncResult> {
    console.log(`Syncing HubSpot integration: ${integration.id}`);
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private async syncOneDrive(integration: Integration): Promise<SyncResult> {
    console.log(`Syncing OneDrive integration: ${integration.id}`);
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private async syncTeams(integration: Integration): Promise<SyncResult> {
    console.log(`Syncing Teams integration: ${integration.id}`);
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private async syncOneNote(integration: Integration): Promise<SyncResult> {
    console.log(`Syncing OneNote integration: ${integration.id}`);
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private async syncNetSuite(integration: Integration): Promise<SyncResult> {
    console.log(`Syncing NetSuite integration: ${integration.id}`);
    return {
      success: true,
      itemsSynced: 0,
    };
  }

  private validateCredentials(type: string, credentials: IntegrationCredentials): void {
    // Basic validation - in production, verify with actual API
    const required: Record<string, string[]> = {
      trello: ["apiKey", "apiToken"],
      jira: ["email", "apiToken", "domain"],
      hubspot: ["accessToken"],
      onedrive: ["clientId", "clientSecret", "accessToken"],
      teams: ["clientId", "clientSecret", "accessToken"],
      onenote: ["accessToken"],
      netsuite: ["accountId", "consumerKey", "consumerSecret", "tokenId", "tokenSecret"],
    };

    const requiredFields = required[type] || [];

    for (const field of requiredFields) {
      if (!credentials[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }
  }

  private getIntegrationName(type: string): string {
    const names: Record<string, string> = {
      trello: "Trello",
      jira: "Jira",
      hubspot: "HubSpot",
      onedrive: "OneDrive",
      teams: "Microsoft Teams",
      onenote: "OneNote",
      netsuite: "NetSuite",
    };

    return names[type] || type;
  }

  private determineHealth(integration: Integration): string {
    if (integration.status !== "connected") {
      return "disconnected";
    }

    if (!integration.lastSync) {
      return "never_synced";
    }

    const hoursSinceSync = (Date.now() - integration.lastSync.getTime()) / (1000 * 60 * 60);

    if (hoursSinceSync < 24) {
      return "healthy";
    } else if (hoursSinceSync < 72) {
      return "warning";
    } else {
      return "stale";
    }
  }
}

export const integrationManager = new IntegrationManager();
