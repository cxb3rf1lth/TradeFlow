import { useState } from "react";
import { useLocation } from "wouter";
import {
  Plus,
  Save,
  Play,
  ChevronLeft,
  Zap,
  Mail,
  CheckSquare,
  User,
  Bell,
  Globe,
  Calendar,
  GitBranch,
  Filter,
  FileText,
  DollarSign,
  Trash2,
  Settings,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
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
import { Separator } from "../../components/ui/separator";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const workflowSchema = z.object({
  name: z.string().min(1, "Workflow name is required"),
  description: z.string().optional(),
});

type WorkflowFormData = z.infer<typeof workflowSchema>;

interface WorkflowBlock {
  id: string;
  type: "trigger" | "action" | "condition";
  category: string;
  label: string;
  icon: any;
  config?: any;
}

const availableTriggers: WorkflowBlock[] = [
  {
    id: "trigger-form",
    type: "trigger",
    category: "Form",
    label: "Form Submitted",
    icon: FileText,
  },
  {
    id: "trigger-deal",
    type: "trigger",
    category: "Deal",
    label: "Deal Created",
    icon: DollarSign,
  },
  {
    id: "trigger-task",
    type: "trigger",
    category: "Task",
    label: "Task Completed",
    icon: CheckSquare,
  },
  {
    id: "trigger-email",
    type: "trigger",
    category: "Email",
    label: "Email Received",
    icon: Mail,
  },
  {
    id: "trigger-schedule",
    type: "trigger",
    category: "Time",
    label: "Schedule",
    icon: Calendar,
  },
  {
    id: "trigger-contact",
    type: "trigger",
    category: "Contact",
    label: "Contact Created",
    icon: User,
  },
];

const availableActions: WorkflowBlock[] = [
  {
    id: "action-email",
    type: "action",
    category: "Communication",
    label: "Send Email",
    icon: Mail,
  },
  {
    id: "action-task",
    type: "action",
    category: "Task",
    label: "Create Task",
    icon: CheckSquare,
  },
  {
    id: "action-contact",
    type: "action",
    category: "Contact",
    label: "Update Contact",
    icon: User,
  },
  {
    id: "action-notification",
    type: "action",
    category: "Communication",
    label: "Send Notification",
    icon: Bell,
  },
  {
    id: "action-webhook",
    type: "action",
    category: "Integration",
    label: "HTTP Request",
    icon: Globe,
  },
  {
    id: "action-deal",
    type: "action",
    category: "Deal",
    label: "Create Deal",
    icon: DollarSign,
  },
];

const availableConditions: WorkflowBlock[] = [
  {
    id: "condition-if",
    type: "condition",
    category: "Logic",
    label: "If/Then",
    icon: GitBranch,
  },
  {
    id: "condition-filter",
    type: "condition",
    category: "Logic",
    label: "Filter",
    icon: Filter,
  },
];

export default function WorkflowBuilder() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowBlock | null>(null);
  const [workflowBlocks, setWorkflowBlocks] = useState<WorkflowBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<WorkflowBlock | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSave = (data: WorkflowFormData) => {
    if (!selectedTrigger) {
      toast({
        title: "Missing trigger",
        description: "Please select a trigger for your workflow.",
        variant: "destructive",
      });
      return;
    }

    if (workflowBlocks.length === 0) {
      toast({
        title: "No actions",
        description: "Please add at least one action to your workflow.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Workflow saved",
      description: "Your workflow has been saved successfully.",
    });
    navigate("/automation/workflows");
  };

  const handleAddBlock = (block: WorkflowBlock) => {
    const newBlock = { ...block, id: `${block.id}-${Date.now()}` };
    setWorkflowBlocks([...workflowBlocks, newBlock]);
    toast({
      title: "Block added",
      description: `${block.label} has been added to the workflow.`,
    });
  };

  const handleRemoveBlock = (blockId: string) => {
    setWorkflowBlocks(workflowBlocks.filter((b) => b.id !== blockId));
  };

  const handleConfigureBlock = (block: WorkflowBlock) => {
    setSelectedBlock(block);
    setIsConfigDialogOpen(true);
  };

  const renderBlockIcon = (Icon: any, type: string) => {
    const bgColor =
      type === "trigger"
        ? "bg-blue-100 text-blue-600"
        : type === "action"
        ? "bg-green-100 text-green-600"
        : "bg-purple-100 text-purple-600";
    return (
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bgColor}`}>
        <Icon className="h-5 w-5" />
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/automation/workflows")}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Workflow Builder</h1>
              <p className="text-sm text-muted-foreground">Create automated workflows</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/automation/workflows")}>
              Cancel
            </Button>
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Test Workflow
            </Button>
            <Button onClick={handleSubmit(onSave)}>
              <Save className="h-4 w-4 mr-2" />
              Save Workflow
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Blocks Palette */}
        <div className="w-80 border-r bg-muted/30">
          <ScrollArea className="h-full">
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Workflow Details
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Workflow Name *</Label>
                    <Input id="name" {...register("name")} placeholder="My Workflow" />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="What does this workflow do?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Triggers
                </h3>
                <div className="space-y-2">
                  {availableTriggers.map((trigger) => (
                    <Card
                      key={trigger.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedTrigger?.id === trigger.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedTrigger(trigger)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        {renderBlockIcon(trigger.icon, "trigger")}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{trigger.label}</p>
                          <p className="text-xs text-muted-foreground">{trigger.category}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Actions
                </h3>
                <div className="space-y-2">
                  {availableActions.map((action) => (
                    <Card
                      key={action.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleAddBlock(action)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        {renderBlockIcon(action.icon, "action")}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{action.label}</p>
                          <p className="text-xs text-muted-foreground">{action.category}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase">
                  Conditions
                </h3>
                <div className="space-y-2">
                  {availableConditions.map((condition) => (
                    <Card
                      key={condition.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleAddBlock(condition)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        {renderBlockIcon(condition.icon, "condition")}
                        <div className="flex-1">
                          <p className="font-medium text-sm">{condition.label}</p>
                          <p className="text-xs text-muted-foreground">{condition.category}</p>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-grid-pattern">
          <div className="min-h-full p-12">
            <div className="max-w-2xl mx-auto">
              <div className="space-y-6">
                {/* Trigger Block */}
                {selectedTrigger ? (
                  <Card className="border-2 border-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {renderBlockIcon(selectedTrigger.icon, "trigger")}
                          <div>
                            <CardTitle className="text-lg">{selectedTrigger.label}</CardTitle>
                            <p className="text-sm text-muted-foreground">Trigger</p>
                          </div>
                        </div>
                        <Badge>Trigger</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleConfigureBlock(selectedTrigger)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-dashed border-2">
                    <CardContent className="py-12 text-center">
                      <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-semibold mb-2">Select a Trigger</h3>
                      <p className="text-sm text-muted-foreground">
                        Choose a trigger from the sidebar to start your workflow
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Connection Line */}
                {selectedTrigger && (
                  <div className="flex justify-center">
                    <div className="w-0.5 h-8 bg-border" />
                  </div>
                )}

                {/* Action/Condition Blocks */}
                {workflowBlocks.map((block, index) => (
                  <div key={block.id}>
                    <Card
                      className={`${
                        block.type === "action"
                          ? "border-2 border-green-500"
                          : "border-2 border-purple-500"
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {renderBlockIcon(block.icon, block.type)}
                            <div>
                              <CardTitle className="text-lg">{block.label}</CardTitle>
                              <p className="text-sm text-muted-foreground capitalize">
                                {block.type}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="capitalize">{block.type}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveBlock(block.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleConfigureBlock(block)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </CardContent>
                    </Card>
                    {index < workflowBlocks.length - 1 && (
                      <div className="flex justify-center">
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                    )}
                  </div>
                ))}

                {/* Add Block Placeholder */}
                {selectedTrigger && (
                  <>
                    {workflowBlocks.length > 0 && (
                      <div className="flex justify-center">
                        <div className="w-0.5 h-8 bg-border" />
                      </div>
                    )}
                    <Card className="border-dashed border-2">
                      <CardContent className="py-8 text-center">
                        <Plus className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Add actions or conditions from the sidebar
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure {selectedBlock?.label}</DialogTitle>
            <DialogDescription>
              Set up the parameters for this {selectedBlock?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {selectedBlock?.type === "trigger" && selectedBlock.label === "Form Submitted" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Select Form</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contact">Contact Form</SelectItem>
                      <SelectItem value="lead">Lead Capture Form</SelectItem>
                      <SelectItem value="demo">Demo Request Form</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {selectedBlock?.type === "trigger" && selectedBlock.label === "Schedule" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Time</Label>
                  <Input type="time" defaultValue="09:00" />
                </div>
              </div>
            )}

            {selectedBlock?.type === "action" && selectedBlock.label === "Send Email" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input placeholder="recipient@example.com" />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="Email subject" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Email body" rows={6} />
                </div>
              </div>
            )}

            {selectedBlock?.type === "action" && selectedBlock.label === "Create Task" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Task Title</Label>
                  <Input placeholder="Task name" />
                </div>
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user1">John Doe</SelectItem>
                      <SelectItem value="user2">Jane Smith</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
              </div>
            )}

            {selectedBlock?.type === "action" && selectedBlock.label === "HTTP Request" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="HTTP Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>URL</Label>
                  <Input placeholder="https://api.example.com/endpoint" />
                </div>
                <div className="space-y-2">
                  <Label>Headers (JSON)</Label>
                  <Textarea placeholder='{"Authorization": "Bearer token"}' rows={3} />
                </div>
              </div>
            )}

            {selectedBlock?.type === "condition" && selectedBlock.label === "If/Then" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Field</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select operator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater">Greater than</SelectItem>
                      <SelectItem value="less">Less than</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Input placeholder="Comparison value" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsConfigDialogOpen(false)}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style>{`
        .bg-grid-pattern {
          background-image:
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}
