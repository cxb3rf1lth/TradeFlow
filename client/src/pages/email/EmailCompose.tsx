import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  Image as ImageIcon,
  Paperclip,
  Send,
  Save,
  Trash2,
  ChevronDown,
  X,
  Calendar,
  Flag,
  Users,
  Sparkles,
  Check,
  Loader2,
  FileText,
  Upload,
  MoreVertical,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
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
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Switch } from "../../components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const emailSchema = z.object({
  to: z.array(z.string().email()).min(1, "At least one recipient is required"),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Email body is required"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
  requestReadReceipt: z.boolean().default(false),
  scheduleSend: z.date().optional(),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface Contact {
  id: string;
  name: string;
  email: string;
}

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
}

// Mock data
const MOCK_CONTACTS: Contact[] = [
  { id: "1", name: "John Smith", email: "john.smith@example.com" },
  { id: "2", name: "Sarah Johnson", email: "sarah.j@client.com" },
  { id: "3", name: "Alex Chen", email: "alex.chen@partner.com" },
  { id: "4", name: "Emily Davis", email: "emily.d@company.com" },
  { id: "5", name: "Michael Brown", email: "michael.b@client.com" },
];

const MOCK_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Sales Follow-up",
    subject: "Following up on our conversation",
    body: "<p>Hi {{firstName}},</p><p>I wanted to follow up on our recent conversation about {{topic}}.</p><p>Best regards</p>",
  },
  {
    id: "2",
    name: "Meeting Request",
    subject: "Meeting Request - {{topic}}",
    body: "<p>Hello {{firstName}},</p><p>I'd like to schedule a meeting to discuss {{topic}}. Please let me know your availability.</p><p>Thanks!</p>",
  },
];

const AI_SUGGESTIONS = [
  { id: "improve", label: "Improve tone", icon: Sparkles },
  { id: "shorter", label: "Make it shorter", icon: Sparkles },
  { id: "professional", label: "Make it more professional", icon: Sparkles },
  { id: "grammar", label: "Fix grammar", icon: Check },
];

