import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Pin, Smile, Lightbulb, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { TeamLoungeNote } from "@shared/schema";
import { format } from "date-fns";

export default function TeamLounge() {
  const { toast } = useToast();
  const [newNote, setNewNote] = useState("");

  const { data: notes = [], isLoading } = useQuery<TeamLoungeNote[]>({
    queryKey: ["/api/team-lounge"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { type: string; content: string }) => {
      const res = await apiRequest("POST", "/api/team-lounge", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-lounge"] });
      setNewNote("");
      toast({
        title: "Posted!",
        description: "Your post has been added to the lounge.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create post",
        variant: "destructive",
      });
    },
  });

  const togglePinMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/team-lounge/${id}/pin`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-lounge"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to toggle pin",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/team-lounge/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-lounge"] });
      toast({
        title: "Post deleted",
        description: "The post has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete post",
        variant: "destructive",
      });
    },
  });

  const typeIcons: any = {
    note: MessageSquare,
    joke: Smile,
    suggestion: Lightbulb,
    acknowledgement: Heart,
  };

  const typeColors: any = {
    note: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    joke: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
    suggestion: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    acknowledgement: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
  };

  const handlePost = (type: string) => {
    if (!newNote.trim()) return;
    createMutation.mutate({
      type,
      content: newNote,
    });
  };

  const togglePin = (id: string) => {
    togglePinMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const formatTimestamp = (date: Date | null) => {
    if (!date) return "Unknown";
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  const pinnedNotes = notes.filter(n => n.isPinned);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Team Lounge
        </h1>
        <p className="text-sm text-muted-foreground">
          Share notes, jokes, suggestions, and acknowledgements with your team
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="What's on your mind? Share with the team..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={3}
            data-testid="input-team-note"
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => handlePost("note")}
              disabled={!newNote.trim() || createMutation.isPending}
              data-testid="button-post-note"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Post Note
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePost("joke")}
              disabled={!newNote.trim() || createMutation.isPending}
              data-testid="button-post-joke"
            >
              <Smile className="h-4 w-4 mr-2" />
              Share Joke
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePost("suggestion")}
              disabled={!newNote.trim() || createMutation.isPending}
              data-testid="button-post-suggestion"
            >
              <Lightbulb className="h-4 w-4 mr-2" />
              Make Suggestion
            </Button>
            <Button
              variant="outline"
              onClick={() => handlePost("acknowledgement")}
              disabled={!newNote.trim() || createMutation.isPending}
              data-testid="button-post-acknowledgement"
            >
              <Heart className="h-4 w-4 mr-2" />
              Acknowledge
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="pinned">Pinned ({pinnedNotes.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : notes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to share something with your team
                </p>
              </CardContent>
            </Card>
          ) : (
            notes.map((note) => {
              const Icon = typeIcons[note.type];
              return (
                <Card key={note.id} className="hover-elevate" data-testid={`lounge-note-${note.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{note.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-sm">{note.author}</p>
                          <Badge variant="secondary" className={typeColors[note.type]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {note.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(note.createdAt)}</span>
                          {note.isPinned && (
                            <Badge variant="secondary" className="ml-auto">
                              <Pin className="h-3 w-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mb-3">{note.content}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => togglePin(note.id)}
                            disabled={togglePinMutation.isPending}
                            data-testid={`button-pin-${note.id}`}
                          >
                            <Pin className="h-3 w-3 mr-1" />
                            {note.isPinned ? 'Unpin' : 'Pin'}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => handleDelete(note.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${note.id}`}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="pinned" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i} className="hover-elevate">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
                        <div className="h-4 bg-muted rounded animate-pulse w-full" />
                        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pinnedNotes.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Pin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No pinned posts yet</p>
              </CardContent>
            </Card>
          ) : (
            pinnedNotes.map((note) => {
              const Icon = typeIcons[note.type];
              return (
                <Card key={note.id} className="hover-elevate" data-testid={`lounge-note-${note.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{note.author[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-medium text-sm">{note.author}</p>
                          <Badge variant="secondary" className={typeColors[note.type]}>
                            <Icon className="h-3 w-3 mr-1" />
                            {note.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{formatTimestamp(note.createdAt)}</span>
                        </div>
                        <p className="text-sm mb-3">{note.content}</p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => togglePin(note.id)}
                            disabled={togglePinMutation.isPending}
                            data-testid={`button-pin-${note.id}`}
                          >
                            <Pin className="h-3 w-3 mr-1" />
                            Unpin
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7"
                            onClick={() => handleDelete(note.id)}
                            disabled={deleteMutation.isPending}
                            data-testid={`button-delete-${note.id}`}
                          >
                            <Trash2 className="h-3 w-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
