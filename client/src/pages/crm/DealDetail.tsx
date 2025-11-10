import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  FileText,
  CheckCircle2,
  XCircle,
  DollarSign,
  Building2,
  User,
  Calendar as CalendarIcon,
  Paperclip,
  Clock,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Package,
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
import { Skeleton } from "../../components/ui/skeleton";
import { Progress } from "../../components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { Deal, Contact, Company, Activity, Document, PipelineStage } from "@shared/schema";
import { format } from "date-fns";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { Separator } from "../../components/ui/separator";

interface DealWithRelations extends Deal {
  contact?: Contact | null;
  company?: Company | null;
  activities?: Activity[];
  documents?: Document[];
  stage?: PipelineStage | null;
}

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
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

export default function DealDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/crm/deals/:id");
  const dealId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);

  // Fetch deal details
  const {
    data: deal,
    isLoading,
    error,
  } = useQuery<DealWithRelations>({
    queryKey: [`/api/deals/${dealId}`],
    enabled: !!dealId,
  });

  // Fetch pipeline stages
  const { data: stages } = useQuery<PipelineStage[]>({
    queryKey: ["/api/pipeline-stages"],
  });

  // Delete deal mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete deal");
    },
    onSuccess: () => {
      toast({
        title: "Deal deleted",
        description: "The deal has been successfully deleted.",
      });
      navigate("/crm/deals");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update deal stage mutation
  const updateStageMutation = useMutation({
    mutationFn: async (stageId: string) => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update stage");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      toast({
        title: "Stage updated",
        description: "Deal stage has been updated successfully.",
      });
    },
  });

  // Mark as won/lost mutations
  const markAsWonMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "won", closedDate: new Date().toISOString() }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark as won");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      toast({
        title: "Deal won!",
        description: "Congratulations on closing this deal!",
      });
    },
  });

  const markAsLostMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "lost", closedDate: new Date().toISOString() }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to mark as lost");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
      toast({
        title: "Deal marked as lost",
        description: "The deal has been marked as lost.",
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
          entityType: "deal",
          entityId: dealId,
          metadata: { content },
        }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create note");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/deals/${dealId}`] });
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
          <Skeleton className="h-20 w-20 rounded-lg" />
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

  if (error || !deal) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Deal not found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The deal you're looking for doesn't exist or has been deleted.
            </p>
            <Button onClick={() => navigate("/crm/deals")}>
              Back to Deals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStageIndex = stages?.findIndex((s) => s.id === deal.stageId) || 0;
  const totalStages = stages?.length || 1;
  const progressPercentage = ((currentStageIndex + 1) / totalStages) * 100;

  const probability = deal.stage?.probability || 0;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/crm/deals")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{deal.title}</h1>
            <p className="text-muted-foreground">
              {deal.company?.name} • {deal.contact && `${deal.contact.firstName} ${deal.contact.lastName}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={deal.stageId}
            onValueChange={(value) => updateStageMutation.mutate(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stages?.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => markAsWonMutation.mutate()}
            disabled={deal.status === "won"}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Won
          </Button>
          <Button
            variant="outline"
            onClick={() => markAsLostMutation.mutate()}
            disabled={deal.status === "lost"}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Lost
          </Button>
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
        </div>
      </div>

      {/* Deal Header Card */}
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-8 w-8" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Deal Value</div>
                <div className="text-3xl font-bold">
                  ${Number(deal.value).toLocaleString()} {deal.currency}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {probability}% probability to close
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge
                variant={
                  deal.status === "won"
                    ? "default"
                    : deal.status === "lost"
                    ? "destructive"
                    : "secondary"
                }
                className="text-base px-4 py-1"
              >
                {deal.status}
              </Badge>
              {deal.expectedCloseDate && (
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Expected close: {format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">Pipeline Progress</div>
              <div className="text-sm text-muted-foreground">
                Stage {currentStageIndex + 1} of {totalStages}
              </div>
            </div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <div className="flex items-center justify-between">
              {stages?.map((stage, idx) => (
                <div
                  key={stage.id}
                  className={`text-xs ${
                    idx <= currentStageIndex
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {stage.name}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Company</div>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                {deal.company ? (
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate(`/crm/companies/${deal.companyId}`)}
                  >
                    {deal.company.name}
                  </Button>
                ) : (
                  <span>No company</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Contact</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                {deal.contact ? (
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => navigate(`/crm/contacts/${deal.contactId}`)}
                  >
                    {deal.contact.firstName} {deal.contact.lastName}
                  </Button>
                ) : (
                  <span>No contact</span>
                )}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Created</div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{deal.createdAt && format(new Date(deal.createdAt), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Deal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Deal Name
                  </div>
                  <div className="text-sm">{deal.title}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Deal Value
                  </div>
                  <div className="text-sm font-semibold">
                    ${Number(deal.value).toLocaleString()} {deal.currency}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Current Stage
                  </div>
                  <Badge
                    style={{
                      backgroundColor: deal.stage?.color || "#6366f1",
                      color: "white",
                    }}
                  >
                    {deal.stage?.name || "Unknown"}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Win Probability
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={probability} className="flex-1 h-2" />
                    <span className="text-sm font-medium">{probability}%</span>
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Status
                  </div>
                  <Badge
                    variant={
                      deal.status === "won"
                        ? "default"
                        : deal.status === "lost"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {deal.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Created Date
                  </div>
                  <div className="text-sm">
                    {deal.createdAt &&
                      format(new Date(deal.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Last Updated
                  </div>
                  <div className="text-sm">
                    {deal.updatedAt &&
                      format(new Date(deal.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground mb-1">
                    Expected Close Date
                  </div>
                  <div className="text-sm">
                    {deal.expectedCloseDate
                      ? format(new Date(deal.expectedCloseDate), "MMMM d, yyyy")
                      : "Not set"}
                  </div>
                </div>
                {deal.closedDate && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-1">
                      Closed Date
                    </div>
                    <div className="text-sm">
                      {format(new Date(deal.closedDate), "MMMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                )}
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
                {deal.activities && deal.activities.length > 0 ? (
                  deal.activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5" />
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

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Products & Line Items</CardTitle>
              <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Product</DialogTitle>
                    <DialogDescription>
                      Add a product or line item to this deal
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Product Name</Label>
                      <Input placeholder="Enterprise License" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input type="number" placeholder="1" />
                      </div>
                      <div className="space-y-2">
                        <Label>Price</Label>
                        <Input type="number" placeholder="50000" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button>Add Product</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products added yet</p>
                <Button onClick={() => setIsProductDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Product
                </Button>
              </div>
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
                      Add a note about this deal
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
                {deal.activities?.filter((a) => a.type === "note").length ? (
                  deal.activities
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
              {deal.documents && deal.documents.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {deal.documents.map((doc) => (
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
