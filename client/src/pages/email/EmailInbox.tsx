import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Search,
  Mail,
  MailOpen,
  Archive,
  Trash2,
  Star,
  StarOff,
  Reply,
  Forward,
  MoreVertical,
  Inbox,
  Send,
  FileText,
  AlertCircle,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  Paperclip,
  Clock,
  Sparkles,
  RefreshCw,
  Edit,
  Folder,
  Plus,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Card, CardContent } from "../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Checkbox } from "../../components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Email {
  id: string;
  from: {
    name: string;
    email: string;
  };
  to: string[];
  subject: string;
  body: string;
  preview: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachments: boolean;
  attachments?: Array<{ name: string; size: string; type: string }>;
  folder: string;
  sentiment?: "positive" | "neutral" | "negative" | "urgent";
  aiSummary?: string;
  threadId?: string;
}

const FOLDERS = [
  { id: "inbox", name: "Inbox", icon: Inbox, count: 12 },
  { id: "sent", name: "Sent", icon: Send, count: 0 },
  { id: "drafts", name: "Drafts", icon: FileText, count: 3 },
  { id: "archived", name: "Archived", icon: Archive, count: 45 },
  { id: "spam", name: "Spam", icon: AlertCircle, count: 2 },
];

// Mock data for demonstration
const MOCK_EMAILS: Email[] = [
  {
    id: "1",
    from: { name: "John Smith", email: "john.smith@example.com" },
    to: ["you@company.com"],
    subject: "Q4 Project Proposal - Review Needed",
    body: `Hi Team,

I hope this email finds you well. I wanted to share the Q4 project proposal with you for review. This is a critical initiative that will significantly impact our revenue targets.

Key highlights:
- Expected ROI: 245%
- Timeline: 12 weeks
- Budget: $150,000
- Team size: 8 members

Please review the attached document and provide your feedback by end of week. I'm available for a call if you have any questions.

Looking forward to your thoughts.

Best regards,
John Smith
Senior Project Manager`,
    preview: "I hope this email finds you well. I wanted to share the Q4 project proposal...",
    timestamp: new Date(Date.now() - 3600000),
    isRead: false,
    isStarred: true,
    hasAttachments: true,
    attachments: [
      { name: "Q4_Proposal.pdf", size: "2.4 MB", type: "application/pdf" },
      { name: "Budget_Breakdown.xlsx", size: "856 KB", type: "application/vnd.ms-excel" },
    ],
    folder: "inbox",
    sentiment: "positive",
    aiSummary:
      "John is requesting review of Q4 project proposal with 245% ROI, 12-week timeline, and $150K budget. Feedback needed by end of week.",
  },
  {
    id: "2",
    from: { name: "Sarah Johnson", email: "sarah.j@client.com" },
    to: ["you@company.com"],
    subject: "URGENT: Payment issue needs immediate attention",
    body: `Hello,

We've encountered a critical payment processing issue that requires immediate attention. Our accounting team has flagged multiple failed transactions.

This is impacting our ability to process customer orders. Please prioritize this issue.

Thanks,
Sarah`,
    preview: "We've encountered a critical payment processing issue that requires...",
    timestamp: new Date(Date.now() - 7200000),
    isRead: false,
    isStarred: false,
    hasAttachments: false,
    folder: "inbox",
    sentiment: "urgent",
    aiSummary:
      "Critical payment processing issue affecting customer orders. Requires immediate attention and prioritization.",
  },
  {
    id: "3",
    from: { name: "Marketing Team", email: "marketing@company.com" },
    to: ["you@company.com"],
    subject: "Weekly Newsletter - Marketing Updates",
    body: `Hi Everyone,

Here's this week's marketing update with our latest campaigns and performance metrics.

This week's highlights:
- New social media campaign launched
- Email open rate increased by 15%
- Website traffic up 23%

Check out the full report in the link below.

Cheers,
Marketing Team`,
    preview: "Here's this week's marketing update with our latest campaigns...",
    timestamp: new Date(Date.now() - 86400000),
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    folder: "inbox",
    sentiment: "positive",
  },
  {
    id: "4",
    from: { name: "Alex Chen", email: "alex.chen@partner.com" },
    to: ["you@company.com"],
    subject: "Meeting scheduled for tomorrow at 2 PM",
    body: `Hi,

Just confirming our meeting tomorrow at 2 PM. I'll send the calendar invite shortly.

We'll discuss the partnership agreement and next steps.

See you then!
Alex`,
    preview: "Just confirming our meeting tomorrow at 2 PM...",
    timestamp: new Date(Date.now() - 172800000),
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    folder: "inbox",
    sentiment: "neutral",
  },
  {
    id: "5",
    from: { name: "Support Team", email: "support@company.com" },
    to: ["you@company.com"],
    subject: "Re: Technical Support Ticket #12345",
    body: `Hello,

Your support ticket has been resolved. The issue was related to server configuration.

If you experience any further problems, please let us know.

Best regards,
Support Team`,
    preview: "Your support ticket has been resolved. The issue was related to...",
    timestamp: new Date(Date.now() - 259200000),
    isRead: true,
    isStarred: false,
    hasAttachments: false,
    folder: "inbox",
    sentiment: "positive",
  },
];

