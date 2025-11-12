import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";

interface Insight {
  id: string;
  type: "suggestion" | "warning" | "opportunity";
  title: string;
  description: string;
  action?: string;
}

const insightIcons = {
  suggestion: Lightbulb,
  warning: AlertTriangle,
  opportunity: TrendingUp,
};

const insightColors = {
  suggestion: "text-blue-600",
  warning: "text-amber-600",
  opportunity: "text-green-600",
};

interface AIInsightsProps {
  insights?: Insight[];
}

const defaultInsights: Insight[] = [
  {
    id: "1",
    type: "warning",
    title: "High Priority Tasks Overdue",
    description: "3 high-priority tasks from HubSpot are past their due date. Consider redistributing workload.",
    action: "View Tasks",
  },
  {
    id: "2",
    type: "suggestion",
    title: "Automate Weekly Reports",
    description: "You create similar reports every Monday. I can automate this workflow.",
    action: "Set Up",
  },
  {
    id: "3",
    type: "opportunity",
    title: "Team Capacity Available",
    description: "Emma Wilson has 30% capacity available this week for additional projects.",
    action: "Assign Tasks",
  },
];

export function AIInsights({ insights = defaultInsights }: AIInsightsProps) {
  return (
    <Card data-testid="card-ai-insights">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          AI Insights
        </CardTitle>
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100">
          Powered by Claude
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => {
          const Icon = insightIcons[insight.type];
          return (
            <div
              key={insight.id}
              className="p-4 rounded-md border hover-elevate"
              data-testid={`insight-${insight.id}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${insightColors[insight.type]}`} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium mb-1">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              </div>
              {insight.action && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => console.log(`Action: ${insight.action}`)}
                  data-testid={`button-insight-action-${insight.id}`}
                >
                  {insight.action}
                </Button>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
