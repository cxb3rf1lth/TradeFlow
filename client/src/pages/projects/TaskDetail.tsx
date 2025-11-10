import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import TiptapLink from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  ArrowLeft,
  Clock,
  Users,
  Tag,
  Calendar,
  Paperclip,
  MoreVertical,
  Archive,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Plus,
  CheckSquare,
  Square,
  X,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  MessageSquare,
  Activity,
  ExternalLink,
  Upload,
  Download,
  ChevronRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Skeleton } from "../../components/ui/skeleton";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Checkbox } from "../../components/ui/checkbox";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "../../components/ui/breadcrumb";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Types
interface Task {
  id: number;
  title: string;
  description: string;
  boardId: number;
  boardName: string;
  boardColor: string;
  listId: number;
  listName: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  labels: Label[];
  members: Member[];
  checklists: Checklist[];
  attachments: Attachment[];
  comments: Comment[];
  customFields: CustomField[];
  coverImage?: string;
  isWatching: boolean;
  createdAt: string;
  updatedAt: string;
  integrationSync?: {
    trello?: { cardId: string; synced: boolean };
    jira?: { issueKey: string; synced: boolean };
  };
}

interface Label {
  id: number;
  name: string;
  color: string;
}

interface Member {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

interface Checklist {
  id: number;
  name: string;
  items: ChecklistItem[];
}

interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
  assignee?: Member;
}

interface Attachment {
  id: number;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedBy: Member;
  uploadedAt: string;
}

interface Comment {
  id: number;
  text: string;
  author: Member;
  createdAt: string;
  updatedAt?: string;
}

interface CustomField {
  id: number;
  name: string;
  value: string;
  type: "text" | "number" | "date" | "select";
}

