import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  Info,
  MoreVertical,
  Search,
  Reply,
  Edit,
  Trash2,
  ThumbsUp,
  Heart,
  Laugh,
  Users,
  File,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  ChevronDown,
  Circle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../../components/ui/sheet';
import { Separator } from '../../components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

// Types
interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'away' | 'busy' | 'offline';
  };
  content: string;
  timestamp: Date;
  isRead: boolean;
  isSent: boolean;
  replyTo?: string;
  reactions: Reaction[];
  attachments?: Attachment[];
  isEdited: boolean;
}

interface Reaction {
  type: 'like' | 'love' | 'laugh';
  users: string[];
}

interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image';
  size: number;
  url?: string;
}

interface ChatMember {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role?: string;
}

// Mock Data
const mockMembers: ChatMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'online',
    role: 'Team Lead',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'away',
    role: 'Developer',
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    status: 'busy',
    role: 'Designer',
  },
];

const mockMessages: Message[] = [
  {
    id: '1',
    sender: mockMembers[0],
    content: 'Hey team! Just finished reviewing the latest mockups. They look great!',
    timestamp: new Date('2024-11-10T09:00:00'),
    isRead: true,
    isSent: false,
    reactions: [{ type: 'like', users: ['2', '3'] }],
    isEdited: false,
  },
  {
    id: '2',
    sender: mockMembers[1],
    content: 'Thanks! I incorporated all the feedback from last week\'s meeting.',
    timestamp: new Date('2024-11-10T09:05:00'),
    isRead: true,
    isSent: false,
    reactions: [{ type: 'like', users: ['1'] }],
    isEdited: false,
  },
  {
    id: '3',
    sender: { id: 'me', name: 'You', status: 'online' },
    content: 'Perfect timing! I wanted to discuss the color scheme for the dashboard.',
    timestamp: new Date('2024-11-10T09:10:00'),
    isRead: true,
    isSent: true,
    reactions: [],
    isEdited: false,
  },
  {
    id: '4',
    sender: mockMembers[2],
    content: 'I have some ideas about that. Let me share a quick prototype.',
    timestamp: new Date('2024-11-10T09:15:00'),
    isRead: true,
    isSent: false,
    reactions: [{ type: 'love', users: ['me'] }],
    attachments: [
      {
        id: 'a1',
        name: 'dashboard-prototype.fig',
        type: 'file',
        size: 2500000,
      },
    ],
    isEdited: false,
  },
  {
    id: '5',
    sender: mockMembers[0],
    content: 'Great! Also, can we schedule a quick call later today to finalize everything?',
    timestamp: new Date('2024-11-10T09:20:00'),
    isRead: true,
    isSent: false,
    reactions: [{ type: 'like', users: ['me', '2'] }],
    isEdited: false,
  },
  {
    id: '6',
    sender: { id: 'me', name: 'You', status: 'online' },
    content: 'Sure! How about 2 PM? That works for everyone?',
    timestamp: new Date('2024-11-10T09:25:00'),
    isRead: true,
    isSent: true,
    reactions: [{ type: 'like', users: ['1', '2', '3'] }],
    isEdited: false,
  },
  {
    id: '7',
    sender: mockMembers[1],
    content: '2 PM works perfectly for me!',
    timestamp: new Date('2024-11-10T09:30:00'),
    isRead: false,
    isSent: false,
    reactions: [],
    isEdited: false,
  },
];

const TeamsChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock chat info
  const chatName = 'Product Development Team';
  const chatMembers = mockMembers;

  const { data: chatMessages = messages, isLoading } = useQuery({
    queryKey: ['teams-chat-messages'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return messages;
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: { id: 'me', name: 'You', status: 'online' },
      content: newMessage,
      timestamp: new Date(),
      isRead: true,
      isSent: true,
      reactions: [],
      isEdited: false,
      replyTo: replyToMessage?.id,
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setReplyToMessage(null);

    // Simulate typing indicator
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleAddReaction = (messageId: string, reactionType: 'like' | 'love' | 'laugh') => {
    setMessages(
      messages.map((msg) => {
        if (msg.id === messageId) {
          const existingReaction = msg.reactions.find((r) => r.type === reactionType);
          if (existingReaction) {
            if (existingReaction.users.includes('me')) {
              // Remove reaction
              return {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.type === reactionType
                    ? { ...r, users: r.users.filter((u) => u !== 'me') }
                    : r
                ).filter((r) => r.users.length > 0),
              };
            } else {
              // Add reaction
              return {
                ...msg,
                reactions: msg.reactions.map((r) =>
                  r.type === reactionType ? { ...r, users: [...r.users, 'me'] } : r
                ),
              };
            }
          } else {
            // New reaction
            return {
              ...msg,
              reactions: [...msg.reactions, { type: reactionType, users: ['me'] }],
            };
          }
        }
        return msg;
      })
    );
  };

  const handleFileAttach = () => {
    fileInputRef.current?.click();
  };

  const getReactionIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <ThumbsUp className="h-4 w-4" />;
      case 'love':
        return <Heart className="h-4 w-4" />;
      case 'laugh':
        return <Laugh className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-purple-600 text-white">
                {getInitials(chatName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{chatName}</h2>
              <p className="text-sm text-gray-500">{chatMembers.length} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search in chat..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4 mr-2" />
              Video Call
            </Button>
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Audio Call
            </Button>
            <Sheet open={showChatInfo} onOpenChange={setShowChatInfo}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Info className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96">
                <SheetHeader>
                  <SheetTitle>Chat Information</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  <div className="text-center">
                    <Avatar className="h-20 w-20 mx-auto mb-3">
                      <AvatarFallback className="bg-purple-600 text-white text-2xl">
                        {getInitials(chatName)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold text-lg">{chatName}</h3>
                    <p className="text-sm text-gray-500">{chatMembers.length} members</p>
                  </div>

                  <Tabs defaultValue="members">
                    <TabsList className="w-full">
                      <TabsTrigger value="members" className="flex-1">Members</TabsTrigger>
                      <TabsTrigger value="files" className="flex-1">Files</TabsTrigger>
                      <TabsTrigger value="links" className="flex-1">Links</TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-2 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Members</h4>
                        <Button variant="outline" size="sm">
                          <Users className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                      <ScrollArea className="h-[400px]">
                        {chatMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  {member.avatar ? (
                                    <AvatarImage src={member.avatar} />
                                  ) : null}
                                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                                </Avatar>
                                <div
                                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                    member.status
                                  )}`}
                                ></div>
                              </div>
                              <div>
                                <p className="font-medium text-sm">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.role}</p>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Send Message</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        ))}
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="files" className="mt-4">
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-2">
                          {messages
                            .filter((m) => m.attachments && m.attachments.length > 0)
                            .map((message) =>
                              message.attachments?.map((attachment) => (
                                <Card key={attachment.id}>
                                  <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <File className="h-8 w-8 text-gray-400" />
                                      <div>
                                        <p className="font-medium text-sm">{attachment.name}</p>
                                        <p className="text-xs text-gray-500">
                                          {formatFileSize(attachment.size)} • {formatDate(message.timestamp)}
                                        </p>
                                      </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                      Download
                                    </Button>
                                  </CardContent>
                                </Card>
                              ))
                            )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="links" className="mt-4">
                      <ScrollArea className="h-[400px]">
                        <div className="text-center py-8 text-gray-500">
                          <LinkIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No links shared yet</p>
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  </Tabs>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-gray-100 px-4 py-1 rounded-full">
                      <span className="text-xs font-medium text-gray-600">{date}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {dateMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex space-x-3 max-w-2xl ${message.isSent ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!message.isSent && (
                            <div className="relative flex-shrink-0">
                              <Avatar className="h-8 w-8">
                                {message.sender.avatar ? (
                                  <AvatarImage src={message.sender.avatar} />
                                ) : null}
                                <AvatarFallback>{getInitials(message.sender.name)}</AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white ${getStatusColor(
                                  message.sender.status
                                )}`}
                              ></div>
                            </div>
                          )}

                          <div className="flex-1">
                            {!message.isSent && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium">{message.sender.name}</span>
                                <span className="text-xs text-gray-500">{formatTime(message.timestamp)}</span>
                              </div>
                            )}

                            <div className="group relative">
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  message.isSent
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-900'
                                }`}
                              >
                                {message.replyTo && (
                                  <div className={`mb-2 pb-2 border-l-2 pl-2 text-xs ${message.isSent ? 'border-purple-400' : 'border-gray-300'}`}>
                                    <p className={message.isSent ? 'text-purple-200' : 'text-gray-500'}>
                                      Replying to previous message
                                    </p>
                                  </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                {message.isEdited && (
                                  <span className={`text-xs ${message.isSent ? 'text-purple-200' : 'text-gray-500'}`}>
                                    {' '}(edited)
                                  </span>
                                )}
                              </div>

                              {message.isSent && (
                                <div className="text-xs text-gray-500 mt-1 text-right">
                                  {formatTime(message.timestamp)}
                                  {message.isRead && <span className="ml-1">✓✓</span>}
                                </div>
                              )}

                              {/* Message Actions */}
                              <div className={`absolute top-0 ${message.isSent ? 'left-0' : 'right-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                                <div className="flex items-center space-x-1 bg-white border rounded-lg shadow-md p-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddReaction(message.id, 'like')}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddReaction(message.id, 'love')}
                                  >
                                    <Heart className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleAddReaction(message.id, 'laugh')}
                                  >
                                    <Laugh className="h-4 w-4" />
                                  </Button>
                                  <Separator orientation="vertical" className="h-6" />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyToMessage(message)}
                                  >
                                    <Reply className="h-4 w-4" />
                                  </Button>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {message.isSent && (
                                        <>
                                          <DropdownMenuItem>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                          </DropdownMenuItem>
                                          <DropdownMenuItem className="text-red-600">
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Delete
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                        </>
                                      )}
                                      <DropdownMenuItem>Copy</DropdownMenuItem>
                                      <DropdownMenuItem>Forward</DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>

                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment) => (
                                  <Card key={attachment.id}>
                                    <CardContent className="p-3 flex items-center justify-between">
                                      <div className="flex items-center space-x-2">
                                        <File className="h-5 w-5 text-gray-400" />
                                        <div>
                                          <p className="text-sm font-medium">{attachment.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {formatFileSize(attachment.size)}
                                          </p>
                                        </div>
                                      </div>
                                      <Button variant="outline" size="sm">
                                        Download
                                      </Button>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            )}

                            {/* Reactions */}
                            {message.reactions.length > 0 && (
                              <div className="flex items-center space-x-1 mt-2">
                                {message.reactions.map((reaction) => (
                                  <button
                                    key={reaction.type}
                                    onClick={() => handleAddReaction(message.id, reaction.type)}
                                    className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs border ${
                                      reaction.users.includes('me')
                                        ? 'bg-purple-100 border-purple-300 text-purple-700'
                                        : 'bg-gray-100 border-gray-200 text-gray-700'
                                    } hover:bg-purple-50 transition-colors`}
                                  >
                                    {getReactionIcon(reaction.type)}
                                    <span>{reaction.users.length}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded-lg px-4 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t">
          {replyToMessage && (
            <div className="mb-2 flex items-center justify-between bg-gray-50 p-2 rounded">
              <div className="flex items-center space-x-2">
                <Reply className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Replying to {replyToMessage.sender.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyToMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <div className="flex-1 border rounded-lg p-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message..."
                className="border-0 focus:ring-0 resize-none min-h-[60px]"
                rows={2}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={handleFileAttach}>
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => console.log('File selected:', e.target.files)}
                  />
                  <Button variant="ghost" size="sm">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                </div>
                <span className="text-xs text-gray-400">
                  Press Enter to send, Shift+Enter for new line
                </span>
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="h-[100px]"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamsChat;
