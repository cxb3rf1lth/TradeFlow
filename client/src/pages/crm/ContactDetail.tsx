import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Edit,
  Trash2,
  Plus,
  FileText,
  Calendar as CalendarIcon,
  Paperclip,
  CheckCircle2,
  XCircle,
  DollarSign,
  User,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Contact, Company, Deal, Activity, Document } from "@shared/schema";
import { format } from "date-fns";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";

interface ContactWithRelations extends Contact {
  company?: Company | null;
  deals?: Deal[];
  activities?: Activity[];
  documents?: Document[];
}

const RichTextEditor = ({ content, onChange }: { content: string; onChange: (content: string) => void }): React.ReactElement | null => {
  const editor = useEditor({
    extensions: [StarterKit, Link, Underline],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex gap-2 p-2 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-muted" : ""}
        >
          B
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-muted" : ""}
        >
          I
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive("underline") ? "bg-muted" : ""}
        >
          U
        </Button>
        <Separator orientation="vertical" className="h-8" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-muted" : ""}
        >
          • List
        </Button>
      </div>
      <EditorContent editor={editor} className="prose prose-sm max-w-none p-4 min-h-[200px]" />
    </div>
  );
};

export default function ContactDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/crm/contacts/:id");
  const contactId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isDealDialogOpen, setIsDealDialogOpen] = useState(false);

  // Fetch contact details
  const {
    data: contact,
    isLoading,
    error,
  } = useQuery<ContactWithRelations>({
    queryKey: [`/api/contacts/${contactId}`],
    enabled: !!contactId,
  });

  // Delete contact mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/contacts/${contactId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete contact");
    },
    onSuccess: () => {
      toast({
        title: "Contact deleted",
        description: "The contact has been successfully deleted.",
      });
      navigate("/crm/contacts");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          action: "added_note",
          entityType: "contact",
          entityId: contactId,
          metadata: { content },
        }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contacts/${contactId}`] });
      setIsNoteDialogOpen(false);
      setNoteContent("");
      toast({
        title: "Note added",
        description: "Your note has been successfully added.",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px] col-span-2" />
        </div>
      </div>
    );
  }

  if (error || !contact) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Contact not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The contact you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/crm/contacts")}>
              Back to Contacts
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/crm/contacts")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {contact.firstName} {contact.lastName}
            </h1>
            <p className="text-muted-foreground">{contact.position || "Contact"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={() => deleteMutation.mutate()}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button variant="outline">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </Button>
          <Button variant="outline">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Dialog open={isDealDialogOpen} onOpenChange={setIsDealDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Deal</DialogTitle>
                <DialogDescription>
                  Create a new deal for {contact.firstName} {contact.lastName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Deal Name</Label>
                  <Input placeholder="Enterprise Plan - Q1 2025" />
                </div>
                <div className="space-y-2">
                  <Label>Deal Value</Label>
                  <Input type="number" placeholder="50000" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDealDialogOpen(false)}>
                  Cancel
                </Button>
                <Button>Create Deal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contact Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${contact.firstName} ${contact.lastName}`} />
              <AvatarFallback>{getInitials(contact.firstName, contact.lastName)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 grid grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Email</div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                    {contact.email || "Not provided"}
                  </a>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Phone</div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.phone || "Not provided"}</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Company</div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  {contact.company ? (
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => navigate(`/crm/companies/${contact.companyId}`)}
                    >
                      {contact.company.name}
                    </Button>
                  ) : (
                    <span>No company</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                HubSpot Synced
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-blue-500" />
                Bigin Synced
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="deals">
            Deals
            {contact.deals && contact.deals.length > 0 && (
              <Badge variant="secondary" className="ml-2">{contact.deals.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Full Name
                  </div>
                  <div className="text-sm">
                    {contact.firstName} {contact.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Position
                  </div>
                  <div className="text-sm">{contact.position || "Not specified"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Email Address
                  </div>
                  <div className="text-sm">{contact.email || "Not provided"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Phone Number
                  </div>
                  <div className="text-sm">{contact.phone || "Not provided"}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </div>
                  <Badge variant={contact.status === "active" ? "default" : "secondary"}>
                    {contact.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Source
                  </div>
                  <div className="text-sm">{contact.source || "Direct"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags & Custom Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Tags
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {(contact.tags as string[])?.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                    {(!contact.tags || (contact.tags as string[]).length === 0) && (
                      <span className="text-sm text-muted-foreground">No tags</span>
                    )}
                    <Button variant="outline" size="sm">
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Created
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    {contact.createdAt &&
                      format(new Date(contact.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    Last Updated
                  </div>
                  <div className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {contact.updatedAt &&
                      format(new Date(contact.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.activities && contact.activities.length > 0 ? (
                  contact.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {activity.type === "email" && <Mail className="h-5 w-5" />}
                          {activity.type === "call" && <Phone className="h-5 w-5" />}
                          {activity.type === "note" && <FileText className="h-5 w-5" />}
                          {activity.type === "meeting" && <User className="h-5 w-5" />}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">{activity.action}</div>
                          <div className="text-sm text-muted-foreground">
                            {activity.createdAt &&
                              format(new Date(activity.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                        {(activity.metadata ? (
                          <div className="text-sm text-muted-foreground mt-1">
                            {JSON.stringify((activity.metadata as any) || {})}
                          </div>
                        ) : null) as React.ReactNode}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Deals Tab */}
        <TabsContent value="deals">
          <Card>
            <CardHeader>
              <CardTitle>Related Deals</CardTitle>
            </CardHeader>
            <CardContent>
              {contact.deals && contact.deals.length > 0 ? (
                <div className="space-y-4">
                  {contact.deals.map((deal) => (
                    <div
                      key={deal.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/crm/deals/${deal.id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <DollarSign className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{deal.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {deal.value && `$${Number(deal.value).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                      <Badge>{deal.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No deals yet</p>
                  <Button onClick={() => setIsDealDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Deal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notes</CardTitle>
              <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Add Note</DialogTitle>
                    <DialogDescription>
                      Add a note about this contact
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <RichTextEditor
                      content={noteContent}
                      onChange={setNoteContent}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsNoteDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createNoteMutation.mutate(noteContent)}
                      disabled={createNoteMutation.isPending}
                    >
                      {createNoteMutation.isPending ? "Saving..." : "Save Note"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contact.activities?.filter((a) => a.type === "note").length ? (
                  contact.activities
                    .filter((a) => a.type === "note")
                    .map((note) => (
                      <div key={note.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Note</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {note.createdAt &&
                              format(new Date(note.createdAt), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: (note.metadata as any)?.content || "",
                          }}
                        />
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No notes yet</p>
                    <Button onClick={() => setIsNoteDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Note
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Files Tab */}
        <TabsContent value="files">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Files & Attachments</CardTitle>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </CardHeader>
            <CardContent>
              {contact.documents && contact.documents.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {contact.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <Paperclip className="h-8 w-8 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {(doc.size / 1024).toFixed(2)} KB
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Paperclip className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">No files uploaded</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload First File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
