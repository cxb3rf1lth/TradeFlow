import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Switch } from "../../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Key,
  Link2,
  Shield,
  Moon,
  Sun,
  Zap,
  CheckCircle2,
  XCircle,
  Copy,
  Trash2,
  Plus,
} from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Mock query for settings data
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => ({
      account: {
        email: "john.doe@company.com",
        company: "TechCorp Inc.",
        timezone: "UTC-5 (Eastern Time)",
        language: "English (US)",
      },
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        desktopNotifications: false,
        taskReminders: true,
        dealUpdates: true,
        weeklyReports: true,
        monthlyReports: false,
      },
      integrations: [
        { id: "1", name: "HubSpot", status: "connected", lastSync: "2 mins ago" },
        { id: "2", name: "Trello", status: "connected", lastSync: "5 mins ago" },
        { id: "3", name: "OneDrive", status: "disconnected", lastSync: null },
        { id: "4", name: "Teams", status: "connected", lastSync: "Just now" },
        { id: "5", name: "Slack", status: "disconnected", lastSync: null },
        { id: "6", name: "Google Calendar", status: "disconnected", lastSync: null },
      ],
      apiKeys: [
        {
          id: "1",
          name: "Production API Key",
          key: "sk_live_••••••••••••1234",
          created: "2025-01-15",
          lastUsed: "2 hours ago",
        },
        {
          id: "2",
          name: "Development API Key",
          key: "sk_test_••••••••••••5678",
          created: "2025-02-01",
          lastUsed: "Never",
        },
      ],
    }),
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleNotificationToggle = (key: string, value: boolean) => {
    updateSettingsMutation.mutate({
      notifications: { [key]: value },
    });
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, this would update the theme
    toast({
      title: "Theme updated",
      description: `Switched to ${!isDarkMode ? "dark" : "light"} mode`,
    });
  };

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast({
      title: "Copied to clipboard",
      description: "API key has been copied to your clipboard.",
    });
  };

  const handleDisconnectIntegration = (name: string) => {
    toast({
      title: "Integration disconnected",
      description: `${name} has been disconnected from your account.`,
    });
  };

  const handleConnectIntegration = (name: string) => {
    toast({
      title: "Connecting...",
      description: `Redirecting to ${name} authorization page.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
            <TabsTrigger value="account" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Account</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="theme" className="gap-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="gap-2">
              <Link2 className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="gap-2">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">API Keys</span>
            </TabsTrigger>
          </TabsList>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={settings?.account.email} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input value={settings?.account.company} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Input value={settings?.account.timezone} disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Input value={settings?.account.language} disabled />
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Profile Settings</h4>
                    <p className="text-sm text-muted-foreground">
                      Update your profile information and preferences
                    </p>
                  </div>
                  <Button variant="outline">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security</CardTitle>
                <CardDescription>Manage your security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Password</h4>
                    <p className="text-sm text-muted-foreground">
                      Last changed 30 days ago
                    </p>
                  </div>
                  <Button variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={settings?.notifications.emailNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle("emailNotifications", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your devices
                      </p>
                    </div>
                    <Switch
                      checked={settings?.notifications.pushNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle("pushNotifications", checked)
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show desktop notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings?.notifications.desktopNotifications}
                      onCheckedChange={(checked) =>
                        handleNotificationToggle("desktopNotifications", checked)
                      }
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h4 className="font-medium">Activity Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Task Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Get reminders for upcoming tasks
                        </p>
                      </div>
                      <Switch
                        checked={settings?.notifications.taskReminders}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("taskReminders", checked)
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Deal Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Notify when deals progress
                        </p>
                      </div>
                      <Switch
                        checked={settings?.notifications.dealUpdates}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("dealUpdates", checked)
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly summary reports
                        </p>
                      </div>
                      <Switch
                        checked={settings?.notifications.weeklyReports}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("weeklyReports", checked)
                        }
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Monthly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive monthly analytics reports
                        </p>
                      </div>
                      <Switch
                        checked={settings?.notifications.monthlyReports}
                        onCheckedChange={(checked) =>
                          handleNotificationToggle("monthlyReports", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Theme Settings */}
          <TabsContent value="theme" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the look and feel of your workspace
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Toggle between light and dark themes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    <Switch checked={isDarkMode} onCheckedChange={handleThemeToggle} />
                    <Moon className="h-4 w-4 text-blue-500" />
                  </div>
                </div>
                <Separator />
                <div>
                  <Label>Theme Presets</Label>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <button className="p-4 border-2 border-blue-600 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 transition-opacity">
                      <div className="text-sm font-medium">Ocean Blue</div>
                    </button>
                    <button className="p-4 border rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white hover:opacity-90 transition-opacity">
                      <div className="text-sm font-medium">Sunset</div>
                    </button>
                    <button className="p-4 border rounded-lg bg-gradient-to-br from-green-500 to-teal-600 text-white hover:opacity-90 transition-opacity">
                      <div className="text-sm font-medium">Forest</div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations */}
          <TabsContent value="integrations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Connected Integrations</CardTitle>
                <CardDescription>
                  Manage your connected services and apps
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings?.integrations.map((integration) => (
                    <div
                      key={integration.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">{integration.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {integration.status === "connected"
                              ? `Last sync: ${integration.lastSync}`
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {integration.status === "connected" ? (
                          <>
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Connected
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDisconnectIntegration(integration.name)}
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <>
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="h-3 w-3" />
                              Disconnected
                            </Badge>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleConnectIntegration(integration.name)}
                            >
                              Connect
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Keys */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage API keys for accessing TradeFlow programmatically
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button className="w-full md:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New API Key
                  </Button>
                  <Separator />
                  <div className="space-y-4">
                    {settings?.apiKeys.map((apiKey) => (
                      <div
                        key={apiKey.id}
                        className="p-4 border rounded-lg space-y-3"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{apiKey.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              Created: {apiKey.created}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Last used: {apiKey.lastUsed}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input value={apiKey.key} readOnly className="font-mono" />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyApiKey(apiKey.key)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
