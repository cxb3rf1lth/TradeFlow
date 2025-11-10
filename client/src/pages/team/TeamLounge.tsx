import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Pin,
  Image as ImageIcon,
  Paperclip,
  Send,
  ThumbsUp,
  Award,
  Lightbulb,
  Filter,
  X,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Card, CardContent } from "../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { Separator } from "../../components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const postSchema = z.object({
  content: z.string().min(1, "Post content is required"),
  type: z.enum(["general", "announcement", "question", "celebration"]).default("general"),
  attachments: z.array(z.string()).default([]),
});

type PostFormData = z.infer<typeof postSchema>;

interface Post {
  id: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
    title: string;
  };
  content: string;
  type: "general" | "announcement" | "question" | "celebration";
  attachments?: { type: "image" | "file"; url: string; name: string }[];
  reactions: {
    like: number;
    love: number;
    celebrate: number;
    insightful: number;
  };
  userReaction?: "like" | "love" | "celebrate" | "insightful";
  commentCount: number;
  isPinned: boolean;
  createdAt: string;
  comments?: Comment[];
}

interface Comment {
  id: string;
  authorId: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

// Mock data
const mockPosts: Post[] = [
  {
    id: "1",
    authorId: "1",
    author: {
      name: "Sarah Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      title: "CEO",
    },
    content: "Exciting news everyone! We've just closed our biggest deal of the quarter with Acme Corp. This is a testament to the incredible work our sales team has been putting in. Let's keep this momentum going! 🎉",
    type: "announcement",
    reactions: { like: 45, love: 23, celebrate: 67, insightful: 12 },
    userReaction: "celebrate",
    commentCount: 12,
    isPinned: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    authorId: "2",
    author: {
      name: "Michael Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
      title: "Sales Manager",
    },
    content: "Quick question for the team: What's everyone's preferred method for following up with leads after the initial contact? I've been experimenting with different approaches and would love to hear what works for you all. #sales #bestpractices",
    type: "question",
    reactions: { like: 12, love: 3, celebrate: 0, insightful: 8 },
    commentCount: 8,
    isPinned: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    comments: [
      {
        id: "c1",
        authorId: "3",
        author: {
          name: "Emily Davis",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
        },
        content: "I usually send a personalized email within 24 hours, then follow up with a call 2 days later if I don't hear back.",
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      },
    ],
  },
  {
    id: "3",
    authorId: "4",
    author: {
      name: "David Rodriguez",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      title: "Product Manager",
    },
    content: "Just wanted to share some exciting news - our new dashboard feature is now live! Check it out and let me know what you think. We've added real-time analytics and some beautiful new charts. 📊",
    type: "general",
    attachments: [
      { type: "image", url: "https://placehold.co/600x400/EEE/31343C", name: "dashboard.png" },
    ],
    reactions: { like: 34, love: 12, celebrate: 18, insightful: 22 },
    commentCount: 15,
    isPinned: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    authorId: "5",
    author: {
      name: "Jessica Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
      title: "HR Manager",
    },
    content: "Congratulations to @MichaelChen for being named Employee of the Month! Your dedication to the team and consistent results are truly inspiring. Keep up the amazing work! 🏆",
    type: "celebration",
    reactions: { like: 56, love: 34, celebrate: 89, insightful: 5 },
    commentCount: 23,
    isPinned: false,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
];

export default function TeamLounge() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});

  // Fetch posts
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery<Post[]>({
    queryKey: ["/api/team/posts", filterType],
    queryFn: async () => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockPosts;
    },
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: async (data: PostFormData) => {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return { id: Math.random().toString(), ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/posts"] });
      setIsCreateDialogOpen(false);
      reset();
      toast({
        title: "Post created",
        description: "Your post has been shared with the team.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    },
  });

  // React to post mutation
  const reactMutation = useMutation({
    mutationFn: async ({
      postId,
      reaction,
    }: {
      postId: string;
      reaction: "like" | "love" | "celebrate" | "insightful";
    }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { postId, reaction };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/posts"] });
    },
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { postId, content };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/team/posts"] });
      setNewComment({});
      toast({
        title: "Comment added",
        description: "Your comment has been posted.",
      });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      content: "",
      type: "general",
      attachments: [],
    },
  });

  const onSubmit = (data: PostFormData) => {
    createMutation.mutate(data);
  };

  const handleReaction = (postId: string, reaction: "like" | "love" | "celebrate" | "insightful") => {
    reactMutation.mutate({ postId, reaction });
  };

  const handleAddComment = (postId: string) => {
    const content = newComment[postId];
    if (content?.trim()) {
      addCommentMutation.mutate({ postId, content });
    }
  };

  const filteredPosts = posts?.filter((post) => {
    const matchesSearch = searchTerm === "" || post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || post.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const pinnedPosts = filteredPosts?.filter((p) => p.isPinned);
  const regularPosts = filteredPosts?.filter((p) => !p.isPinned);

  const ReactionButton = ({
    icon: Icon,
    label,
    count,
    active,
    onClick,
  }: {
    icon: any;
    label: string;
    count: number;
    active?: boolean;
    onClick: () => void;
  }) => (
    <Button
      variant={active ? "default" : "ghost"}
      size="sm"
      className="h-8"
      onClick={onClick}
    >
      <Icon className="h-4 w-4 mr-1" />
      {count > 0 && <span className="text-xs">{count}</span>}
    </Button>
  );

  if (error) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Error loading posts</h3>
            <p className="text-sm text-muted-foreground mb-4">
              There was an error loading the team posts.
            </p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Lounge</h1>
          <p className="text-muted-foreground">Share updates and collaborate with your team</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Post</DialogTitle>
              <DialogDescription>Share something with your team</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Select {...register("type")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Post type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="celebration">Celebration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Textarea
                    {...register("content")}
                    placeholder="What's on your mind?"
                    rows={6}
                    className="resize-none"
                  />
                  {errors.content && (
                    <p className="text-sm text-destructive">{errors.content.message}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm">
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Image
                  </Button>
                  <Button type="button" variant="outline" size="sm">
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach File
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Posting..." : "Post"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter posts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Posts</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="celebration">Celebrations</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Pinned Posts */}
          {pinnedPosts?.map((post) => (
            <Card key={post.id} className="border-2 border-primary">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.author.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {post.author.title}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Pin className="h-3 w-3 mr-1" />
                            Pinned
                          </Badge>
                          {post.type !== "general" && (
                            <Badge className="text-xs capitalize">{post.type}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            Unpin Post
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>

                    {post.attachments && post.attachments.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {post.attachments.map((attachment, idx) => (
                          <img
                            key={idx}
                            src={attachment.url}
                            alt={attachment.name}
                            className="rounded-lg border"
                          />
                        ))}
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <ReactionButton
                          icon={ThumbsUp}
                          label="Like"
                          count={post.reactions.like}
                          active={post.userReaction === "like"}
                          onClick={() => handleReaction(post.id, "like")}
                        />
                        <ReactionButton
                          icon={Heart}
                          label="Love"
                          count={post.reactions.love}
                          active={post.userReaction === "love"}
                          onClick={() => handleReaction(post.id, "love")}
                        />
                        <ReactionButton
                          icon={Award}
                          label="Celebrate"
                          count={post.reactions.celebrate}
                          active={post.userReaction === "celebrate"}
                          onClick={() => handleReaction(post.id, "celebrate")}
                        />
                        <ReactionButton
                          icon={Lightbulb}
                          label="Insightful"
                          count={post.reactions.insightful}
                          active={post.userReaction === "insightful"}
                          onClick={() => handleReaction(post.id, "insightful")}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedPost(expandedPost === post.id ? null : post.id)
                          }
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.commentCount} Comments
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {expandedPost === post.id && (
                      <div className="mt-4 space-y-4">
                        <Separator />
                        {post.comments?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg p-3">
                                <p className="font-semibold text-sm">{comment.author.name}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 ml-3">
                                {format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment[post.id] || ""}
                              onChange={(e) =>
                                setNewComment({ ...newComment, [post.id]: e.target.value })
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                            />
                            <Button
                              size="icon"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Regular Posts */}
          {regularPosts?.map((post) => (
            <Card key={post.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{post.author.name}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {post.author.title}
                          </Badge>
                          {post.type !== "general" && (
                            <Badge className="text-xs capitalize">{post.type}</Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(post.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Post
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm mb-4 whitespace-pre-wrap">{post.content}</p>

                    {post.attachments && post.attachments.length > 0 && (
                      <div className="mb-4 grid grid-cols-2 gap-2">
                        {post.attachments.map((attachment, idx) => (
                          <img
                            key={idx}
                            src={attachment.url}
                            alt={attachment.name}
                            className="rounded-lg border"
                          />
                        ))}
                      </div>
                    )}

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        <ReactionButton
                          icon={ThumbsUp}
                          label="Like"
                          count={post.reactions.like}
                          active={post.userReaction === "like"}
                          onClick={() => handleReaction(post.id, "like")}
                        />
                        <ReactionButton
                          icon={Heart}
                          label="Love"
                          count={post.reactions.love}
                          active={post.userReaction === "love"}
                          onClick={() => handleReaction(post.id, "love")}
                        />
                        <ReactionButton
                          icon={Award}
                          label="Celebrate"
                          count={post.reactions.celebrate}
                          active={post.userReaction === "celebrate"}
                          onClick={() => handleReaction(post.id, "celebrate")}
                        />
                        <ReactionButton
                          icon={Lightbulb}
                          label="Insightful"
                          count={post.reactions.insightful}
                          active={post.userReaction === "insightful"}
                          onClick={() => handleReaction(post.id, "insightful")}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setExpandedPost(expandedPost === post.id ? null : post.id)
                          }
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          {post.commentCount} Comments
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    {expandedPost === post.id && (
                      <div className="mt-4 space-y-4">
                        <Separator />
                        {post.comments?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted rounded-lg p-3">
                                <p className="font-semibold text-sm">{comment.author.name}</p>
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 ml-3">
                                {format(new Date(comment.createdAt), "MMM d 'at' h:mm a")}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>You</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 flex gap-2">
                            <Input
                              placeholder="Add a comment..."
                              value={newComment[post.id] || ""}
                              onChange={(e) =>
                                setNewComment({ ...newComment, [post.id]: e.target.value })
                              }
                              onKeyPress={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAddComment(post.id);
                                }
                              }}
                            />
                            <Button
                              size="icon"
                              onClick={() => handleAddComment(post.id)}
                              disabled={!newComment[post.id]?.trim()}
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
