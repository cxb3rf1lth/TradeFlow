import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  Grid3x3,
  List,
  Mail,
  Phone,
  Calendar,
  MessageCircle,
  Building2,
  MapPin,
  Filter,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { format } from "date-fns";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  title: string;
  department: string;
  officeLocation: string;
  isOnline: boolean;
  joinDate: string;
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}

// Mock data
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@tradeflow.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    title: "CEO",
    department: "Executive",
    officeLocation: "New York, NY",
    isOnline: true,
    joinDate: "2020-01-15",
    recentActivity: [
      {
        type: "post",
        description: "Posted an announcement about Q4 results",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: "deal",
        description: "Closed deal with Acme Corp",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@tradeflow.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    title: "Sales Manager",
    department: "Sales",
    officeLocation: "San Francisco, CA",
    isOnline: true,
    joinDate: "2020-06-01",
    recentActivity: [
      {
        type: "contact",
        description: "Added 5 new contacts",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: "meeting",
        description: "Scheduled meeting with prospect",
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "3",
    name: "Emily Davis",
    email: "emily.davis@tradeflow.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    title: "Sales Representative",
    department: "Sales",
    officeLocation: "Boston, MA",
    isOnline: false,
    joinDate: "2021-03-15",
    recentActivity: [
      {
        type: "task",
        description: "Completed 3 tasks",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "4",
    name: "David Rodriguez",
    email: "david.rodriguez@tradeflow.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    title: "Product Manager",
    department: "Product",
    officeLocation: "Austin, TX",
    isOnline: true,
    joinDate: "2021-07-01",
    recentActivity: [
      {
        type: "feature",
        description: "Launched new dashboard feature",
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "5",
    name: "Jessica Lee",
    email: "jessica.lee@tradeflow.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    title: "HR Manager",
    department: "Human Resources",
    officeLocation: "Seattle, WA",
    isOnline: false,
    joinDate: "2020-09-01",
    recentActivity: [
      {
        type: "announcement",
        description: "Posted employee of the month",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "6",
    name: "Robert Taylor",
    email: "robert.taylor@tradeflow.com",
    phone: "+1 (555) 678-9012",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert",
    title: "Marketing Director",
    department: "Marketing",
    officeLocation: "Los Angeles, CA",
    isOnline: true,
    joinDate: "2021-01-15",
    recentActivity: [
      {
        type: "campaign",
        description: "Launched new email campaign",
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "7",
    name: "Amanda White",
    email: "amanda.white@tradeflow.com",
    phone: "+1 (555) 789-0123",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda",
    title: "Customer Success Manager",
    department: "Customer Success",
    officeLocation: "Chicago, IL",
    isOnline: true,
    joinDate: "2021-05-01",
    recentActivity: [
      {
        type: "support",
        description: "Resolved 8 support tickets",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "8",
    name: "Christopher Brown",
    email: "christopher.brown@tradeflow.com",
    phone: "+1 (555) 890-1234",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Christopher",
    title: "Lead Developer",
    department: "Engineering",
    officeLocation: "Remote",
    isOnline: false,
    joinDate: "2020-04-01",
    recentActivity: [
      {
        type: "code",
        description: "Deployed new API endpoints",
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
];

export default function TeamDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "joinDate" | "department">("name");
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Fetch team members
  const { data: members, isLoading } = useQuery<TeamMember[]>({
    queryKey: ["/api/team/members"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockTeamMembers;
    },
  });

  const filteredMembers = members
    ?.filter((member) => {
      const matchesSearch =
        searchTerm === "" ||
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.title.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || member.department === departmentFilter;

      const matchesLocation =
        locationFilter === "all" || member.officeLocation === locationFilter;

      return matchesSearch && matchesDepartment && matchesLocation;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "joinDate") {
        return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
      } else if (sortBy === "department") {
        return a.department.localeCompare(b.department);
      }
      return 0;
    });

  const departments = Array.from(new Set(members?.map((m) => m.department) || []));
  const locations = Array.from(new Set(members?.map((m) => m.officeLocation) || []));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Directory</h1>
          <p className="text-muted-foreground">Browse and connect with team members</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members by name, email, or title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Button
              variant={sortBy === "name" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("name")}
            >
              Name
            </Button>
            <Button
              variant={sortBy === "joinDate" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("joinDate")}
            >
              Join Date
            </Button>
            <Button
              variant={sortBy === "department" ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy("department")}
            >
              Department
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Members Grid/List */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers?.map((member) => (
            <Card
              key={member.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedMember(member)}
            >
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {member.isOnline && (
                      <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </div>
                  <h3 className="font-semibold text-lg mt-4">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.title}</p>
                  <Badge variant="secondary" className="mt-2">
                    {member.department}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <MapPin className="h-3 w-3" />
                    {member.officeLocation}
                  </div>
                  <Separator className="my-4" />
                  <div className="flex gap-2 w-full">
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={`mailto:${member.email}`}>
                        <Mail className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredMembers?.map((member) => (
                <div
                  key={member.id}
                  className="p-6 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedMember(member)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {member.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{member.name}</h4>
                      <p className="text-sm text-muted-foreground">{member.title}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span>{member.department}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{member.officeLocation}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={`mailto:${member.email}`}>
                          <Mail className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Member Detail Dialog */}
      <Dialog open={selectedMember !== null} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
            <DialogDescription>View full profile and contact information</DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={selectedMember.avatar} alt={selectedMember.name} />
                    <AvatarFallback>{selectedMember.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {selectedMember.isOnline && (
                    <div className="absolute bottom-0 right-0 h-5 w-5 bg-green-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold">{selectedMember.name}</h3>
                  <p className="text-muted-foreground">{selectedMember.title}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{selectedMember.department}</Badge>
                    <Badge variant="secondary">
                      {selectedMember.isOnline ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <Tabs defaultValue="contact">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="contact">Contact Info</TabsTrigger>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                </TabsList>
                <TabsContent value="contact" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Email</p>
                      <a
                        href={`mailto:${selectedMember.email}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedMember.email}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <a
                        href={`tel:${selectedMember.phone}`}
                        className="text-sm text-primary hover:underline"
                      >
                        {selectedMember.phone}
                      </a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="text-sm">{selectedMember.department}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Office Location</p>
                      <p className="text-sm">{selectedMember.officeLocation}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Join Date</p>
                      <p className="text-sm">
                        {format(new Date(selectedMember.joinDate), "MMMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button className="flex-1" asChild>
                      <a href={`mailto:${selectedMember.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </a>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Direct Message
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      Schedule Meeting
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="activity" className="space-y-4">
                  {selectedMember.recentActivity.length > 0 ? (
                    <div className="space-y-4">
                      {selectedMember.recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex gap-4">
                          <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm">{activity.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No recent activity
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
