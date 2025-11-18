import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, MoreHorizontal, Trash2, Edit } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authorizedFetch } from "@/lib/api-client";

export default function Boards() {
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDesc, setNewBoardDesc] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: boards, isLoading } = useQuery({
    queryKey: ["/api/boards"],
    queryFn: async () => {
      const res = await authorizedFetch("/api/boards");
      return res.json();
    }
  });

  const createBoardMutation = useMutation({
    mutationFn: async (board: any) => {
      const res = await authorizedFetch("/api/boards", {
        method: "POST",
        body: JSON.stringify(board),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({ title: "Board created successfully" });
      setNewBoardName("");
      setNewBoardDesc("");
      setIsDialogOpen(false);
    },
  });

  const deleteBoardMutation = useMutation({
    mutationFn: async (id: string) => {
      await authorizedFetch(`/api/boards/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/boards"] });
      toast({ title: "Board deleted successfully" });
    },
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Project Boards</h1>
          <p className="text-zinc-400">Manage your projects with Trello-like boards</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-yellow-600 hover:bg-yellow-700 text-black">
              <Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-white">Create New Board</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Board name"
                value={newBoardName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBoardName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Textarea
                placeholder="Board description (optional)"
                value={newBoardDesc}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewBoardDesc(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <Button
                onClick={() => createBoardMutation.mutate({ name: newBoardName, description: newBoardDesc })}
                disabled={!newBoardName}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                Create Board
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 animate-pulse">
              <div className="h-6 bg-zinc-800 rounded mb-4"></div>
              <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : boards && boards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board: any) => (
            <div
              key={board.id}
              className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                  {board.name}
                </h3>
                <button
                  onClick={() => deleteBoardMutation.mutate(board.id)}
                  className="text-zinc-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {board.description && (
                <p className="text-zinc-400 text-sm mb-4">{board.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-zinc-500">
                <span>Created {new Date(board.createdAt).toLocaleDateString()}</span>
                <a href={`/boards/${board.id}`} className="text-yellow-500 hover:text-yellow-400">
                  Open →
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-yellow-600/10 border border-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-yellow-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No boards yet</h3>
            <p className="text-zinc-400 mb-4">
              Create your first project board to start organizing your tasks
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Board
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
