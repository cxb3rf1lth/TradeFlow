import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/lib/use-toast";
import type { Task, User, Integration, InsertTask } from "@shared/schema";
import { CheckCircle2, Clock, AlertCircle, ListTodo, Mail, FileText, Sparkles, TrendingUp, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface TaskStats {
  total: number;
  inProgress: number;
  completed: number;
  overdue: number;
}

interface AIInsight {
  type: "info" | "warning" | "success";
  message: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createNoteOpen, setCreateNoteOpen] = useState(false);
  const [sendEmailOpen, setSendEmailOpen] = useState(false);

  // Form states
  const [newTask, setNewTask] = useState<Partial<InsertTask>>({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    source: "manual",
  });
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [newEmail, setNewEmail] = useState({ to: "", subject: "", body: "" });

  // Fetch tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    queryFn: () => apiRequest("/api/tasks"),
  });

  // Fetch users for assignee selection
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
  });

  // Fetch integrations
  const { data: integrations = [] } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
    queryFn: () => apiRequest("/api/integrations"),
  });

  // Fetch AI insights
  const { data: aiInsights = [] } = useQuery<AIInsight[]>({
    queryKey: ["/api/ai/dashboard-insights"],
    queryFn: () => apiRequest("/api/ai/dashboard-insights"),
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (task: Partial<InsertTask>) =>
      apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify(task),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      setCreateTaskOpen(false);
      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        source: "manual",
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

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (note: { title: string; content: string; createdBy: string }) =>
      apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify(note),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      setCreateNoteOpen(false);
      setNewNote({ title: "", content: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Send email mutation (PA only)
  const sendEmailMutation = useMutation({
    mutationFn: (email: { to: string; subject: string; body: string; sentBy: string }) =>
      apiRequest("/api/email/send", {
        method: "POST",
        body: JSON.stringify(email),
      }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Email sent successfully",
      });
      setSendEmailOpen(false);
      setNewEmail({ to: "", subject: "", body: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Calculate task statistics
  const taskStats: TaskStats = {
    total: tasks.length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed").length,
  };

  // Get recent tasks (last 5)
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate(newTask);
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createNoteMutation.mutate({ ...newNote, createdBy: user.id });
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      sendEmailMutation.mutate({ ...newEmail, sentBy: user.id });
    }
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "in_progress":
        return "secondary";
      default:
        return "outline";
    }
  };

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name || "User"}!
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your workflow and tasks
        </p>
      </div>

      {/* Task Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.total}</div>
            <p className="text-xs text-muted-foreground">Active tasks in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.completed}</div>
            <p className="text-xs text-muted-foreground">Successfully finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskStats.overdue}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Your latest tasks and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No tasks yet. Create your first task to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-start justify-between space-x-4 border-b pb-4 last:border-0">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Badge variant={getPriorityBadgeVariant(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    {task.dueDate && (
                      <div className="text-xs text-muted-foreground">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Create Task Dialog */}
            <Dialog open={createTaskOpen} onOpenChange={setCreateTaskOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <ListTodo className="mr-2 h-4 w-4" />
                  Create New Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                  <DialogDescription>Add a new task to your workflow</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Title</Label>
                    <Input
                      id="task-title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-description">Description</Label>
                    <Textarea
                      id="task-description"
                      value={newTask.description || ""}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger id="task-priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-assignee">Assignee</Label>
                    <Select
                      value={newTask.assigneeId || ""}
                      onValueChange={(value) => setNewTask({ ...newTask, assigneeId: value })}
                    >
                      <SelectTrigger id="task-assignee">
                        <SelectValue placeholder="Select assignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id}>
                            {u.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-due-date">Due Date</Label>
                    <Input
                      id="task-due-date"
                      type="date"
                      onChange={(e) =>
                        setNewTask({ ...newTask, dueDate: e.target.value ? new Date(e.target.value) : undefined })
                      }
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
                    {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Send Email Dialog (PA only) */}
            {user?.role === "virtual_pa" && (
              <Dialog open={sendEmailOpen} onOpenChange={setSendEmailOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full justify-start" variant="outline">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Email</DialogTitle>
                    <DialogDescription>Compose and send an email</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSendEmail} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-to">To</Label>
                      <Input
                        id="email-to"
                        type="email"
                        value={newEmail.to}
                        onChange={(e) => setNewEmail({ ...newEmail, to: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        value={newEmail.subject}
                        onChange={(e) => setNewEmail({ ...newEmail, subject: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-body">Message</Label>
                      <Textarea
                        id="email-body"
                        value={newEmail.body}
                        onChange={(e) => setNewEmail({ ...newEmail, body: e.target.value })}
                        rows={5}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={sendEmailMutation.isPending}>
                      {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {/* Create Note Dialog */}
            <Dialog open={createNoteOpen} onOpenChange={setCreateNoteOpen}>
              <DialogTrigger asChild>
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Create Note
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Note</DialogTitle>
                  <DialogDescription>Add a new note to your collection</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateNote} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="note-title">Title</Label>
                    <Input
                      id="note-title"
                      value={newNote.title}
                      onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="note-content">Content</Label>
                    <Textarea
                      id="note-content"
                      value={newNote.content}
                      onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createNoteMutation.isPending}>
                    {createNoteMutation.isPending ? "Creating..." : "Create Note"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>Intelligent recommendations for your workflow</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiInsights.length === 0 ? (
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  AI is analyzing your workflow patterns. Check back soon for personalized insights!
                </AlertDescription>
              </Alert>
            ) : (
              aiInsights.map((insight, index) => (
                <Alert key={index} variant={insight.type === "warning" ? "destructive" : "default"}>
                  <AlertDescription>{insight.message}</AlertDescription>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>

        {/* Integration Status */}
        <Card>
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>Connected services and their status</CardDescription>
          </CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No integrations connected. Visit the Integrations page to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {integration.status === "connected" ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{integration.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {integration.lastSync
                            ? `Last synced: ${new Date(integration.lastSync).toLocaleDateString()}`
                            : "Never synced"}
                        </p>
                      </div>
                    </div>
                    <Badge variant={integration.status === "connected" ? "default" : "secondary"}>
                      {integration.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
