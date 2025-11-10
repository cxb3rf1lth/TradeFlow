import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Users,
  Video,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  RefreshCw,
  Grid3x3,
  List as ListIcon,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { ScrollArea } from '../../components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';

// Types
interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  description?: string;
  category: 'work' | 'personal' | 'meeting' | 'holiday';
  isAllDay: boolean;
  isRecurring: boolean;
  status?: 'accepted' | 'tentative' | 'declined';
  isOnline?: boolean;
}

// Mock Data
const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    date: new Date('2024-11-10T10:00:00'),
    startTime: '10:00',
    endTime: '10:30',
    location: 'Conference Room A',
    attendees: ['john@company.com', 'sarah@company.com', 'mike@company.com'],
    description: 'Daily team standup meeting',
    category: 'meeting',
    isAllDay: false,
    isRecurring: true,
    status: 'accepted',
    isOnline: false,
  },
  {
    id: '2',
    title: 'Client Presentation',
    date: new Date('2024-11-11T14:00:00'),
    startTime: '14:00',
    endTime: '15:30',
    location: 'Microsoft Teams',
    attendees: ['client@external.com', 'you@company.com'],
    description: 'Q4 results presentation for the client',
    category: 'meeting',
    isAllDay: false,
    isRecurring: false,
    status: 'accepted',
    isOnline: true,
  },
  {
    id: '3',
    title: 'Lunch with Sarah',
    date: new Date('2024-11-12T12:30:00'),
    startTime: '12:30',
    endTime: '13:30',
    location: 'Downtown Café',
    description: 'Catch up lunch',
    category: 'personal',
    isAllDay: false,
    isRecurring: false,
    status: 'accepted',
    isOnline: false,
  },
  {
    id: '4',
    title: 'Project Planning',
    date: new Date('2024-11-13T09:00:00'),
    startTime: '09:00',
    endTime: '11:00',
    location: 'Office',
    attendees: ['team@company.com'],
    description: 'Planning session for Q1 2025 projects',
    category: 'work',
    isAllDay: false,
    isRecurring: false,
    status: 'tentative',
    isOnline: false,
  },
  {
    id: '5',
    title: 'Company Holiday',
    date: new Date('2024-11-28T00:00:00'),
    startTime: '',
    endTime: '',
    description: 'Thanksgiving',
    category: 'holiday',
    isAllDay: true,
    isRecurring: false,
    isOnline: false,
  },
  {
    id: '6',
    title: 'Weekly Review',
    date: new Date('2024-11-15T16:00:00'),
    startTime: '16:00',
    endTime: '17:00',
    location: 'Zoom',
    attendees: ['manager@company.com'],
    description: 'Weekly one-on-one with manager',
    category: 'meeting',
    isAllDay: false,
    isRecurring: true,
    status: 'accepted',
    isOnline: true,
  },
];

