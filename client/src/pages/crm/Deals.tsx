import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, DollarSign, Calendar } from "lucide-react";

export default function Deals() {
  const { data: deals, isLoading } = useQuery({
    queryKey: ["/api/crm/deals"],
  });

  if (isLoading) {
    return <div>Loading deals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 mt-1">
            Track your sales pipeline
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Deal</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals && deals.length > 0 ? (
          deals.map((deal: any) => (
            <Card key={deal.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{deal.title}</CardTitle>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                  deal.status === 'open' ? 'bg-green-100 text-green-700' :
                  deal.status === 'won' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {deal.status}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {deal.value && (
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="w-4 h-4 mr-2" />
                    ${parseFloat(deal.value).toLocaleString()} {deal.currency}
                  </div>
                )}
                {deal.expectedCloseDate && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No deals yet. Click "Add Deal" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
