import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Plus,
  DollarSign,
  Building2,
  Calendar,
  MoreHorizontal,
  Filter,
  User,
  TrendingUp,
  List,
  Eye,
  Edit,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
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
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Deal, PipelineStage, Contact, Company } from "@shared/schema";
import { format, differenceInDays } from "date-fns";
import { ScrollArea } from "../../components/ui/scroll-area";

interface DealWithRelations extends Deal {
  contact?: Contact | null;
  company?: Company | null;
  stage?: PipelineStage | null;
}

const dealSchema = z.object({
  title: z.string().min(1, "Deal name is required"),
  value: z.string().optional(),
  currency: z.string().default("USD"),
  pipelineId: z.string(),
  stageId: z.string(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  expectedCloseDate: z.string().optional(),
  status: z.string().default("open"),
});

type DealFormData = z.infer<typeof dealSchema>;

export default function Pipeline() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [ownerFilter, setOwnerFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedStageForCreate, setSelectedStageForCreate] = useState<string | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<DealWithRelations | null>(null);

  // Fetch deals
  const { data: deals, isLoading: dealsLoading } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals"],
  });

  // Fetch pipeline stages
  const { data: stages, isLoading: stagesLoading } = useQuery<PipelineStage[]>({
    queryKey: ["/api/pipeline-stages"],
  });

  // Fetch contacts for dropdown
  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Fetch companies for dropdown
  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Create deal mutation
  const createMutation = useMutation({
    mutationFn: async (data: DealFormData) => {
      const response = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to create deal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setIsCreateDialogOpen(false);
      reset();
      toast({
        title: "Deal created",
        description: "The deal has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update deal stage mutation (for drag-and-drop)
  const updateStageMutation = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stageId }),
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to update stage");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Deal moved",
        description: "Deal has been moved to a new stage.",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<DealFormData>({
    resolver: zodResolver(dealSchema),
    defaultValues: {
      title: "",
      value: "",
      currency: "USD",
      status: "open",
    },
  });

  const onSubmit = (data: DealFormData) => {
    createMutation.mutate(data);
  };

  // Group deals by stage
  const dealsByStage = stages?.reduce((acc, stage) => {
    acc[stage.id] = deals?.filter(
      (deal) => deal.stageId === stage.id && deal.status === "open"
    ) || [];
    return acc;
  }, {} as Record<string, DealWithRelations[]>);

  // Calculate stage totals
  const getStageTotals = (stageId: string) => {
    const stageDeals = dealsByStage?.[stageId] || [];
    const count = stageDeals.length;
    const totalValue = stageDeals.reduce(
      (sum, deal) => sum + (Number(deal.value) || 0),
      0
    );
    return { count, totalValue };
  };

  const getDaysInStage = (deal: DealWithRelations) => {
    if (!deal.updatedAt) return 0;
    return differenceInDays(new Date(), new Date(deal.updatedAt));
  };

  // Drag and drop handlers
  const handleDragStart = (deal: DealWithRelations) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStageId: string) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stageId !== targetStageId) {
      updateStageMutation.mutate({
        dealId: draggedDeal.id,
        stageId: targetStageId,
      });
    }
    setDraggedDeal(null);
  };

  const handleCreateInStage = (stageId: string) => {
    setSelectedStageForCreate(stageId);
    setValue("stageId", stageId);
    setIsCreateDialogOpen(true);
  };

  const isLoading = dealsLoading || stagesLoading;

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-[600px]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground">
            Drag and drop deals between stages to manage your pipeline
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Owners</SelectItem>
              <SelectItem value="me">My Deals</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => navigate("/crm/deals")}>
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
                <DialogDescription>
                  Add a new deal to your pipeline
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="title">Deal Name *</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enterprise Plan - Q1 2025"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive">
                        {errors.title.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="value">Deal Value</Label>
                    <Input
                      id="value"
                      type="number"
                      {...register("value")}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select {...register("currency")} defaultValue="USD">
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactId">Contact</Label>
                    <Select {...register("contactId")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select contact" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts?.map((contact) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.firstName} {contact.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyId">Company</Label>
                    <Select {...register("companyId")}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies?.map((company) => (
                          <SelectItem key={company.id} value={company.id}>
                            {company.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stageId">Pipeline Stage *</Label>
                    <Select {...register("stageId")} defaultValue={selectedStageForCreate || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages?.map((stage) => (
                          <SelectItem key={stage.id} value={stage.id}>
                            {stage.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.stageId && (
                      <p className="text-sm text-destructive">
                        {errors.stageId.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
                    <Input
                      id="expectedCloseDate"
                      type="date"
                      {...register("expectedCloseDate")}
                    />
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
                    {createMutation.isPending ? "Creating..." : "Create Deal"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Pipeline</div>
                <div className="text-2xl font-bold">
                  ${deals
                    ?.filter((d) => d.status === "open")
                    .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0)
                    .toLocaleString()}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Open Deals</div>
                <div className="text-2xl font-bold">
                  {deals?.filter((d) => d.status === "open").length || 0}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Avg Deal Size</div>
                <div className="text-2xl font-bold">
                  $
                  {Math.round(
                    (deals
                      ?.filter((d) => d.status === "open")
                      .reduce((sum, deal) => sum + (Number(deal.value) || 0), 0) || 0) /
                      (deals?.filter((d) => d.status === "open").length || 1)
                  ).toLocaleString()}
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                <div className="text-2xl font-bold">
                  {deals?.length
                    ? Math.round(
                        (deals.filter((d) => d.status === "won").length / deals.length) *
                          100
                      )
                    : 0}
                  %
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-5 gap-4 pb-4">
        {stages?.map((stage) => {
          const { count, totalValue } = getStageTotals(stage.id);
          const stageDeals = dealsByStage?.[stage.id] || [];

          return (
            <div
              key={stage.id}
              className="flex flex-col"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <Card className="mb-2">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: stage.color || "#6366f1" }}
                      />
                      {stage.name}
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCreateInStage(stage.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{count} deals</span>
                      <Badge variant="secondary" className="text-xs">
                        {stage.probability}%
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold">
                      ${totalValue.toLocaleString()}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Deal Cards */}
              <ScrollArea className="flex-1 pr-2" style={{ maxHeight: "calc(100vh - 400px)" }}>
                <div className="space-y-2">
                  {stageDeals.map((deal) => (
                    <Card
                      key={deal.id}
                      className="cursor-move hover:shadow-md transition-shadow"
                      draggable
                      onDragStart={() => handleDragStart(deal)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Deal Title */}
                          <div
                            className="font-medium text-sm line-clamp-2 cursor-pointer hover:text-primary"
                            onClick={() => navigate(`/crm/deals/${deal.id}`)}
                          >
                            {deal.title}
                          </div>

                          {/* Deal Value */}
                          <div className="flex items-center gap-1 text-lg font-bold">
                            <DollarSign className="h-4 w-4" />
                            {Number(deal.value).toLocaleString()}
                          </div>

                          {/* Company */}
                          {deal.company && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Building2 className="h-3 w-3" />
                              <span className="truncate">{deal.company.name}</span>
                            </div>
                          )}

                          {/* Days in stage */}
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {getDaysInStage(deal)} days
                            </div>
                            {deal.expectedCloseDate && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(deal.expectedCloseDate), "MMM d")}
                              </div>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex -space-x-2">
                              {deal.contact && (
                                <div
                                  className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium border-2 border-background"
                                  title={`${deal.contact.firstName} ${deal.contact.lastName}`}
                                >
                                  {deal.contact.firstName[0]}
                                  {deal.contact.lastName[0]}
                                </div>
                              )}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon" className="h-6 w-6">
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => navigate(`/crm/deals/${deal.id}`)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {stageDeals.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="p-8 text-center">
                        <p className="text-sm text-muted-foreground mb-2">No deals</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateInStage(stage.id)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Deal
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
