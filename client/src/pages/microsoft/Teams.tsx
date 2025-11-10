import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  Users,
  Hash,
  Plus,
  Search,
  Pin,
  MoreVertical,
  Settings,
  Bell,
  Star,
  Video,
  Phone,
  ChevronDown,
  ChevronRight,
  Circle,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useLocation } from 'wouter';

// Types
interface Team {
  id: string;
  name: string;
  avatar?: string;
  channels: Channel[];
}

interface Channel {
  id: string;
  name: string;
  teamId: string;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: Date;
  isPinned: boolean;
  isPrivate: boolean;
}

interface Chat {
  id: string;
  type: 'direct' | 'group';
  participants: Participant[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  isPinned: boolean;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
}

// Mock Data
const mockParticipants: Participant[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    status: 'online',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'away',
  },
  {
    id: '3',
    name: 'Mike Brown',
    email: 'mike.brown@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    status: 'busy',
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.d@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    status: 'online',
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'david.w@company.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    status: 'offline',
  },
];

const mockTeams: Team[] = [
  {
    id: '1',
    name: 'Product Development',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=ProductDev',
    channels: [
      {
        id: 'c1',
        name: 'General',
        teamId: '1',
        unreadCount: 3,
        lastMessage: 'Great work on the new feature!',
        lastMessageTime: new Date('2024-11-10T10:30:00'),
        isPinned: true,
        isPrivate: false,
      },
      {
        id: 'c2',
        name: 'Development',
        teamId: '1',
        unreadCount: 12,
        lastMessage: 'PR #456 is ready for review',
        lastMessageTime: new Date('2024-11-10T09:15:00'),
        isPinned: false,
        isPrivate: false,
      },
      {
        id: 'c3',
        name: 'Design',
        teamId: '1',
        unreadCount: 0,
        lastMessage: 'Updated mockups are in Figma',
        lastMessageTime: new Date('2024-11-09T16:45:00'),
        isPinned: false,
        isPrivate: false,
      },
      {
        id: 'c4',
        name: 'Sprint Planning',
        teamId: '1',
        unreadCount: 5,
        lastMessage: 'Next sprint starts Monday',
        lastMessageTime: new Date('2024-11-10T08:00:00'),
        isPinned: false,
        isPrivate: true,
      },
    ],
  },
  {
    id: '2',
    name: 'Marketing',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Marketing',
    channels: [
      {
        id: 'c5',
        name: 'General',
        teamId: '2',
        unreadCount: 1,
        lastMessage: 'Campaign results are impressive!',
        lastMessageTime: new Date('2024-11-09T14:20:00'),
        isPinned: false,
        isPrivate: false,
      },
      {
        id: 'c6',
        name: 'Social Media',
        teamId: '2',
        unreadCount: 0,
        lastMessage: 'Scheduled posts for next week',
        lastMessageTime: new Date('2024-11-08T11:30:00'),
        isPinned: false,
        isPrivate: false,
      },
    ],
  },
  {
    id: '3',
    name: 'Executive Team',
    avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=Executive',
    channels: [
      {
        id: 'c7',
        name: 'Leadership',
        teamId: '3',
        unreadCount: 2,
        lastMessage: 'Q4 board meeting agenda',
        lastMessageTime: new Date('2024-11-10T07:45:00'),
        isPinned: true,
        isPrivate: true,
      },
    ],
  },
];

const mockChats: Chat[] = [
  {
    id: 'ch1',
    type: 'direct',
    participants: [mockParticipants[0]],
    lastMessage: 'Can we discuss the project timeline?',
    lastMessageTime: new Date('2024-11-10T11:00:00'),
    unreadCount: 2,
    isPinned: true,
  },
  {
    id: 'ch2',
    type: 'direct',
    participants: [mockParticipants[1]],
    lastMessage: 'Thanks for the update!',
    lastMessageTime: new Date('2024-11-10T09:45:00'),
    unreadCount: 0,
    isPinned: false,
  },
  {
    id: 'ch3',
    type: 'group',
    participants: [mockParticipants[2], mockParticipants[3]],
    lastMessage: 'Meeting at 2pm today',
    lastMessageTime: new Date('2024-11-10T08:30:00'),
    unreadCount: 5,
    isPinned: false,
  },
  {
    id: 'ch4',
    type: 'direct',
    participants: [mockParticipants[4]],
    lastMessage: 'See you tomorrow',
    lastMessageTime: new Date('2024-11-09T17:00:00'),
    unreadCount: 0,
    isPinned: false,
  },
];

