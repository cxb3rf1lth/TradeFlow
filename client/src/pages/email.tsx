import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/lib/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { EmailTemplate, EmailLog, EmailDraft } from "@shared/schema";
import { Mail, Send, FileText, History, Sparkles, Trash2, Edit2, Save, RefreshCw, AlertCircle } from "lucide-react";

export default function EmailPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if user is a PA
  if (user?.role !== "virtual_pa") {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to Virtual PA users.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // UI states
  const [activeTab, setActiveTab] = useState("compose");
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<EmailDraft | null>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: "template" | "draft"; id: string } | null>(null);

  // Form states
  const [emailForm, setEmailForm] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [templateForm, setTemplateForm] = useState({
    name: "",
    subject: "",
    body: "",
  });

  // Fetch email templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email/templates"],
    queryFn: () => apiRequest("/api/email/templates"),
  });

  // Fetch email drafts
  const { data: drafts = [], isLoading: draftsLoading } = useQuery<EmailDraft[]>({
    queryKey: ["/api/email/drafts"],
    queryFn: () => apiRequest("/api/email/drafts"),
  });

  // Fetch email logs
  const { data: logs = [], isLoading: logsLoading } = useQuery<EmailLog[]>({
    queryKey: ["/api/email/logs"],
    queryFn: () => apiRequest("/api/email/logs"),
  });

  // Send email mutation
  const sendEmailMutation = useMutation({
    mutationFn: (email: { to: string; subject: string; body: string; sentBy: string }) =>
      apiRequest("/api/email/send", {
        method: "POST",
        body: JSON.stringify(email),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/logs"] });
      toast({
        title: "Success",
        description: "Email sent successfully",
      });
      setEmailForm({ to: "", subject: "", body: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Save draft mutation
  const saveDraftMutation = useMutation({
    mutationFn: (draft: { to: string; subject: string; body: string; createdBy: string }) =>
      apiRequest("/api/email/drafts", {
        method: "POST",
        body: JSON.stringify(draft),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/drafts"] });
      toast({
        title: "Success",
        description: "Draft saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update draft mutation
  const updateDraftMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; to: string; subject: string; body: string }) =>
      apiRequest(`/api/email/drafts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/drafts"] });
      toast({
        title: "Success",
        description: "Draft updated successfully",
      });
      setSelectedDraft(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (template: { name: string; subject: string; body: string; createdBy: string }) =>
      apiRequest("/api/email/templates", {
        method: "POST",
        body: JSON.stringify(template),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/templates"] });
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      setTemplateDialogOpen(false);
      setTemplateForm({ name: "", subject: "", body: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation (for both templates and drafts)
  const deleteMutation = useMutation({
    mutationFn: ({ type, id }: { type: "template" | "draft"; id: string }) => {
      const endpoint = type === "template"
        ? `/api/email/templates/${id}`
        : `/api/email/drafts/${id}`;
      return apiRequest(endpoint, { method: "DELETE" });
    },
    onSuccess: (_, variables) => {
      const queryKey = variables.type === "template"
        ? ["/api/email/templates"]
        : ["/api/email/drafts"];
      queryClient.invalidateQueries({ queryKey });
      toast({
        title: "Success",
        description: `${variables.type === "template" ? "Template" : "Draft"} deleted successfully`,
      });
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI draft assistance mutation
  const aiDraftMutation = useMutation({
    mutationFn: (prompt: string) =>
      apiRequest<{ draft: string }>("/api/ai/draft-email", {
        method: "POST",
        body: JSON.stringify({ prompt }),
      }),
    onSuccess: (data) => {
      setEmailForm({ ...emailForm, body: data.draft });
      toast({
        title: "AI Draft Generated",
        description: "AI has generated a draft for you",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI improve email mutation
  const aiImproveMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest<{ improved: string }>("/api/ai/improve-email", {
        method: "POST",
        body: JSON.stringify({ text }),
      }),
    onSuccess: (data) => {
      setEmailForm({ ...emailForm, body: data.improved });
      toast({
        title: "Email Improved",
        description: "AI has improved your email content",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      sendEmailMutation.mutate({ ...emailForm, sentBy: user.id });
    }
  };

  const handleSaveDraft = () => {
    if (user) {
      if (selectedDraft) {
        updateDraftMutation.mutate({ id: selectedDraft.id, ...emailForm });
      } else {
        saveDraftMutation.mutate({ ...emailForm, createdBy: user.id });
      }
    }
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createTemplateMutation.mutate({ ...templateForm, createdBy: user.id });
    }
  };

  const loadTemplate = (template: EmailTemplate) => {
    setEmailForm({
      to: emailForm.to,
      subject: template.subject,
      body: template.body,
    });
    toast({
      title: "Template Loaded",
      description: `Template "${template.name}" has been loaded`,
    });
  };

  const loadDraft = (draft: EmailDraft) => {
    setSelectedDraft(draft);
    setEmailForm({
      to: draft.to,
      subject: draft.subject,
      body: draft.body,
    });
    setActiveTab("compose");
  };

  const openDeleteDialog = (type: "template" | "draft", id: string) => {
    setItemToDelete({ type, id });
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Email Center</h1>
        <p className="text-muted-foreground">Compose and manage emails with AI assistance</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="compose">
            <Mail className="mr-2 h-4 w-4" />
            Compose
          </TabsTrigger>
          <TabsTrigger value="drafts">
            <FileText className="mr-2 h-4 w-4" />
            Drafts ({drafts.length})
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileText className="mr-2 h-4 w-4" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="mr-2 h-4 w-4" />
            History ({logs.length})
          </TabsTrigger>
        </TabsList>

        {/* Compose Tab */}
        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Email</CardTitle>
              <CardDescription>Write a new email with AI assistance</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="email"
                    value={emailForm.to}
                    onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
                    placeholder="recipient@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={emailForm.subject}
                    onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                    placeholder="Email subject"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="body">Message</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const prompt = window.prompt("What would you like the email to be about?");
                          if (prompt) aiDraftMutation.mutate(prompt);
                        }}
                        disabled={aiDraftMutation.isPending}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Draft
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => aiImproveMutation.mutate(emailForm.body)}
                        disabled={!emailForm.body || aiImproveMutation.isPending}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Improve
                      </Button>
                    </div>
                  </div>
                  <Textarea
                    id="body"
                    value={emailForm.body}
                    onChange={(e) => setEmailForm({ ...emailForm, body: e.target.value })}
                    placeholder="Write your message here..."
                    rows={10}
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={sendEmailMutation.isPending}>
                    <Send className="mr-2 h-4 w-4" />
                    {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={saveDraftMutation.isPending || updateDraftMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {selectedDraft ? "Update Draft" : "Save Draft"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts" className="space-y-4">
          {draftsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : drafts.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No drafts saved yet. Save your emails as drafts from the compose tab.
                </p>
              </CardContent>
            </Card>
          ) : (
            drafts.map((draft) => (
              <Card key={draft.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{draft.subject}</CardTitle>
                      <CardDescription>To: {draft.to}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadDraft(draft)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog("draft", draft.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{draft.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Last updated: {new Date(draft.updatedAt!).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Email Template</DialogTitle>
                  <DialogDescription>Save a reusable email template</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTemplate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      value={templateForm.name}
                      onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                      placeholder="e.g., Meeting Request"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-subject">Subject</Label>
                    <Input
                      id="template-subject"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="template-body">Body</Label>
                    <Textarea
                      id="template-body"
                      value={templateForm.body}
                      onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                      rows={8}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createTemplateMutation.isPending}>
                    {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {templatesLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : templates.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No templates created yet. Create your first template to speed up email composition.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription>{template.subject}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog("template", template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-3">{template.body}</p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => loadTemplate(template)}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground py-8">
                  No emails sent yet. Your sent emails will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            logs.map((log) => (
              <Card key={log.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{log.subject}</CardTitle>
                      <CardDescription>To: {log.to}</CardDescription>
                    </div>
                    <Badge variant={log.status === "sent" ? "default" : "destructive"}>
                      {log.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">{log.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Sent: {new Date(log.sentAt!).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {itemToDelete?.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
