import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export default function Teams() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Microsoft Teams</h1>
        <p className="text-gray-500 mt-1">
          Access your Teams chats and channels
        </p>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect to Microsoft Teams
          </h3>
          <p className="text-gray-500 mb-4">
            Access your chats, channels, and meetings
          </p>
          <Button>Connect Teams</Button>
        </CardContent>
      </Card>
    </div>
  );
}
