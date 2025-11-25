import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, FileText, Zap, Plus } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../components/ui/use-toast";
import { authorizedFetch } from "@/lib/api-client";
import { useAuth } from "@/contexts/auth-context";

export default function Email() {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { user } = useAuth();

  const { data: emailLogs } = useQuery({
    queryKey: ["/api/email/logs"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/email/logs");
      return res.json();
    }
  });

  const { data: templates } = useQuery({
    queryKey: ["/api/email/templates"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/email/templates");
      return res.json();
    }
  });

  const sendEmailMutation = useMutation({
    mutationFn: async (email: any) => {
      const res = await authorizedFetch("/api/email/send", {
        method: "POST",
        body: JSON.stringify(email),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email/logs"] });
      toast({ title: "Email sent successfully!" });
      setTo("");
      setSubject("");
      setBody("");
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to send email", variant: "destructive" });
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Email Center</h1>
          <p className="text-zinc-400">Send emails and manage automation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
              <Send className="w-4 h-4 mr-2" />
              Send Email
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">Compose Email</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="To"
                value={to}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTo(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Input
                placeholder="Subject"
                value={subject}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Textarea
                placeholder="Email body"
                value={body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[200px]"
              />
              <Button
                onClick={() => sendEmailMutation.mutate({ to, subject, body, sentBy: user?.id ?? "user" })}
                disabled={!to || !subject || !body || sendEmailMutation.isPending}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                <Send className="w-4 h-4 mr-2" />
                {sendEmailMutation.isPending ? "Sending..." : "Send Email"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Emails Sent" value={emailLogs?.length || 0} icon={Send} />
        <StatsCard title="Templates" value={templates?.length || 0} icon={FileText} />
        <StatsCard title="Automations" value="3" icon={Zap} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-yellow-500" />
            Recent Emails
          </h2>
          {emailLogs && emailLogs.length > 0 ? (
            <div className="space-y-3">
              {emailLogs.slice(0, 5).map((log: any) => (
                <div key={log.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium text-sm">{log.subject}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      log.status === "sent"
                        ? "bg-green-600/10 text-green-500"
                        : "bg-red-600/10 text-red-500"
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs">To: {log.to}</p>
                  <p className="text-zinc-500 text-xs mt-1">
                    {new Date(log.sentAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">No emails sent yet</p>
          )}
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-yellow-500" />
              Email Templates
            </h2>
            <Button variant="ghost" size="sm" className="text-yellow-500">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {templates && templates.length > 0 ? (
            <div className="space-y-3">
              {templates.map((template: any) => (
                <div key={template.id} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 hover:border-yellow-500/50 transition-all cursor-pointer">
                  <h3 className="text-white font-medium text-sm mb-1">{template.name}</h3>
                  <p className="text-zinc-400 text-xs">{template.subject}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 text-sm">No templates yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded-lg bg-yellow-600/10 border border-yellow-600/20">
          <Icon className="w-6 h-6 text-yellow-500" />
        </div>
      </div>
      <h3 className="text-zinc-400 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
