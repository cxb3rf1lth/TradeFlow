import { StatCard } from "@/components/stat-card";
import { TaskCard } from "@/components/task-card";
import { IntegrationStatus } from "@/components/integration-status";
import { ActivityTimeline } from "@/components/activity-timeline";
import { TeamWorkload } from "@/components/team-workload";
import { AIInsights } from "@/components/ai-insights";
import { CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockTasks = [
  {
    id: "1",
    title: "Review Q4 sales pipeline",
    description: "Analyze HubSpot deals and prepare summary for board meeting",
    status: "in-progress",
    priority: "high" as const,
    source: "hubspot" as const,
    dueDate: "Dec 15",
    assignee: { name: "Sarah Chen" },
  },
  {
    id: "2",
    title: "Update project roadmap",
    description: "Sync with engineering team on delivery timeline",
    status: "todo",
    priority: "medium" as const,
    source: "jira" as const,
    dueDate: "Dec 20",
    assignee: { name: "Mike Ross" },
  },
  {
    id: "3",
    title: "Prepare investor deck",
    description: "Update slides with Q4 metrics and 2024 projections",
    status: "in-progress",
    priority: "high" as const,
    source: "trello" as const,
    dueDate: "Dec 18",
    assignee: { name: "Emma Wilson" },
  },
  {
    id: "4",
    title: "Team performance reviews",
    description: "Complete quarterly reviews for executive team",
    status: "todo",
    priority: "medium" as const,
    source: "teams" as const,
    dueDate: "Dec 22",
    assignee: { name: "John Doe" },
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6" role="region" aria-label="Dashboard overview">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Here's your team overview and priority tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" role="region" aria-label="Key metrics">
        <StatCard
          title="Tasks Completed"
          value={42}
          change={12.5}
          icon={CheckSquare}
          iconColor="text-green-600"
        />
        <StatCard
          title="In Progress"
          value={18}
          change={-5}
          icon={Clock}
          iconColor="text-blue-600"
        />
        <StatCard
          title="Overdue"
          value={3}
          icon={AlertCircle}
          iconColor="text-red-600"
        />
        <StatCard
          title="Completion Rate"
          value="87%"
          change={3.2}
          icon={TrendingUp}
          iconColor="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Priority Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all" data-testid="tab-all-tasks">All</TabsTrigger>
                  <TabsTrigger value="high" data-testid="tab-high-priority">High Priority</TabsTrigger>
                  <TabsTrigger value="overdue" data-testid="tab-overdue">Overdue</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="space-y-3 mt-0">
                  {mockTasks.map((task) => (
                    <TaskCard key={task.id} {...task} onClick={() => console.log('Task clicked:', task.id)} />
                  ))}
                </TabsContent>
                <TabsContent value="high" className="space-y-3 mt-0">
                  {mockTasks.filter(t => t.priority === "high").map((task) => (
                    <TaskCard key={task.id} {...task} onClick={() => console.log('Task clicked:', task.id)} />
                  ))}
                </TabsContent>
                <TabsContent value="overdue" className="mt-0">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No overdue tasks
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <TeamWorkload />
        </div>

        <div className="space-y-6">
          <AIInsights />
          <IntegrationStatus />
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
}
