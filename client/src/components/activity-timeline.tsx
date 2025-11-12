import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckSquare, FileText, MessageSquare, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

const activityIcons = {
  task: CheckSquare,
  document: FileText,
  message: MessageSquare,
  user: UserPlus,
};

interface Activity {
  id: string;
  type: keyof typeof activityIcons;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target: string;
  timestamp: string;
}

interface ActivityTimelineProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    type: "task",
    user: { name: "Sarah Chen" },
    action: "completed",
    target: "Q4 Revenue Analysis",
    timestamp: "5 min ago",
  },
  {
    id: "2",
    type: "document",
    user: { name: "Mike Ross" },
    action: "uploaded",
    target: "Project Proposal.docx",
    timestamp: "15 min ago",
  },
  {
    id: "3",
    type: "message",
    user: { name: "Emma Wilson" },
    action: "sent message in",
    target: "Executive Team",
    timestamp: "1 hour ago",
  },
  {
    id: "4",
    type: "task",
    user: { name: "John Doe" },
    action: "created",
    target: "Review marketing strategy",
    timestamp: "2 hours ago",
  },
];

export function ActivityTimeline({ activities = defaultActivities }: ActivityTimelineProps) {
  return (
    <Card data-testid="card-activity-timeline">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            return (
              <div
                key={activity.id}
                className={cn(
                  "flex gap-3 pb-4",
                  index !== activities.length - 1 && "border-l-2 border-border ml-4"
                )}
                data-testid={`activity-${activity.id}`}
              >
                <div className="relative -ml-[1.125rem]">
                  <div className="h-9 w-9 rounded-full bg-card border-2 border-border flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start gap-2 mb-1">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback className="text-xs">
                        {activity.user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user.name}</span>
                        {' '}{activity.action}{' '}
                        <span className="font-medium">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
