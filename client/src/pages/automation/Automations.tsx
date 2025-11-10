import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Copy,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  X,
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
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const conditionSchema = z.object({
  field: z.string().min(1, "Field is required"),
  operator: z.string().min(1, "Operator is required"),
  value: z.string().min(1, "Value is required"),
});

const actionSchema = z.object({
  type: z.string().min(1, "Action type is required"),
  config: z.record(z.any()),
});

const ruleSchema = z.object({
  name: z.string().min(1, "Rule name is required"),
  triggerType: z.string().min(1, "Trigger type is required"),
  conditions: z.array(conditionSchema).min(1, "At least one condition is required"),
  actions: z.array(actionSchema).min(1, "At least one action is required"),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface AutomationRule {
  id: string;
  name: string;
  triggerType: string;
  conditions: Array<{
    field: string;
    operator: string;
    value: string;
  }>;
  actions: Array<{
    type: string;
    config: Record<string, any>;
  }>;
  isEnabled: boolean;
  executionCount: number;
  lastExecuted?: string;
  createdAt: string;
}

interface ExecutionLog {
  id: string;
  ruleId: string;
  ruleName: string;
  status: "success" | "failed";
  timestamp: string;
  details: string;
}

// Mock data
const mockRules: AutomationRule[] = [
  {
    id: "1",
    name: "High-value lead notification",
    triggerType: "contact_created",
    conditions: [
      { field: "company_size", operator: "greater_than", value: "100" },
      { field: "budget", operator: "greater_than", value: "50000" },
    ],
    actions: [
      {
        type: "send_notification",
        config: { recipients: ["sales-team"], message: "New high-value lead created" },
      },
      { type: "assign_to", config: { userId: "sales-manager" } },
    ],
    isEnabled: true,
    executionCount: 45,
    lastExecuted: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    name: "Deal won celebration",
    triggerType: "deal_updated",
    conditions: [{ field: "stage", operator: "equals", value: "won" }],
    actions: [
      {
        type: "send_email",
        config: { to: "team@company.com", subject: "Deal won!", template: "celebration" },
      },
      { type: "create_task", config: { title: "Send thank you note", assignee: "account-manager" } },
    ],
    isEnabled: true,
    executionCount: 23,
    lastExecuted: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Inactive contact cleanup",
    triggerType: "contact_updated",
    conditions: [{ field: "last_contacted", operator: "older_than", value: "180" }],
    actions: [
      { type: "update_field", config: { field: "status", value: "inactive" } },
      { type: "add_tag", config: { tag: "needs-reengagement" } },
    ],
    isEnabled: false,
    executionCount: 156,
    lastExecuted: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const mockExecutionLogs: ExecutionLog[] = [
  {
    id: "1",
    ruleId: "1",
    ruleName: "High-value lead notification",
    status: "success",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    details: "Notified sales team about new lead from Acme Corp",
  },
  {
    id: "2",
    ruleId: "2",
    ruleName: "Deal won celebration",
    status: "success",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: "Sent celebration email for $50,000 deal",
  },
  {
    id: "3",
    ruleId: "1",
    ruleName: "High-value lead notification",
    status: "failed",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    details: "Failed to send notification: Email service unavailable",
  },
];

export default function Automations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);

  // Fetch rules
  const {
    data: rules,
    isLoading,
    error,
    refetch,
  } = useQuery<AutomationRule[]>({
    queryKey: ["/api/automation/rules"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockRules;
    },
  });

  // Fetch execution logs
  const { data: executionLogs } = useQuery<ExecutionLog[]>({
    queryKey: ["/api/automation/logs"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockExecutionLogs;
    },
  });

  // Create rule mutation
  const createMutation = useMutation({
    mutationFn: async (data: RuleFormData) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: Math.random().toString(), ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
      setIsCreateDialogOpen(false);
      reset();
      toast({
        title: "Rule created",
        description: "Your automation rule has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create rule. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Toggle rule
  const toggleMutation = useMutation({
    mutationFn: async ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, isEnabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
    },
  });

  // Delete rule
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
      toast({
        title: "Rule deleted",
        description: "The automation rule has been deleted.",
      });
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      triggerType: "",
      conditions: [{ field: "", operator: "", value: "" }],
      actions: [{ type: "", config: {} }],
    },
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: "conditions",
  });

  const {
    fields: actionFields,
    append: appendAction,
    remove: removeAction,
  } = useFieldArray({
    control,
    name: "actions",
  });

  const onSubmit = (data: RuleFormData) => {
    createMutation.mutate(data);
  };

  const filteredRules = rules?.filter((rule) => {
    const matchesSearch =
      searchTerm === "" || rule.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "enabled" && rule.isEnabled) ||
      (statusFilter === "disabled" && !rule.isEnabled);

    return matchesSearch && matchesStatus;
  });

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading rules</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the automation rules.
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
          <h1 className="text-3xl font-bold tracking-tight">Automation Rules</h1>
          <p className="text-muted-foreground">Create rules to automate your workflows</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>
                Define when and how your automation should execute
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input id="name" {...register("name")} placeholder="My automation rule" />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerType">Trigger Type *</Label>
                  <Select onValueChange={(value) => register("triggerType").onChange({ target: { value } })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact_created">Contact Created</SelectItem>
                      <SelectItem value="contact_updated">Contact Updated</SelectItem>
                      <SelectItem value="deal_created">Deal Created</SelectItem>
                      <SelectItem value="deal_updated">Deal Updated</SelectItem>
                      <SelectItem value="task_completed">Task Completed</SelectItem>
                      <SelectItem value="email_received">Email Received</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.triggerType && (
                    <p className="text-sm text-destructive">{errors.triggerType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Conditions *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCondition({ field: "", operator: "", value: "" })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Condition
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {conditionFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                              <Label>Field</Label>
                              <Select
                                onValueChange={(value) =>
                                  register(`conditions.${index}.field`).onChange({
                                    target: { value },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select field" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="email">Email</SelectItem>
                                  <SelectItem value="status">Status</SelectItem>
                                  <SelectItem value="stage">Stage</SelectItem>
                                  <SelectItem value="amount">Amount</SelectItem>
                                  <SelectItem value="company_size">Company Size</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label>Operator</Label>
                              <Select
                                onValueChange={(value) =>
                                  register(`conditions.${index}.operator`).onChange({
                                    target: { value },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select operator" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="equals">Equals</SelectItem>
                                  <SelectItem value="not_equals">Not Equals</SelectItem>
                                  <SelectItem value="contains">Contains</SelectItem>
                                  <SelectItem value="greater_than">Greater Than</SelectItem>
                                  <SelectItem value="less_than">Less Than</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex-1 space-y-2">
                              <Label>Value</Label>
                              <Input
                                {...register(`conditions.${index}.value`)}
                                placeholder="Value"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeCondition(index)}
                              disabled={conditionFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Actions *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAction({ type: "", config: {} })}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {actionFields.map((field, index) => (
                      <Card key={field.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-2">
                              <Label>Action Type</Label>
                              <Select
                                onValueChange={(value) =>
                                  register(`actions.${index}.type`).onChange({
                                    target: { value },
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select action" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="send_email">Send Email</SelectItem>
                                  <SelectItem value="send_notification">Send Notification</SelectItem>
                                  <SelectItem value="create_task">Create Task</SelectItem>
                                  <SelectItem value="update_field">Update Field</SelectItem>
                                  <SelectItem value="add_tag">Add Tag</SelectItem>
                                  <SelectItem value="assign_to">Assign To</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeAction(index)}
                              disabled={actionFields.length === 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {rules?.filter((r) => r.isEnabled).length || 0} enabled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules?.reduce((sum, r) => sum + r.executionCount, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(
                (executionLogs?.filter((l) => l.status === "success").length || 0) /
                (executionLogs?.length || 1) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
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
                placeholder="Search rules..."
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
                <SelectItem value="all">All Rules</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Trigger</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Actions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Executions</TableHead>
                  <TableHead>Last Executed</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules?.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <p className="font-medium">{rule.name}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{rule.triggerType.replace("_", " ")}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.conditions.length} conditions</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rule.actions.length} actions</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={rule.isEnabled}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: rule.id, isEnabled: checked })
                          }
                        />
                        <span className="text-sm">{rule.isEnabled ? "Enabled" : "Disabled"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{rule.executionCount}</TableCell>
                    <TableCell>
                      {rule.lastExecuted
                        ? format(new Date(rule.lastExecuted), "MMM d, h:mm a")
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Activity className="h-4 w-4 mr-2" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteMutation.mutate(rule.id)}
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

      {/* Execution Logs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Execution Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {executionLogs?.slice(0, 5).map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <div className="mt-1">
                  {log.status === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{log.ruleName}</p>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <Badge variant={log.status === "success" ? "default" : "destructive"}>
                  {log.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
