import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, FolderOpen, File, Upload } from "lucide-react";

export default function OneDrive() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">OneDrive</h1>
          <p className="text-gray-500 mt-1">
            Access and manage your cloud files
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Cloud className="w-4 h-4 mr-2" />
            Sync
          </Button>
          <Button>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="py-12 text-center">
          <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Connect to OneDrive
          </h3>
          <p className="text-gray-500 mb-4">
            Sign in with your Microsoft account to access your files
          </p>
          <Button>Connect OneDrive</Button>
        </CardContent>
      </Card>
    </div>
  );
}
