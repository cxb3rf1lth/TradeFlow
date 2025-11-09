import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@/hooks/use-user";
import { apiRequest } from "@/lib/api-request";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/lib/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Note } from "@shared/schema";
import { Plus, Edit2, Trash2, Sparkles, FileText, RefreshCw, ListChecks, FileSearch } from "lucide-react";

interface AISummary {
  summary: string;
}

interface AIActionItems {
  actionItems: string[];
}

export default function NotesPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // UI states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [actionItemsDialogOpen, setActionItemsDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // AI results
  const [aiSummary, setAiSummary] = useState<string>("");
  const [aiActionItems, setAiActionItems] = useState<string[]>([]);

  // Form states
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  });

  const [editNote, setEditNote] = useState<Partial<Note>>({});

  // Fetch notes
  const { data: notes = [], isLoading } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    queryFn: () => apiRequest("/api/notes"),
  });

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (note: { title: string; content: string; createdBy: string }) =>
      apiRequest("/api/notes", {
        method: "POST",
        body: JSON.stringify(note),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note created successfully",
      });
      setCreateDialogOpen(false);
      setNewNote({ title: "", content: "" });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, ...data }: Partial<Note> & { id: string }) =>
      apiRequest(`/api/notes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
      setEditDialogOpen(false);
      setSelectedNote(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/notes/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Success",
        description: "Note deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedNote(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI summarization mutation
  const aiSummarizeMutation = useMutation({
    mutationFn: (noteId: string) =>
      apiRequest<AISummary>(`/api/ai/summarize-note/${noteId}`),
    onSuccess: (data) => {
      setAiSummary(data.summary);
      setSummaryDialogOpen(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // AI action items extraction mutation
  const aiActionItemsMutation = useMutation({
    mutationFn: (noteId: string) =>
      apiRequest<AIActionItems>(`/api/ai/extract-action-items/${noteId}`),
    onSuccess: (data) => {
      setAiActionItems(data.actionItems);
      setActionItemsDialogOpen(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter notes by search query
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      createNoteMutation.mutate({ ...newNote, createdBy: user.id });
    }
  };

  const handleEditNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (editNote.id) {
      updateNoteMutation.mutate(editNote as Note);
    }
  };

  const handleDeleteNote = () => {
    if (selectedNote) {
      deleteNoteMutation.mutate(selectedNote.id);
    }
  };

  const openEditDialog = (note: Note) => {
    setSelectedNote(note);
    setEditNote(note);
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (note: Note) => {
    setSelectedNote(note);
    setDeleteDialogOpen(true);
  };

  const handleSummarize = (note: Note) => {
    setSelectedNote(note);
    aiSummarizeMutation.mutate(note.id);
  };

  const handleExtractActionItems = (note: Note) => {
    setSelectedNote(note);
    aiActionItemsMutation.mutate(note.id);
  };

  const createTasksFromActionItems = async () => {
    if (!aiActionItems.length || !user) return;

    try {
      const promises = aiActionItems.map((item) =>
        apiRequest("/api/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: item,
            description: `Auto-generated from note: ${selectedNote?.title}`,
            status: "todo",
            priority: "medium",
            source: "ai_extraction",
            sourceId: selectedNote?.id,
          }),
        })
      );

      await Promise.all(promises);

      toast({
        title: "Success",
        description: `Created ${aiActionItems.length} tasks from action items`,
      });
      setActionItemsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notes</h1>
          <p className="text-muted-foreground">Create and manage your notes with AI assistance</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Note
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Note</DialogTitle>
              <DialogDescription>Add a new note to your collection</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateNote} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note-title">Title</Label>
                <Input
                  id="note-title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  placeholder="Note title"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note-content">Content</Label>
                <Textarea
                  id="note-content"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  placeholder="Write your note here... (Supports markdown formatting)"
                  rows={12}
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Tip: You can use markdown formatting for rich text
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={createNoteMutation.isPending}>
                {createNoteMutation.isPending ? "Creating..." : "Create Note"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search notes by title or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground py-8">
              {searchQuery
                ? "No notes found matching your search."
                : "No notes yet. Create your first note to get started!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card key={note.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{note.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {new Date(note.updatedAt!).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(note)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDeleteDialog(note)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-4 whitespace-pre-wrap">
                  {note.content}
                </p>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleSummarize(note)}
                    disabled={aiSummarizeMutation.isPending}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    AI Summarize
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleExtractActionItems(note)}
                    disabled={aiActionItemsMutation.isPending}
                  >
                    <ListChecks className="mr-2 h-4 w-4" />
                    Extract Action Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>Update your note content</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditNote} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-note-title">Title</Label>
              <Input
                id="edit-note-title"
                value={editNote.title || ""}
                onChange={(e) => setEditNote({ ...editNote, title: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-note-content">Content</Label>
              <Textarea
                id="edit-note-content"
                value={editNote.content || ""}
                onChange={(e) => setEditNote({ ...editNote, content: e.target.value })}
                rows={12}
                className="font-mono text-sm"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={updateNoteMutation.isPending}>
              {updateNoteMutation.isPending ? "Updating..." : "Update Note"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Note</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedNote?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteNote}
              disabled={deleteNoteMutation.isPending}
            >
              {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              AI Summary
            </DialogTitle>
            <DialogDescription>
              AI-generated summary of "{selectedNote?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Alert>
              <AlertDescription className="whitespace-pre-wrap">{aiSummary}</AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button onClick={() => setSummaryDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI Action Items Dialog */}
      <Dialog open={actionItemsDialogOpen} onOpenChange={setActionItemsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-purple-500" />
              AI-Extracted Action Items
            </DialogTitle>
            <DialogDescription>
              Action items found in "{selectedNote?.title}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {aiActionItems.length === 0 ? (
              <Alert>
                <AlertDescription>No action items found in this note.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                {aiActionItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 border rounded-md">
                    <Badge variant="outline" className="mt-1">
                      {index + 1}
                    </Badge>
                    <p className="text-sm flex-1">{item}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setActionItemsDialogOpen(false)}>
              Close
            </Button>
            {aiActionItems.length > 0 && (
              <Button onClick={createTasksFromActionItems}>
                <Plus className="mr-2 h-4 w-4" />
                Create Tasks from Items
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
