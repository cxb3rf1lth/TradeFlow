import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  List,
  LayoutGrid,
  Calendar as CalendarIcon,
  Users,
  Tag,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  Trash2,
  Archive,
  Copy,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Checkbox } from "../../components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { format, isPast, isToday, isTomorrow } from "date-fns";

// Types
interface Task {
  id: number;
  title: string;
  description?: string;
  boardId: number;
  boardName: string;
  boardColor: string;
  listId: number;
  listName: string;
  dueDate?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "todo" | "in_progress" | "review" | "done";
  labels: Label[];
  assignees: Member[];
  checklistProgress?: {
    completed: number;
    total: number;
  };
  createdAt: string;
  updatedAt: string;
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

interface Board {
  id: number;
  name: string;
  color: string;
}

type ViewMode = "list" | "grid" | "calendar";
type SortField = "title" | "dueDate" | "priority" | "status" | "board" | "updatedAt";
type SortOrder = "asc" | "desc";

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

export default function TaskList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBoard, setSelectedBoard] = useState<string>("all");
  const [selectedAssignee, setSelectedAssignee] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showOverdue, setShowOverdue] = useState(false);
  const [showMyTasks, setShowMyTasks] = useState(false);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedTasks, setSelectedTasks] = useState<Set<number>>(new Set());

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Fetch boards for filter
  const { data: boards } = useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });

  // Get current user (for "My Tasks" filter)
  const { data: currentUser } = useQuery<Member>({
    queryKey: ["/api/user"],
  });

  // Delete tasks mutation
  const deleteTasksMutation = useMutation({
    mutationFn: async (taskIds: number[]) => {
      const response = await fetch("/api/tasks/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskIds }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete tasks");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setSelectedTasks(new Set());
      toast({
        title: "Success",
        description: "Tasks deleted successfully",
      });
    },
  });

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    if (!tasks) return [];

    let filtered = tasks.filter((task) => {
      // Search filter
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Board filter
      if (selectedBoard !== "all" && task.boardId !== parseInt(selectedBoard)) {
        return false;
      }

      // Assignee filter
      if (
        selectedAssignee !== "all" &&
        !task.assignees.some((a) => a.id === parseInt(selectedAssignee))
      ) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== "all" && task.priority !== selectedPriority) {
        return false;
      }

      // Status filter
      if (selectedStatus !== "all" && task.status !== selectedStatus) {
        return false;
      }

      // Overdue filter
      if (showOverdue && (!task.dueDate || !isPast(new Date(task.dueDate)))) {
        return false;
      }

      // My tasks filter
      if (
        showMyTasks &&
        currentUser &&
        !task.assignees.some((a) => a.id === currentUser.id)
      ) {
        return false;
      }

      return true;
    });

    // Sort tasks
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "dueDate":
          aValue = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          bValue = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          break;
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        case "board":
          aValue = a.boardName.toLowerCase();
          bValue = b.boardName.toLowerCase();
          break;
        case "updatedAt":
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [
    tasks,
    searchQuery,
    selectedBoard,
    selectedAssignee,
    selectedPriority,
    selectedStatus,
    showOverdue,
    showMyTasks,
    currentUser,
    sortField,
    sortOrder,
  ]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === filteredAndSortedTasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(filteredAndSortedTasks.map((t) => t.id)));
    }
  };

  const handleSelectTask = (taskId: number) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedTasks.size > 0) {
      deleteTasksMutation.mutate(Array.from(selectedTasks));
    }
  };

  const formatDueDate = (date: string) => {
    const dueDate = new Date(date);
    if (isToday(dueDate)) return "Today";
    if (isTomorrow(dueDate)) return "Tomorrow";
    return format(dueDate, "MMM d, yyyy");
  };

  const getDueDateColor = (date?: string) => {
    if (!date) return "";
    const dueDate = new Date(date);
    if (isPast(dueDate)) return "text-red-600 dark:text-red-400";
    if (isToday(dueDate)) return "text-orange-600 dark:text-orange-400";
    return "text-muted-foreground";
  };

  // Get unique assignees for filter
  const allAssignees = useMemo(() => {
    if (!tasks) return [];
    const assigneesMap = new Map<number, Member>();
    tasks.forEach((task) => {
      task.assignees.forEach((assignee) => {
        if (!assigneesMap.has(assignee.id)) {
          assigneesMap.set(assignee.id, assignee);
        }
      });
    });
    return Array.from(assigneesMap.values());
  }, [tasks]);

  return (
    <div className="h-full bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <CheckSquare className="h-8 w-8 text-blue-600" />
              Tasks
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your tasks in one place
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/projects/boards">
              <Button variant="outline">View Boards</Button>
            </Link>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Board Filter */}
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Boards" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Boards</SelectItem>
                  {boards?.map((board) => (
                    <SelectItem key={board.id} value={board.id.toString()}>
                      {board.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Assignee Filter */}
              <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
                <SelectTrigger className="w-full lg:w-[180px]">
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {allAssignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id.toString()}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Priority Filter */}
              <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full lg:w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>

              {/* More Filters */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={showOverdue}
                    onCheckedChange={setShowOverdue}
                  >
                    Overdue Tasks Only
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={showMyTasks}
                    onCheckedChange={setShowMyTasks}
                  >
                    My Tasks Only
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* View Mode & Bulk Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
                <TabsTrigger value="grid" className="gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {selectedTasks.size > 0 && (
              <div className="flex items-center gap-2 ml-4">
                <span className="text-sm text-muted-foreground">
                  {selectedTasks.size} selected
                </span>
                <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Tasks View */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : filteredAndSortedTasks.length > 0 ? (
          viewMode === "list" ? (
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedTasks.size === filteredAndSortedTasks.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("title")}
                    >
                      <div className="flex items-center gap-2">
                        Title
                        {sortField === "title" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("board")}
                    >
                      <div className="flex items-center gap-2">
                        Board
                        {sortField === "board" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>List</TableHead>
                    <TableHead>Assignees</TableHead>
                    <TableHead>Labels</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("dueDate")}
                    >
                      <div className="flex items-center gap-2">
                        Due Date
                        {sortField === "dueDate" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("priority")}
                    >
                      <div className="flex items-center gap-2">
                        Priority
                        {sortField === "priority" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSort("status")}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        {sortField === "status" && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedTasks.map((task) => (
                    <TableRow key={task.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedTasks.has(task.id)}
                          onCheckedChange={() => handleSelectTask(task.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Link href={`/projects/tasks/${task.id}`}>
                          <div className="flex items-start gap-2">
                            <span className="font-medium hover:text-blue-600 cursor-pointer line-clamp-2">
                              {task.title}
                            </span>
                            {task.checklistProgress && (
                              <Badge variant="secondary" className="text-xs">
                                {task.checklistProgress.completed}/{task.checklistProgress.total}
                              </Badge>
                            )}
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          style={{ borderColor: task.boardColor }}
                        >
                          {task.boardName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{task.listName}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <Avatar
                              key={assignee.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              <AvatarImage src={assignee.avatar} alt={assignee.name} />
                              <AvatarFallback className="text-xs">
                                {assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {task.assignees.length > 3 && (
                            <Avatar className="h-6 w-6 border-2 border-background">
                              <AvatarFallback className="text-xs">
                                +{task.assignees.length - 3}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {task.labels.slice(0, 3).map((label) => (
                            <Badge
                              key={label.id}
                              className="h-2 w-8 p-0"
                              style={{ backgroundColor: label.color }}
                              title={label.name}
                            />
                          ))}
                          {task.labels.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.labels.length - 3}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {task.dueDate && (
                          <div className={`flex items-center gap-1 text-sm ${getDueDateColor(task.dueDate)}`}>
                            <Calendar className="h-3 w-3" />
                            {formatDueDate(task.dueDate)}
                            {isPast(new Date(task.dueDate)) && (
                              <AlertCircle className="h-3 w-3" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${PRIORITY_COLORS[task.priority]} text-white`}>
                          {PRIORITY_LABELS[task.priority]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {task.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Copy className="h-4 w-4 mr-2" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteTasksMutation.mutate([task.id])}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <Checkbox
                        checked={selectedTasks.has(task.id)}
                        onCheckedChange={() => handleSelectTask(task.id)}
                      />
                      <Badge className={`${PRIORITY_COLORS[task.priority]} text-white text-xs`}>
                        {PRIORITY_LABELS[task.priority]}
                      </Badge>
                    </div>

                    {task.labels.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.labels.slice(0, 3).map((label) => (
                          <Badge
                            key={label.id}
                            className="h-2 w-10 p-0"
                            style={{ backgroundColor: label.color }}
                            title={label.name}
                          />
                        ))}
                      </div>
                    )}

                    <Link href={`/projects/tasks/${task.id}`}>
                      <h3 className="font-medium text-sm line-clamp-2 hover:text-blue-600 cursor-pointer">
                        {task.title}
                      </h3>
                    </Link>

                    <div className="space-y-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" style={{ borderColor: task.boardColor }}>
                          {task.boardName}
                        </Badge>
                      </div>

                      {task.dueDate && (
                        <div className={`flex items-center gap-1 ${getDueDateColor(task.dueDate)}`}>
                          <Calendar className="h-3 w-3" />
                          {formatDueDate(task.dueDate)}
                          {isPast(new Date(task.dueDate)) && <AlertCircle className="h-3 w-3" />}
                        </div>
                      )}

                      {task.assignees.length > 0 && (
                        <div className="flex -space-x-2">
                          {task.assignees.slice(0, 3).map((assignee) => (
                            <Avatar
                              key={assignee.id}
                              className="h-6 w-6 border-2 border-background"
                            >
                              <AvatarImage src={assignee.avatar} alt={assignee.name} />
                              <AvatarFallback className="text-xs">
                                {assignee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-6">
              <div className="text-center text-muted-foreground">
                Calendar view coming soon...
              </div>
            </Card>
          )
        ) : (
          <Card className="p-12">
            <div className="text-center">
              <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create a new task
              </p>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Task
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
