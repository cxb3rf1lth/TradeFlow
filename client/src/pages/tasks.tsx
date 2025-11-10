import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Plus, Filter, Calendar, User, Tag, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const mockTasks = [
  { id: 1, title: "Review Q4 sales pipeline", priority: "high", status: "in-progress", assignee: "Sarah Chen", dueDate: "Dec 15", progress: 65, tags: ["sales", "quarterly"] },
  { id: 2, title: "Update project roadmap", priority: "medium", status: "todo", assignee: "Mike Ross", dueDate: "Dec 20", progress: 30, tags: ["engineering"] },
  { id: 3, title: "Prepare investor deck", priority: "high", status: "in-progress", assignee: "Emma Wilson", dueDate: "Dec 18", progress: 80, tags: ["finance"] },
  { id: 4, title: "Team performance reviews", priority: "medium", status: "todo", assignee: "John Doe", dueDate: "Dec 22", progress: 10, tags: ["hr"] },
  { id: 5, title: "Security audit", priority: "high", status: "in-progress", assignee: "Alex Kim", dueDate: "Dec 12", progress: 90, tags: ["security"] },
  { id: 6, title: "Update documentation", priority: "low", status: "todo", assignee: "Lisa Park", dueDate: "Dec 25", progress: 0, tags: ["docs"] },
  { id: 7, title: "Client presentation", priority: "high", status: "done", assignee: "Sarah Chen", dueDate: "Dec 10", progress: 100, tags: ["sales"] },
];

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [view, setView] = useState<"list" | "board" | "calendar">("list");

  const filteredTasks = mockTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesPriority && matchesStatus;
  });

  const tasksByStatus = {
    todo: filteredTasks.filter(t => t.status === "todo"),
    "in-progress": filteredTasks.filter(t => t.status === "in-progress"),
    done: filteredTasks.filter(t => t.status === "done"),
  };

  const priorityColors: Record<string, string> = {
    high: "border-red-500 text-red-700",
    medium: "border-yellow-500 text-yellow-700",
    low: "border-green-500 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <CheckSquare className="h-8 w-8" />
            Tasks
          </h1>
          <p className="text-sm text-muted-foreground">Manage and track all your team's tasks</p>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />New Task</Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
              </div>
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" /><SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="board">Board View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-3 mt-6">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:bg-accent/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold truncate">{task.title}</h3>
                      <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
                      <Badge variant="secondary">{task.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assignee}</span>
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{task.dueDate}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Progress</span><span>{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-2" />
                    </div>
                    <div className="flex gap-1 mt-2">
                      {task.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs"><Tag className="h-3 w-3 mr-1" />{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="board" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["todo", "in-progress", "done"] as const).map((status) => (
              <Card key={status}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base capitalize flex items-center justify-between">
                    {status.replace("-", " ")}
                    <Badge variant="secondary">{tasksByStatus[status].length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {tasksByStatus[status].map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm mb-2">{task.title}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{task.assignee}</span>
                          <Badge variant="outline" className={priorityColors[task.priority]}>{task.priority}</Badge>
                        </div>
                        <Progress value={task.progress} className="h-1 mt-2" />
                      </CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
              <p className="text-sm text-muted-foreground">Calendar integration coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
