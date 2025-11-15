import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Phone, Building2 } from "lucide-react";
import { useState } from "react";
import DataExport from "@/components/DataExport";
import type { Contact } from "@/types/api";

export default function Contacts() {
  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/crm/contacts"],
  });

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">
            Manage your customer relationships
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DataExport
            data={contacts || []}
            filename="contacts"
            columns={["firstName", "lastName", "email", "phone", "position", "company"]}
          />
          <Button className="flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add Contact</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts && contacts.length > 0 ? (
          contacts.map((contact: any) => (
            <Card key={contact.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  {contact.firstName} {contact.lastName}
                </CardTitle>
                {contact.position && (
                  <p className="text-sm text-gray-500">{contact.position}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {contact.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    {contact.email}
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {contact.phone}
                  </div>
                )}
                {contact.companyId && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building2 className="w-4 h-4 mr-2" />
                    Company
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No contacts yet. Click "Add Contact" to get started.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
