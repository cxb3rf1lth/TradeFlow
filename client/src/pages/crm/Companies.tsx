import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users } from "lucide-react";
import type { Company } from "@/types/api";

export default function Companies() {
  const { data: companies = [], isLoading } = useQuery<Company[]>({
    queryKey: ["/api/crm/companies"],
  });

  if (isLoading) {
    return <div>Loading companies...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-500 mt-1">
            Manage your business accounts
          </p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies && companies.length > 0 ? (
          companies.map((company: any) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{company.name}</CardTitle>
                {company.industry && (
                  <p className="text-sm text-gray-500">{company.industry}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {company.city && company.country && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {company.city}, {company.country}
                  </div>
                )}
                {company.size && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    {company.size} employees
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No companies yet. Click "Add Company" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
