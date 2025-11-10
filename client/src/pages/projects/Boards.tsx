import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  LayoutGrid,
  Plus,
  Search,
  Star,
  Archive,
  MoreVertical,
  Users,
  CheckSquare,
  Copy,
  Trash2,
  Settings,
  Filter,
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
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Types
interface Board {
  id: number;
  name: string;
  description: string;
  color: string;
  isStarred: boolean;
  isArchived: boolean;
  memberCount: number;
  cardCount: number;
  createdAt: string;
  updatedAt: string;
}

interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  color: string;
  lists: string[];
}

// Validation Schema
const boardSchema = z.object({
  name: z.string().min(1, "Board name is required").max(100),
  description: z.string().max(500).optional(),
  color: z.string().default("#0079bf"),
});

type BoardFormData = z.infer<typeof boardSchema>;

// Board Templates
const BOARD_TEMPLATES: BoardTemplate[] = [
  {
    id: "kanban",
    name: "Kanban Board",
    description: "Classic workflow management",
    color: "#0079bf",
    lists: ["To Do", "In Progress", "Review", "Done"],
  },
  {
    id: "project",
    name: "Project Management",
    description: "Track project tasks and milestones",
    color: "#d29034",
    lists: ["Backlog", "Planning", "In Progress", "Testing", "Completed"],
  },
  {
    id: "agile",
    name: "Agile Sprint",
    description: "Sprint planning and tracking",
    color: "#519839",
    lists: ["Sprint Backlog", "In Progress", "Code Review", "QA", "Done"],
  },
  {
    id: "sales",
    name: "Sales Pipeline",
    description: "Track deals and opportunities",
    color: "#b04632",
    lists: ["Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"],
  },
];

// Color Options
const COLOR_OPTIONS = [
  { name: "Blue", value: "#0079bf" },
  { name: "Orange", value: "#d29034" },
  { name: "Green", value: "#519839" },
  { name: "Red", value: "#b04632" },
  { name: "Purple", value: "#89609e" },
  { name: "Pink", value: "#cd5a91" },
  { name: "Lime", value: "#4bbf6b" },
  { name: "Sky", value: "#00aecc" },
  { name: "Grey", value: "#838c91" },
];

