import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { EmailDraft, EmailLog } from "@shared/schema";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Send, Clock, FileText, Zap, RefreshCcw, Loader2, Paperclip, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EmailCenter() {
  const { toast } = useToast();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [syncing, setSyncing] = useState(false);

  const { data: emailLogs = [], isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ["/api/email/logs"],
  });

  const { data: drafts = [], isLoading: draftsLoading } = useQuery<EmailDraft[]>({
    queryKey: ["/api/email/drafts"],
  });

  const saveDraftMutation = useMutation({
    mutationFn: async (data: { to: string; subject: string; body: string; createdBy: string }) => {
      const res = await apiRequest("POST", "/api/email/drafts", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/drafts"] });
      setTo("");
      setSubject("");
      setBody("");
      toast({
        title: "Draft saved!",
        description: "Your email draft has been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to save draft",
        description: error.message || "An error occurred while saving the draft.",
        variant: "destructive",
      });
    },
  });

  const attachmentMetadata = attachments.map(file => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));

  const handleAttachmentChange = (fileList: FileList | null) => {
    setAttachments(fileList ? Array.from(fileList) : []);
  };

  const handleSendEmail = async () => {
    if (!to || !subject || !body) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          subject,
          body,
          attachments: attachmentMetadata,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send email');
      }

      toast({
        title: "Email sent!",
        description: `Email successfully sent to ${to}`,
      });
      
      setTo("");
      setSubject("");
      setBody("");
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ["/api/email/logs"] });
    } catch (error: any) {
      toast({
        title: "Failed to send email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSaveDraft = () => {
    if (!to || !subject || !body) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    saveDraftMutation.mutate({ to, subject, body, createdBy: "current-user" });
  };

  const handleSyncMailbox = async () => {
    setSyncing(true);
    try {
      const response = await fetch('/api/email/sync', { method: 'POST' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync mailbox');
      }
      queryClient.invalidateQueries({ queryKey: ["/api/email/logs"] });
      toast({
        title: "Mailbox synced",
        description: `${data.synced || 0} messages processed from provider`,
      });
    } catch (error: any) {
      toast({
        title: "Sync failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const templates = [
    { id: "1", name: "Weekly Update", subject: "Weekly Team Update", uses: 12 },
    { id: "2", name: "Task Reminder", subject: "Reminder: Upcoming Task", uses: 8 },
    { id: "3", name: "Meeting Follow-up", subject: "Follow-up from our meeting", uses: 15 },
  ];

  const formatTimestamp = (date: Date | string | null | undefined) => {
    if (!date) return "Unknown";
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  const allHistory = [
    ...emailLogs.map(log => ({ ...log, type: (log.state as string) || 'sent', sentAt: log.sentAt })),
    ...drafts.map(draft => ({ ...draft, type: 'draft' as const, sentAt: draft.updatedAt }))
  ].sort((a, b) => {
    const dateA = a.sentAt ? new Date(a.sentAt).getTime() : 0;
    const dateB = b.sentAt ? new Date(b.sentAt).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Email Center
        </h1>
        <p className="text-sm text-muted-foreground">
          Send emails and manage automation (PA only)
        </p>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList>
          <TabsTrigger value="compose" data-testid="tab-compose">
            <Send className="h-4 w-4 mr-2" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <Clock className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="automation" data-testid="tab-automation">
            <Zap className="h-4 w-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Send an email to team members or external contacts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  data-testid="input-email-to"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Email subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  data-testid="input-email-subject"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  placeholder="Write your email message here..."
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  data-testid="input-email-body"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="attachments" className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4" /> Attachments
                </Label>
                <Input
                  id="attachments"
                  type="file"
                  multiple
                  onChange={(e) => handleAttachmentChange(e.target.files)}
                />
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    {attachments.map((file) => (
                      <Badge key={file.name} variant="secondary" className="flex items-center gap-2">
                        <Paperclip className="h-3 w-3" />
                        <span>{file.name}</span>
                        <span className="text-xs">({Math.round(file.size / 1024)} KB)</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSendEmail}
                  disabled={sending}
                  data-testid="button-send-email"
                >
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Email"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSaveDraft}
                  disabled={saveDraftMutation.isPending}
                  data-testid="button-save-draft"
                >
                  {saveDraftMutation.isPending ? "Saving..." : "Save as Draft"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Email Templates</h3>
            <Button data-testid="button-create-template">
              <FileText className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </div>
          <div className="grid gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover-elevate" data-testid={`template-${template.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{template.name}</h4>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{template.uses} uses</Badge>
                      <Button variant="outline" size="sm" data-testid={`button-use-template-${template.id}`}>
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Email History</h3>
              <p className="text-sm text-muted-foreground">Synced inbound and outbound messages with statuses.</p>
            </div>
            <Button variant="outline" onClick={handleSyncMailbox} disabled={syncing} data-testid="button-sync-mailbox">
              {syncing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCcw className="h-4 w-4 mr-2" />} {syncing ? "Syncing" : "Sync now"}
            </Button>
          </div>
          {logsLoading || draftsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="h-5 bg-muted rounded animate-pulse" />
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : allHistory.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No email history</h3>
                <p className="text-sm text-muted-foreground">
                  Your sent emails and drafts will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {allHistory.map((item) => (
                <Card key={item.id} data-testid={`email-log-${item.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarImage src={(item as any).sender?.avatar as string | undefined} />
                          <AvatarFallback>
                            {(((item as any).sender?.name as string | undefined)?.[0] || (item.from || "?"))[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.subject || "(no subject)"}</p>
                            <Badge variant="outline" data-testid={`badge-${item.type}-${item.id}`}>
                              {item.type}
                            </Badge>
                            {"syncStatus" in item && (
                              <Badge variant="secondary">Sync: {(item as EmailLog).syncStatus}</Badge>
                            )}
                            {"retryCount" in item && (item as EmailLog).retryCount > 0 && (
                              <Badge variant="outline" className="border-destructive text-destructive">Retry {(item as EmailLog).retryCount}</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            From: {(item as any).from || (item as any).sender?.email || "Unknown"}
                            {item.to ? ` · To: ${item.to}` : ""}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {"direction" in item && <Badge variant="outline">{(item as EmailLog).direction}</Badge>}
                            <span>{formatTimestamp(item.sentAt)}</span>
                          </div>
                          {"attachments" in item && (item as EmailLog).attachments?.length ? (
                            <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                              {(item as EmailLog).attachments!.map((attachment: any) => (
                                <Badge key={attachment.name} variant="secondary" className="flex items-center gap-1">
                                  <Paperclip className="h-3 w-3" />
                                  <span>{attachment.name}</span>
                                </Badge>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {item.type === 'draft' ? (
                          <span>Draft saved</span>
                        ) : (
                          <span>{(item as EmailLog).status || 'sent'}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Email Automation Rules</h3>
            <Button data-testid="button-create-automation">
              <Zap className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Weekly Status Email</h4>
                    <p className="text-sm text-muted-foreground">Send weekly summary every Monday at 9 AM</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">Overdue Task Reminder</h4>
                    <p className="text-sm text-muted-foreground">Send reminder when tasks are overdue by 2 days</p>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div>
                    <h4 className="font-medium">New Task Assignment</h4>
                    <p className="text-sm text-muted-foreground">Notify assignee when new task is created</p>
                  </div>
                  <Badge variant="secondary">Inactive</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
