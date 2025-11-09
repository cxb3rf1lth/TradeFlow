import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/lib/use-toast";
import type { TeamLoungeNote } from "@shared/schema";
import { Plus, Pin, Trash2, MessageSquare, Smile, Lightbulb, Award, RefreshCw, Filter } from "lucide-react";

const POST_TYPES = [
  { value: "note", label: "Note", icon: MessageSquare, color: "bg-blue-500" },
  { value: "joke", label: "Joke", icon: Smile, color: "bg-yellow-500" },
  { value: "suggestion", label: "Suggestion", icon: Lightbulb, color: "bg-purple-500" },
  { value: "acknowledgement", label: "Acknowledgement", icon: Award, color: "bg-green-500" },
];

export default function TeamLoungePage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<TeamLoungeNote | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Form state
  const [newPost, setNewPost] = useState({
    type: "note",
    content: "",
  });

  // Fetch posts
  const { data: posts = [], isLoading } = useQuery<TeamLoungeNote[]>({
    queryKey: ["/api/team-lounge"],
    queryFn: () => apiRequest("/api/team-lounge"),
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: (post: { type: string; content: string; author: string }) =>
      apiRequest("/api/team-lounge", {
        method: "POST",
        body: JSON.stringify(post),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-lounge"] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
      setCreateDialogOpen(false);
      setNewPost({ type: "note", content: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: ({ id, isPinned }: { id: string; isPinned: boolean }) =>
      apiRequest(`/api/team-lounge/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isPinned: !isPinned }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-lounge"] });
      toast({
        title: "Success",
        description: "Post pin status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/team-lounge/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team-lounge"] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedPost(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter and sort posts
  const filteredPosts = posts
    .filter((post) => typeFilter === "all" || post.type === typeFilter)
    .sort((a, b) => {
      // Pinned posts first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      // Then by created date (newest first)
      return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
    });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createPostMutation.mutate({ ...newPost, author: user.name });
    }
  };

  const handleTogglePin = (post: TeamLoungeNote) => {
    togglePinMutation.mutate({ id: post.id, isPinned: post.isPinned });
  };

  const openDeleteDialog = (post: TeamLoungeNote) => {
    setSelectedPost(post);
    setDeleteDialogOpen(true);
  };

  const handleDeletePost = () => {
    if (selectedPost) {
      deletePostMutation.mutate(selectedPost.id);
    }
  };

  const getPostTypeInfo = (type: string) => {
    return POST_TYPES.find((t) => t.value === type) || POST_TYPES[0];
  };

  const getPostTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "note":
        return "default";
      case "joke":
        return "secondary";
      case "suggestion":
        return "outline";
      case "acknowledgement":
        return "default";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading team lounge...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Lounge</h1>
          <p className="text-muted-foreground">
            Share notes, jokes, suggestions, and acknowledgements with your team
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team Post</DialogTitle>
              <DialogDescription>Share something with your team</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="post-type">Post Type</Label>
                <Select value={newPost.type} onValueChange={(value) => setNewPost({ ...newPost, type: value })}>
                  <SelectTrigger id="post-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="post-content">Content</Label>
                <Textarea
                  id="post-content"
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Write your post here..."
                  rows={6}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={createPostMutation.isPending}>
                {createPostMutation.isPending ? "Creating..." : "Create Post"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Post Type Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {POST_TYPES.map((type) => {
          const Icon = type.icon;
          const count = posts.filter((p) => p.type === type.value).length;
          return (
            <Card key={type.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{type.label}s</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Label>Filter by type:</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {POST_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              Showing {filteredPosts.length} of {posts.length} posts
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Posts List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground py-8">
                {typeFilter === "all"
                  ? "No posts yet. Be the first to share something with your team!"
                  : `No ${typeFilter}s found. Try changing the filter.`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredPosts.map((post) => {
            const typeInfo = getPostTypeInfo(post.type);
            const Icon = typeInfo.icon;
            return (
              <Card key={post.id} className={post.isPinned ? "border-primary" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${typeInfo.color} bg-opacity-10`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getPostTypeBadgeVariant(post.type)}>
                            {typeInfo.label}
                          </Badge>
                          {post.isPinned && (
                            <Badge variant="outline" className="border-primary">
                              <Pin className="mr-1 h-3 w-3" />
                              Pinned
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posted by <span className="font-medium">{post.author}</span> on{" "}
                          {new Date(post.createdAt!).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTogglePin(post)}
                        disabled={togglePinMutation.isPending}
                      >
                        <Pin className={`h-4 w-4 ${post.isPinned ? "fill-current" : ""}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDeleteDialog(post)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeletePost}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
