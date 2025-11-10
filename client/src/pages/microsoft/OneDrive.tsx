import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Search,
  Upload,
  FolderPlus,
  Download,
  Share2,
  Trash2,
  FolderOpen,
  File,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Archive,
  MoreVertical,
  Grid3x3,
  List,
  ArrowUp,
  ArrowDown,
  Home,
  Clock,
  Users,
  ChevronRight,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../components/ui/breadcrumb';

// Types
interface OneDriveFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  owner: string;
  fileType?: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  thumbnail?: string;
  shared?: boolean;
}

interface FolderPath {
  id: string;
  name: string;
}

// Mock Data
const mockFiles: OneDriveFile[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    modified: new Date('2024-11-05'),
    owner: 'You',
  },
  {
    id: '2',
    name: 'Pictures',
    type: 'folder',
    modified: new Date('2024-11-03'),
    owner: 'You',
  },
  {
    id: '3',
    name: 'Q4 Report.docx',
    type: 'file',
    size: 1250000,
    modified: new Date('2024-11-08'),
    owner: 'John Doe',
    fileType: 'document',
    shared: true,
  },
  {
    id: '4',
    name: 'Product Presentation.pptx',
    type: 'file',
    size: 3500000,
    modified: new Date('2024-11-07'),
    owner: 'You',
    fileType: 'document',
  },
  {
    id: '5',
    name: 'Budget_2024.xlsx',
    type: 'file',
    size: 850000,
    modified: new Date('2024-11-06'),
    owner: 'Sarah Smith',
    fileType: 'document',
    shared: true,
  },
  {
    id: '6',
    name: 'team_photo.jpg',
    type: 'file',
    size: 2100000,
    modified: new Date('2024-11-04'),
    owner: 'You',
    fileType: 'image',
    thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200',
  },
  {
    id: '7',
    name: 'project_archive.zip',
    type: 'file',
    size: 15000000,
    modified: new Date('2024-11-02'),
    owner: 'You',
    fileType: 'archive',
  },
  {
    id: '8',
    name: 'demo_video.mp4',
    type: 'file',
    size: 25000000,
    modified: new Date('2024-11-01'),
    owner: 'Mike Johnson',
    fileType: 'video',
    shared: true,
  },
];

const mockRecentFiles: OneDriveFile[] = mockFiles.filter(f => f.type === 'file').slice(0, 5);
const mockSharedFiles: OneDriveFile[] = mockFiles.filter(f => f.shared);

