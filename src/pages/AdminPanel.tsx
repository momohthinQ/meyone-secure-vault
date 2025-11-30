import { useState } from "react";
import { UserCog, Users, FileText, Shield, Activity, Settings, Search, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface UserEntry {
  id: string;
  name: string;
  email: string;
  role: "user" | "officer" | "admin";
  status: "active" | "inactive";
  documentsCount: number;
  lastActive: string;
}

const mockUsers: UserEntry[] = [
  { id: "1", name: "John Doe", email: "john@email.com", role: "user", status: "active", documentsCount: 12, lastActive: "Today" },
  { id: "2", name: "Jane Smith", email: "jane@email.com", role: "officer", status: "active", documentsCount: 0, lastActive: "Yesterday" },
  { id: "3", name: "Admin User", email: "admin@email.com", role: "admin", status: "active", documentsCount: 5, lastActive: "Today" },
  { id: "4", name: "Bob Wilson", email: "bob@email.com", role: "user", status: "inactive", documentsCount: 3, lastActive: "Last week" },
];

const roleColors = {
  user: "bg-muted text-muted-foreground",
  officer: "bg-secondary/10 text-secondary",
  admin: "bg-primary/10 text-primary",
};

export default function AdminPanel() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserAction = (action: string, userName: string) => {
    toast({
      title: `Action: ${action}`,
      description: `${action} action performed on ${userName}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, officers, and system settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={156}
          icon={Users}
          variant="primary"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Total Documents"
          value={1248}
          icon={FileText}
          variant="secondary"
          trend={{ value: 8, positive: true }}
        />
        <StatsCard
          title="Verified Documents"
          value={892}
          icon={Shield}
          variant="success"
        />
        <StatsCard
          title="Active Officers"
          value={12}
          icon={UserCog}
          variant="default"
        />
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger value="officers">
            <UserCog className="h-4 w-4 mr-2" />
            Officers
          </TabsTrigger>
          <TabsTrigger value="system">
            <Settings className="h-4 w-4 mr-2" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage all registered users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-bold text-white">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{user.name}</h4>
                          <Badge className={roleColors[user.role]}>
                            {user.role}
                          </Badge>
                          <Badge variant={user.status === "active" ? "default" : "secondary"}>
                            {user.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm text-muted-foreground hidden sm:block">
                        <p>{user.documentsCount} documents</p>
                        <p>Last active: {user.lastActive}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction("View", user.name)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction("Edit", user.name)}>
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction("Promote to Officer", user.name)}>
                            Promote to Officer
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleUserAction("Deactivate", user.name)}
                          >
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Officers</CardTitle>
              <CardDescription>
                Manage users with document verification privileges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockUsers
                  .filter((u) => u.role === "officer" || u.role === "admin")
                  .map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-hero flex items-center justify-center text-sm font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge className={roleColors[user.role]}>{user.role}</Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                Configure system-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Document Types</p>
                    <p className="text-sm text-muted-foreground">
                      10 document types configured
                    </p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Storage Usage</p>
                    <p className="text-sm text-muted-foreground">
                      45.2 GB of 100 GB used
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">System Logs</p>
                    <p className="text-sm text-muted-foreground">
                      View system-wide activity logs
                    </p>
                  </div>
                  <Button variant="outline" size="sm">View Logs</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
