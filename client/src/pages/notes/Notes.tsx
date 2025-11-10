import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import {
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Star,
  Archive,
  Share2,
  Pin,
  Tag,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  FileText,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
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
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Note {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  isStarred: boolean;
  sharedWith?: string[];
  createdAt: string;
  updatedAt: string;
}

// Mock data
const mockNotes: Note[] = [
  {
    id: "1",
    title: "Meeting Notes - Q4 Planning",
    content: "<h2>Q4 Planning Meeting</h2><p>Discussed key objectives for Q4:</p><ul><li>Increase revenue by 20%</li><li>Launch new product feature</li><li>Expand team by 5 people</li></ul>",
    category: "meetings",
    tags: ["planning", "q4"],
    isPinned: true,
    isArchived: false,
    isStarred: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    title: "Product Ideas",
    content: "<h2>New Feature Ideas</h2><p>Ideas for upcoming features:</p><ol><li>AI-powered analytics</li><li>Mobile app</li><li>Advanced reporting</li></ol>",
    category: "ideas",
    tags: ["product", "features"],
    isPinned: false,
    isArchived: false,
    isStarred: false,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    title: "Customer Feedback",
    content: "<h2>Recent Customer Feedback</h2><p>Summary of feedback from last week:</p><ul><li>Users love the new dashboard</li><li>Request for dark mode</li><li>Need better mobile experience</li></ul>",
    category: "feedback",
    tags: ["customers", "feedback"],
    isPinned: false,
    isArchived: false,
    isStarred: true,
    sharedWith: ["team@company.com"],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    title: "Project Checklist",
    content: "<h2>Launch Checklist</h2><ul><li>Finalize designs ✓</li><li>Complete development</li><li>Test thoroughly</li><li>Deploy to production</li></ul>",
    category: "projects",
    tags: ["checklist", "launch"],
    isPinned: true,
    isArchived: false,
    isStarred: false,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function Notes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [filterBy, setFilterBy] = useState("all");
  const [noteTitle, setNoteTitle] = useState("");

  // Fetch notes
  const {
    data: notes,
    isLoading,
  } = useQuery<Note[]>({
    queryKey: ["/api/notes"],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockNotes;
    },
  });

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: selectedNote?.content || "<p>Start writing your note...</p>",
    onUpdate: ({ editor }) => {
      // Auto-save logic would go here
    },
  });

  // Update editor content when note changes
  React.useEffect(() => {
    if (selectedNote && editor) {
      editor.commands.setContent(selectedNote.content);
      setNoteTitle(selectedNote.title);
    }
  }, [selectedNote, editor]);

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: Math.random().toString(),
        title: "Untitled Note",
        content: "<p>Start writing...</p>",
        tags: [],
        isPinned: false,
        isArchived: false,
        isStarred: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    onSuccess: (newNote) => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setSelectedNote(newNote);
      toast({
        title: "Note created",
        description: "A new note has been created.",
      });
    },
  });

  // Save note mutation
  const saveNoteMutation = useMutation({
    mutationFn: async (data: { id: string; title: string; content: string }) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      toast({
        title: "Note saved",
        description: "Your note has been saved.",
      });
    },
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
      setSelectedNote(null);
      toast({
        title: "Note deleted",
        description: "The note has been deleted.",
      });
    },
  });

  // Toggle pin mutation
  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, isPinned };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  // Toggle star mutation
  const toggleStarMutation = useMutation({
    mutationFn: async ({ id, isStarred }: { id: string; isStarred: boolean }) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { id, isStarred };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notes"] });
    },
  });

  const handleSaveNote = () => {
    if (selectedNote && editor) {
      saveNoteMutation.mutate({
        id: selectedNote.id,
        title: noteTitle,
        content: editor.getHTML(),
      });
    }
  };

  const filteredNotes = notes
    ?.filter((note) => {
      if (filterBy === "pinned") return note.isPinned;
      if (filterBy === "starred") return note.isStarred;
      if (filterBy === "archived") return note.isArchived;
      return !note.isArchived; // By default, don't show archived notes
    })
    .filter((note) => {
      return (
        searchTerm === "" ||
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

  const pinnedNotes = filteredNotes?.filter((n) => n.isPinned);
  const regularNotes = filteredNotes?.filter((n) => !n.isPinned);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">Capture your ideas and thoughts</p>
          </div>
          <Button onClick={() => createNoteMutation.mutate()}>
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Notes List */}
        <div className="w-80 border-r bg-muted/30">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterBy} onValueChange={setFilterBy}>
              <SelectTrigger>
                <SelectValue placeholder="Filter notes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Notes</SelectItem>
                <SelectItem value="pinned">Pinned</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="p-4 space-y-4">
              {/* Pinned Notes */}
              {pinnedNotes && pinnedNotes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Pinned</p>
                  {pinnedNotes.map((note) => (
                    <Card
                      key={note.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedNote?.id === note.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedNote(note)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            <Pin className="h-4 w-4 text-primary" />
                            {note.isStarred && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm mb-1 truncate">{note.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {note.content.replace(/<[^>]*>/g, "")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {note.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.updatedAt), "MMM d, yyyy")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Regular Notes */}
              {regularNotes && regularNotes.length > 0 && (
                <div className="space-y-2">
                  {pinnedNotes && pinnedNotes.length > 0 && (
                    <p className="text-xs font-semibold text-muted-foreground uppercase pt-4">
                      Notes
                    </p>
                  )}
                  {regularNotes.map((note) => (
                    <Card
                      key={note.id}
                      className={`cursor-pointer hover:shadow-md transition-shadow ${
                        selectedNote?.id === note.id ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedNote(note)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {note.isStarred && (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            )}
                          </div>
                        </div>
                        <h4 className="font-semibold text-sm mb-1 truncate">{note.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {note.content.replace(/<[^>]*>/g, "")}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {note.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {format(new Date(note.updatedAt), "MMM d, yyyy")}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {isLoading && (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-32" />
                  ))}
                </div>
              )}

              {!isLoading && filteredNotes && filteredNotes.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No notes found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedNote ? (
            <>
              {/* Note Header */}
              <div className="border-b bg-background p-4">
                <div className="flex items-center justify-between mb-3">
                  <Input
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    className="text-2xl font-bold border-none shadow-none px-0 focus-visible:ring-0"
                    placeholder="Note title..."
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        togglePinMutation.mutate({
                          id: selectedNote.id,
                          isPinned: !selectedNote.isPinned,
                        })
                      }
                    >
                      <Pin className={`h-4 w-4 ${selectedNote.isPinned ? "text-primary" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleStarMutation.mutate({
                          id: selectedNote.id,
                          isStarred: !selectedNote.isStarred,
                        })
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${
                          selectedNote.isStarred ? "fill-yellow-400 text-yellow-400" : ""
                        }`}
                      />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share Note
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteMutation.mutate(selectedNote.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button onClick={handleSaveNote} disabled={saveNoteMutation.isPending}>
                      {saveNoteMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </div>

                {/* Toolbar */}
                {editor && (
                  <div className="flex items-center gap-1 flex-wrap">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBold().run()}
                      className={editor.isActive("bold") ? "bg-muted" : ""}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleItalic().run()}
                      className={editor.isActive("italic") ? "bg-muted" : ""}
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleUnderline().run()}
                      className={editor.isActive("underline") ? "bg-muted" : ""}
                    >
                      <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleBulletList().run()}
                      className={editor.isActive("bulletList") ? "bg-muted" : ""}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().toggleOrderedList().run()}
                      className={editor.isActive("orderedList") ? "bg-muted" : ""}
                    >
                      <ListOrdered className="h-4 w-4" />
                    </Button>
                    <Separator orientation="vertical" className="h-6 mx-2" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign("left").run()}
                      className={editor.isActive({ textAlign: "left" }) ? "bg-muted" : ""}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign("center").run()}
                      className={editor.isActive({ textAlign: "center" }) ? "bg-muted" : ""}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => editor.chain().focus().setTextAlign("right").run()}
                      className={editor.isActive({ textAlign: "right" }) ? "bg-muted" : ""}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Editor Content */}
              <ScrollArea className="flex-1">
                <div className="p-8">
                  <EditorContent editor={editor} className="prose max-w-none" />
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No note selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a note from the sidebar or create a new one
                </p>
                <Button onClick={() => createNoteMutation.mutate()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Note
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ProseMirror {
          min-height: 500px;
          outline: none;
        }
        .ProseMirror p {
          margin: 1em 0;
        }
        .ProseMirror h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5em;
          margin: 1em 0;
        }
        .ProseMirror li {
          margin: 0.5em 0;
        }
      `}</style>
    </div>
  );
}
