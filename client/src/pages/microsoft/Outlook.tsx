import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail,
  Send,
  Inbox,
  Star,
  Trash2,
  Archive,
  MoreVertical,
  Search,
  Plus,
  FolderOpen,
  Flag,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Reply,
  ReplyAll,
  Forward,
  Paperclip,
  Users,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Types
interface Email {
  id: string;
  from: {
    name: string;
    email: string;
    avatar?: string;
  };
  to: string[];
  cc?: string[];
  subject: string;
  preview: string;
  body: string;
  date: Date;
  read: boolean;
  starred: boolean;
  hasAttachment: boolean;
  folder: string;
}

interface Folder {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
}

// Mock Data
const mockEmails: Email[] = [
  {
    id: '1',
    from: {
      name: 'John Smith',
      email: 'john.smith@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    },
    to: ['you@company.com'],
    subject: 'Q4 Budget Review Meeting',
    preview: 'Hi team, I wanted to schedule a meeting to review the Q4 budget allocation...',
    body: '<p>Hi team,</p><p>I wanted to schedule a meeting to review the Q4 budget allocation and discuss our spending priorities for the upcoming quarter.</p><p>Please let me know your availability for next week.</p><p>Best regards,<br>John</p>',
    date: new Date('2024-11-10T09:30:00'),
    read: false,
    starred: true,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '2',
    from: {
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    to: ['you@company.com'],
    cc: ['team@company.com'],
    subject: 'Project Update - Sprint Review',
    preview: 'Quick update on our current sprint progress. We\'ve completed 15 out of 18 tasks...',
    body: '<p>Hi everyone,</p><p>Quick update on our current sprint progress. We\'ve completed 15 out of 18 tasks and are on track for the Friday deadline.</p><p>Outstanding items:</p><ul><li>API integration testing</li><li>UI polish</li><li>Documentation</li></ul><p>Thanks,<br>Sarah</p>',
    date: new Date('2024-11-10T08:15:00'),
    read: false,
    starred: false,
    hasAttachment: true,
    folder: 'inbox',
  },
  {
    id: '3',
    from: {
      name: 'Mike Brown',
      email: 'mike.brown@vendor.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    to: ['you@company.com'],
    subject: 'Invoice #INV-2024-1105',
    preview: 'Please find attached the invoice for services rendered in October...',
    body: '<p>Hello,</p><p>Please find attached the invoice for services rendered in October. Payment is due within 30 days.</p><p>Let me know if you have any questions.</p><p>Regards,<br>Mike</p>',
    date: new Date('2024-11-09T16:45:00'),
    read: true,
    starred: false,
    hasAttachment: true,
    folder: 'inbox',
  },
  {
    id: '4',
    from: {
      name: 'HR Department',
      email: 'hr@company.com',
    },
    to: ['all@company.com'],
    subject: 'Company Holiday Schedule 2025',
    preview: 'We are pleased to share the company holiday schedule for 2025...',
    body: '<p>Dear Team,</p><p>We are pleased to share the company holiday schedule for 2025. Please review and plan your time off accordingly.</p><p>Best,<br>HR Team</p>',
    date: new Date('2024-11-08T14:20:00'),
    read: true,
    starred: false,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '5',
    from: {
      name: 'Emily Davis',
      email: 'emily.d@company.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
    to: ['you@company.com'],
    subject: 'Re: Design Mockups',
    preview: 'Thanks for the feedback! I\'ve updated the mockups based on your comments...',
    body: '<p>Hi,</p><p>Thanks for the feedback! I\'ve updated the mockups based on your comments. Please take another look when you get a chance.</p><p>Cheers,<br>Emily</p>',
    date: new Date('2024-11-08T11:30:00'),
    read: true,
    starred: true,
    hasAttachment: false,
    folder: 'inbox',
  },
  {
    id: '6',
    from: {
      name: 'You',
      email: 'you@company.com',
    },
    to: ['client@external.com'],
    subject: 'Proposal for Q1 2025',
    preview: 'Please find attached our proposal for the Q1 2025 engagement...',
    body: '<p>Dear Client,</p><p>Please find attached our proposal for the Q1 2025 engagement. I\'d be happy to discuss this in more detail.</p><p>Best regards</p>',
    date: new Date('2024-11-07T15:00:00'),
    read: true,
    starred: false,
    hasAttachment: true,
    folder: 'sent',
  },
];

const Outlook: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeDialog, setShowComposeDialog] = useState(false);
  const [filterUnread, setFilterUnread] = useState(false);
  const [filterStarred, setFilterStarred] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSyncing, setIsSyncing] = useState(false);
  const itemsPerPage = 10;

  // Compose form state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  const folders: Folder[] = [
    { id: 'inbox', name: 'Inbox', icon: <Inbox className="h-4 w-4" />, count: 5 },
    { id: 'starred', name: 'Starred', icon: <Star className="h-4 w-4" />, count: 2 },
    { id: 'sent', name: 'Sent Items', icon: <Send className="h-4 w-4" />, count: 15 },
    { id: 'drafts', name: 'Drafts', icon: <Mail className="h-4 w-4" />, count: 3 },
    { id: 'archive', name: 'Archive', icon: <Archive className="h-4 w-4" />, count: 42 },
    { id: 'deleted', name: 'Deleted Items', icon: <Trash2 className="h-4 w-4" />, count: 8 },
  ];

  const { data: emails = mockEmails, isLoading } = useQuery({
    queryKey: ['outlook-emails', selectedFolder],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockEmails;
    },
    enabled: isConnected,
  });

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Filter emails
  let filteredEmails = emails.filter(email => {
    if (selectedFolder === 'starred') {
      return email.starred;
    }
    if (selectedFolder === 'inbox' && email.folder !== 'inbox') {
      return false;
    }
    if (selectedFolder !== 'inbox' && selectedFolder !== 'starred' && email.folder !== selectedFolder) {
      return false;
    }
    if (filterUnread && email.read) return false;
    if (filterStarred && !email.starred) return false;
    if (searchQuery && !email.subject.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !email.preview.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage);
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleMarkAsRead = (email: Email) => {
    console.log('Marking as read:', email.id);
  };

  const handleToggleStar = (email: Email) => {
    console.log('Toggle star:', email.id);
  };

  const handleDelete = (email: Email) => {
    console.log('Deleting:', email.id);
  };

  const handleSendEmail = () => {
    console.log('Sending email:', { to: composeTo, subject: composeSubject, body: composeBody });
    setShowComposeDialog(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <Mail className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Connect to Outlook</h2>
              <p className="text-gray-600 mb-4">
                Connect your Microsoft 365 account to access your Outlook emails.
              </p>
              <Button onClick={() => setIsConnected(true)} className="w-full">
                Connect to Microsoft 365
              </Button>
            </div>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Outlook</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>{isSyncing ? 'Syncing...' : 'Connected'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search emails..."
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
              <Button onClick={() => setShowComposeDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Compose
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar - Folders */}
        <div className="w-64 bg-white border-r">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={() => {
                    setSelectedFolder(folder.id);
                    setSelectedEmail(null);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    selectedFolder === folder.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {folder.icon}
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  {folder.count > 0 && (
                    <Badge variant={selectedFolder === folder.id ? 'default' : 'secondary'}>
                      {folder.count}
                    </Badge>
                  )}
                </button>
              ))}

              <Separator className="my-4" />

              <div className="px-3 py-2">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Custom Folders
                </h4>
                <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-left">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Projects</span>
                </button>
                <button className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 text-left">
                  <FolderOpen className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Important</span>
                </button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Email List */}
        <div className="w-96 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold capitalize">{selectedFolder}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setFilterUnread(!filterUnread)}>
                    {filterUnread ? '✓ ' : ''}Unread only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterStarred(!filterStarred)}>
                    {filterStarred ? '✓ ' : ''}Starred only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-sm text-gray-500">
              {filteredEmails.length} message{filteredEmails.length !== 1 ? 's' : ''}
            </p>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : paginatedEmails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No emails found</p>
              </div>
            ) : (
              <div className="divide-y">
                {paginatedEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${
                      selectedEmail?.id === email.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                    } ${!email.read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => setSelectedEmail(email)}
                  >
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-10 w-10">
                        {email.from.avatar ? (
                          <AvatarImage src={email.from.avatar} />
                        ) : null}
                        <AvatarFallback>{getInitials(email.from.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className={`font-medium truncate ${!email.read ? 'font-bold' : ''}`}>
                            {email.from.name}
                          </p>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {formatDate(email.date)}
                          </span>
                        </div>
                        <p className={`text-sm truncate mb-1 ${!email.read ? 'font-semibold' : ''}`}>
                          {email.subject}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {email.preview}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          {!email.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                          {email.starred && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
                          {email.hasAttachment && <Paperclip className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Email Preview */}
        <div className="flex-1 bg-white">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEmail.subject}
                    </h2>
                    <div className="flex items-center space-x-2">
                      {selectedEmail.hasAttachment && (
                        <Badge variant="outline">
                          <Paperclip className="h-3 w-3 mr-1" />
                          Attachment
                        </Badge>
                      )}
                      {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                        <Badge variant="outline">
                          <Users className="h-3 w-3 mr-1" />
                          CC: {selectedEmail.cc.length}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(selectedEmail)}
                    >
                      <Star
                        className={`h-4 w-4 ${
                          selectedEmail.starred ? 'text-yellow-500 fill-yellow-500' : ''
                        }`}
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleMarkAsRead(selectedEmail)}>
                          <Mail className="h-4 w-4 mr-2" />
                          Mark as {selectedEmail.read ? 'Unread' : 'Read'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Flag className="h-4 w-4 mr-2" />
                          Flag
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(selectedEmail)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-12 w-12">
                    {selectedEmail.from.avatar ? (
                      <AvatarImage src={selectedEmail.from.avatar} />
                    ) : null}
                    <AvatarFallback>{getInitials(selectedEmail.from.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{selectedEmail.from.name}</p>
                    <p className="text-sm text-gray-500">{selectedEmail.from.email}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      To: {selectedEmail.to.join(', ')}
                    </p>
                    {selectedEmail.cc && selectedEmail.cc.length > 0 && (
                      <p className="text-sm text-gray-500">
                        CC: {selectedEmail.cc.join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {selectedEmail.date.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </Button>
                  <Button variant="outline" size="sm">
                    <ReplyAll className="h-4 w-4 mr-2" />
                    Reply All
                  </Button>
                  <Button variant="outline" size="sm">
                    <Forward className="h-4 w-4 mr-2" />
                    Forward
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body }}
                />

                {selectedEmail.hasAttachment && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold mb-3">Attachments</h3>
                    <div className="space-y-2">
                      <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Paperclip className="h-5 w-5 text-gray-400" />
                            <div>
                              <p className="font-medium">document.pdf</p>
                              <p className="text-sm text-gray-500">2.4 MB</p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Mail className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select an email to view its content</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Dialog */}
      <Dialog open={showComposeDialog} onOpenChange={setShowComposeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Message</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="to">To</Label>
              <Input
                id="to"
                value={composeTo}
                onChange={(e) => setComposeTo(e.target.value)}
                placeholder="recipient@example.com"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Email subject"
              />
            </div>
            <div>
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={composeBody}
                onChange={(e) => setComposeBody(e.target.value)}
                placeholder="Write your message..."
                rows={10}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Paperclip className="h-4 w-4 mr-2" />
                Attach File
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowComposeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Outlook;