const OneDrive: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPath, setCurrentPath] = useState<FolderPath[]>([{ id: 'root', name: 'My Files' }]);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedFile, setSelectedFile] = useState<OneDriveFile | null>(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Mock storage usage
  const storageUsed = 45.2; // GB
  const storageTotal = 100; // GB
  const storagePercentage = (storageUsed / storageTotal) * 100;

  const { data: files = mockFiles, isLoading } = useQuery({
    queryKey: ['onedrive-files', currentPath],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockFiles;
    },
    enabled: isConnected,
  });

  // File icon selector
  const getFileIcon = (file: OneDriveFile) => {
    if (file.type === 'folder') {
      return <FolderOpen className="h-8 w-8 text-blue-500" />;
    }
    switch (file.fileType) {
      case 'document':
        return <FileText className="h-8 w-8 text-blue-600" />;
      case 'image':
        return <ImageIcon className="h-8 w-8 text-green-600" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-600" />;
      case 'audio':
        return <Music className="h-8 w-8 text-pink-600" />;
      case 'archive':
        return <Archive className="h-8 w-8 text-orange-600" />;
      default:
        return <File className="h-8 w-8 text-gray-600" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Format date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  // Sort files
  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;

    // Folders first
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;

    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = a.modified.getTime() - b.modified.getTime();
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Filter files by search
  const filteredFiles = sortedFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileClick = (file: OneDriveFile) => {
    if (file.type === 'folder') {
      setCurrentPath([...currentPath, { id: file.id, name: file.name }]);
    } else {
      setSelectedFile(file);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // Handle file upload
      console.log('Files dropped:', e.dataTransfer.files);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect to OneDrive</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Connect your Microsoft 365 account to access your OneDrive files.
            </p>
            <Button onClick={() => setIsConnected(true)} className="w-full">
              Connect to Microsoft 365
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OneDrive</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Connected</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setShowUploadDialog(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowCreateFolderDialog(true)}>
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </div>
          </div>

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              {currentPath.map((path, index) => (
                <React.Fragment key={path.id}>
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage>{path.name}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => handleBreadcrumbClick(index)}
                        className="cursor-pointer"
                      >
                        {path.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Storage Usage */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Storage Usage</span>
              <span className="text-sm text-gray-600">
                {storageUsed} GB of {storageTotal} GB used
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
          </CardContent>
        </Card>

        <Tabs defaultValue="files" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="files">
                <Home className="h-4 w-4 mr-2" />
                My Files
              </TabsTrigger>
              <TabsTrigger value="recent">
                <Clock className="h-4 w-4 mr-2" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="shared">
                <Users className="h-4 w-4 mr-2" />
                Shared with me
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Sort: {sortBy}
                    {sortOrder === 'asc' ? (
                      <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                      <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortBy('name')}>Name</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('date')}>Date Modified</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>Size</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                    {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="files" className="space-y-4">
            {/* Drag and drop zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-white'
              }`}
            >
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">Drag and drop files here, or click Upload button</p>
            </div>

            {/* Files Grid/List */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading files...</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredFiles.map((file) => (
                  <Card
                    key={file.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleFileClick(file)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        {file.fileType === 'image' && file.thumbnail ? (
                          <img
                            src={file.thumbnail}
                            alt={file.name}
                            className="h-24 w-full object-cover rounded mb-2"
                          />
                        ) : (
                          <div className="h-24 flex items-center justify-center mb-2">
                            {getFileIcon(file)}
                          </div>
                        )}
                        <div className="w-full">
                          <p className="font-medium text-sm truncate" title={file.name}>
                            {file.name}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            {file.shared && (
                              <Badge variant="secondary" className="text-xs">
                                <Users className="h-3 w-3 mr-1" />
                                Shared
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="w-full mt-2">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedFile(file);
                            setNewFileName(file.name);
                            setShowRenameDialog(true);
                          }}>
                            <FileText className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleFileClick(file)}
                      >
                        <div className="flex items-center space-x-4 flex-1">
                          {getFileIcon(file)}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{file.name}</p>
                            <p className="text-sm text-gray-500">
                              Modified {formatDate(file.modified)} • {file.owner}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {file.shared && (
                            <Badge variant="secondary">
                              <Users className="h-3 w-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                          <span className="text-sm text-gray-500 w-20 text-right">
                            {formatFileSize(file.size)}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedFile(file);
                                setNewFileName(file.name);
                                setShowRenameDialog(true);
                              }}>
                                <FileText className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {mockRecentFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {formatDate(file.modified)} • {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="shared">
            <Card>
              <CardHeader>
                <CardTitle>Shared with me</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {mockSharedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        {getFileIcon(file)}
                        <div>
                          <p className="font-medium">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            Shared by {file.owner} • {formatDate(file.modified)}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Files</DialogTitle>
          </DialogHeader>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4">Drag and drop files here</p>
            <Button>Choose Files</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Creating folder:', newFolderName);
              setShowCreateFolderDialog(false);
              setNewFolderName('');
            }}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename {selectedFile?.type === 'folder' ? 'Folder' : 'File'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">New Name</Label>
              <Input
                id="new-name"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                placeholder="Enter new name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRenameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Renaming to:', newFileName);
              setShowRenameDialog(false);
            }}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Dialog */}
      {selectedFile && selectedFile.type === 'file' && selectedFile.fileType === 'image' && (
        <Dialog open={!!selectedFile} onOpenChange={() => setSelectedFile(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedFile.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedFile.thumbnail && (
                <img
                  src={selectedFile.thumbnail}
                  alt={selectedFile.name}
                  className="w-full h-auto rounded-lg"
                />
              )}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Size</p>
                  <p className="font-medium">{formatFileSize(selectedFile.size)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Modified</p>
                  <p className="font-medium">{formatDate(selectedFile.modified)}</p>
                </div>
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-medium">{selectedFile.owner}</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Close
              </Button>
              <Button>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OneDrive;
