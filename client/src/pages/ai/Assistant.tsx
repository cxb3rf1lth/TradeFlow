import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authorizedFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

export default function AIAssistant() {
  const [message, setMessage] = useState("");
  const [conversation, setConversation] = useState<Array<{role: string, content: string}>>([]);
  const { user } = useAuth();

  const sendMessage = useMutation({
    mutationFn: async (userMessage: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      const res = await authorizedFetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          message: userMessage,
          userId: user.id,
        }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      setConversation(prev => [
        ...prev,
        { role: "user", content: message },
        { role: "assistant", content: data.response }
      ]);
      setMessage("");
    },
  });

  const handleSend = () => {
    if (!message.trim()) return;
    sendMessage.mutate(message);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
        <p className="text-gray-500 mt-1">
          Powered by Claude AI for intelligent business insights
        </p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bot className="w-5 h-5 mr-2" />
            Claude AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {conversation.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  Ask me anything about your business, contacts, deals, or get intelligent insights!
                </p>
              </div>
            ) : (
              conversation.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                      msg.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {sendMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <span className="text-gray-500">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="flex space-x-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={sendMessage.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
