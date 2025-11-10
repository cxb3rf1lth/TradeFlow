import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import {
  ArrowLeft,
  Plus,
  MoreVertical,
  Users,
  Star,
  Settings,
  Filter,
  Archive,
  Clock,
  CheckSquare,
  Paperclip,
  Tag,
  X,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Progress } from "../../components/ui/progress";
import { Skeleton } from "../../components/ui/skeleton";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { format, isPast } from "date-fns";

// Types
interface Board {
  id: number;
  name: string;
  description: string;
  color: string;
  isStarred: boolean;
  members: Member[];
  lists: BoardList[];
}

interface BoardList {
  id: number;
  boardId: number;
  name: string;
  position: number;
  cards: Card[];
}

interface Card {
  id: number;
  listId: number;
  title: string;
  description?: string;
  position: number;
  dueDate?: string;
  labels: Label[];
  members: Member[];
  attachmentCount: number;
  checklistItems: ChecklistItem[];
  coverImage?: string;
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

interface ChecklistItem {
  id: number;
  text: string;
  completed: boolean;
}

export default function BoardDetail() {
  const { id } = useParams();
  const boardId = parseInt(id || "0");

  const [isAddingList, setIsAddingList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [addingCardToList, setAddingCardToList] = useState<number | null>(null);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [draggedCard, setDraggedCard] = useState<{ cardId: number; sourceListId: number } | null>(
    null
  );
  const [dragOverList, setDragOverList] = useState<number | null>(null);
  const [editingListId, setEditingListId] = useState<number | null>(null);
  const [editingListName, setEditingListName] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch board data
  const { data: board, isLoading } = useQuery<Board>({
    queryKey: [`/api/boards/${boardId}`],
    enabled: boardId > 0,
  });

  // Create list mutation
  const createListMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await fetch(`/api/boards/${boardId}/lists`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}`] });
      setIsAddingList(false);
      setNewListName("");
    },
  });

  // Update list mutation
  const updateListMutation = useMutation({
    mutationFn: async ({ listId, name }: { listId: number; name: string }) => {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}`] });
      setEditingListId(null);
    },
  });

  // Create card mutation
  const createCardMutation = useMutation({
    mutationFn: async ({ listId, title }: { listId: number; title: string }) => {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}`] });
      setAddingCardToList(null);
      setNewCardTitle("");
    },
  });

  // Move card mutation
  const moveCardMutation = useMutation({
    mutationFn: async ({
      cardId,
      targetListId,
      position,
    }: {
      cardId: number;
      targetListId: number;
      position: number;
    }) => {
      const response = await fetch(`/api/cards/${cardId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listId: targetListId, position }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to move card");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}`] });
    },
  });

  // Archive list mutation
  const archiveListMutation = useMutation({
    mutationFn: async (listId: number) => {
      const response = await fetch(`/api/boards/${boardId}/lists/${listId}/archive`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to archive list");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}`] });
      toast({
        title: "Success",
        description: "List archived successfully",
      });
    },
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/boards/${boardId}/star`, {
        method: "PATCH",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to toggle star");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/boards/${boardId}`] });
    },
  });

  // Drag handlers
  const handleDragStart = (cardId: number, listId: number) => {
    setDraggedCard({ cardId, sourceListId: listId });
  };

  const handleDragOver = (e: React.DragEvent, listId: number) => {
    e.preventDefault();
    setDragOverList(listId);
  };

  const handleDragLeave = () => {
    setDragOverList(null);
  };

  const handleDrop = (e: React.DragEvent, targetListId: number) => {
    e.preventDefault();
    setDragOverList(null);

    if (!draggedCard) return;

    const { cardId, sourceListId } = draggedCard;

    if (sourceListId !== targetListId) {
      // Move card to different list
      const targetList = board?.lists.find((l) => l.id === targetListId);
      const position = targetList?.cards.length || 0;
      moveCardMutation.mutate({ cardId, targetListId, position });
    }

    setDraggedCard(null);
  };

  const handleAddList = () => {
    if (newListName.trim()) {
      createListMutation.mutate(newListName);
    }
  };

  const handleAddCard = (listId: number) => {
    if (newCardTitle.trim()) {
      createCardMutation.mutate({ listId, title: newCardTitle });
    }
  };

  const handleUpdateList = (listId: number) => {
    if (editingListName.trim()) {
      updateListMutation.mutate({ listId, name: editingListName });
    }
  };

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-600 to-blue-800 p-4">
        <div className="space-y-4">
          <Skeleton className="h-16 w-full bg-white/20" />
          <div className="flex gap-4 overflow-x-auto">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-80 bg-white/20 flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Board not found</h2>
          <Link href="/projects/boards">
            <Button variant="outline">Back to Boards</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: `linear-gradient(135deg, ${board.color} 0%, ${adjustColor(
          board.color,
          -30
        )} 100%)`,
      }}
    >
      {/* Board Header */}
      <div className="flex-shrink-0 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link href="/projects/boards">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-white truncate">{board.name}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleStarMutation.mutate()}
                className="text-white hover:bg-white/20"
              >
                <Star
                  className={`h-5 w-5 ${
                    board.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                  }`}
                />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              {/* Board Members */}
              <div className="flex -space-x-2">
                {board.members.slice(0, 5).map((member) => (
                  <Avatar
                    key={member.id}
                    className="h-8 w-8 border-2 border-white hover:z-10 cursor-pointer"
                  >
                    <AvatarImage src={member.avatar} alt={member.name} />
                    <AvatarFallback className="text-xs">
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {board.members.length > 5 && (
                  <Avatar className="h-8 w-8 border-2 border-white">
                    <AvatarFallback className="text-xs">+{board.members.length - 5}</AvatarFallback>
                  </Avatar>
                )}
              </div>

              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 gap-2">
                <Users className="h-4 w-4" />
                Invite
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Board Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Clock className="h-4 w-4 mr-2" />
                    Automation
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Archive className="h-4 w-4 mr-2" />
                    Archived Items
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Board Lists */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="flex gap-4 items-start pb-4">
            {board.lists
              .sort((a, b) => a.position - b.position)
              .map((list) => (
                <div
                  key={list.id}
                  className={`flex-shrink-0 w-80 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md transition-all ${
                    dragOverList === list.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, list.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, list.id)}
                >
                  {/* List Header */}
                  <div className="p-3 border-b">
                    <div className="flex items-center justify-between gap-2">
                      {editingListId === list.id ? (
                        <Input
                          value={editingListName}
                          onChange={(e) => setEditingListName(e.target.value)}
                          onBlur={() => handleUpdateList(list.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleUpdateList(list.id);
                            if (e.key === "Escape") setEditingListId(null);
                          }}
                          autoFocus
                          className="h-8"
                        />
                      ) : (
                        <h3
                          className="font-semibold flex-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 px-2 py-1 rounded"
                          onClick={() => {
                            setEditingListId(list.id);
                            setEditingListName(list.name);
                          }}
                        >
                          {list.name} <span className="text-muted-foreground">({list.cards.length})</span>
                        </h3>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setAddingCardToList(list.id)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Card
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingListId(list.id);
                              setEditingListName(list.name);
                            }}
                          >
                            <Settings className="h-4 w-4 mr-2" />
                            Rename List
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => archiveListMutation.mutate(list.id)}>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive List
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Cards */}
                  <ScrollArea className="max-h-[calc(100vh-300px)]">
                    <div className="p-2 space-y-2">
                      {list.cards
                        .sort((a, b) => a.position - b.position)
                        .map((card) => (
                          <CardComponent
                            key={card.id}
                            card={card}
                            onDragStart={() => handleDragStart(card.id, list.id)}
                          />
                        ))}

                      {/* Add Card Form */}
                      {addingCardToList === list.id ? (
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Enter card title..."
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleAddCard(list.id);
                              }
                              if (e.key === "Escape") setAddingCardToList(null);
                            }}
                            autoFocus
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAddCard(list.id)}
                              disabled={!newCardTitle.trim()}
                            >
                              Add Card
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setAddingCardToList(null);
                                setNewCardTitle("");
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAddingCardToList(list.id)}
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add a card
                        </Button>
                      )}
                    </div>
                  </ScrollArea>
                </div>
              ))}

            {/* Add List */}
            <div className="flex-shrink-0 w-80">
              {isAddingList ? (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 space-y-2">
                  <Input
                    placeholder="Enter list title..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleAddList();
                      if (e.key === "Escape") {
                        setIsAddingList(false);
                        setNewListName("");
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleAddList} disabled={!newListName.trim()}>
                      Add List
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setIsAddingList(false);
                        setNewListName("");
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => setIsAddingList(true)}
                  className="w-full justify-start bg-white/20 hover:bg-white/30 text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add another list
                </Button>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

// Card Component
interface CardComponentProps {
  card: Card;
  onDragStart: () => void;
}

function CardComponent({ card, onDragStart }: CardComponentProps) {
  const isOverdue = card.dueDate && isPast(new Date(card.dueDate));
  const completedItems = card.checklistItems.filter((item) => item.completed).length;
  const totalItems = card.checklistItems.length;
  const checklistProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <Link href={`/projects/tasks/${card.id}`}>
      <Card
        draggable
        onDragStart={onDragStart}
        className="cursor-pointer hover:shadow-lg transition-all group"
      >
        {card.coverImage && (
          <div className="h-24 w-full overflow-hidden rounded-t-lg">
            <img
              src={card.coverImage}
              alt=""
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
        )}
        <CardContent className="p-3 space-y-2">
          {/* Labels */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.map((label) => (
                <Badge
                  key={label.id}
                  className="h-2 w-10 p-0"
                  style={{ backgroundColor: label.color }}
                  title={label.name}
                />
              ))}
            </div>
          )}

          {/* Title */}
          <h4 className="font-medium text-sm line-clamp-3">{card.title}</h4>

          {/* Meta Info */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
            {card.dueDate && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                  isOverdue
                    ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <Calendar className="h-3 w-3" />
                {format(new Date(card.dueDate), "MMM d")}
                {isOverdue && <AlertCircle className="h-3 w-3" />}
              </div>
            )}
            {totalItems > 0 && (
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded ${
                  completedItems === totalItems
                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                    : "bg-gray-100 dark:bg-gray-700"
                }`}
              >
                <CheckSquare className="h-3 w-3" />
                {completedItems}/{totalItems}
              </div>
            )}
            {card.description && (
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
              </div>
            )}
            {card.attachmentCount > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-3 w-3" />
                {card.attachmentCount}
              </div>
            )}
          </div>

          {/* Checklist Progress */}
          {totalItems > 0 && (
            <Progress value={checklistProgress} className="h-1" />
          )}

          {/* Members */}
          {card.members.length > 0 && (
            <div className="flex -space-x-2">
              {card.members.slice(0, 3).map((member) => (
                <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {card.members.length > 3 && (
                <Avatar className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="text-xs">+{card.members.length - 3}</AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const clamp = (num: number) => Math.min(Math.max(num, 0), 255);

  const num = parseInt(color.replace("#", ""), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);

  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
