import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SiTrello, SiJira } from "react-icons/si";
import { Clock, MoreVertical, Building2, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const sourceColors = {
  trello: "border-l-[#0079BF]",
  hubspot: "border-l-[#FF7A59]",
  jira: "border-l-[#0052CC]",
  teams: "border-l-[#6264A7]",
};

const sourceIcons = {
  trello: SiTrello,
  hubspot: Building2,
  jira: SiJira,
  teams: MessageSquare,
};

const priorityVariants = {
  high: "destructive",
  medium: "secondary",
  low: "secondary",
} as const;

interface TaskCardProps {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: "high" | "medium" | "low";
  source: "trello" | "hubspot" | "jira" | "teams";
  dueDate?: string;
  assignee?: {
    name: string;
    avatar?: string;
  };
  onClick?: () => void;
}

export function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  source,
  dueDate,
  assignee,
  onClick,
}: TaskCardProps) {
  const SourceIcon = sourceIcons[source];
  
  return (
    <Card
      className={cn(
        "p-4 border-l-4 hover-elevate cursor-pointer",
        sourceColors[source]
      )}
      onClick={onClick}
      data-testid={`card-task-${id}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate mb-1" data-testid={`text-task-title-${id}`}>
            {title}
          </h3>
          {description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <SourceIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Task menu clicked', id);
            }}
            data-testid={`button-task-menu-${id}`}
          >
            <MoreVertical className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {assignee && (
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-xs">
                {assignee.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          )}
          {dueDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{dueDate}</span>
            </div>
          )}
        </div>
        <Badge variant={priorityVariants[priority]} className="text-xs">
          {priority}
        </Badge>
      </div>
    </Card>
  );
}
