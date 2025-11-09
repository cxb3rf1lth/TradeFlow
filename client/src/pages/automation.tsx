import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/lib/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AutomationRule, User } from "@shared/schema";
import { Plus, Edit2, Trash2, Play, Zap, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const TRIGGERS = [
  { value: "task_created", label: "Task Created", description: "When a new task is created" },
  { value: "task_completed", label: "Task Completed", description: "When a task is marked as completed" },
  { value: "task_overdue", label: "Task Overdue", description: "When a task becomes overdue" },
  { value: "task_assigned", label: "Task Assigned", description: "When a task is assigned to someone" },
  { value: "email_received", label: "Email Received", description: "When a new email is received" },
  { value: "integration_sync", label: "Integration Synced", description: "When an integration completes sync" },
  { value: "note_created", label: "Note Created", description: "When a new note is created" },
  { value: "daily_schedule", label: "Daily at Specific Time", description: "Runs daily at a specific time" },
];

const ACTIONS = [
  { value: "send_email", label: "Send Email", description: "Send an email notification" },
  { value: "create_task", label: "Create Task", description: "Automatically create a new task" },
  { value: "assign_task", label: "Assign Task", description: "Assign task to a team member" },
  { value: "update_task_priority", label: "Update Task Priority", description: "Change task priority" },
  { value: "send_slack_message", label: "Send Slack Message", description: "Post message to Slack" },
  { value: "create_note", label: "Create Note", description: "Automatically create a note" },
  { value: "webhook", label: "Call Webhook", description: "Send data to a webhook URL" },
];

interface TestResult {
  success: boolean;
  message: string;
  executionTime?: number;
}

export default function AutomationPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Form states
  const [newRule, setNewRule] = useState({
    name: "",
    trigger: "",
    action: "",
    enabled: true,
  });

  const [editRule, setEditRule] = useState<Partial<AutomationRule>>({});

  // Fetch automation rules
  const { data: rules = [], isLoading } = useQuery<AutomationRule[]>({
    queryKey: ["/api/automation/rules"],
    queryFn: () => apiRequest("/api/automation/rules"),
  });

  // Fetch users for assignment actions
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: (rule: { name: string; trigger: string; action: string; enabled: boolean; createdBy: string }) =>
      apiRequest("/api/automation/rules", {
        method: "POST",
        body: JSON.stringify(rule),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
      toast({
        title: "Success",
        description: "Automation rule created successfully",
      });
      setCreateDialogOpen(false);
      setNewRule({ name: "", trigger: "", action: "", enabled: true });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<AutomationRule> & { id: string }) =>
      apiRequest(`/api/automation/rules/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
      toast({
        title: "Success",
        description: "Automation rule updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedRule(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/automation/rules/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
      toast({
        title: "Success",
        description: "Automation rule deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedRule(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle enabled mutation
  const toggleEnabledMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiRequest(`/api/automation/rules/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automation/rules"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Test rule mutation
  const testRuleMutation = useMutation({
    mutationFn: (ruleId: string) =>
      apiRequest<TestResult>(`/api/automation/rules/${ruleId}/test`, {
        method: "POST",
      }),
    onSuccess: (data) => {
      setTestResult(data);
    },
    onError: (error: Error) => {
      setTestResult({
        success: false,
        message: error.message,
      });
    },
  });

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createRuleMutation.mutate({ ...newRule, createdBy: user.id });
    }
  };

  const handleEditRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (editRule.id) {
      updateRuleMutation.mutate(editRule as AutomationRule);
    }
  };

  const handleDeleteRule = () => {
    if (selectedRule) {
      deleteRuleMutation.mutate(selectedRule.id);
    }
  };

  const openEditDialog = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setEditRule(rule);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setDeleteDialogOpen(true);
  };

  const openTestDialog = (rule: AutomationRule) => {
    setSelectedRule(rule);
    setTestResult(null);
    setTestDialogOpen(true);
  };

  const handleTestRule = () => {
    if (selectedRule) {
      testRuleMutation.mutate(selectedRule.id);
    }
  };

  const toggleRuleEnabled = (rule: AutomationRule) => {
    toggleEnabledMutation.mutate({ id: rule.id, enabled: !rule.enabled });
  };

  const getTriggerInfo = (trigger: string) => {
    return TRIGGERS.find((t) => t.value === trigger);
  };

  const getActionInfo = (action: string) => {
    return ACTIONS.find((a) => a.value === action);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading automation rules...</p>
        </div>
      </div>
    );
  }

  const enabledRules = rules.filter((r) => r.enabled).length;
  const disabledRules = rules.filter((r) => !r.enabled).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Automation</h1>
          <p className="text-muted-foreground">
            Create automated workflows to streamline your processes
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Automation Rule</DialogTitle>
              <DialogDescription>Set up a new automation workflow</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input
                  id="rule-name"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  placeholder="e.g., Auto-assign high priority tasks"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-trigger">Trigger</Label>
                <Select
                  value={newRule.trigger}
                  onValueChange={(value) => setNewRule({ ...newRule, trigger: value })}
                >
                  <SelectTrigger id="rule-trigger">
                    <SelectValue placeholder="Select a trigger" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((trigger) => (
                      <SelectItem key={trigger.value} value={trigger.value}>
                        <div className="space-y-1">
                          <div className="font-medium">{trigger.label}</div>
                          <div className="text-xs text-muted-foreground">{trigger.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rule-action">Action</Label>
                <Select
                  value={newRule.action}
                  onValueChange={(value) => setNewRule({ ...newRule, action: value })}
                >
                  <SelectTrigger id="rule-action">
                    <SelectValue placeholder="Select an action" />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIONS.map((action) => (
                      <SelectItem key={action.value} value={action.value}>
                        <div className="space-y-1">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-xs text-muted-foreground">{action.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="rule-enabled">Enable Rule</Label>
                  <p className="text-sm text-muted-foreground">Activate this rule immediately</p>
                </div>
                <Switch
                  id="rule-enabled"
                  checked={newRule.enabled}
                  onCheckedChange={(checked) => setNewRule({ ...newRule, enabled: checked })}
                />
              </div>
              <Button type="submit" className="w-full" disabled={createRuleMutation.isPending}>
                {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">Automation workflows</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enabledRules}</div>
            <p className="text-xs text-muted-foreground">Active rules</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disabled</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disabledRules}</div>
            <p className="text-xs text-muted-foreground">Inactive rules</p>
          </CardContent>
        </Card>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                No automation rules yet. Create your first rule to automate your workflow!
              </p>
            </CardContent>
          </Card>
        ) : (
          rules.map((rule) => {
            const triggerInfo = getTriggerInfo(rule.trigger);
            const actionInfo = getActionInfo(rule.action);

            return (
              <Card key={rule.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-purple-500 bg-opacity-10 rounded-lg">
                        <Zap className="h-6 w-6 text-purple-500" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <Badge variant={rule.enabled ? "default" : "secondary"}>
                              {rule.enabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Created {new Date(rule.createdAt!).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">WHEN</p>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{triggerInfo?.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {triggerInfo?.description}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">THEN</p>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">{actionInfo?.label}</p>
                              <p className="text-xs text-muted-foreground">
                                {actionInfo?.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRuleEnabled(rule)}
                        disabled={toggleEnabledMutation.isPending}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openTestDialog(rule)}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(rule)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(rule)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Edit Rule Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Automation Rule</DialogTitle>
            <DialogDescription>Update your automation workflow</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditRule} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-rule-name">Rule Name</Label>
              <Input
                id="edit-rule-name"
                value={editRule.name || ""}
                onChange={(e) => setEditRule({ ...editRule, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rule-trigger">Trigger</Label>
              <Select
                value={editRule.trigger}
                onValueChange={(value) => setEditRule({ ...editRule, trigger: value })}
              >
                <SelectTrigger id="edit-rule-trigger">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIGGERS.map((trigger) => (
                    <SelectItem key={trigger.value} value={trigger.value}>
                      {trigger.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rule-action">Action</Label>
              <Select
                value={editRule.action}
                onValueChange={(value) => setEditRule({ ...editRule, action: value })}
              >
                <SelectTrigger id="edit-rule-action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={updateRuleMutation.isPending}>
              {updateRuleMutation.isPending ? "Updating..." : "Update Rule"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Automation Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedRule?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRule}
              disabled={deleteRuleMutation.isPending}
            >
              {deleteRuleMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Rule Dialog */}
      <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Test Automation Rule</DialogTitle>
            <DialogDescription>
              Test "{selectedRule?.name}" to verify it works correctly
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {testResult ? (
              <Alert variant={testResult.success ? "default" : "destructive"}>
                <AlertDescription>
                  {testResult.message}
                  {testResult.executionTime && (
                    <p className="mt-2 text-xs">
                      Execution time: {testResult.executionTime}ms
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <AlertDescription>
                  Click the button below to test this automation rule. This will simulate the trigger
                  and execute the action in a safe test environment.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleTestRule} disabled={testRuleMutation.isPending}>
              <Play className="mr-2 h-4 w-4" />
              {testRuleMutation.isPending ? "Testing..." : "Run Test"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
