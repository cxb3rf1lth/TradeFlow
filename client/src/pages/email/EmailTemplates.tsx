import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  Eye,
  FileText,
  Tag,
  Calendar,
  TrendingUp,
  Filter,
  Grid3x3,
  List,
  Sparkles,
  X,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
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
import { Skeleton } from "../../components/ui/skeleton";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";

const templateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  category: z.string().min(1, "Category is required"),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  preview: string;
  category: "sales" | "support" | "marketing" | "follow-up";
  usageCount: number;
  lastUsed: Date | null;
  createdAt: Date;
  variables: string[];
}

const CATEGORIES = [
  { id: "all", name: "All Templates", count: 12 },
  { id: "sales", name: "Sales", count: 4 },
  { id: "support", name: "Support", count: 3 },
  { id: "marketing", name: "Marketing", count: 3 },
  { id: "follow-up", name: "Follow-up", count: 2 },
];

const AVAILABLE_VARIABLES = [
  { name: "{{firstName}}", description: "Contact's first name" },
  { name: "{{lastName}}", description: "Contact's last name" },
  { name: "{{company}}", description: "Company name" },
  { name: "{{position}}", description: "Job position" },
  { name: "{{dealValue}}", description: "Deal value" },
  { name: "{{projectName}}", description: "Project name" },
  { name: "{{dueDate}}", description: "Due date" },
  { name: "{{senderName}}", description: "Your name" },
];

// Mock data
const MOCK_TEMPLATES: EmailTemplate[] = [
  {
    id: "1",
    name: "Sales Introduction",
    subject: "Introduction to {{company}}",
    body: `<p>Hi {{firstName}},</p><p>I hope this email finds you well. My name is {{senderName}}, and I wanted to reach out to introduce our services at {{company}}.</p><p>We specialize in helping businesses like yours achieve their goals through innovative solutions.</p><p>Would you be available for a brief call next week to discuss how we can help?</p><p>Best regards,<br>{{senderName}}</p>`,
    preview: "Hi {{firstName}}, I hope this email finds you well...",
    category: "sales",
    usageCount: 45,
    lastUsed: new Date(Date.now() - 86400000),
    createdAt: new Date(Date.now() - 86400000 * 30),
    variables: ["{{firstName}}", "{{company}}", "{{senderName}}"],
  },
  {
    id: "2",
    name: "Follow-up After Meeting",
    subject: "Great meeting you, {{firstName}}!",
    body: `<p>Hi {{firstName}},</p><p>Thank you for taking the time to meet with me today. I really enjoyed our conversation about {{projectName}}.</p><p>As discussed, I'm attaching the proposal we talked about. Please review it at your convenience and let me know if you have any questions.</p><p>Looking forward to working together!</p><p>Best,<br>{{senderName}}</p>`,
    preview: "Thank you for taking the time to meet with me today...",
    category: "follow-up",
    usageCount: 32,
    lastUsed: new Date(Date.now() - 172800000),
    createdAt: new Date(Date.now() - 86400000 * 45),
    variables: ["{{firstName}}", "{{projectName}}", "{{senderName}}"],
  },
  {
    id: "3",
    name: "Project Proposal",
    subject: "Proposal for {{projectName}} - {{company}}",
    body: `<p>Dear {{firstName}},</p><p>I'm pleased to present our proposal for {{projectName}}.</p><p><strong>Project Overview:</strong></p><ul><li>Timeline: 12 weeks</li><li>Investment: {{dealValue}}</li><li>Deliverables: Full implementation and training</li></ul><p>Please review the attached detailed proposal. I'm available to discuss any questions you may have.</p><p>Sincerely,<br>{{senderName}}</p>`,
    preview: "I'm pleased to present our proposal for {{projectName}}...",
    category: "sales",
    usageCount: 28,
    lastUsed: new Date(Date.now() - 259200000),
    createdAt: new Date(Date.now() - 86400000 * 60),
    variables: ["{{firstName}}", "{{projectName}}", "{{company}}", "{{dealValue}}", "{{senderName}}"],
  },
  {
    id: "4",
    name: "Support Ticket Response",
    subject: "Re: Support Ticket - Issue Resolved",
    body: `<p>Hello {{firstName}},</p><p>Thank you for reaching out to our support team.</p><p>I'm happy to inform you that your issue has been resolved. Our technical team has addressed the problem, and everything should be working correctly now.</p><p>If you experience any further issues, please don't hesitate to contact us.</p><p>Best regards,<br>{{senderName}}<br>Support Team</p>`,
    preview: "Thank you for reaching out to our support team...",
    category: "support",
    usageCount: 67,
    lastUsed: new Date(Date.now() - 3600000),
    createdAt: new Date(Date.now() - 86400000 * 90),
    variables: ["{{firstName}}", "{{senderName}}"],
  },
  {
    id: "5",
    name: "Newsletter Introduction",
    subject: "{{company}} Monthly Newsletter",
    body: `<p>Hello {{firstName}},</p><p>Welcome to this month's newsletter from {{company}}!</p><p><strong>This month's highlights:</strong></p><ul><li>New product features</li><li>Customer success stories</li><li>Upcoming events and webinars</li></ul><p>We hope you find this information valuable. As always, feel free to reach out if you have any questions.</p><p>Cheers,<br>The {{company}} Team</p>`,
    preview: "Welcome to this month's newsletter from {{company}}!...",
    category: "marketing",
    usageCount: 156,
    lastUsed: new Date(Date.now() - 604800000),
    createdAt: new Date(Date.now() - 86400000 * 120),
    variables: ["{{firstName}}", "{{company}}"],
  },
  {
    id: "6",
    name: "Payment Reminder",
    subject: "Payment Reminder - Invoice Due {{dueDate}}",
    body: `<p>Dear {{firstName}},</p><p>This is a friendly reminder that payment for invoice #{{dealValue}} is due on {{dueDate}}.</p><p>If you've already made the payment, please disregard this message. Otherwise, you can make the payment through our online portal.</p><p>Thank you for your business!</p><p>Best regards,<br>{{senderName}}<br>Accounts Team</p>`,
    preview: "This is a friendly reminder that payment for invoice...",
    category: "follow-up",
    usageCount: 89,
    lastUsed: new Date(Date.now() - 432000000),
    createdAt: new Date(Date.now() - 86400000 * 75),
    variables: ["{{firstName}}", "{{dealValue}}", "{{dueDate}}", "{{senderName}}"],
  },
];

