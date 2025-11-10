import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search,
  Plus,
  MoreHorizontal,
  Play,
  Pause,
  Copy,
  Trash2,
  History,
  Edit,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Skeleton } from "../../components/ui/skeleton";
import { Progress } from "../../components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Workflow {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: string;
    label: string;
  };
  actions: number;
  isActive: boolean;
  lastRun?: string;
  successRate: number;
  totalRuns: number;
  createdAt: string;
}

// Mock data
const mockWorkflows: Workflow[] = [
  {
    id: "1",
    name: "New Contact Welcome Email",
    description: "Automatically send welcome email when a new contact is added",
    trigger: { type: "contact_created", label: "Contact Created" },
    actions: 2,
    isActive: true,
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    successRate: 98.5,
    totalRuns: 342,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Deal Stage Notification",
    description: "Notify team when deal moves to Negotiation stage",
    trigger: { type: "deal_updated", label: "Deal Updated" },
    actions: 3,
    isActive: true,
    lastRun: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    successRate: 100,
    totalRuns: 89,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Task Overdue Reminder",
    description: "Send reminder emails for overdue tasks every morning",
    trigger: { type: "schedule", label: "Daily at 9:00 AM" },
    actions: 2,
    isActive: true,
    lastRun: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    successRate: 95.2,
    totalRuns: 156,
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "Lead Score Update",
    description: "Update lead score based on email engagement",
    trigger: { type: "email_opened", label: "Email Opened" },
    actions: 4,
    isActive: false,
    lastRun: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    successRate: 88.3,
    totalRuns: 523,
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Project Creation from Deal",
    description: "Automatically create project when deal is won",
    trigger: { type: "deal_won", label: "Deal Won" },
    actions: 5,
    isActive: true,
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    successRate: 100,
    totalRuns: 45,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const workflowTemplates = [
  {
    id: "t1",
    name: "Lead Nurturing Campaign",
    description: "Automatically nurture new leads with a series of emails",
    trigger: "Lead Created",
  },
  {
    id: "t2",
    name: "Customer Onboarding",
    description: "Streamline customer onboarding with automated tasks",
    trigger: "Deal Closed Won",
  },
  {
    id: "t3",
    name: "Task Assignment",
    description: "Automatically assign tasks based on criteria",
    trigger: "Contact Updated",
  },
  {
    id: "t4",
    name: "Follow-up Reminder",
    description: "Send reminders for follow-up activities",
    trigger: "Schedule",
  },
];

export default function Workflows() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch workflows
  const {
    data: workflows,
    isLoading,
    error,
    refetch,
  } = useQuery<Workflow[]>({
    queryKey: ["/api/workflows"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockWorkflows;
    },
  });

  // Toggle workflow active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, isActive };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow updated",
        description: "The workflow status has been updated.",
      });
    },
  });

  // Delete workflow
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow deleted",
        description: "The workflow has been deleted.",
      });
    },
  });

  // Duplicate workflow
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workflows"] });
      toast({
        title: "Workflow duplicated",
        description: "The workflow has been duplicated.",
      });
    },
  });

  const filteredWorkflows = workflows?.filter((workflow) => {
    const matchesSearch =
      searchTerm === "" ||
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && workflow.isActive) ||
      (statusFilter === "inactive" && !workflow.isActive);

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: workflows?.length || 0,
    active: workflows?.filter((w) => w.isActive).length || 0,
    totalRuns: workflows?.reduce((sum, w) => sum + w.totalRuns, 0) || 0,
    avgSuccessRate:
      (workflows?.reduce((sum, w) => sum + w.successRate, 0) ?? 0) / (workflows?.length || 1),
  };

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading workflows</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the workflows.
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
          <p className="text-muted-foreground">Automate your business processes</p>
        </div>
        <Button onClick={() => navigate("/automation/workflow-builder")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.total - stats.active} inactive
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRuns.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Average across all workflows</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Workflows</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Workflows Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Run</TableHead>
                  <TableHead>Success Rate</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkflows?.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{workflow.name}</p>
                        <p className="text-sm text-muted-foreground">{workflow.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{workflow.trigger.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{workflow.actions} actions</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={workflow.isActive}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: workflow.id, isActive: checked })
                          }
                        />
                        <span className="text-sm">
                          {workflow.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {workflow.lastRun
                        ? format(new Date(workflow.lastRun), "MMM d, h:mm a")
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Progress value={workflow.successRate} className="w-16" />
                          <span className="text-sm font-medium">
                            {workflow.successRate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{workflow.totalRuns}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => navigate(`/automation/workflow-builder?id=${workflow.id}`)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => duplicateMutation.mutate(workflow.id)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="h-4 w-4 mr-2" />
                            View History
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(workflow.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Workflow Templates */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Workflow Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {workflowTemplates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">{template.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                <Badge variant="outline" className="text-xs">
                  {template.trigger}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4"
                  onClick={() => navigate("/automation/workflow-builder")}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