const PRIORITY_COLORS = {
  low: "bg-gray-500",
  medium: "bg-blue-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

const PRIORITY_LABELS = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export default function TaskDetail() {
  const { id } = useParams();
  const taskId = parseInt(id || "0");
  const [, navigate] = useLocation();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [newChecklistName, setNewChecklistName] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newChecklistItem, setNewChecklistItem] = useState<{ [key: number]: string }>({});
  const [newComment, setNewComment] = useState("");
  const [activeTab, setActiveTab] = useState("activity");

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch task data
  const { data: task, isLoading } = useQuery<Task>({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: taskId > 0,
  });

  // Rich text editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapLink.configure({
        openOnClick: false,
      }),
      Image,
    ],
    content: task?.description || "",
    onUpdate: ({ editor }) => {
      // Auto-save description
      updateTaskMutation.mutate({
        description: editor.getHTML(),
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task>) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update task");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
    },
  });

  // Add checklist mutation
  const addChecklistMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/tasks/${taskId}/checklists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to add checklist");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setIsAddingChecklist(false);
      setNewChecklistName("");
    },
  });

  // Add checklist item mutation
  const addChecklistItemMutation = useMutation({
    mutationFn: async ({ checklistId, text }: { checklistId: number; text: string }) => {
      const response = await fetch(`/api/tasks/${taskId}/checklists/${checklistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to add checklist item");
      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setNewChecklistItem((prev) => ({ ...prev, [variables.checklistId]: "" }));
    },
  });

  // Toggle checklist item mutation
  const toggleChecklistItemMutation = useMutation({
    mutationFn: async ({ checklistId, itemId }: { checklistId: number; itemId: number }) => {
      const response = await fetch(
        `/api/tasks/${taskId}/checklists/${checklistId}/items/${itemId}/toggle`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );
      if (!response.ok) throw new Error("Failed to toggle checklist item");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (text: string) => {
      const response = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to add comment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      setNewComment("");
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    },
  });

  // Toggle watch mutation
  const toggleWatchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}/watch`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle watch");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete task");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
      navigate("/projects/tasks");
    },
  });

  // Upload attachment mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/tasks/${taskId}/attachments`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to upload attachment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      toast({
        title: "Success",
        description: "Attachment uploaded successfully",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAttachmentMutation.mutate(file);
    }
  };

  const handleUpdateTitle = () => {
    if (editedTitle.trim() && editedTitle !== task?.title) {
      updateTaskMutation.mutate({ title: editedTitle });
    }
    setIsEditingTitle(false);
  };

  const calculateChecklistProgress = (checklist: Checklist) => {
    const completed = checklist.items.filter((item) => item.completed).length;
    const total = checklist.items.length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (isLoading) {
    return (
      <div className="h-full bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Task not found</h2>
          <Link href="/projects/tasks">
            <Button variant="outline">Back to Tasks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/projects/boards">Boards</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/projects/boards/${task.boardId}`}>
                    {task.boardName}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator>
                  <ChevronRight className="h-4 w-4" />
                </BreadcrumbSeparator>
                <BreadcrumbItem>
                  <BreadcrumbPage>{task.listName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant={task.isWatching ? "default" : "outline"}
                size="sm"
                onClick={() => toggleWatchMutation.mutate()}
                className="gap-2"
              >
                {task.isWatching ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                {task.isWatching ? "Watching" : "Watch"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Task
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => deleteTaskMutation.mutate()}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="container mx-auto p-6">
          {/* Cover Image */}
          {task.coverImage && (
            <div className="mb-6 rounded-lg overflow-hidden">
              <img
                src={task.coverImage}
                alt="Cover"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                {isEditingTitle ? (
                  <Input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onBlur={handleUpdateTitle}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateTitle();
                      if (e.key === "Escape") setIsEditingTitle(false);
                    }}
                    autoFocus
                    className="text-2xl font-bold"
                  />
                ) : (
                  <h1
                    className="text-3xl font-bold cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                    onClick={() => {
                      setIsEditingTitle(true);
                      setEditedTitle(task.title);
                    }}
                  >
                    {task.title}
                  </h1>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  in list <Badge variant="outline">{task.listName}</Badge>
                </div>
              </div>

              {/* Labels */}
              {task.labels.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {task.labels.map((label) => (
                    <Badge
                      key={label.id}
                      style={{ backgroundColor: label.color }}
                      className="text-white"
                    >
                      {label.name}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Integration Sync Status */}
              {task.integrationSync && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Integration Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {task.integrationSync.trello && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Trello</span>
                        <Badge variant={task.integrationSync.trello.synced ? "default" : "secondary"}>
                          {task.integrationSync.trello.synced ? "Synced" : "Pending"}
                        </Badge>
                      </div>
                    )}
                    {task.integrationSync.jira && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Jira</span>
                        <Badge variant={task.integrationSync.jira.synced ? "default" : "secondary"}>
                          {task.integrationSync.jira.synced ? "Synced" : "Pending"}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <List className="h-4 w-4" />
                    Description
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Editor Toolbar */}
                  {editor && (
                    <div className="border rounded-lg mb-2 p-2 flex flex-wrap gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive("bold") ? "bg-muted" : ""}
                      >
                        <Bold className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive("italic") ? "bg-muted" : ""}
                      >
                        <Italic className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={editor.isActive("underline") ? "bg-muted" : ""}
                      >
                        <UnderlineIcon className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-8" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                        className={editor.isActive("bulletList") ? "bg-muted" : ""}
                      >
                        <List className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                        className={editor.isActive("orderedList") ? "bg-muted" : ""}
                      >
                        <ListOrdered className="h-4 w-4" />
                      </Button>
                      <Separator orientation="vertical" className="h-8" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("left").run()}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("center").run()}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().setTextAlign("right").run()}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <EditorContent
                    editor={editor}
                    className="prose prose-sm max-w-none dark:prose-invert min-h-[200px] border rounded-lg p-4"
                  />
                </CardContent>
              </Card>

              {/* Checklists */}
              {task.checklists.map((checklist) => {
                const progress = calculateChecklistProgress(checklist);
                const completed = checklist.items.filter((item) => item.completed).length;

                return (
                  <Card key={checklist.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2">
                          <CheckSquare className="h-4 w-4" />
                          {checklist.name}
                        </CardTitle>
                        <span className="text-sm text-muted-foreground">
                          {completed}/{checklist.items.length}
                        </span>
                      </div>
                      <Progress value={progress} className="h-2 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {checklist.items.map((item) => (
                        <div key={item.id} className="flex items-start gap-2 group">
                          <Checkbox
                            checked={item.completed}
                            onCheckedChange={() =>
                              toggleChecklistItemMutation.mutate({
                                checklistId: checklist.id,
                                itemId: item.id,
                              })
                            }
                            className="mt-1"
                          />
                          <span
                            className={`flex-1 text-sm ${
                              item.completed
                                ? "line-through text-muted-foreground"
                                : ""
                            }`}
                          >
                            {item.text}
                          </span>
                          {item.assignee && (
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={item.assignee.avatar} />
                              <AvatarFallback className="text-xs">
                                {item.assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      ))}

                      {/* Add Item */}
                      <div className="flex gap-2 mt-3">
                        <Input
                          placeholder="Add an item..."
                          value={newChecklistItem[checklist.id] || ""}
                          onChange={(e) =>
                            setNewChecklistItem((prev) => ({
                              ...prev,
                              [checklist.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && newChecklistItem[checklist.id]?.trim()) {
                              addChecklistItemMutation.mutate({
                                checklistId: checklist.id,
                                text: newChecklistItem[checklist.id],
                              });
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() =>
                            addChecklistItemMutation.mutate({
                              checklistId: checklist.id,
                              text: newChecklistItem[checklist.id],
                            })
                          }
                          disabled={!newChecklistItem[checklist.id]?.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Add Checklist */}
              {isAddingChecklist ? (
                <Card>
                  <CardContent className="pt-6 space-y-3">
                    <Input
                      placeholder="Checklist name..."
                      value={newChecklistName}
                      onChange={(e) => setNewChecklistName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && newChecklistName.trim()) {
                          addChecklistMutation.mutate(newChecklistName);
                        }
                        if (e.key === "Escape") setIsAddingChecklist(false);
                      }}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => addChecklistMutation.mutate(newChecklistName)}
                        disabled={!newChecklistName.trim()}
                      >
                        Add Checklist
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setIsAddingChecklist(false);
                          setNewChecklistName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingChecklist(true)}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Checklist
                </Button>
              )}

              {/* Attachments */}
              {task.attachments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attachments
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {task.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <Paperclip className="h-4 w-4 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(attachment.size)} • Uploaded by{" "}
                              {attachment.uploadedBy.name}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Activity & Comments */}
              <Card>
                <CardHeader>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList>
                      <TabsTrigger value="activity" className="gap-2">
                        <Activity className="h-4 w-4" />
                        Activity
                      </TabsTrigger>
                      <TabsTrigger value="comments" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Comments ({task.comments.length})
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardHeader>
                <CardContent>
                  <TabsContent value="activity" className="mt-0 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Activity feed coming soon...
                    </p>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-0 space-y-4">
                    {/* Add Comment */}
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Write a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                      />
                      <Button
                        size="sm"
                        onClick={() => addCommentMutation.mutate(newComment)}
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </Button>
                    </div>

                    <Separator />

                    {/* Comments List */}
                    <div className="space-y-4">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar>
                            <AvatarImage src={comment.author.avatar} />
                            <AvatarFallback>
                              {comment.author.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}
                              </span>
                            </div>
                            <p className="text-sm">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Add to Card</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Members
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Tag className="h-4 w-4" />
                    Labels
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4" />
                    Attachment
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-4 w-4" />
                    Cover
                  </Button>
                </CardContent>
              </Card>

              {/* Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Members */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Members</Label>
                    <div className="flex -space-x-2 mt-2">
                      {task.members.map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      <Avatar className="h-8 w-8 border-2 border-background cursor-pointer hover:bg-muted">
                        <AvatarFallback>
                          <Plus className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {/* Due Date */}
                  {task.dueDate && (
                    <div>
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      <div className="mt-2 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {format(new Date(task.dueDate), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Priority */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Priority</Label>
                    <Select
                      value={task.priority}
                      onValueChange={(value) =>
                        updateTaskMutation.mutate({ priority: value as Task["priority"] })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Select
                      value={task.status}
                      onValueChange={(value) =>
                        updateTaskMutation.mutate({ status: value as Task["status"] })
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Timestamps */}
                  <Separator />
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <div>
                      Created {format(new Date(task.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                    <div>
                      Updated {format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Custom Fields */}
              {task.customFields && task.customFields.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Custom Fields</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {task.customFields.map((field) => (
                      <div key={field.id}>
                        <Label className="text-xs text-muted-foreground">{field.name}</Label>
                        <p className="text-sm mt-1">{field.value || "—"}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
