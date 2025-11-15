import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  FolderOpen,
  File,
  Upload,
  FileText,
  Image,
  Video,
  Music,
  MoreVertical,
  Download,
  Share2,
  Trash2,
} from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";

export default function OneDrive() {
  const [showUpload, setShowUpload] = useState(false);
  const { toast } = useToast();

  // Mock files data - in production, fetch from API
  const mockFiles = [
    {
      id: "1",
      name: "Project Proposal.docx",
      type: "document",
      size: "2.4 MB",
      modified: "2 hours ago",
    },
    {
      id: "2",
      name: "Company Logo.png",
      type: "image",
      size: "856 KB",
      modified: "Yesterday",
    },
    {
      id: "3",
      name: "Q4 Presentation.pptx",
      type: "document",
      size: "4.2 MB",
      modified: "3 days ago",
    },
    {
      id: "4",
      name: "Marketing Video.mp4",
      type: "video",
      size: "45.8 MB",
      modified: "1 week ago",
    },
  ];

  const handleUpload = async (files: File[]) => {
    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    toast({
      title: "Files uploaded successfully",
      description: `${files.length} file(s) uploaded to OneDrive`,
    });

    setShowUpload(false);
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="w-8 h-8 text-blue-500" />;
      case "image":
        return <Image className="w-8 h-8 text-green-500" />;
      case "video":
        return <Video className="w-8 h-8 text-purple-500" />;
      case "audio":
        return <Music className="w-8 h-8 text-pink-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

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
          <Button onClick={() => setShowUpload(!showUpload)}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {showUpload && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Files to OneDrive</CardTitle>
          </CardHeader>
          <CardContent>
            <FileUpload
              onUpload={handleUpload}
              maxSize={100}
              multiple={true}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
          <TabsTrigger value="starred">Starred</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 gap-4">
                {mockFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.size} • Modified {file.modified}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="icon">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardContent className="py-12 text-center">
              <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No recent files
              </h3>
              <p className="text-gray-500">
                Files you've recently accessed will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shared">
          <Card>
            <CardContent className="py-12 text-center">
              <Share2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No shared files
              </h3>
              <p className="text-gray-500">
                Files shared with you will appear here
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="starred">
          <Card>
            <CardContent className="py-12 text-center">
              <Cloud className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No starred files
              </h3>
              <p className="text-gray-500">
                Mark important files as starred to find them easily
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
