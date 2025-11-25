import { MicrosoftGraphService, type GraphAuthProvider } from "../../microsoft-graph";
import { sendEmail } from "../email";
import type { InsertEmailLog, EmailLog } from "@shared/schema";
import type { IStorage } from "../memory-storage";

export interface MailAttachmentMeta {
  name: string;
  size: number;
  type?: string;
  url?: string;
}

interface MailMessageInput {
  to: string;
  subject: string;
  body: string;
  attachments?: MailAttachmentMeta[];
  user: Express.User;
}

export class MailService {
  constructor(private storage: IStorage) {}

  async sendMessage(input: MailMessageInput) {
    const { to, subject, body, attachments = [], user } = input;
    const senderProfile = {
      id: user.id,
      name: user.name || user.username,
      avatar: user.avatar || null,
      email: `${user.username}@tradeflow.local`,
    };

    const baseLog: InsertEmailLog = {
      to,
      from: senderProfile.email,
      subject,
      body,
      sentBy: user.id,
      sender: senderProfile,
      attachments,
      direction: "outbound",
      syncStatus: "pending",
      state: "sent",
      status: "sent",
      retryCount: 0,
    } as InsertEmailLog;

    try {
      const result = await sendEmail({
        to,
        subject,
        html: body,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to send email");
      }

      return await this.storage.createEmailLog({
        ...baseLog,
        syncStatus: "synced",
      });
    } catch (error) {
      return await this.storage.createEmailLog({
        ...baseLog,
        status: "failed",
        state: "failed",
        syncStatus: "error",
        retryCount: 1,
      });
    }
  }

  async syncInbox(user: Express.User) {
    const syncedMessages: EmailLog[] = [];
    const senderProfile = {
      id: user.id,
      name: user.name || user.username,
      avatar: user.avatar || null,
      email: `${user.username}@tradeflow.local`,
    };

    try {
      if (process.env.MICROSOFT_GRAPH_TOKEN) {
        const authProvider: GraphAuthProvider = {
          getAccessToken: async () => process.env.MICROSOFT_GRAPH_TOKEN!,
        };
        const graphService = new MicrosoftGraphService(authProvider);
        const messages = await graphService.listMessages(5);

        for (const message of messages) {
          const fromAddress = message.from?.emailAddress?.address || "unknown@graph";
          syncedMessages.push(
            await this.storage.createEmailLog({
              to: senderProfile.email,
              from: fromAddress,
              subject: message.subject || "(no subject)",
              body: message.bodyPreview || "", 
              sentBy: user.id,
              sender: message.from?.emailAddress
                ? { name: message.from.emailAddress.name, email: fromAddress }
                : senderProfile,
              direction: "inbound",
              syncStatus: "synced",
              status: "sent",
              state: "sent",
              attachments: [],
              retryCount: 0,
              sentAt: message.receivedDateTime ? new Date(message.receivedDateTime) : undefined,
            })
          );
        }
      } else {
        // Fallback sample data when no provider tokens are configured
        syncedMessages.push(
          await this.storage.createEmailLog({
            to: senderProfile.email,
            from: "notifications@example.com",
            subject: "Mailbox connected",
            body: "We simulated a sync from your provider to confirm connectivity.",
            sentBy: user.id,
            sender: { name: "System", email: "notifications@example.com" },
            direction: "inbound",
            syncStatus: "synced",
            status: "sent",
            state: "sent",
            attachments: [],
            retryCount: 0,
          })
        );
      }

      return { synced: syncedMessages.length, messages: syncedMessages };
    } catch (error: any) {
      await this.storage.createEmailLog({
        to: senderProfile.email,
        from: "sync@tradeflow.local",
        subject: "Mailbox sync failed",
        body: error?.message || "Unable to sync mailbox right now.",
        sentBy: user.id,
        sender: senderProfile,
        direction: "system",
        syncStatus: "error",
        status: "failed",
        state: "failed",
        retryCount: 1,
      });

      return { synced: syncedMessages.length, error: error?.message };
    }
  }
}
