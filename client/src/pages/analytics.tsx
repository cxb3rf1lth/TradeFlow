import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, Users, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const teamPerformanceData = [
  { name: "Sarah Chen", tasksCompleted: 42, onTime: 95, efficiency: 92 },
  { name: "Mike Ross", tasksCompleted: 38, onTime: 88, efficiency: 85 },
  { name: "Emma Wilson", tasksCompleted: 45, onTime: 92, efficiency: 90 },
  { name: "John Doe", tasksCompleted: 35, onTime: 85, efficiency: 82 },
  { name: "Alex Kim", tasksCompleted: 40, onTime: 90, efficiency: 88 },
];

const projectAnalytics = [
  { project: "Project Alpha", budget: 85, timeline: 78, quality: 92, risk: "low" },
  { project: "Project Beta", budget: 65, timeline: 55, quality: 70, risk: "high" },
  { project: "Project Gamma", budget: 92, timeline: 88, quality: 95, risk: "low" },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
            <BarChart3 className="h-8 w-8" />
            Analytics
          </h1>
          <p className="text-sm text-muted-foreground">
            Track performance, productivity, and project insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Completion Time</p>
                <p className="text-2xl font-bold mt-1">3.2 days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">↓ 15% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Productivity</p>
                <p className="text-2xl font-bold mt-1">87%</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 5% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On-Time Delivery</p>
                <p className="text-2xl font-bold mt-1">92%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-green-600 mt-2">↑ 3% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <p className="text-2xl font-bold mt-1">8</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">3 completing soon</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="team" className="w-full">
        <TabsList>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="projects">Project Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Performance Metrics</CardTitle>
              <CardDescription>Individual contributor performance overview</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {teamPerformanceData.map((member) => (
                <div key={member.name} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{member.name}</span>
                    <Badge variant="secondary">{member.tasksCompleted} tasks completed</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">On-Time Rate</span>
                        <span>{member.onTime}%</span>
                      </div>
                      <Progress value={member.onTime} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span>{member.efficiency}%</span>
                      </div>
                      <Progress value={member.efficiency} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Quality Score</span>
                        <span>{member.efficiency}%</span>
                      </div>
                      <Progress value={member.efficiency} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Analytics Dashboard</CardTitle>
              <CardDescription>Budget, timeline, and quality metrics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {projectAnalytics.map((project) => (
                <div key={project.project} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{project.project}</span>
                    <Badge variant={project.risk === "low" ? "secondary" : "destructive"}>
                      {project.risk} risk
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Budget</span>
                        <span>{project.budget}%</span>
                      </div>
                      <Progress value={project.budget} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Timeline</span>
                        <span>{project.timeline}%</span>
                      </div>
                      <Progress value={project.timeline} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Quality</span>
                        <span>{project.quality}%</span>
                      </div>
                      <Progress value={project.quality} />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Trend Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced trend visualization coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
