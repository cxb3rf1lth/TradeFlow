import { HubSpotConnector } from './hubspot-connector';
import { TrelloConnector } from './trello-connector';
import { BiginConnector } from './bigin-connector';
import {
  OneDriveConnector,
  OneNoteConnector,
  OutlookConnector,
  TeamsConnector,
} from './microsoft-connector';
import type { BaseConnector } from './base-connector';

export type IntegrationType =
  | 'hubspot'
  | 'trello'
  | 'bigin'
  | 'onedrive'
  | 'onenote'
  | 'outlook'
  | 'teams';

export class IntegrationFactory {
  /**
   * Create a connector instance for the specified integration type
   */
  static createConnector(type: IntegrationType): BaseConnector {
    switch (type) {
      case 'hubspot':
        return new HubSpotConnector();
      case 'trello':
        return new TrelloConnector();
      case 'bigin':
        return new BiginConnector();
      case 'onedrive':
        return new OneDriveConnector();
      case 'onenote':
        return new OneNoteConnector();
      case 'outlook':
        return new OutlookConnector();
      case 'teams':
        return new TeamsConnector();
      default:
        throw new Error(`Unknown integration type: ${type}`);
    }
  }

  /**
   * Get list of all available integrations
   */
  static getAvailableIntegrations(): Array<{
    type: IntegrationType;
    name: string;
    description: string;
    category: string;
    features: string[];
  }> {
    return [
      {
        type: 'hubspot',
        name: 'HubSpot',
        description: 'CRM and marketing automation platform',
        category: 'CRM',
        features: ['Contacts', 'Companies', 'Deals', 'Email Integration'],
      },
      {
        type: 'trello',
        name: 'Trello',
        description: 'Project management and collaboration tool',
        category: 'Project Management',
        features: ['Boards', 'Lists', 'Cards', 'Checklists', 'Comments'],
      },
      {
        type: 'bigin',
        name: 'Bigin by Zoho CRM',
        description: 'Simple CRM for small businesses',
        category: 'CRM',
        features: ['Contacts', 'Companies', 'Pipelines', 'Activities'],
      },
      {
        type: 'onedrive',
        name: 'Microsoft OneDrive',
        description: 'Cloud file storage and sharing',
        category: 'Storage',
        features: ['File Storage', 'File Sharing', 'Document Sync'],
      },
      {
        type: 'onenote',
        name: 'Microsoft OneNote',
        description: 'Digital note-taking application',
        category: 'Productivity',
        features: ['Notes', 'Notebooks', 'Sections', 'Pages'],
      },
      {
        type: 'outlook',
        name: 'Microsoft Outlook',
        description: 'Email and calendar management',
        category: 'Email',
        features: ['Email Sync', 'Calendar', 'Contacts', 'Send Emails'],
      },
      {
        type: 'teams',
        name: 'Microsoft Teams',
        description: 'Team collaboration and messaging',
        category: 'Communication',
        features: ['Teams', 'Channels', 'Messages', 'Chat'],
      },
    ];
  }

  /**
   * Check if integration requires OAuth
   */
  static requiresOAuth(type: IntegrationType): boolean {
    // All current integrations use OAuth
    return true;
  }

  /**
   * Get integration capabilities
   */
  static getCapabilities(type: IntegrationType): {
    supportsContacts: boolean;
    supportsCompanies: boolean;
    supportsDeals: boolean;
    supportsBoards: boolean;
    supportsFiles: boolean;
    supportsNotes: boolean;
    supportsEmail: boolean;
    supportsChat: boolean;
  } {
    const capabilities = {
      hubspot: {
        supportsContacts: true,
        supportsCompanies: true,
        supportsDeals: true,
        supportsBoards: false,
        supportsFiles: false,
        supportsNotes: false,
        supportsEmail: true,
        supportsChat: false,
      },
      trello: {
        supportsContacts: false,
        supportsCompanies: false,
        supportsDeals: false,
        supportsBoards: true,
        supportsFiles: false,
        supportsNotes: false,
        supportsEmail: false,
        supportsChat: false,
      },
      bigin: {
        supportsContacts: true,
        supportsCompanies: true,
        supportsDeals: true,
        supportsBoards: false,
        supportsFiles: false,
        supportsNotes: false,
        supportsEmail: false,
        supportsChat: false,
      },
      onedrive: {
        supportsContacts: false,
        supportsCompanies: false,
        supportsDeals: false,
        supportsBoards: false,
        supportsFiles: true,
        supportsNotes: false,
        supportsEmail: false,
        supportsChat: false,
      },
      onenote: {
        supportsContacts: false,
        supportsCompanies: false,
        supportsDeals: false,
        supportsBoards: false,
        supportsFiles: false,
        supportsNotes: true,
        supportsEmail: false,
        supportsChat: false,
      },
      outlook: {
        supportsContacts: true,
        supportsCompanies: false,
        supportsDeals: false,
        supportsBoards: false,
        supportsFiles: false,
        supportsNotes: false,
        supportsEmail: true,
        supportsChat: false,
      },
      teams: {
        supportsContacts: false,
        supportsCompanies: false,
        supportsDeals: false,
        supportsBoards: false,
        supportsFiles: false,
        supportsNotes: false,
        supportsEmail: false,
        supportsChat: true,
      },
    };

    return capabilities[type];
  }
}
