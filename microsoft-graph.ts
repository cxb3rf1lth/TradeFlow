import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch";

type GraphUploadBody = Blob | ArrayBuffer | ArrayBufferView | string;

export interface GraphAuthProvider {
  getAccessToken(): Promise<string>;
}

export class MicrosoftGraphService {
  private client: Client;

  constructor(authProvider: GraphAuthProvider) {
    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await authProvider.getAccessToken();
          done(null, token);
        } catch (error) {
          done(error as Error, null);
        }
      },
    });
  }

  // ========== OneDrive Services ==========

  async listDriveItems(path: string = "/") {
    try {
      const response = await this.client
        .api(`/me/drive/root${path === "/" ? "" : `:${path}:`}/children`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing drive items:", error);
      throw error;
    }
  }

  async getDriveItem(itemId: string) {
    try {
      return await this.client.api(`/me/drive/items/${itemId}`).get();
    } catch (error) {
      console.error("Error getting drive item:", error);
      throw error;
    }
  }

  async createFolder(parentId: string, folderName: string) {
    try {
      const folder = {
        name: folderName,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename",
      };
      return await this.client
        .api(`/me/drive/items/${parentId}/children`)
        .post(folder);
    } catch (error) {
      console.error("Error creating folder:", error);
      throw error;
    }
  }

  async uploadFile(parentId: string, fileName: string, file: GraphUploadBody) {
    try {
      return await this.client
        .api(`/me/drive/items/${parentId}:/${fileName}:/content`)
        .put(file);
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  }

  async downloadFile(itemId: string): Promise<ArrayBuffer> {
    try {
      return await this.client
        .api(`/me/drive/items/${itemId}/content`)
        .get();
    } catch (error) {
      console.error("Error downloading file:", error);
      throw error;
    }
  }

  async shareFile(itemId: string, type: "view" | "edit" = "view") {
    try {
      const permission = {
        type: "anonymous",
        scope: type,
      };
      return await this.client
        .api(`/me/drive/items/${itemId}/createLink`)
        .post(permission);
    } catch (error) {
      console.error("Error sharing file:", error);
      throw error;
    }
  }

  async deleteFile(itemId: string) {
    try {
      return await this.client.api(`/me/drive/items/${itemId}`).delete();
    } catch (error) {
      console.error("Error deleting file:", error);
      throw error;
    }
  }

  async searchFiles(query: string) {
    try {
      const response = await this.client
        .api(`/me/drive/root/search(q='${query}')`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error searching files:", error);
      throw error;
    }
  }

  // ========== OneNote Services ==========

  async listNotebooks() {
    try {
      const response = await this.client.api("/me/onenote/notebooks").get();
      return response.value;
    } catch (error) {
      console.error("Error listing notebooks:", error);
      throw error;
    }
  }

  async createNotebook(displayName: string) {
    try {
      return await this.client
        .api("/me/onenote/notebooks")
        .post({ displayName });
    } catch (error) {
      console.error("Error creating notebook:", error);
      throw error;
    }
  }

  async listSections(notebookId: string) {
    try {
      const response = await this.client
        .api(`/me/onenote/notebooks/${notebookId}/sections`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing sections:", error);
      throw error;
    }
  }

  async createSection(notebookId: string, displayName: string) {
    try {
      return await this.client
        .api(`/me/onenote/notebooks/${notebookId}/sections`)
        .post({ displayName });
    } catch (error) {
      console.error("Error creating section:", error);
      throw error;
    }
  }

  async listPages(sectionId: string) {
    try {
      const response = await this.client
        .api(`/me/onenote/sections/${sectionId}/pages`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing pages:", error);
      throw error;
    }
  }

  async createPage(sectionId: string, title: string, content: string) {
    try {
      const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    ${content}
  </body>
</html>`;
      return await this.client
        .api(`/me/onenote/sections/${sectionId}/pages`)
        .header("Content-Type", "text/html")
        .post(html);
    } catch (error) {
      console.error("Error creating page:", error);
      throw error;
    }
  }

  async getPageContent(pageId: string) {
    try {
      return await this.client
        .api(`/me/onenote/pages/${pageId}/content`)
        .get();
    } catch (error) {
      console.error("Error getting page content:", error);
      throw error;
    }
  }

  // ========== Outlook Calendar Services ==========

  async listCalendars() {
    try {
      const response = await this.client.api("/me/calendars").get();
      return response.value;
    } catch (error) {
      console.error("Error listing calendars:", error);
      throw error;
    }
  }

  async createCalendar(name: string, color?: string) {
    try {
      return await this.client
        .api("/me/calendars")
        .post({ name, color });
    } catch (error) {
      console.error("Error creating calendar:", error);
      throw error;
    }
  }

  async listEvents(calendarId?: string, startDate?: Date, endDate?: Date) {
    try {
      let endpoint = calendarId
        ? `/me/calendars/${calendarId}/events`
        : "/me/events";

      let query = this.client.api(endpoint);

      if (startDate && endDate) {
        query = query.filter(
          `start/dateTime ge '${startDate.toISOString()}' and end/dateTime le '${endDate.toISOString()}'`
        );
      }

      const response = await query.get();
      return response.value;
    } catch (error) {
      console.error("Error listing events:", error);
      throw error;
    }
  }

  async createEvent(event: any, calendarId?: string) {
    try {
      const endpoint = calendarId
        ? `/me/calendars/${calendarId}/events`
        : "/me/calendar/events";
      return await this.client.api(endpoint).post(event);
    } catch (error) {
      console.error("Error creating event:", error);
      throw error;
    }
  }

  async updateEvent(eventId: string, updates: any) {
    try {
      return await this.client
        .api(`/me/events/${eventId}`)
        .patch(updates);
    } catch (error) {
      console.error("Error updating event:", error);
      throw error;
    }
  }

  async deleteEvent(eventId: string) {
    try {
      return await this.client.api(`/me/events/${eventId}`).delete();
    } catch (error) {
      console.error("Error deleting event:", error);
      throw error;
    }
  }

  // ========== Outlook Mail Services ==========

  async listEmails(folderId: string = "inbox", top: number = 50) {
    try {
      const response = await this.client
        .api(`/me/mailFolders/${folderId}/messages`)
        .top(top)
        .orderby("receivedDateTime DESC")
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing emails:", error);
      throw error;
    }
  }

  async getEmail(messageId: string) {
    try {
      return await this.client.api(`/me/messages/${messageId}`).get();
    } catch (error) {
      console.error("Error getting email:", error);
      throw error;
    }
  }

  async sendEmail(email: any) {
    try {
      return await this.client
        .api("/me/sendMail")
        .post({ message: email });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async replyToEmail(messageId: string, comment: string) {
    try {
      return await this.client
        .api(`/me/messages/${messageId}/reply`)
        .post({ comment });
    } catch (error) {
      console.error("Error replying to email:", error);
      throw error;
    }
  }

  async createDraft(email: any) {
    try {
      return await this.client.api("/me/messages").post(email);
    } catch (error) {
      console.error("Error creating draft:", error);
      throw error;
    }
  }

  async markAsRead(messageId: string, isRead: boolean = true) {
    try {
      return await this.client
        .api(`/me/messages/${messageId}`)
        .patch({ isRead });
    } catch (error) {
      console.error("Error marking email:", error);
      throw error;
    }
  }

  // ========== Outlook Contacts Services ==========

  async listContacts() {
    try {
      const response = await this.client.api("/me/contacts").get();
      return response.value;
    } catch (error) {
      console.error("Error listing contacts:", error);
      throw error;
    }
  }

  async createContact(contact: any) {
    try {
      return await this.client.api("/me/contacts").post(contact);
    } catch (error) {
      console.error("Error creating contact:", error);
      throw error;
    }
  }

  async updateContact(contactId: string, updates: any) {
    try {
      return await this.client
        .api(`/me/contacts/${contactId}`)
        .patch(updates);
    } catch (error) {
      console.error("Error updating contact:", error);
      throw error;
    }
  }

  async deleteContact(contactId: string) {
    try {
      return await this.client.api(`/me/contacts/${contactId}`).delete();
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  }

  // ========== Microsoft Teams Services ==========

  async listJoinedTeams() {
    try {
      const response = await this.client.api("/me/joinedTeams").get();
      return response.value;
    } catch (error) {
      console.error("Error listing teams:", error);
      throw error;
    }
  }

  async listChannels(teamId: string) {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/channels`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing channels:", error);
      throw error;
    }
  }

  async createChannel(teamId: string, displayName: string, description?: string) {
    try {
      return await this.client
        .api(`/teams/${teamId}/channels`)
        .post({ displayName, description });
    } catch (error) {
      console.error("Error creating channel:", error);
      throw error;
    }
  }

  async listChannelMessages(teamId: string, channelId: string) {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing channel messages:", error);
      throw error;
    }
  }

  async sendChannelMessage(teamId: string, channelId: string, content: string) {
    try {
      const message = {
        body: {
          content,
        },
      };
      return await this.client
        .api(`/teams/${teamId}/channels/${channelId}/messages`)
        .post(message);
    } catch (error) {
      console.error("Error sending channel message:", error);
      throw error;
    }
  }

  async listChats() {
    try {
      const response = await this.client.api("/me/chats").get();
      return response.value;
    } catch (error) {
      console.error("Error listing chats:", error);
      throw error;
    }
  }

  async listChatMessages(chatId: string) {
    try {
      const response = await this.client
        .api(`/me/chats/${chatId}/messages`)
        .get();
      return response.value;
    } catch (error) {
      console.error("Error listing chat messages:", error);
      throw error;
    }
  }

  async sendChatMessage(chatId: string, content: string) {
    try {
      const message = {
        body: {
          content,
        },
      };
      return await this.client
        .api(`/me/chats/${chatId}/messages`)
        .post(message);
    } catch (error) {
      console.error("Error sending chat message:", error);
      throw error;
    }
  }

  async createOnlineMeeting(meeting: any) {
    try {
      return await this.client
        .api("/me/onlineMeetings")
        .post(meeting);
    } catch (error) {
      console.error("Error creating online meeting:", error);
      throw error;
    }
  }

  async getOnlineMeeting(meetingId: string) {
    try {
      return await this.client
        .api(`/me/onlineMeetings/${meetingId}`)
        .get();
    } catch (error) {
      console.error("Error getting online meeting:", error);
      throw error;
    }
  }

  // ========== User Profile Services ==========

  async getUserProfile() {
    try {
      return await this.client.api("/me").get();
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  async getUserPhoto() {
    try {
      return await this.client.api("/me/photo/$value").get();
    } catch (error) {
      console.error("Error getting user photo:", error);
      throw error;
    }
  }
}

export default MicrosoftGraphService;