const OutlookCalendar: React.FC = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('');
  const [eventEndTime, setEventEndTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventAttendees, setEventAttendees] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventCategory, setEventCategory] = useState<'work' | 'personal' | 'meeting' | 'holiday'>('meeting');
  const [eventIsAllDay, setEventIsAllDay] = useState(false);

  const { data: events = mockEvents, isLoading } = useQuery({
    queryKey: ['outlook-calendar-events', currentDate],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockEvents;
    },
    enabled: isConnected,
  });

  // Calendar helpers
  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Date[] = [];

    // Add previous month's days
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push(day);
    }

    // Add current month's days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-500',
      personal: 'bg-green-500',
      meeting: 'bg-purple-500',
      holiday: 'bg-red-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-green-100 text-green-800',
      meeting: 'bg-purple-100 text-purple-800',
      holiday: 'bg-red-100 text-red-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (time: string): string => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleCreateEvent = () => {
    console.log('Creating event:', {
      title: eventTitle,
      date: eventDate,
      startTime: eventStartTime,
      endTime: eventEndTime,
      location: eventLocation,
      attendees: eventAttendees,
      description: eventDescription,
      category: eventCategory,
      isAllDay: eventIsAllDay,
    });
    setShowEventDialog(false);
    resetForm();
  };

  const resetForm = () => {
    setEventTitle('');
    setEventDate('');
    setEventStartTime('');
    setEventEndTime('');
    setEventLocation('');
    setEventAttendees('');
    setEventDescription('');
    setEventCategory('meeting');
    setEventIsAllDay(false);
  };

  const calendarDays = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentDate.getMonth();

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Connect to Outlook Calendar</h2>
              <p className="text-gray-600 mb-4">
                Connect your Microsoft 365 account to access your calendar.
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
                <CalendarIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <div className={`h-2 w-2 rounded-full ${isSyncing ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span>{isSyncing ? 'Syncing...' : 'Synced with Outlook'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search events..."
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
              <Button onClick={() => setShowEventDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Calendar Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold min-w-[200px] text-center">
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h2>
                <Button variant="outline" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToToday}>
                  Today
                </Button>
              </div>
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList>
                  <TabsTrigger value="day">
                    <ListIcon className="h-4 w-4 mr-2" />
                    Day
                  </TabsTrigger>
                  <TabsTrigger value="week">
                    <Grid3x3 className="h-4 w-4 mr-2" />
                    Week
                  </TabsTrigger>
                  <TabsTrigger value="month">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Month
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        {viewMode === 'month' && (
          <Card>
            <CardContent className="p-6">
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const dayEvents = getEventsForDate(day);
                  const isTodayDate = isToday(day);
                  const isCurrentMonthDate = isCurrentMonth(day);

                  return (
                    <div
                      key={index}
                      className={`min-h-[120px] border rounded-lg p-2 ${
                        isTodayDate
                          ? 'bg-blue-50 border-blue-500 border-2'
                          : isCurrentMonthDate
                          ? 'bg-white border-gray-200'
                          : 'bg-gray-50 border-gray-100'
                      } cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${
                            isTodayDate
                              ? 'text-blue-700 font-bold'
                              : isCurrentMonthDate
                              ? 'text-gray-900'
                              : 'text-gray-400'
                          }`}
                        >
                          {day.getDate()}
                        </span>
                        {dayEvents.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {dayEvents.length}
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded truncate ${getCategoryColor(event.category)} text-white`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(event);
                            }}
                          >
                            {event.isAllDay ? (
                              <span>{event.title}</span>
                            ) : (
                              <span>
                                {formatTime(event.startTime)} {event.title}
                              </span>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 pl-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Day/Week View - List of events */}
        {(viewMode === 'day' || viewMode === 'week') && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    </div>
                  ) : (
                    <ScrollArea className="h-[600px]">
                      <div className="space-y-4">
                        {getEventsForDate(selectedDate).length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>No events scheduled for this day</p>
                          </div>
                        ) : (
                          getEventsForDate(selectedDate).map((event) => (
                            <Card key={event.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      <div className={`h-3 w-3 rounded-full ${getCategoryColor(event.category)}`}></div>
                                      <h3 className="font-semibold text-lg">{event.title}</h3>
                                      {event.isRecurring && (
                                        <Badge variant="outline" className="text-xs">
                                          Recurring
                                        </Badge>
                                      )}
                                      {event.status && (
                                        <Badge
                                          variant={
                                            event.status === 'accepted'
                                              ? 'default'
                                              : event.status === 'tentative'
                                              ? 'secondary'
                                              : 'destructive'
                                          }
                                          className="text-xs"
                                        >
                                          {event.status}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-600">
                                      {!event.isAllDay && (
                                        <div className="flex items-center space-x-2">
                                          <Clock className="h-4 w-4" />
                                          <span>
                                            {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                          </span>
                                        </div>
                                      )}
                                      {event.location && (
                                        <div className="flex items-center space-x-2">
                                          {event.isOnline ? (
                                            <>
                                              <Video className="h-4 w-4" />
                                              <span>{event.location}</span>
                                              <Badge variant="outline" className="text-xs">
                                                Online
                                              </Badge>
                                            </>
                                          ) : (
                                            <>
                                              <MapPin className="h-4 w-4" />
                                              <span>{event.location}</span>
                                            </>
                                          )}
                                        </div>
                                      )}
                                      {event.attendees && event.attendees.length > 0 && (
                                        <div className="flex items-center space-x-2">
                                          <Users className="h-4 w-4" />
                                          <span>{event.attendees.length} attendees</span>
                                        </div>
                                      )}
                                      {event.description && (
                                        <p className="mt-2 text-gray-600">{event.description}</p>
                                      )}
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Copy className="h-4 w-4 mr-2" />
                                        Duplicate
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem className="text-red-600">
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Mini Calendar and Legend */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Event Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['work', 'personal', 'meeting', 'holiday'].map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${getCategoryColor(category)}`}></div>
                      <span className="text-sm capitalize">{category}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {events
                        .filter(e => new Date(e.date) > new Date())
                        .slice(0, 10)
                        .map((event) => (
                          <div key={event.id} className="border-l-4 pl-3 py-2" style={{ borderColor: getCategoryColor(event.category).replace('bg-', '#').replace('500', '') }}>
                            <p className="font-medium text-sm">{event.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              {!event.isAllDay && ` • ${formatTime(event.startTime)}`}
                            </p>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Create Event Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Event Title *</Label>
              <Input
                id="title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Enter event title"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={eventCategory} onValueChange={(v: any) => setEventCategory(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work">Work</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {!eventIsAllDay && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={eventIsAllDay}
                  onChange={(e) => setEventIsAllDay(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">All day event</span>
              </label>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Enter location or meeting link"
              />
            </div>
            <div>
              <Label htmlFor="attendees">Attendees</Label>
              <Input
                id="attendees"
                value={eventAttendees}
                onChange={(e) => setEventAttendees(e.target.value)}
                placeholder="Enter email addresses, separated by commas"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Add event description..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEventDialog(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div>
                  <DialogTitle className="text-2xl mb-2">{selectedEvent.title}</DialogTitle>
                  <Badge className={getCategoryBadgeColor(selectedEvent.category)}>
                    {selectedEvent.category}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {!selectedEvent.isAllDay && (
                <div className="flex items-center space-x-2 text-gray-700">
                  <Clock className="h-5 w-5" />
                  <span>
                    {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                    {' • '}
                    {formatTime(selectedEvent.startTime)} - {formatTime(selectedEvent.endTime)}
                  </span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="flex items-center space-x-2 text-gray-700">
                  {selectedEvent.isOnline ? (
                    <>
                      <Video className="h-5 w-5" />
                      <span>{selectedEvent.location}</span>
                      <Badge variant="outline">Online Meeting</Badge>
                    </>
                  ) : (
                    <>
                      <MapPin className="h-5 w-5" />
                      <span>{selectedEvent.location}</span>
                    </>
                  )}
                </div>
              )}
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 text-gray-700 mb-2">
                    <Users className="h-5 w-5" />
                    <span className="font-medium">{selectedEvent.attendees.length} Attendees</span>
                  </div>
                  <div className="ml-7 space-y-2">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {attendee.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{attendee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedEvent.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-700">{selectedEvent.description}</p>
                </div>
              )}
              {selectedEvent.isRecurring && (
                <Badge variant="outline">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Recurring Event
                </Badge>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                Close
              </Button>
              {selectedEvent.isOnline && (
                <Button>
                  <Video className="h-4 w-4 mr-2" />
                  Join Meeting
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OutlookCalendar;
