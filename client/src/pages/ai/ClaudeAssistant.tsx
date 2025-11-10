import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Settings,
  MessageSquare,
  Download,
  Loader2,
  MoreVertical,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
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
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { Skeleton } from "../../components/ui/skeleton";
import { Slider } from "../../components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const SUGGESTED_PROMPTS = [
  {
    icon: "📊",
    text: "Summarize my deals",
    description: "Get an overview of current deals",
  },
  {
    icon: "✉️",
    text: "Draft an email to John",
    description: "Create a professional email",
  },
  {
    icon: "✅",
    text: "Create a task for project X",
    description: "Add tasks to your projects",
  },
  {
    icon: "⏰",
    text: "Show me overdue tasks",
    description: "View tasks that need attention",
  },
  {
    icon: "📈",
    text: "Analyze my sales pipeline",
    description: "Get insights on your pipeline",
  },
];

// Mock data for demonstration
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    title: "Sales Pipeline Analysis",
    messages: [
      {
        id: "1",
        role: "user",
        content: "Analyze my sales pipeline",
        timestamp: new Date(Date.now() - 3600000),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Based on your current pipeline, I can see you have 15 active deals worth $2.3M. Your conversion rate is 34%, which is above industry average. Here are some key insights:\n\n1. **Strong performers**: Enterprise deals are closing faster than expected\n2. **Areas to focus**: 3 deals in negotiation stage need attention\n3. **Recommendation**: Follow up with contacts who haven't responded in 7+ days",
        timestamp: new Date(Date.now() - 3590000),
      },
    ],
    createdAt: new Date(Date.now() - 86400000),
    updatedAt: new Date(Date.now() - 3600000),
  },
  {
    id: "2",
    title: "Email Draft Assistance",
    messages: [
      {
        id: "3",
        role: "user",
        content: "Draft an email to John Smith about our meeting tomorrow",
        timestamp: new Date(Date.now() - 7200000),
      },
      {
        id: "4",
        role: "assistant",
        content:
          "Here's a professional email draft for John Smith:\n\n**Subject:** Confirmation: Meeting Tomorrow at 2 PM\n\nHi John,\n\nI wanted to confirm our meeting scheduled for tomorrow at 2 PM. We'll be discussing the Q4 project roadmap and reviewing the proposal.\n\nPlease let me know if you need any materials prepared in advance.\n\nLooking forward to our discussion.\n\nBest regards",
        timestamp: new Date(Date.now() - 7190000),
      },
    ],
    createdAt: new Date(Date.now() - 172800000),
    updatedAt: new Date(Date.now() - 7200000),
  },
];

