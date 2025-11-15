import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Plus } from "lucide-react";

export default function Calendar() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">
            Manage your Outlook calendar and events
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect to Outlook Calendar
          </h3>
          <p className="text-gray-500 mb-4">
            Sync your Outlook calendar to view and manage events
          </p>
          <Button>Connect Calendar</Button>
        </CardContent>
      </Card>
    </div>
  );
}