export default function EmailTemplates() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [templates, setTemplates] = useState<EmailTemplate[]>(MOCK_TEMPLATES);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [previewData, setPreviewData] = useState({
    firstName: "John",
    lastName: "Smith",
    company: "Acme Corp",
    position: "CEO",
    dealValue: "$50,000",
    projectName: "Website Redesign",
    dueDate: "December 31, 2025",
    senderName: "Your Name",
  });

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
      TextStyle,
      Color,
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose prose-sm dark:prose-invert max-w-none min-h-[200px] focus:outline-none p-4 border rounded-md",
      },
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      category: "sales",
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch =
      searchTerm === "" ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.preview.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleCreateTemplate = (data: TemplateFormData) => {
    const newTemplate: EmailTemplate = {
      id: Date.now().toString(),
      name: data.name,
      subject: data.subject,
      body: data.body,
      preview: data.body.replace(/<[^>]*>/g, "").slice(0, 100) + "...",
      category: data.category as any,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date(),
      variables: extractVariables(data.body + " " + data.subject),
    };

    setTemplates([newTemplate, ...templates]);
    setIsCreateDialogOpen(false);
    reset();
    editor?.commands.setContent("");
    toast({
      title: "Template created",
      description: "Your email template has been created successfully",
    });
  };

  const handleEditTemplate = (data: TemplateFormData) => {
    if (!selectedTemplate) return;

    setTemplates(
      templates.map((t) =>
        t.id === selectedTemplate.id
          ? {
              ...t,
              name: data.name,
              subject: data.subject,
              body: data.body,
              preview: data.body.replace(/<[^>]*>/g, "").slice(0, 100) + "...",
              category: data.category as any,
              variables: extractVariables(data.body + " " + data.subject),
            }
          : t
      )
    );

    setIsEditDialogOpen(false);
    setSelectedTemplate(null);
    reset();
    toast({
      title: "Template updated",
      description: "Your email template has been updated successfully",
    });
  };

  const handleDuplicateTemplate = (template: EmailTemplate) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: null,
      createdAt: new Date(),
    };

    setTemplates([newTemplate, ...templates]);
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created",
    });
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      setTemplates(templates.filter((t) => t.id !== id));
      toast({
        title: "Template deleted",
        description: "The template has been removed",
      });
    }
  };

  const handleUseTemplate = (template: EmailTemplate) => {
    navigate("/email/compose");
    toast({
      title: "Template loaded",
      description: "The template has been loaded in the composer",
    });
  };

  const handleEditClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setValue("name", template.name);
    setValue("subject", template.subject);
    setValue("body", template.body);
    setValue("category", template.category);
    editor?.commands.setContent(template.body);
    setIsEditDialogOpen(true);
  };

  const handlePreviewClick = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setIsPreviewDialogOpen(true);
  };

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/\{\{[^}]+\}\}/g);
    return matches ? Array.from(new Set(matches)) : [];
  };

  const insertVariable = (variable: string) => {
    editor?.chain().focus().insertContent(variable).run();
  };

  const renderPreview = (template: EmailTemplate) => {
    let preview = template.subject + " " + template.body;
    Object.entries(previewData).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
      preview = preview.replace(regex, value);
    });
    return preview;
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sales":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "support":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "marketing":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      case "follow-up":
        return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="border-b bg-muted/50 p-2 flex flex-wrap items-center gap-1 mb-2">
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
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Templates</h1>
          <p className="text-muted-foreground">
            Create and manage reusable email templates
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Create Email Template</DialogTitle>
              <DialogDescription>
                Create a reusable email template with variables
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(handleCreateTemplate)}>
              <div className="grid grid-cols-3 gap-6 py-4">
                <div className="col-span-2 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input id="name" {...register("name")} placeholder="Sales Introduction" />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      {...register("subject")}
                      placeholder="Use {{variables}} for dynamic content"
                    />
                    {errors.subject && (
                      <p className="text-sm text-destructive">{errors.subject.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      defaultValue="sales"
                      onValueChange={(value) => setValue("category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">Sales</SelectItem>
                        <SelectItem value="support">Support</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Body *</Label>
                    <MenuBar />
                    <EditorContent
                      editor={editor}
                      {...register("body")}
                      onChange={() => setValue("body", editor?.getHTML() || "")}
                    />
                    {errors.body && (
                      <p className="text-sm text-destructive">{errors.body.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold mb-3">Available Variables</h3>
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-2">
                        {AVAILABLE_VARIABLES.map((variable) => (
                          <Card
                            key={variable.name}
                            className="cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => insertVariable(variable.name)}
                          >
                            <CardContent className="p-3">
                              <div className="font-mono text-xs mb-1 text-primary">
                                {variable.name}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {variable.description}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Template</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {CATEGORIES.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid/List */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{template.name}</CardTitle>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleUseTemplate(template)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Use Template
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePreviewClick(template)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditClick(template)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-semibold mb-1">Subject:</div>
                  <div className="text-sm text-muted-foreground">{template.subject}</div>
                </div>

                <div>
                  <div className="text-sm font-semibold mb-1">Preview:</div>
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {template.preview}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {template.variables.slice(0, 3).map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs font-mono">
                      {variable}
                    </Badge>
                  ))}
                  {template.variables.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{template.variables.length - 3}
                    </Badge>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{template.usageCount} uses</span>
                  </div>
                  {template.lastUsed && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{format(template.lastUsed, "MMM d")}</span>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleUseTemplate(template)}
                >
                  Use Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTemplates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{template.name}</h3>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="text-sm">
                          <span className="font-medium">Subject:</span>{" "}
                          <span className="text-muted-foreground">{template.subject}</span>
                        </div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {template.preview}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{template.usageCount} uses</span>
                        </div>
                        {template.lastUsed && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Last used {format(template.lastUsed, "MMM d, yyyy")}</span>
                          </div>
                        )}
                        <div className="flex gap-1">
                          {template.variables.slice(0, 3).map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs font-mono">
                              {variable}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleUseTemplate(template)}>
                        Use Template
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreviewClick(template)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(template)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Update your email template
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(handleEditTemplate)}>
            <div className="grid grid-cols-3 gap-6 py-4">
              <div className="col-span-2 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Template Name *</Label>
                  <Input id="edit-name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-subject">Subject *</Label>
                  <Input id="edit-subject" {...register("subject")} />
                  {errors.subject && (
                    <p className="text-sm text-destructive">{errors.subject.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Select onValueChange={(value) => setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Support</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Body *</Label>
                  <MenuBar />
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold mb-3">Available Variables</h3>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <Card
                          key={variable.name}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => insertVariable(variable.name)}
                        >
                          <CardContent className="p-3">
                            <div className="font-mono text-xs mb-1 text-primary">
                              {variable.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {variable.description}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setSelectedTemplate(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Update Template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Template Preview</DialogTitle>
            <DialogDescription>
              See how your template looks with sample data
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-4">
              <Tabs defaultValue="preview">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="sample-data">Sample Data</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold">Subject</Label>
                    <div className="p-3 bg-muted rounded-md mt-1">
                      {renderPreview({ ...selectedTemplate, body: "" }).split(" ").slice(0, -1).join(" ")}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold">Body</Label>
                    <div
                      className="p-4 bg-muted rounded-md mt-1 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: renderPreview({ ...selectedTemplate, subject: "" }),
                      }}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="sample-data">
                  <div className="space-y-3">
                    {Object.entries(previewData).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="text-xs">{key}</Label>
                        <Input
                          value={value}
                          onChange={(e) =>
                            setPreviewData({ ...previewData, [key]: e.target.value })
                          }
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setIsPreviewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
