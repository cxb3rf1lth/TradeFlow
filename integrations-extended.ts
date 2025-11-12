import axios, { AxiosInstance } from "axios";

// ========== Slack Integration ==========

export class SlackConnector {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(config: { accessToken: string }) {
    if (!config.accessToken) {
      throw new Error("Slack access token is required");
    }
    this.accessToken = config.accessToken;
    this.client = axios.create({
      baseURL: "https://slack.com/api",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Channels
  async listChannels() {
    try {
      const response = await this.client.get("/conversations.list");
      return response.data;
    } catch (error) {
      console.error("Error listing Slack channels:", error);
      throw error;
    }
  }

  async getChannel(channelId: string) {
    try {
      const response = await this.client.get("/conversations.info", {
        params: { channel: channelId },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting Slack channel:", error);
      throw error;
    }
  }

  // Messages
  async sendMessage(channel: string, text: string, attachments?: any[]) {
    try {
      const response = await this.client.post("/chat.postMessage", {
        channel,
        text,
        attachments,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending Slack message:", error);
      throw error;
    }
  }

  async getMessages(channel: string, limit: number = 100) {
    try {
      const response = await this.client.get("/conversations.history", {
        params: { channel, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting Slack messages:", error);
      throw error;
    }
  }

  // Users
  async listUsers() {
    try {
      const response = await this.client.get("/users.list");
      return response.data;
    } catch (error) {
      console.error("Error listing Slack users:", error);
      throw error;
    }
  }

  async getUserInfo(userId: string) {
    try {
      const response = await this.client.get("/users.info", {
        params: { user: userId },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting Slack user:", error);
      throw error;
    }
  }

  // Files
  async uploadFile(channels: string, file: Buffer, filename: string, title?: string) {
    try {
      const formData = new FormData();
      formData.append("channels", channels);
      formData.append("file", new Blob([file]), filename);
      if (title) formData.append("title", title);

      const response = await this.client.post("/files.upload", formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading Slack file:", error);
      throw error;
    }
  }
}

// ========== Google Workspace Integration ==========

export class GoogleWorkspaceConnector {
  private accessToken: string;
  private client: AxiosInstance;

  constructor(config: { accessToken: string }) {
    if (!config.accessToken) {
      throw new Error("Google access token is required");
    }
    this.accessToken = config.accessToken;
    this.client = axios.create({
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Gmail
  async listEmails(maxResults: number = 50) {
    try {
      const response = await this.client.get(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages",
        { params: { maxResults } }
      );
      return response.data;
    } catch (error) {
      console.error("Error listing Gmail messages:", error);
      throw error;
    }
  }

  async getEmail(messageId: string) {
    try {
      const response = await this.client.get(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting Gmail message:", error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, body: string) {
    try {
      const email = [
        `To: ${to}`,
        `Subject: ${subject}`,
        "",
        body,
      ].join("\n");

      const encodedEmail = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

      const response = await this.client.post(
        "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
        { raw: encodedEmail }
      );
      return response.data;
    } catch (error) {
      console.error("Error sending Gmail message:", error);
      throw error;
    }
  }

  // Google Drive
  async listDriveFiles(pageSize: number = 100) {
    try {
      const response = await this.client.get(
        "https://www.googleapis.com/drive/v3/files",
        { params: { pageSize, fields: "files(id, name, mimeType, size, modifiedTime)" } }
      );
      return response.data;
    } catch (error) {
      console.error("Error listing Drive files:", error);
      throw error;
    }
  }

  async uploadDriveFile(name: string, mimeType: string, content: Buffer) {
    try {
      const metadata = { name, mimeType };
      const formData = new FormData();
      formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
      formData.append("file", new Blob([content], { type: mimeType }));

      const response = await this.client.post(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        formData
      );
      return response.data;
    } catch (error) {
      console.error("Error uploading Drive file:", error);
      throw error;
    }
  }

  // Google Calendar
  async listCalendarEvents(calendarId: string = "primary", maxResults: number = 100) {
    try {
      const response = await this.client.get(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        { params: { maxResults, orderBy: "startTime", singleEvents: true } }
      );
      return response.data;
    } catch (error) {
      console.error("Error listing Calendar events:", error);
      throw error;
    }
  }

  async createCalendarEvent(calendarId: string = "primary", event: any) {
    try {
      const response = await this.client.post(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        event
      );
      return response.data;
    } catch (error) {
      console.error("Error creating Calendar event:", error);
      throw error;
    }
  }
}

// ========== Salesforce Integration ==========

export class SalesforceConnector {
  private client: AxiosInstance;
  private instanceUrl: string;

  constructor(config: { accessToken: string; instanceUrl: string }) {
    if (!config.accessToken || !config.instanceUrl) {
      throw new Error("Salesforce access token and instance URL are required");
    }
    this.instanceUrl = config.instanceUrl;
    this.client = axios.create({
      baseURL: `${this.instanceUrl}/services/data/v58.0`,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Accounts (Companies)
  async getAccounts(limit: number = 200) {
    try {
      const response = await this.client.get(
        `/query?q=SELECT Id,Name,Industry,Phone,Website,BillingCity,BillingCountry FROM Account LIMIT ${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting Salesforce accounts:", error);
      throw error;
    }
  }

  async createAccount(data: any) {
    try {
      const response = await this.client.post("/sobjects/Account", data);
      return response.data;
    } catch (error) {
      console.error("Error creating Salesforce account:", error);
      throw error;
    }
  }

  // Contacts
  async getContacts(limit: number = 200) {
    try {
      const response = await this.client.get(
        `/query?q=SELECT Id,FirstName,LastName,Email,Phone,Title,AccountId FROM Contact LIMIT ${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting Salesforce contacts:", error);
      throw error;
    }
  }

  async createContact(data: any) {
    try {
      const response = await this.client.post("/sobjects/Contact", data);
      return response.data;
    } catch (error) {
      console.error("Error creating Salesforce contact:", error);
      throw error;
    }
  }

  // Opportunities (Deals)
  async getOpportunities(limit: number = 200) {
    try {
      const response = await this.client.get(
        `/query?q=SELECT Id,Name,Amount,StageName,CloseDate,AccountId FROM Opportunity LIMIT ${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting Salesforce opportunities:", error);
      throw error;
    }
  }

  async createOpportunity(data: any) {
    try {
      const response = await this.client.post("/sobjects/Opportunity", data);
      return response.data;
    } catch (error) {
      console.error("Error creating Salesforce opportunity:", error);
      throw error;
    }
  }

  // Leads
  async getLeads(limit: number = 200) {
    try {
      const response = await this.client.get(
        `/query?q=SELECT Id,FirstName,LastName,Email,Company,Status FROM Lead LIMIT ${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error getting Salesforce leads:", error);
      throw error;
    }
  }

  async createLead(data: any) {
    try {
      const response = await this.client.post("/sobjects/Lead", data);
      return response.data;
    } catch (error) {
      console.error("Error creating Salesforce lead:", error);
      throw error;
    }
  }
}

// ========== Zendesk Integration ==========

export class ZendeskConnector {
  private client: AxiosInstance;

  constructor(config: { subdomain: string; email: string; apiToken: string }) {
    if (!config.subdomain || !config.email || !config.apiToken) {
      throw new Error("Zendesk subdomain, email, and API token are required");
    }

    const auth = Buffer.from(`${config.email}/token:${config.apiToken}`).toString("base64");

    this.client = axios.create({
      baseURL: `https://${config.subdomain}.zendesk.com/api/v2`,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    });
  }

  // Tickets
  async listTickets(page: number = 1, perPage: number = 100) {
    try {
      const response = await this.client.get("/tickets.json", {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error("Error listing Zendesk tickets:", error);
      throw error;
    }
  }

  async getTicket(ticketId: string) {
    try {
      const response = await this.client.get(`/tickets/${ticketId}.json`);
      return response.data;
    } catch (error) {
      console.error("Error getting Zendesk ticket:", error);
      throw error;
    }
  }

  async createTicket(data: any) {
    try {
      const response = await this.client.post("/tickets.json", { ticket: data });
      return response.data;
    } catch (error) {
      console.error("Error creating Zendesk ticket:", error);
      throw error;
    }
  }

  async updateTicket(ticketId: string, data: any) {
    try {
      const response = await this.client.put(`/tickets/${ticketId}.json`, { ticket: data });
      return response.data;
    } catch (error) {
      console.error("Error updating Zendesk ticket:", error);
      throw error;
    }
  }

  // Users
  async listUsers(page: number = 1, perPage: number = 100) {
    try {
      const response = await this.client.get("/users.json", {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error("Error listing Zendesk users:", error);
      throw error;
    }
  }

  async createUser(data: any) {
    try {
      const response = await this.client.post("/users.json", { user: data });
      return response.data;
    } catch (error) {
      console.error("Error creating Zendesk user:", error);
      throw error;
    }
  }

  // Organizations
  async listOrganizations(page: number = 1, perPage: number = 100) {
    try {
      const response = await this.client.get("/organizations.json", {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error("Error listing Zendesk organizations:", error);
      throw error;
    }
  }

  async createOrganization(data: any) {
    try {
      const response = await this.client.post("/organizations.json", { organization: data });
      return response.data;
    } catch (error) {
      console.error("Error creating Zendesk organization:", error);
      throw error;
    }
  }
}

// ========== Enhanced Connector Factory ==========

export class EnhancedConnectorFactory {
  static createConnector(
    type: "slack" | "google" | "salesforce" | "zendesk",
    config: any
  ): SlackConnector | GoogleWorkspaceConnector | SalesforceConnector | ZendeskConnector {
    switch (type) {
      case "slack":
        return new SlackConnector(config);
      case "google":
        return new GoogleWorkspaceConnector(config);
      case "salesforce":
        return new SalesforceConnector(config);
      case "zendesk":
        return new ZendeskConnector(config);
      default:
        throw new Error(`Unknown connector type: ${type}`);
    }
  }
}

export default EnhancedConnectorFactory;