export default function ClaudeAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(
    MOCK_CONVERSATIONS[0].id
  );
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState("claude-3-5-sonnet");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentConversation = conversations.find((c) => c.id === currentConversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentConversation?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [inputMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    // Add user message
    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, userMessage], updatedAt: new Date() }
            : conv
        )
      );
    } else {
      // Create new conversation
      const newConversation: Conversation = {
        id: Date.now().toString(),
        title: inputMessage.slice(0, 50) + (inputMessage.length > 50 ? "..." : ""),
        messages: [userMessage],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setConversations((prev) => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
    }

    setInputMessage("");
    setIsStreaming(true);

    // Simulate streaming response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `I understand you're asking about "${userMessage.content}". Here's a helpful response based on your TradeFlow data.\n\nThis is a simulated response. In production, this would connect to the Claude API and provide context-aware assistance based on your CRM data, tasks, emails, and projects.\n\nWould you like me to help with anything specific related to this?`,
        timestamp: new Date(),
      };

      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? { ...conv, messages: [...conv.messages, assistantMessage], updatedAt: new Date() }
            : conv
        )
      );
      setIsStreaming(false);
    }, 2000);
  };

  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setInputMessage("");
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(conversations[0]?.id || null);
    }
    toast({
      title: "Conversation deleted",
      description: "The conversation has been removed",
    });
  };

  const handleClearChat = () => {
    if (!currentConversationId) return;
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId ? { ...conv, messages: [] } : conv
      )
    );
    toast({
      title: "Chat cleared",
      description: "All messages in this conversation have been removed",
    });
  };

  const handleExportConversation = () => {
    if (!currentConversation) return;

    const exportData = {
      title: currentConversation.title,
      messages: currentConversation.messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${currentConversation.id}.json`;
    a.click();

    toast({
      title: "Conversation exported",
      description: "Your conversation has been downloaded",
    });
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted/20">
      {/* Sidebar - Chat History */}
      <div className="w-80 border-r bg-background/50 backdrop-blur-sm flex flex-col">
        <div className="p-4 border-b">
          <Button onClick={handleNewConversation} className="w-full" size="lg">
            <Plus className="h-4 w-4 mr-2" />
            New Conversation
          </Button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">
              Recent Conversations
            </h3>
            {conversations.map((conv) => (
              <Card
                key={conv.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  currentConversationId === conv.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => setCurrentConversationId(conv.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-primary flex-shrink-0" />
                        <h4 className="text-sm font-medium truncate">{conv.title}</h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {format(conv.updatedAt, "MMM d, h:mm a")}
                      </div>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {conv.messages.length} messages
                      </Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDeleteConversation(conv.id)}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/80 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Claude AI Assistant</h2>
                <p className="text-sm text-muted-foreground">
                  Context-aware help for your business
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>AI Assistant Settings</DialogTitle>
                    <DialogDescription>
                      Configure your AI assistant preferences
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6 py-4">
                    <div className="space-y-2">
                      <Label>Model</Label>
                      <select
                        className="w-full px-3 py-2 rounded-md border bg-background"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                      >
                        <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                        <option value="claude-3-opus">Claude 3 Opus</option>
                        <option value="claude-3-haiku">Claude 3 Haiku</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Temperature</Label>
                        <span className="text-sm text-muted-foreground">{temperature}</span>
                      </div>
                      <Slider
                        value={[temperature]}
                        onValueChange={(value) => setTemperature(value[0])}
                        min={0}
                        max={1}
                        step={0.1}
                        className="w-full"
                      />
                      <p className="text-xs text-muted-foreground">
                        Lower values make responses more focused and deterministic
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setIsSettingsOpen(false)}>Save Changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {currentConversation && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Conversation Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleExportConversation}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Conversation
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleClearChat}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Chat
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full space-y-8">
              <div className="text-center space-y-3">
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold">How can I help you today?</h3>
                <p className="text-muted-foreground max-w-md">
                  I can help you manage deals, draft emails, create tasks, analyze data, and
                  more. Try asking me anything!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 max-w-2xl w-full">
                {SUGGESTED_PROMPTS.map((prompt, index) => (
                  <Card
                    key={index}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
                    onClick={() => handlePromptClick(prompt.text)}
                  >
                    <CardContent className="p-4">
                      <div className="text-2xl mb-2">{prompt.icon}</div>
                      <h4 className="font-medium mb-1">{prompt.text}</h4>
                      <p className="text-xs text-muted-foreground">{prompt.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {currentConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    </div>

                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/10">
                      <span className="text-xs opacity-70">
                        {format(message.timestamp, "h:mm a")}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 ml-auto"
                        onClick={() => handleCopyMessage(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                      You
                    </div>
                  )}
                </div>
              ))}

              {isStreaming && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[70%] rounded-2xl px-4 py-3 bg-muted">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Claude is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t bg-background/80 backdrop-blur-sm p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask me anything about your business..."
                  className="min-h-[60px] max-h-[200px] resize-none pr-12"
                  disabled={isStreaming}
                />
                <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                  {inputMessage.length}/4000
                </div>
              </div>

              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isStreaming}
                size="lg"
                className="h-[60px] px-6"
              >
                {isStreaming ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Claude can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
