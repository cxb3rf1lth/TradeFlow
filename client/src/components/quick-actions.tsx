import { Button } from "@/components/ui/button";
import { Plus, Upload, Users, Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuickActions() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button data-testid="button-quick-actions">
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log('Create task')} data-testid="button-create-task">
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Create deal')} data-testid="button-create-deal">
          <Plus className="h-4 w-4 mr-2" />
          Create Deal (HubSpot)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Upload document')} data-testid="button-upload-document">
          <Upload className="h-4 w-4 mr-2" />
          Upload Document
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log('Assign tasks')} data-testid="button-assign-tasks">
          <Users className="h-4 w-4 mr-2" />
          Assign Tasks
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => console.log('Run automation')} data-testid="button-run-automation">
          <Zap className="h-4 w-4 mr-2" />
          Run Automation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