export default function EmailCompose() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [toInput, setToInput] = useState("");
  const [ccInput, setCcInput] = useState("");
  const [bccInput, setBccInput] = useState("");
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [bccEmails, setBccEmails] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [subject, setSubject] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [requestReadReceipt, setRequestReadReceipt] = useState(false);
  const [scheduleSend, setScheduleSend] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
      }),
      Image,
      TextStyle,
      Color,
      Highlight,
    ],
    content: "<p>Write your email here...</p>",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[300px] focus:outline-none p-4",
      },
    },
  });

  // Auto-save draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (subject || toEmails.length > 0) {
        handleSaveDraft();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [subject, toEmails]);

  const handleAddEmail = (email: string, type: "to" | "cc" | "bcc") => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    switch (type) {
      case "to":
        if (!toEmails.includes(email)) {
          setToEmails([...toEmails, email]);
          setToInput("");
        }
        break;
      case "cc":
        if (!ccEmails.includes(email)) {
          setCcEmails([...ccEmails, email]);
          setCcInput("");
        }
        break;
      case "bcc":
        if (!bccEmails.includes(email)) {
          setBccEmails([...bccEmails, email]);
          setBccInput("");
        }
        break;
    }
  };

  const handleRemoveEmail = (email: string, type: "to" | "cc" | "bcc") => {
    switch (type) {
      case "to":
        setToEmails(toEmails.filter((e) => e !== email));
        break;
      case "cc":
        setCcEmails(ccEmails.filter((e) => e !== email));
        break;
      case "bcc":
        setBccEmails(bccEmails.filter((e) => e !== email));
        break;
    }
  };

  const handleContactSearch = (value: string, type: "to" | "cc" | "bcc") => {
    if (type === "to") setToInput(value);
    if (type === "cc") setCcInput(value);
    if (type === "bcc") setBccInput(value);

    if (value.length > 0) {
      const filtered = MOCK_CONTACTS.filter(
        (contact) =>
          contact.name.toLowerCase().includes(value.toLowerCase()) ||
          contact.email.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredContacts(filtered);
      setShowContactSuggestions(filtered.length > 0);
    } else {
      setShowContactSuggestions(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments([...attachments, ...files]);
    toast({
      title: "Files attached",
      description: `${files.length} file(s) attached`,
    });
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Draft saved",
        description: "Your email has been saved to drafts",
      });
    }, 1000);
  };

  const handleSendEmail = () => {
    if (toEmails.length === 0) {
      toast({
        title: "No recipients",
        description: "Please add at least one recipient",
        variant: "destructive",
      });
      return;
    }

    if (!subject) {
      toast({
        title: "No subject",
        description: "Please add a subject line",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Email sent",
        description: "Your email has been sent successfully",
      });
      navigate("/email/inbox");
    }, 2000);
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard this email?")) {
      navigate("/email/inbox");
    }
  };

  const handleLoadTemplate = (template: Template) => {
    setSubject(template.subject);
    editor?.commands.setContent(template.body);
    toast({
      title: "Template loaded",
      description: `"${template.name}" template has been loaded`,
    });
  };

  const handleAiAssist = (action: string) => {
    setIsAiProcessing(true);
    const currentContent = editor?.getHTML() || "";

    setTimeout(() => {
      // Simulate AI processing
      let newContent = currentContent;
      switch (action) {
        case "improve":
          newContent = currentContent.replace(
            /Write your email here\.\.\./g,
            "I hope this message finds you well. I wanted to reach out regarding our upcoming collaboration."
          );
          break;
        case "shorter":
          newContent = "<p>Quick update: Let's discuss this at your earliest convenience.</p>";
          break;
        case "professional":
          newContent = currentContent.replace(
            /hi|hey/gi,
            "Dear"
          );
          break;
        case "grammar":
          toast({
            title: "Grammar checked",
            description: "No issues found",
          });
          setIsAiProcessing(false);
          return;
      }

      editor?.commands.setContent(newContent);
      setIsAiProcessing(false);
      toast({
        title: "AI enhancement applied",
        description: "Your email has been improved",
      });
    }, 1500);
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="border-b bg-muted/50 p-2 flex flex-wrap items-center gap-1">
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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive("strike") ? "bg-muted" : ""}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive("heading", { level: 1 }) ? "bg-muted" : ""}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive("heading", { level: 2 }) ? "bg-muted" : ""}
        >
          <Heading2 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

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
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-muted" : ""}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

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

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assist
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>AI Writing Assistant</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {AI_SUGGESTIONS.map((suggestion) => (
                <DropdownMenuItem
                  key={suggestion.id}
                  onClick={() => handleAiAssist(suggestion.id)}
                  disabled={isAiProcessing}
                >
                  <suggestion.icon className="h-4 w-4 mr-2" />
                  {suggestion.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">New Email</h1>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Templates
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[250px]">
                <DropdownMenuLabel>Email Templates</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {MOCK_TEMPLATES.map((template) => (
                  <DropdownMenuItem key={template.id} onClick={() => handleLoadTemplate(template)}>
                    <FileText className="h-4 w-4 mr-2" />
                    {template.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/email/templates")}>
                  <MoreVertical className="h-4 w-4 mr-2" />
                  Manage Templates
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Draft
            </Button>

            <Button variant="outline" size="sm" onClick={handleDiscard}>
              <Trash2 className="h-4 w-4 mr-2" />
              Discard
            </Button>

            <Button onClick={handleSendEmail} disabled={isSending}>
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send
            </Button>
          </div>
        </div>
      </div>

      {/* Email Form */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          {/* Recipients */}
          <Card>
            <CardContent className="p-4 space-y-4">
              {/* To */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="w-16 text-muted-foreground">To</Label>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {toEmails.map((email) => (
                        <Badge key={email} variant="secondary" className="px-2 py-1">
                          {email}
                          <X
                            className="h-3 w-3 ml-1 cursor-pointer"
                            onClick={() => handleRemoveEmail(email, "to")}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="relative">
                      <Input
                        value={toInput}
                        onChange={(e) => handleContactSearch(e.target.value, "to")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddEmail(toInput, "to");
                          }
                        }}
                        placeholder="Add recipients (press Enter or comma to add)"
                      />
                      {showContactSuggestions && (
                        <Card className="absolute top-full mt-1 w-full z-10 shadow-lg">
                          <CardContent className="p-2">
                            {filteredContacts.map((contact) => (
                              <div
                                key={contact.id}
                                className="p-2 hover:bg-muted rounded cursor-pointer"
                                onClick={() => {
                                  handleAddEmail(contact.email, "to");
                                  setShowContactSuggestions(false);
                                }}
                              >
                                <div className="font-medium">{contact.name}</div>
                                <div className="text-sm text-muted-foreground">{contact.email}</div>
                              </div>
                            ))}
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!showCc && (
                      <Button variant="ghost" size="sm" onClick={() => setShowCc(true)}>
                        Cc
                      </Button>
                    )}
                    {!showBcc && (
                      <Button variant="ghost" size="sm" onClick={() => setShowBcc(true)}>
                        Bcc
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Cc */}
              {showCc && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="w-16 text-muted-foreground">Cc</Label>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {ccEmails.map((email) => (
                          <Badge key={email} variant="secondary" className="px-2 py-1">
                            {email}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => handleRemoveEmail(email, "cc")}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        value={ccInput}
                        onChange={(e) => setCcInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddEmail(ccInput, "cc");
                          }
                        }}
                        placeholder="Add Cc recipients"
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowCc(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Bcc */}
              {showBcc && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label className="w-16 text-muted-foreground">Bcc</Label>
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {bccEmails.map((email) => (
                          <Badge key={email} variant="secondary" className="px-2 py-1">
                            {email}
                            <X
                              className="h-3 w-3 ml-1 cursor-pointer"
                              onClick={() => handleRemoveEmail(email, "bcc")}
                            />
                          </Badge>
                        ))}
                      </div>
                      <Input
                        value={bccInput}
                        onChange={(e) => setBccInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            handleAddEmail(bccInput, "bcc");
                          }
                        }}
                        placeholder="Add Bcc recipients"
                      />
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowBcc(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <Separator />

              {/* Subject */}
              <div className="flex items-center gap-2">
                <Label className="w-16 text-muted-foreground">Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                  className="flex-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card>
            <MenuBar />
            <EditorContent editor={editor} className="min-h-[400px]" />
          </Card>

          {/* Attachments */}
          {attachments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-semibold mb-3">
                  Attachments ({attachments.length})
                </h3>
                <div className="space-y-2">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded border bg-muted/50"
                    >
                      <Paperclip className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{file.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Options */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <label className="relative">
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button variant="outline" size="sm" asChild>
                      <span className="cursor-pointer">
                        <Paperclip className="h-4 w-4 mr-2" />
                        Attach Files
                      </span>
                    </Button>
                  </label>

                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger className="w-[140px]">
                      <Flag className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Priority</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={scheduleSend}
                      onCheckedChange={setScheduleSend}
                      id="schedule"
                    />
                    <Label htmlFor="schedule" className="text-sm cursor-pointer">
                      <Calendar className="h-4 w-4 inline mr-1" />
                      Schedule Send
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={requestReadReceipt}
                      onCheckedChange={setRequestReadReceipt}
                      id="receipt"
                    />
                    <Label htmlFor="receipt" className="text-sm cursor-pointer">
                      Request Read Receipt
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
