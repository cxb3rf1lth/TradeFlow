import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  tasksAssigned: number;
  tasksCompleted: number;
  capacity: number;
}

interface TeamWorkloadProps {
  members?: TeamMember[];
}

const defaultMembers: TeamMember[] = [
  {
    id: "1",
    name: "Sarah Chen",
    role: "CEO",
    tasksAssigned: 12,
    tasksCompleted: 8,
    capacity: 67,
  },
  {
    id: "2",
    name: "Mike Ross",
    role: "CTO",
    tasksAssigned: 15,
    tasksCompleted: 12,
    capacity: 80,
  },
  {
    id: "3",
    name: "Emma Wilson",
    role: "CFO",
    tasksAssigned: 8,
    tasksCompleted: 6,
    capacity: 53,
  },
  {
    id: "4",
    name: "Virtual PA",
    role: "Assistant",
    tasksAssigned: 25,
    tasksCompleted: 20,
    capacity: 83,
  },
];

export function TeamWorkload({ members = defaultMembers }: TeamWorkloadProps) {
  return (
    <Card data-testid="card-team-workload">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Team Workload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {members.map((member) => (
          <div key={member.id} className="space-y-2" data-testid={`team-member-${member.id}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {member.tasksCompleted}/{member.tasksAssigned}
                </p>
                <p className="text-xs text-muted-foreground">tasks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={member.capacity} className="flex-1" />
              <Badge variant="secondary" className="text-xs min-w-[3rem] justify-center">
                {member.capacity}%
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
