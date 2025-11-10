import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Book,
  Plus,
  Search,
  MoreVertical,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Tag,
  Clock,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit,
  BookOpen,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
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
import { Separator } from '../../components/ui/separator';

// Types
interface NotebookPage {
  id: string;
  title: string;
  content: string;
  sectionId: string;
  modified: Date;
  tags: string[];
}

interface NotebookSection {
  id: string;
  name: string;
  notebookId: string;
  pages: NotebookPage[];
  color: string;
}

interface Notebook {
  id: string;
  name: string;
  sections: NotebookSection[];
  modified: Date;
  color: string;
}

// Mock Data
const mockNotebooks: Notebook[] = [
  {
    id: '1',
    name: 'Work Notes',
    modified: new Date('2024-11-08'),
    color: 'blue',
    sections: [
      {
        id: 's1',
        name: 'Meetings',
        notebookId: '1',
        color: 'blue',
        pages: [
          {
            id: 'p1',
            title: 'Q4 Planning Meeting',
            sectionId: 's1',
            modified: new Date('2024-11-08'),
            content: '<h2>Q4 Planning Meeting - Nov 8, 2024</h2><p><strong>Attendees:</strong> John, Sarah, Mike</p><h3>Key Points:</h3><ul><li>Budget allocation for Q4</li><li>New product launch timeline</li><li>Team hiring plans</li></ul><p><strong>Action Items:</strong></p><ol><li>Review budget proposal by Friday</li><li>Schedule follow-up with marketing team</li></ol>',
            tags: ['meeting', 'planning', 'Q4'],
          },
          {
            id: 'p2',
            title: 'Team Standup Notes',
            sectionId: 's1',
            modified: new Date('2024-11-07'),
            content: '<h2>Daily Standup - Nov 7</h2><p>Quick notes from today\'s standup meeting.</p>',
            tags: ['standup', 'daily'],
          },
        ],
      },
      {
        id: 's2',
        name: 'Project Ideas',
        notebookId: '1',
        color: 'green',
        pages: [
          {
            id: 'p3',
            title: 'Mobile App Concept',
            sectionId: 's2',
            modified: new Date('2024-11-06'),
            content: '<h2>Mobile App Ideas</h2><p>Brainstorming session for new mobile application...</p>',
            tags: ['ideas', 'mobile'],
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'Personal',
    modified: new Date('2024-11-05'),
    color: 'purple',
    sections: [
      {
        id: 's3',
        name: 'Goals',
        notebookId: '2',
        color: 'purple',
        pages: [
          {
            id: 'p4',
            title: '2024 Goals',
            sectionId: 's3',
            modified: new Date('2024-11-05'),
            content: '<h2>My Goals for 2024</h2><ul><li>Learn new technology</li><li>Read 24 books</li><li>Exercise regularly</li></ul>',
            tags: ['goals', 'personal'],
          },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Research',
    modified: new Date('2024-11-04'),
    color: 'orange',
    sections: [
      {
        id: 's4',
        name: 'AI & ML',
        notebookId: '3',
        color: 'orange',
        pages: [
          {
            id: 'p5',
            title: 'Machine Learning Basics',
            sectionId: 's4',
            modified: new Date('2024-11-04'),
            content: '<h2>Introduction to ML</h2><p>Key concepts and algorithms...</p>',
            tags: ['AI', 'ML', 'learning'],
          },
        ],
      },
    ],
  },
];

const OneNote: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [selectedNotebook, setSelectedNotebook] = useState<Notebook | null>(mockNotebooks[0]);
  const [selectedSection, setSelectedSection] = useState<NotebookSection | null>(
    mockNotebooks[0].sections[0]
  );
  const [selectedPage, setSelectedPage] = useState<NotebookPage | null>(
    mockNotebooks[0].sections[0].pages[0]
  );
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set(['1']));
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [showNewNotebookDialog, setShowNewNotebookDialog] = useState(false);
  const [showNewSectionDialog, setShowNewSectionDialog] = useState(false);
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const { data: notebooks = mockNotebooks, isLoading } = useQuery({
    queryKey: ['onenote-notebooks'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockNotebooks;
    },
    enabled: isConnected,
  });

  const toggleNotebook = (notebookId: string) => {
    const newExpanded = new Set(expandedNotebooks);
    if (newExpanded.has(notebookId)) {
      newExpanded.delete(notebookId);
    } else {
      newExpanded.add(notebookId);
    }
    setExpandedNotebooks(newExpanded);
  };

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleEditContent = () => {
    setIsEditing(true);
    setEditedContent(selectedPage?.content || '');
  };

  const handleSaveContent = () => {
    console.log('Saving content:', editedContent);
    setIsEditing(false);
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 1000);
  };

  const getNotebookColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      red: 'bg-red-500',
      pink: 'bg-pink-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Connect to OneNote</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-gray-600">
              Connect your Microsoft 365 account to access your OneNote notebooks.
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Book className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">OneNote</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>{isSyncing ? 'Syncing...' : 'Synced'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSyncing(true);
                  setTimeout(() => setIsSyncing(false), 1000);
                }}
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar - Notebooks and Sections */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <Button onClick={() => setShowNewNotebookDialog(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              New Notebook
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : (
                notebooks.map((notebook) => (
                  <div key={notebook.id} className="mb-2">
                    <div
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                        selectedNotebook?.id === notebook.id ? 'bg-purple-50' : ''
                      }`}
                      onClick={() => {
                        setSelectedNotebook(notebook);
                        toggleNotebook(notebook.id);
                      }}
                    >
                      <div className="flex items-center space-x-2 flex-1">
                        {expandedNotebooks.has(notebook.id) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <div className={`h-3 w-3 rounded ${getNotebookColor(notebook.color)}`}></div>
                        <BookOpen className="h-4 w-4 text-gray-600" />
                        <span className="font-medium text-sm">{notebook.name}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setSelectedNotebook(notebook);
                            setShowNewSectionDialog(true);
                          }}>
                            <Plus className="h-4 w-4 mr-2" />
                            New Section
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {expandedNotebooks.has(notebook.id) && (
                      <div className="ml-6 mt-1 space-y-1">
                        {notebook.sections.map((section) => (
                          <div key={section.id}>
                            <div
                              className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 ${
                                selectedSection?.id === section.id ? 'bg-purple-100' : ''
                              }`}
                              onClick={() => setSelectedSection(section)}
                            >
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm">{section.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {section.pages.length}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Pages List */}
        <div className="w-80 bg-white border-r flex flex-col">
          {selectedSection ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{selectedSection.name}</h3>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Rename Section
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Section
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <Button
                  onClick={() => setShowNewPageDialog(true)}
                  className="w-full"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Page
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                  {selectedSection.pages.map((page) => (
                    <div
                      key={page.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                        selectedPage?.id === page.id ? 'bg-purple-50 border-l-4 border-purple-600' : ''
                      }`}
                      onClick={() => {
                        setSelectedPage(page);
                        setIsEditing(false);
                      }}
                    >
                      <h4 className="font-medium text-sm mb-1">{page.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(page.modified)}</span>
                      </div>
                      {page.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {page.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select a section to view pages</p>
              </div>
            </div>
          )}
        </div>

        {/* Content Editor */}
        <div className="flex-1 bg-white flex flex-col">
          {selectedPage ? (
            <>
              <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedPage.title}</h2>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>Last edited {formatDate(selectedPage.modified)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isEditing ? (
                      <>
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveContent}>
                          Save
                        </Button>
                      </>
                    ) : (
                      <Button onClick={handleEditContent}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Rename Page
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="h-4 w-4 mr-2" />
                          Add Tags
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Page
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Editor Toolbar */}
                {isEditing && (
                  <div className="flex items-center space-x-1 border-t pt-4">
                    <Button variant="ghost" size="sm">
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button variant="ghost" size="sm">
                      <List className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button variant="ghost" size="sm">
                      <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button variant="ghost" size="sm">
                      <Tag className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <ScrollArea className="flex-1">
                <div className="max-w-4xl mx-auto p-8">
                  {isEditing ? (
                    <div className="min-h-[500px]">
                      <textarea
                        className="w-full min-h-[500px] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        placeholder="Start typing your notes..."
                      />
                    </div>
                  ) : (
                    <div
                      className="prose prose-lg max-w-none"
                      dangerouslySetInnerHTML={{ __html: selectedPage.content }}
                    />
                  )}
                </div>
              </ScrollArea>

              {/* Tags */}
              {selectedPage.tags.length > 0 && !isEditing && (
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <div className="flex flex-wrap gap-2">
                      {selectedPage.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Book className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a page to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Notebook Dialog */}
      <Dialog open={showNewNotebookDialog} onOpenChange={setShowNewNotebookDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Notebook</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="notebook-name">Notebook Name</Label>
              <Input
                id="notebook-name"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                placeholder="Enter notebook name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewNotebookDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Creating notebook:', newNotebookName);
              setShowNewNotebookDialog(false);
              setNewNotebookName('');
            }}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Section Dialog */}
      <Dialog open={showNewSectionDialog} onOpenChange={setShowNewSectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="section-name">Section Name</Label>
              <Input
                id="section-name"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                placeholder="Enter section name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSectionDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Creating section:', newSectionName);
              setShowNewSectionDialog(false);
              setNewSectionName('');
            }}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Page Dialog */}
      <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="page-title">Page Title</Label>
              <Input
                id="page-title"
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Enter page title"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPageDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Creating page:', newPageTitle);
              setShowNewPageDialog(false);
              setNewPageTitle('');
            }}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OneNote;