export default function EmailInbox() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState<Email[]>(MOCK_EMAILS);
  const [selectedFolder, setSelectedFolder] = useState("inbox");
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(MOCK_EMAILS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const filteredEmails = emails.filter((email) => {
    const matchesFolder = email.folder === selectedFolder;
    const matchesSearch =
      searchTerm === "" ||
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.from.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.body.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFolder && matchesSearch;
  });

  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const unreadCount = emails.filter((e) => !e.isRead && e.folder === "inbox").length;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmails(filteredEmails.map((e) => e.id));
    } else {
      setSelectedEmails([]);
    }
  };

  const handleSelectEmail = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEmails([...selectedEmails, id]);
    } else {
      setSelectedEmails(selectedEmails.filter((eId) => eId !== id));
    }
  };

  const handleMarkAsRead = (ids: string[]) => {
    setEmails((prev) =>
      prev.map((email) => (ids.includes(email.id) ? { ...email, isRead: true } : email))
    );
    toast({ title: "Marked as read" });
  };

  const handleMarkAsUnread = (ids: string[]) => {
    setEmails((prev) =>
      prev.map((email) => (ids.includes(email.id) ? { ...email, isRead: false } : email))
    );
    toast({ title: "Marked as unread" });
  };

  const handleToggleStar = (id: string) => {
    setEmails((prev) =>
      prev.map((email) =>
        email.id === id ? { ...email, isStarred: !email.isStarred } : email
      )
    );
  };

  const handleArchive = (ids: string[]) => {
    setEmails((prev) =>
      prev.map((email) => (ids.includes(email.id) ? { ...email, folder: "archived" } : email))
    );
    setSelectedEmails([]);
    toast({ title: "Archived", description: `${ids.length} email(s) archived` });
  };

  const handleDelete = (ids: string[]) => {
    setEmails((prev) => prev.filter((email) => !ids.includes(email.id)));
    setSelectedEmails([]);
    if (selectedEmail && ids.includes(selectedEmail.id)) {
      setSelectedEmail(null);
    }
    toast({ title: "Deleted", description: `${ids.length} email(s) deleted` });
  };

  const handleMoveToFolder = (ids: string[], folder: string) => {
    setEmails((prev) =>
      prev.map((email) => (ids.includes(email.id) ? { ...email, folder } : email))
    );
    setSelectedEmails([]);
    toast({ title: "Moved", description: `Moved to ${folder}` });
  };

  const handleEmailClick = (email: Email) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      handleMarkAsRead([email.id]);
    }
  };

  const handleRefresh = () => {
    toast({ title: "Refreshing...", description: "Checking for new emails" });
    // In production, this would fetch new emails from the server
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20";
      case "negative":
        return "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20";
      case "urgent":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20";
      default:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20";
    }
  };

  const getSentimentIcon = (sentiment?: string) => {
    if (sentiment === "urgent") return <AlertCircle className="h-3 w-3" />;
    return <Sparkles className="h-3 w-3" />;
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Email</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => navigate("/email/compose")}>
              <Edit className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDateFilter("today")}>
                <Clock className="h-4 w-4 mr-2" />
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("week")}>
                <Calendar className="h-4 w-4 mr-2" />
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("attachments")}>
                <Paperclip className="h-4 w-4 mr-2" />
                Has Attachments
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setDateFilter("starred")}>
                <Star className="h-4 w-4 mr-2" />
                Starred
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bulk Actions */}
        {selectedEmails.length > 0 && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{selectedEmails.length} selected</span>
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsRead(selectedEmails)}
            >
              <MailOpen className="h-4 w-4 mr-2" />
              Mark Read
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleMarkAsUnread(selectedEmails)}
            >
              <Mail className="h-4 w-4 mr-2" />
              Mark Unread
            </Button>
            <Button variant="ghost" size="sm" onClick={() => handleArchive(selectedEmails)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(selectedEmails)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="h-full border-r">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {FOLDERS.map((folder) => (
                  <Button
                    key={folder.id}
                    variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <folder.icon className="h-4 w-4 mr-2" />
                    <span className="flex-1 text-left">{folder.name}</span>
                    {folder.count > 0 && (
                      <Badge variant="secondary" className="ml-auto">
                        {folder.count}
                      </Badge>
                    )}
                  </Button>
                ))}

                <Separator className="my-4" />

                <div className="space-y-1">
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm font-medium text-muted-foreground">
                      Custom Folders
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Folder className="h-4 w-4 mr-2" />
                    Important Clients
                  </Button>
                  <Button variant="ghost" className="w-full justify-start" size="sm">
                    <Folder className="h-4 w-4 mr-2" />
                    Projects
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Email List */}
        <div className="w-96 flex-shrink-0 border-r">
          <div className="h-full flex flex-col">
            <div className="border-b p-3 flex items-center gap-2">
              <Checkbox
                checked={
                  selectedEmails.length === filteredEmails.length && filteredEmails.length > 0
                }
                onCheckedChange={handleSelectAll}
              />
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y">
                {paginatedEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                      selectedEmail?.id === email.id ? "bg-muted" : ""
                    } ${!email.isRead ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => handleEmailClick(email)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedEmails.includes(email.id)}
                        onCheckedChange={(checked) =>
                          handleSelectEmail(email.id, checked as boolean)
                        }
                        onClick={(e) => e.stopPropagation()}
                      />

                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback>
                          {email.from.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span
                            className={`font-medium truncate ${
                              !email.isRead ? "font-bold" : ""
                            }`}
                          >
                            {email.from.name}
                          </span>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-muted-foreground">
                              {format(email.timestamp, "MMM d")}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleStar(email.id);
                              }}
                            >
                              {email.isStarred ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <StarOff className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        <div
                          className={`text-sm mb-1 truncate ${
                            !email.isRead ? "font-semibold" : ""
                          }`}
                        >
                          {email.subject}
                        </div>

                        <div className="text-sm text-muted-foreground truncate mb-2">
                          {email.preview}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          {email.sentiment && (
                            <Badge variant="outline" className={getSentimentColor(email.sentiment)}>
                              {getSentimentIcon(email.sentiment)}
                              <span className="ml-1 capitalize">{email.sentiment}</span>
                            </Badge>
                          )}
                          {email.hasAttachments && (
                            <Badge variant="outline">
                              <Paperclip className="h-3 w-3 mr-1" />
                              {email.attachments?.length || 1}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Email Preview */}
        <div className="flex-1">
          {selectedEmail ? (
            <div className="h-full flex flex-col">
              {/* Email Header */}
              <div className="border-b p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-2">
                      {selectedEmail.sentiment && (
                        <Badge
                          variant="outline"
                          className={getSentimentColor(selectedEmail.sentiment)}
                        >
                          {getSentimentIcon(selectedEmail.sentiment)}
                          <span className="ml-1 capitalize">{selectedEmail.sentiment}</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStar(selectedEmail.id)}
                    >
                      {selectedEmail.isStarred ? (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleMarkAsUnread([selectedEmail.id])}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Mark as Unread
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Folder className="h-4 w-4 mr-2" />
                          Move to Folder
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {selectedEmail.from.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{selectedEmail.from.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedEmail.from.email}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {format(selectedEmail.timestamp, "EEEE, MMMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {selectedEmail.aiSummary && (
                  <Card className="mt-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-semibold text-sm mb-1">AI Summary</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedEmail.aiSummary}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Email Body */}
              <ScrollArea className="flex-1">
                <div className="p-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap">{selectedEmail.body}</p>
                  </div>

                  {/* Attachments */}
                  {selectedEmail.hasAttachments && selectedEmail.attachments && (
                    <div className="mt-6">
                      <h3 className="text-sm font-semibold mb-3">
                        Attachments ({selectedEmail.attachments.length})
                      </h3>
                      <div className="space-y-2">
                        {selectedEmail.attachments.map((attachment, index) => (
                          <Card key={index}>
                            <CardContent className="p-3 flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-muted flex items-center justify-center">
                                <Paperclip className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {attachment.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {attachment.size}
                                </div>
                              </div>
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Quick Actions */}
              <div className="border-t p-4 flex items-center gap-2">
                <Button onClick={() => navigate("/email/compose")}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
                <Button variant="outline">
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center p-8">
              <div>
                <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No email selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select an email from the list to view its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
