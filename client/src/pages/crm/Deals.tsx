import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search,
  Plus,
  MoreHorizontal,
  DollarSign,
  Calendar,
  User,
  Filter,
  Download,
  Trash2,
  Edit,
  Eye,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Building2,
  Target,
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
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";
import { Checkbox } from "../../components/ui/checkbox";
import { Skeleton } from "../../components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Deal, Contact, Company, PipelineStage } from "@shared/schema";
import { format } from "date-fns";

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

interface DealWithRelations extends Deal {
  contact?: Contact | null;
  company?: Company | null;
  stage?: PipelineStage | null;
}

export default function Deals() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");
  const [selectedDeals, setSelectedDeals] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("value");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [valueRange, setValueRange] = useState<{ min?: number; max?: number }>({});
  const itemsPerPage = 20;

  // Fetch deals
  const {
    data: deals,
    isLoading,
    error,
    refetch,
  } = useQuery<DealWithRelations[]>({
    queryKey: ["/api/deals", searchTerm, stageFilter, statusFilter, sortBy, sortOrder],
  });

  // Fetch contacts for dropdown
  const { data: contacts } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
  });

  // Fetch companies for dropdown
  const { data: companies } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  // Fetch pipeline stages
  const { data: stages } = useQuery<PipelineStage[]>({
    queryKey: ["/api/pipeline-stages"],
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

  // Delete deal mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/deals/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to delete deal");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Deal deleted",
        description: "The deal has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deal. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Bulk delete mutation
  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(
        ids.map((id) =>
          fetch(`/api/deals/${id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setSelectedDeals([]);
      toast({
        title: "Deals deleted",
        description: `${selectedDeals.length} deals have been deleted.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deals. Please try again.",
        variant: "destructive",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedDeals(deals?.map((d) => d.id) || []);
    } else {
      setSelectedDeals([]);
    }
  };

  const handleSelectDeal = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedDeals([...selectedDeals, id]);
    } else {
      setSelectedDeals(selectedDeals.filter((dId) => dId !== id));
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredDeals = deals?.filter((deal) => {
    const matchesSearch =
      searchTerm === "" ||
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact?.lastName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStage = stageFilter === "all" || deal.stageId === stageFilter;
    const matchesStatus = statusFilter === "all" || deal.status === statusFilter;

    const dealValue = Number(deal.value) || 0;
    const matchesValueRange =
      (!valueRange.min || dealValue >= valueRange.min) &&
      (!valueRange.max || dealValue <= valueRange.max);

    return matchesSearch && matchesStage && matchesStatus && matchesValueRange;
  });

  const paginatedDeals = filteredDeals?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil((filteredDeals?.length || 0) / itemsPerPage);

  const totalValue = filteredDeals?.reduce(
    (sum, deal) => sum + (Number(deal.value) || 0),
    0
  );

  const getStageColor = (stageId: string) => {
    const stage = stages?.find((s) => s.id === stageId);
    return stage?.color || "#6366f1";
  };

  const getStageName = (stageId: string) => {
    const stage = stages?.find((s) => s.id === stageId);
    return stage?.name || "Unknown";
  };

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error loading deals</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the deals list.
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
          <h1 className="text-3xl font-bold tracking-tight">Deals</h1>
          <p className="text-muted-foreground">
            Manage your sales opportunities and track revenue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/crm/pipeline")}
          >
            <Target className="h-4 w-4 mr-2" />
            Pipeline View
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
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
                    <Select {...register("stageId")}>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Deals</div>
                <div className="text-2xl font-bold">{filteredDeals?.length || 0}</div>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Value</div>
                <div className="text-2xl font-bold">
                  ${(totalValue || 0).toLocaleString()}
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
                <div className="text-sm text-muted-foreground mb-1">Open Deals</div>
                <div className="text-2xl font-bold">
                  {filteredDeals?.filter((d) => d.status === "open").length || 0}
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Avg Deal Size</div>
                <div className="text-2xl font-bold">
                  ${Math.round((totalValue || 0) / (filteredDeals?.length || 1)).toLocaleString()}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search deals by name, company, or contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="won">Won</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={setStageFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages?.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {selectedDeals.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {selectedDeals.length} selected
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => bulkDeleteMutation.mutate(selectedDeals)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deals Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedDeals.length === deals?.length &&
                          deals?.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("title")}
                    >
                      Deal Name
                      {sortBy === "title" && (
                        <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead
                      className="cursor-pointer"
                      onClick={() => handleSort("value")}
                    >
                      <DollarSign className="h-4 w-4 inline mr-2" />
                      Value
                      {sortBy === "value" && (
                        <span className="ml-2">{sortOrder === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>
                      <Building2 className="h-4 w-4 inline mr-2" />
                      Company
                    </TableHead>
                    <TableHead>
                      <User className="h-4 w-4 inline mr-2" />
                      Contact
                    </TableHead>
                    <TableHead>
                      <Calendar className="h-4 w-4 inline mr-2" />
                      Close Date
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedDeals?.map((deal) => (
                    <TableRow
                      key={deal.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedDeals.includes(deal.id)}
                          onCheckedChange={(checked) =>
                            handleSelectDeal(deal.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell onClick={() => navigate(`/crm/deals/${deal.id}`)}>
                        <div className="font-medium">{deal.title}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold">
                          ${Number(deal.value).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          style={{
                            backgroundColor: getStageColor(deal.stageId),
                            color: "white",
                          }}
                        >
                          {getStageName(deal.stageId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {deal.company && (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/crm/companies/${deal.companyId}`);
                            }}
                          >
                            {deal.company.name}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.contact && (
                          <Button
                            variant="link"
                            className="p-0 h-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/crm/contacts/${deal.contactId}`);
                            }}
                          >
                            {deal.contact.firstName} {deal.contact.lastName}
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        {deal.expectedCloseDate &&
                          format(new Date(deal.expectedCloseDate), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            deal.status === "won"
                              ? "default"
                              : deal.status === "lost"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {deal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => deleteMutation.mutate(deal.id)}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredDeals?.length || 0)}{" "}
                    of {filteredDeals?.length} deals
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