const Teams: React.FC = () => {
  const [, navigate] = useLocation();
  const [isConnected, setIsConnected] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(mockTeams[0]);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set(['1']));
  const [activeTab, setActiveTab] = useState<'teams' | 'chats'>('teams');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'pinned'>('all');
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showNewChannelDialog, setShowNewChannelDialog] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const { data: teams = mockTeams, isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTeams;
    },
    enabled: isConnected,
  });

  const { data: chats = mockChats, isLoading: chatsLoading } = useQuery({
    queryKey: ['teams-chats'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockChats;
    },
    enabled: isConnected,
  });

  const toggleTeam = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
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

  // Filter channels
  const filterChannels = (channels: Channel[]) => {
    let filtered = channels;
    if (filterType === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (filterType === 'pinned') {
      filtered = filtered.filter(c => c.isPinned);
    }
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered;
  };

  // Filter chats
  const filterChats = (chats: Chat[]) => {
    let filtered = chats;
    if (filterType === 'unread') {
      filtered = filtered.filter(c => c.unreadCount > 0);
    } else if (filterType === 'pinned') {
      filtered = filtered.filter(c => c.isPinned);
    }
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered;
  };

  const handleChannelClick = (channel: Channel) => {
    navigate(`/microsoft/teams/chat?channel=${channel.id}`);
  };

  const handleChatClick = (chat: Chat) => {
    navigate(`/microsoft/teams/chat?chat=${chat.id}`);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-purple-600" />
              <h2 className="text-2xl font-bold mb-2">Connect to Microsoft Teams</h2>
              <p className="text-gray-600 mb-4">
                Connect your Microsoft 365 account to access your Teams channels and chats.
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
              <div className="h-10 w-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Microsoft Teams</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <span>Connected</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button onClick={() => setShowNewChatDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList className="w-full">
                <TabsTrigger value="teams" className="flex-1">
                  <Hash className="h-4 w-4 mr-2" />
                  Teams
                </TabsTrigger>
                <TabsTrigger value="chats" className="flex-1">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chats
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mt-4 space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={filterType === 'all' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                  className="flex-1"
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'unread' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('unread')}
                  className="flex-1"
                >
                  Unread
                </Button>
                <Button
                  variant={filterType === 'pinned' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setFilterType('pinned')}
                  className="flex-1"
                >
                  <Pin className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {activeTab === 'teams' ? (
              <div className="p-2">
                {teamsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : (
                  teams.map((team) => {
                    const filteredChannels = filterChannels(team.channels);
                    if (filteredChannels.length === 0 && searchQuery) return null;

                    return (
                      <div key={team.id} className="mb-2">
                        <div
                          className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setSelectedTeam(team);
                            toggleTeam(team.id);
                          }}
                        >
                          <div className="flex items-center space-x-2">
                            {expandedTeams.has(team.id) ? (
                              <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-gray-500" />
                            )}
                            <Avatar className="h-6 w-6">
                              {team.avatar ? (
                                <AvatarImage src={team.avatar} />
                              ) : null}
                              <AvatarFallback>{getInitials(team.name)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{team.name}</span>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedTeam(team);
                                setShowNewChannelDialog(true);
                              }}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Channel
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Settings className="h-4 w-4 mr-2" />
                                Team Settings
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {expandedTeams.has(team.id) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {filteredChannels.map((channel) => (
                              <div
                                key={channel.id}
                                className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-gray-100 group"
                                onClick={() => handleChannelClick(channel)}
                              >
                                <div className="flex items-center space-x-2 flex-1 min-w-0">
                                  <Hash className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                  <span className="text-sm truncate">{channel.name}</span>
                                  {channel.isPinned && (
                                    <Pin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                  )}
                                </div>
                                {channel.unreadCount > 0 && (
                                  <Badge variant="default" className="ml-2">
                                    {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            ) : (
              <div className="p-2">
                {chatsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  </div>
                ) : (
                  filterChats(chats).map((chat) => (
                    <div
                      key={chat.id}
                      className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-gray-100 mb-2"
                      onClick={() => handleChatClick(chat)}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {chat.type === 'direct' ? (
                          <div className="relative">
                            <Avatar className="h-10 w-10">
                              {chat.participants[0].avatar ? (
                                <AvatarImage src={chat.participants[0].avatar} />
                              ) : null}
                              <AvatarFallback>
                                {getInitials(chat.participants[0].name)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(
                                chat.participants[0].status
                              )}`}
                            ></div>
                          </div>
                        ) : (
                          <div className="flex -space-x-2">
                            {chat.participants.slice(0, 2).map((participant) => (
                              <Avatar key={participant.id} className="h-10 w-10 border-2 border-white">
                                {participant.avatar ? (
                                  <AvatarImage src={participant.avatar} />
                                ) : null}
                                <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm truncate">
                              {chat.type === 'direct'
                                ? chat.participants[0].name
                                : chat.participants.map(p => p.name.split(' ')[0]).join(', ')}
                            </p>
                            {chat.isPinned && (
                              <Pin className="h-3 w-3 text-gray-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1 ml-2">
                        <span className="text-xs text-gray-500">{formatTime(chat.lastMessageTime)}</span>
                        {chat.unreadCount > 0 && (
                          <Badge variant="default" className="text-xs">
                            {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-white">
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Select a channel or chat to view messages</p>
              <p className="text-sm text-gray-400">
                Your conversations will appear here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="participants">Add People</Label>
              <Input
                id="participants"
                placeholder="Search for people..."
              />
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-3">Suggested Contacts</p>
              <div className="space-y-2">
                {mockParticipants.slice(0, 5).map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <Avatar className="h-8 w-8">
                          {participant.avatar ? (
                            <AvatarImage src={participant.avatar} />
                          ) : null}
                          <AvatarFallback>{getInitials(participant.name)}</AvatarFallback>
                        </Avatar>
                        <div
                          className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white ${getStatusColor(
                            participant.status
                          )}`}
                        ></div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{participant.name}</p>
                        <p className="text-xs text-gray-500">{participant.email}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChatDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Starting new chat');
              setShowNewChatDialog(false);
            }}>
              Start Chat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Channel Dialog */}
      <Dialog open={showNewChannelDialog} onOpenChange={setShowNewChannelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Channel</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="e.g., Marketing Campaign"
              />
            </div>
            <div>
              <Label>Privacy</Label>
              <div className="space-y-2 mt-2">
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="privacy" value="public" defaultChecked />
                  <div>
                    <p className="font-medium text-sm">Standard</p>
                    <p className="text-xs text-gray-500">Anyone in the team can access</p>
                  </div>
                </label>
                <label className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="privacy" value="private" />
                  <div>
                    <p className="font-medium text-sm">Private</p>
                    <p className="text-xs text-gray-500">Only specific people can access</p>
                  </div>
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewChannelDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              console.log('Creating channel:', newChannelName);
              setShowNewChannelDialog(false);
              setNewChannelName('');
            }}>
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Teams;
