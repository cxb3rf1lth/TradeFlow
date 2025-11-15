import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trello } from "lucide-react";
import type { Board } from "@/types/api";

export default function Boards() {
  const { data: boards = [], isLoading } = useQuery<Board[]>({
    queryKey: ["/api/boards"],
  });

  if (isLoading) {
    return <div>Loading boards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Project Boards</h1>
          <p className="text-gray-500 mt-1">
            Organize your work with Kanban boards
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Board</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {boards && boards.length > 0 ? (
          boards.map((board: any) => (
            <Card key={board.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{board.name}</CardTitle>
                  <Trello className="w-5 h-5 text-gray-400" />
                </div>
                {board.description && (
                  <p className="text-sm text-gray-500">{board.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  board.visibility === 'public' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {board.visibility}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <Trello className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No boards yet. Click "Create Board" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
