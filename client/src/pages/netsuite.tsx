import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2, RefreshCw, Settings, FileText, Users, DollarSign } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NetSuite() {
  const customers = [
    { id: "1", name: "Acme Corporation", status: "Active", balance: "$45,230" },
    { id: "2", name: "Global Industries", status: "Active", balance: "$32,150" },
    { id: "3", name: "Tech Solutions Ltd", status: "Pending", balance: "$12,500" },
  ];

  const invoices = [
    { id: "INV-001", customer: "Acme Corporation", amount: "$12,500", status: "Paid", date: "Dec 10, 2024" },
    { id: "INV-002", customer: "Global Industries", amount: "$8,750", status: "Pending", date: "Dec 12, 2024" },
    { id: "INV-003", customer: "Tech Solutions Ltd", amount: "$5,200", status: "Overdue", date: "Nov 28, 2024" },
  ];

  const salesOrders = [
    { id: "SO-245", customer: "Acme Corporation", total: "$18,900", status: "Pending Fulfillment" },
    { id: "SO-246", customer: "Global Industries", total: "$6,500", status: "Billed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold mb-1 flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            NetSuite Integration
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage customers, invoices, and sales orders from NetSuite
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-sync-netsuite">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
          <Button variant="outline" data-testid="button-netsuite-settings">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground">+12 this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">$125,450 total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$342,580</div>
            <p className="text-xs text-muted-foreground">+18% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="w-full">
        <TabsList>
          <TabsTrigger value="customers" data-testid="tab-customers">Customers</TabsTrigger>
          <TabsTrigger value="invoices" data-testid="tab-invoices">Invoices</TabsTrigger>
          <TabsTrigger value="orders" data-testid="tab-orders">Sales Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>Synced from NetSuite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                    data-testid={`customer-${customer.id}`}
                  >
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">Balance: {customer.balance}</p>
                    </div>
                    <Badge variant={customer.status === "Active" ? "secondary" : "outline"}>
                      {customer.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>Latest invoices from NetSuite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                    data-testid={`invoice-${invoice.id}`}
                  >
                    <div>
                      <p className="font-medium">{invoice.id}</p>
                      <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{invoice.amount}</p>
                      <Badge variant={
                        invoice.status === "Paid" ? "secondary" :
                        invoice.status === "Overdue" ? "destructive" : "outline"
                      }>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Orders</CardTitle>
              <CardDescription>Recent sales orders from NetSuite</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {salesOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 border rounded-md hover-elevate"
                    data-testid={`order-${order.id}`}
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{order.total}</p>
                      <Badge variant="secondary">{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