export default function Boards() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#0079bf");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch boards
  const { data: boards, isLoading } = useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });

  // Create board mutation
  const createBoardMutation = useMutation({
    mutationFn: async (data: BoardFormData & { color: string; templateId?: string }) => {
      const response = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create board");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({
        title: "Success",
        description: "Board created successfully",
      });
      setIsCreateDialogOpen(false);
      reset();
      setSelectedColor("#0079bf");
      setSelectedTemplate(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create board",
        variant: "destructive",
      });
    },
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async (boardId: number) => {
      const response = await fetch(`/api/boards/${boardId}/star`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle star");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
    },
  });

  // Archive board mutation
  const archiveBoardMutation = useMutation({
    mutationFn: async (boardId: number) => {
      const response = await fetch(`/api/boards/${boardId}/archive`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to archive board");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({
        title: "Success",
        description: "Board archived successfully",
      });
    },
  });

  // Delete board mutation
  const deleteBoardMutation = useMutation({
    mutationFn: async (boardId: number) => {
      const response = await fetch(`/api/boards/${boardId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete board");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({
        title: "Success",
        description: "Board deleted successfully",
      });
    },
  });

  // Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BoardFormData>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      color: "#0079bf",
    },
  });

  const onSubmit = (data: BoardFormData) => {
    createBoardMutation.mutate({
      ...data,
      color: selectedColor,
      templateId: selectedTemplate || undefined,
    });
  };

  // Filter boards
  const filteredBoards = boards?.filter((board) => {
    const matchesSearch = board.name.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedTab === "starred") {
      return matchesSearch && board.isStarred;
    }
    if (selectedTab === "archived") {
      return matchesSearch && board.isArchived;
    }
    return matchesSearch && !board.isArchived;
  });

  const starredBoards = boards?.filter((b) => b.isStarred && !b.isArchived) || [];

  const handleTemplateSelect = (template: BoardTemplate) => {
    setSelectedTemplate(template.id);
    setSelectedColor(template.color);
    setValue("name", template.name);
    setValue("description", template.description);
  };

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <LayoutGrid className="h-8 w-8 text-blue-600" />
              Boards
            </h1>
            <p className="text-muted-foreground mt-1">
              Organize your projects with Trello-like boards
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Create Board
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Board</DialogTitle>
                <DialogDescription>
                  Start from scratch or use a template to get started quickly
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue="custom" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="custom">Custom Board</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="custom" className="space-y-4 mt-4">
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Board Name *</Label>
                      <Input
                        id="name"
                        placeholder="e.g., Product Roadmap"
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="What is this board about?"
                        rows={3}
                        {...register("description")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Board Color</Label>
                      <div className="grid grid-cols-9 gap-2">
                        {COLOR_OPTIONS.map((color) => (
                          <button
                            key={color.value}
                            type="button"
                            onClick={() => setSelectedColor(color.value)}
                            className={`h-10 rounded-md transition-all ${
                              selectedColor === color.value
                                ? "ring-2 ring-offset-2 ring-blue-500 scale-110"
                                : "hover:scale-105"
                            }`}
                            style={{ backgroundColor: color.value }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createBoardMutation.isPending}>
                        {createBoardMutation.isPending ? "Creating..." : "Create Board"}
                      </Button>
                    </DialogFooter>
                  </form>
                </TabsContent>

                <TabsContent value="templates" className="space-y-4 mt-4">
                  <div className="grid gap-3">
                    {BOARD_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateSelect(template)}
                        className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                          selectedTemplate === template.id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                            : "border-border hover:border-blue-300"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-12 h-12 rounded flex-shrink-0"
                            style={{ backgroundColor: template.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold">{template.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {template.description}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {template.lists.map((list) => (
                                <Badge key={list} variant="secondary" className="text-xs">
                                  {list}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <div className="pt-4 border-t">
                      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="template-name">Customize Board Name</Label>
                          <Input
                            id="template-name"
                            placeholder="Board name"
                            {...register("name")}
                          />
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setSelectedTemplate(null);
                              reset();
                            }}
                          >
                            Back
                          </Button>
                          <Button type="submit" disabled={createBoardMutation.isPending}>
                            {createBoardMutation.isPending
                              ? "Creating..."
                              : "Create from Template"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Starred Boards Section */}
        {starredBoards.length > 0 && selectedTab === "all" && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h2 className="text-lg font-semibold">Starred Boards</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {starredBoards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onToggleStar={toggleStarMutation.mutate}
                  onArchive={archiveBoardMutation.mutate}
                  onDelete={deleteBoardMutation.mutate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs for All/Starred/Archived */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="all">All Boards</TabsTrigger>
            <TabsTrigger value="starred">Starred</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Boards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-24 w-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredBoards && filteredBoards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBoards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onToggleStar={toggleStarMutation.mutate}
                onArchive={archiveBoardMutation.mutate}
                onDelete={deleteBoardMutation.mutate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No boards found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try adjusting your search"
                : "Create your first board to get started"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Board
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Board Card Component
interface BoardCardProps {
  board: Board;
  onToggleStar: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
}

function BoardCard({ board, onToggleStar, onArchive, onDelete }: BoardCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-all overflow-hidden">
      <Link href={`/projects/boards/${board.id}`}>
        <div
          className="h-24 w-full cursor-pointer relative"
          style={{ backgroundColor: board.color }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
        </div>
      </Link>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/projects/boards/${board.id}`}>
            <CardTitle className="text-lg hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
              {board.name}
            </CardTitle>
          </Link>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onToggleStar(board.id);
              }}
              className="h-8 w-8 p-0"
            >
              <Star
                className={`h-4 w-4 ${
                  board.isStarred ? "fill-yellow-500 text-yellow-500" : ""
                }`}
              />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Board Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate Board
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onArchive(board.id)}>
                  <Archive className="h-4 w-4 mr-2" />
                  {board.isArchived ? "Restore" : "Archive"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(board.id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {board.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {board.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{board.memberCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckSquare className="h-4 w-4" />
            <span>{board.cardCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
