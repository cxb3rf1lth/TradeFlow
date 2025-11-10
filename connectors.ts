import axios, { AxiosInstance } from "axios";

// ========== Base Connector Interface ==========

export interface ConnectorConfig {
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  baseUrl?: string;
}

export interface SyncResult {
  success: boolean;
  synced: number;
  errors: string[];
  lastSyncTime: Date;
}

// ========== HubSpot Connector ==========

export class HubSpotConnector {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(config: ConnectorConfig) {
    if (!config.accessToken) {
      throw new Error("HubSpot access token is required");
    }
    this.accessToken = config.accessToken;
    this.client = axios.create({
      baseURL: "https://api.hubapi.com",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Contacts
  async getContacts(limit: number = 100, after?: string) {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get("/crm/v3/objects/contacts", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching HubSpot contacts:", error);
      throw error;
    }
  }

  async createContact(properties: any) {
    try {
      const response = await this.client.post("/crm/v3/objects/contacts", {
        properties,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating HubSpot contact:", error);
      throw error;
    }
  }

  async updateContact(contactId: string, properties: any) {
    try {
      const response = await this.client.patch(
        `/crm/v3/objects/contacts/${contactId}`,
        { properties }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating HubSpot contact:", error);
      throw error;
    }
  }

  // Companies
  async getCompanies(limit: number = 100, after?: string) {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get("/crm/v3/objects/companies", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching HubSpot companies:", error);
      throw error;
    }
  }

  async createCompany(properties: any) {
    try {
      const response = await this.client.post("/crm/v3/objects/companies", {
        properties,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating HubSpot company:", error);
      throw error;
    }
  }

  async updateCompany(companyId: string, properties: any) {
    try {
      const response = await this.client.patch(
        `/crm/v3/objects/companies/${companyId}`,
        { properties }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating HubSpot company:", error);
      throw error;
    }
  }

  // Deals
  async getDeals(limit: number = 100, after?: string) {
    try {
      const params: any = { limit };
      if (after) params.after = after;

      const response = await this.client.get("/crm/v3/objects/deals", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching HubSpot deals:", error);
      throw error;
    }
  }

  async createDeal(properties: any) {
    try {
      const response = await this.client.post("/crm/v3/objects/deals", {
        properties,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating HubSpot deal:", error);
      throw error;
    }
  }

  async updateDeal(dealId: string, properties: any) {
    try {
      const response = await this.client.patch(
        `/crm/v3/objects/deals/${dealId}`,
        { properties }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating HubSpot deal:", error);
      throw error;
    }
  }

  // Pipelines
  async getPipelines(objectType: string = "deals") {
    try {
      const response = await this.client.get(
        `/crm/v3/pipelines/${objectType}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching HubSpot pipelines:", error);
      throw error;
    }
  }

  // Sync
  async syncToTradeFlow(): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedCount = 0;

    try {
      // Sync contacts, companies, and deals
      const [contacts, companies, deals] = await Promise.all([
        this.getContacts(),
        this.getCompanies(),
        this.getDeals(),
      ]);

      syncedCount =
        contacts.results.length +
        companies.results.length +
        deals.results.length;

      return {
        success: true,
        synced: syncedCount,
        errors,
        lastSyncTime: new Date(),
      };
    } catch (error) {
      errors.push(`Sync error: ${error}`);
      return {
        success: false,
        synced: syncedCount,
        errors,
        lastSyncTime: new Date(),
      };
    }
  }
}

// ========== Trello Connector ==========

export class TrelloConnector {
  private client: AxiosInstance;
  private apiKey: string;
  private token: string;

  constructor(config: ConnectorConfig) {
    if (!config.apiKey || !config.accessToken) {
      throw new Error("Trello API key and token are required");
    }
    this.apiKey = config.apiKey;
    this.token = config.accessToken;

    this.client = axios.create({
      baseURL: "https://api.trello.com/1",
      params: {
        key: this.apiKey,
        token: this.token,
      },
    });
  }

  // Boards
  async getBoards() {
    try {
      const response = await this.client.get("/members/me/boards");
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello boards:", error);
      throw error;
    }
  }

  async getBoard(boardId: string) {
    try {
      const response = await this.client.get(`/boards/${boardId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello board:", error);
      throw error;
    }
  }

  async createBoard(name: string, desc?: string) {
    try {
      const response = await this.client.post("/boards", {
        name,
        desc,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Trello board:", error);
      throw error;
    }
  }

  // Lists
  async getLists(boardId: string) {
    try {
      const response = await this.client.get(`/boards/${boardId}/lists`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello lists:", error);
      throw error;
    }
  }

  async createList(boardId: string, name: string) {
    try {
      const response = await this.client.post("/lists", {
        name,
        idBoard: boardId,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Trello list:", error);
      throw error;
    }
  }

  // Cards
  async getCards(boardId: string) {
    try {
      const response = await this.client.get(`/boards/${boardId}/cards`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello cards:", error);
      throw error;
    }
  }

  async getCard(cardId: string) {
    try {
      const response = await this.client.get(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello card:", error);
      throw error;
    }
  }

  async createCard(listId: string, name: string, desc?: string) {
    try {
      const response = await this.client.post("/cards", {
        name,
        desc,
        idList: listId,
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Trello card:", error);
      throw error;
    }
  }

  async updateCard(cardId: string, updates: any) {
    try {
      const response = await this.client.put(`/cards/${cardId}`, updates);
      return response.data;
    } catch (error) {
      console.error("Error updating Trello card:", error);
      throw error;
    }
  }

  async deleteCard(cardId: string) {
    try {
      const response = await this.client.delete(`/cards/${cardId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting Trello card:", error);
      throw error;
    }
  }

  // Labels
  async getLabels(boardId: string) {
    try {
      const response = await this.client.get(`/boards/${boardId}/labels`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello labels:", error);
      throw error;
    }
  }

  // Members
  async getBoardMembers(boardId: string) {
    try {
      const response = await this.client.get(`/boards/${boardId}/members`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Trello board members:", error);
      throw error;
    }
  }

  // Sync
  async syncToTradeFlow(): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedCount = 0;

    try {
      const boards = await this.getBoards();

      for (const board of boards) {
        const [lists, cards] = await Promise.all([
          this.getLists(board.id),
          this.getCards(board.id),
        ]);
        syncedCount += 1 + lists.length + cards.length;
      }

      return {
        success: true,
        synced: syncedCount,
        errors,
        lastSyncTime: new Date(),
      };
    } catch (error) {
      errors.push(`Sync error: ${error}`);
      return {
        success: false,
        synced: syncedCount,
        errors,
        lastSyncTime: new Date(),
      };
    }
  }
}

// ========== Bigin Connector (Zoho Bigin) ==========

export class BiginConnector {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(config: ConnectorConfig) {
    if (!config.accessToken) {
      throw new Error("Bigin access token is required");
    }
    this.accessToken = config.accessToken;

    // Bigin uses Zoho API
    this.client = axios.create({
      baseURL: config.baseUrl || "https://www.zohoapis.com/bigin/v1",
      headers: {
        Authorization: `Zoho-oauthtoken ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Contacts
  async getContacts(page: number = 1, perPage: number = 200) {
    try {
      const response = await this.client.get("/Contacts", {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin contacts:", error);
      throw error;
    }
  }

  async createContact(data: any) {
    try {
      const response = await this.client.post("/Contacts", {
        data: [data],
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Bigin contact:", error);
      throw error;
    }
  }

  async updateContact(contactId: string, data: any) {
    try {
      const response = await this.client.put(`/Contacts/${contactId}`, {
        data: [data],
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Bigin contact:", error);
      throw error;
    }
  }

  // Companies
  async getCompanies(page: number = 1, perPage: number = 200) {
    try {
      const response = await this.client.get("/Accounts", {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin companies:", error);
      throw error;
    }
  }

  async createCompany(data: any) {
    try {
      const response = await this.client.post("/Accounts", {
        data: [data],
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Bigin company:", error);
      throw error;
    }
  }

  // Deals (called "Deals" in Bigin too)
  async getDeals(page: number = 1, perPage: number = 200) {
    try {
      const response = await this.client.get("/Deals", {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin deals:", error);
      throw error;
    }
  }

  async createDeal(data: any) {
    try {
      const response = await this.client.post("/Deals", {
        data: [data],
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Bigin deal:", error);
      throw error;
    }
  }

  async updateDeal(dealId: string, data: any) {
    try {
      const response = await this.client.put(`/Deals/${dealId}`, {
        data: [data],
      });
      return response.data;
    } catch (error) {
      console.error("Error updating Bigin deal:", error);
      throw error;
    }
  }

  // Pipelines
  async getPipelines() {
    try {
      const response = await this.client.get("/settings/pipelines");
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin pipelines:", error);
      throw error;
    }
  }

  // Products
  async getProducts(page: number = 1, perPage: number = 200) {
    try {
      const response = await this.client.get("/Products", {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin products:", error);
      throw error;
    }
  }

  // Notes
  async getNotes(module: string, recordId: string) {
    try {
      const response = await this.client.get(`/${module}/${recordId}/Notes`);
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin notes:", error);
      throw error;
    }
  }

  async createNote(module: string, recordId: string, noteContent: string) {
    try {
      const response = await this.client.post(`/${module}/${recordId}/Notes`, {
        data: [
          {
            Note_Content: noteContent,
          },
        ],
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Bigin note:", error);
      throw error;
    }
  }

  // Tasks
  async getTasks(page: number = 1, perPage: number = 200) {
    try {
      const response = await this.client.get("/Tasks", {
        params: {
          page,
          per_page: perPage,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching Bigin tasks:", error);
      throw error;
    }
  }

  async createTask(data: any) {
    try {
      const response = await this.client.post("/Tasks", {
        data: [data],
      });
      return response.data;
    } catch (error) {
      console.error("Error creating Bigin task:", error);
      throw error;
    }
  }

  // Sync
  async syncToTradeFlow(): Promise<SyncResult> {
    const errors: string[] = [];
    let syncedCount = 0;

    try {
      const [contacts, companies, deals, tasks] = await Promise.all([
        this.getContacts(),
        this.getCompanies(),
        this.getDeals(),
        this.getTasks(),
      ]);

      syncedCount =
        (contacts.data?.length || 0) +
        (companies.data?.length || 0) +
        (deals.data?.length || 0) +
        (tasks.data?.length || 0);

      return {
        success: true,
        synced: syncedCount,
        errors,
        lastSyncTime: new Date(),
      };
    } catch (error) {
      errors.push(`Sync error: ${error}`);
      return {
        success: false,
        synced: syncedCount,
        errors,
        lastSyncTime: new Date(),
      };
    }
  }
}

// ========== Connector Factory ==========

export class ConnectorFactory {
  static createConnector(
    type: "hubspot" | "trello" | "bigin",
    config: ConnectorConfig
  ): HubSpotConnector | TrelloConnector | BiginConnector {
    switch (type) {
      case "hubspot":
        return new HubSpotConnector(config);
      case "trello":
        return new TrelloConnector(config);
      case "bigin":
        return new BiginConnector(config);
      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  }
}

export default ConnectorFactory;
