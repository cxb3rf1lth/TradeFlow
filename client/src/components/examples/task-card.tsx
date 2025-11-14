import { TaskCard } from '../task-card';

export default function TaskCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <TaskCard
        id="1"
        title="Review Q4 sales pipeline"
        description="Analyze HubSpot deals and prepare summary for board meeting"
        status="in-progress"
        priority="high"
        source="hubspot"
        dueDate="Dec 15"
        assignee={{ name: "Sarah Chen" }}
        onClick={() => console.log('Task clicked')}
      />
      <TaskCard
        id="2"
        title="Update project roadmap"
        description="Sync with engineering team on delivery timeline"
        status="todo"
        priority="medium"
        source="jira"
        dueDate="Dec 20"
        assignee={{ name: "Mike Ross" }}
        onClick={() => console.log('Task clicked')}
      />
    </div>
  );
}
