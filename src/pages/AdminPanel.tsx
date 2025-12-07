import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserCog, Users, FileText, Shield, Settings, Search, MoreVertical, AlertTriangle, Building2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

interface UserEntry {
  id: string;
  name: string;
  email: string;
  role: "user" | "officer" | "admin" | "institution";
  status: "active" | "inactive";
  documentsCount: number;
  lastActive: string;
}

interface Institution {
  id: string;
  user_id: string;
  name: string;
  institution_type: string;
  registration_number: string | null;
  contact_email: string;
  contact_phone: string | null;
  status: string;
  created_at: string;
  description: string | null;
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
  institution: "bg-blue-500/10 text-blue-600",
};

const institutionTypeLabels: Record<string, string> = {
  university: "University",
  mda: "MDA",
  ngo: "NGO",
  private_company: "Private Company",
  other: "Other",
};

export default function AdminPanel() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, isLoading } = useUserRole();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<UserEntry[]>(mockUsers);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [institutionsLoading, setInstitutionsLoading] = useState(true);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && isAdmin) {
      fetchInstitutions();
    }
  }, [isAdmin, isLoading]);

  const fetchInstitutions = async () => {
    setInstitutionsLoading(true);
    try {
      const { data, error } = await supabase
        .from("institutions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInstitutions(data || []);
    } catch (error) {
      console.error("Error fetching institutions:", error);
    } finally {
      setInstitutionsLoading(false);
    }
  };

  // Redirect non-admin users
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAdmin, isLoading, navigate, toast]);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleViewDetails = (user: UserEntry) => {
    toast({
      title: "User Details",
      description: `Viewing details for ${user.name} (${user.email})`,
    });
  };

  const handleEditUser = (user: UserEntry) => {
    toast({
      title: "Edit User",
      description: `Opening editor for ${user.name}`,
    });
  };

  const handlePromoteToOfficer = (user: UserEntry) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, role: "officer" as const } : u));
    toast({
      title: "User Promoted",
      description: `${user.name} has been promoted to Verification Officer`,
    });
  };

  const handleDemoteToUser = (user: UserEntry) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, role: "user" as const } : u));
    toast({
      title: "User Demoted",
      description: `${user.name} has been demoted to regular user`,
    });
  };

  const handleDeactivate = (user: UserEntry) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, status: "inactive" as const } : u));
    toast({
      title: "User Deactivated",
      description: `${user.name}'s account has been deactivated`,
      variant: "destructive",
    });
  };

  const handleActivate = (user: UserEntry) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, status: "active" as const } : u));
    toast({
      title: "User Activated",
      description: `${user.name}'s account has been activated`,
    });
  };

  const handleApproveInstitution = async (institution: Institution) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("institutions")
        .update({
          status: "approved",
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", institution.id);

      if (error) throw error;

      toast({
        title: "Institution Approved",
        description: `${institution.name} has been approved and can now access their dashboard`,
      });

      fetchInstitutions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve institution",
        variant: "destructive",
      });
    }
  };

  const handleRejectInstitution = async () => {
    if (!selectedInstitution) return;

    try {
      const { error } = await supabase
        .from("institutions")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason,
        })
        .eq("id", selectedInstitution.id);

      if (error) throw error;

      toast({
        title: "Institution Rejected",
        description: `${selectedInstitution.name} has been rejected`,
        variant: "destructive",
      });

      setIsRejectDialogOpen(false);
      setSelectedInstitution(null);
      setRejectionReason("");
      fetchInstitutions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject institution",
        variant: "destructive",
      });
    }
  };

  const handleSuspendInstitution = async (institution: Institution) => {
    try {
      const { error } = await supabase
        .from("institutions")
        .update({ status: "suspended" })
        .eq("id", institution.id);

      if (error) throw error;

      toast({
        title: "Institution Suspended",
        description: `${institution.name} has been suspended`,
        variant: "destructive",
      });

      fetchInstitutions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to suspend institution",
        variant: "destructive",
      });
    }
  };

  const pendingInstitutions = institutions.filter((i) => i.status === "pending");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have permission to access this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Panel</h1>
        <p className="text-muted-foreground mt-1">
          Manage users, institutions, officers, and system settings
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard
          title="Total Users"
          value={users.length}
          icon={Users}
          variant="primary"
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Institutions"
          value={institutions.length}
          icon={Building2}
          variant="secondary"
        />
        <StatsCard
          title="Pending Approvals"
          value={pendingInstitutions.length}
          icon={Clock}
          variant="default"
        />
        <StatsCard
          title="Total Documents"
          value={1248}
          icon={FileText}
          variant="success"
        />
        <StatsCard
          title="Active Officers"
          value={users.filter(u => u.role === "officer").length}
          icon={UserCog}
          variant="default"
        />
      </div>

      <Tabs defaultValue="institutions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="institutions">
            <Building2 className="h-4 w-4 mr-2" />
            Institutions
            {pendingInstitutions.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{pendingInstitutions.length}</Badge>
            )}
          </TabsTrigger>
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

        <TabsContent value="institutions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Institution Management</CardTitle>
              <CardDescription>
                Review and approve institution registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {institutionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading institutions...</div>
              ) : institutions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No institution registrations yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {institutions.map((institution) => (
                    <div
                      key={institution.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center text-lg font-bold text-white">
                          {institution.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{institution.name}</h4>
                            <Badge variant="outline">
                              {institutionTypeLabels[institution.institution_type] || institution.institution_type}
                            </Badge>
                            <Badge
                              className={
                                institution.status === "pending"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : institution.status === "approved"
                                  ? "bg-green-500/10 text-green-600"
                                  : institution.status === "rejected"
                                  ? "bg-red-500/10 text-red-600"
                                  : "bg-orange-500/10 text-orange-600"
                              }
                            >
                              {institution.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {institution.contact_email}
                            {institution.registration_number && ` · Reg: ${institution.registration_number}`}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Registered: {new Date(institution.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {institution.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setSelectedInstitution(institution);
                                setIsRejectDialogOpen(true);
                              }}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleApproveInstitution(institution)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                          </>
                        )}
                        {institution.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-orange-600 hover:bg-orange-50"
                            onClick={() => handleSuspendInstitution(institution)}
                          >
                            Suspend
                          </Button>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>View Documents</DropdownMenuItem>
                            <DropdownMenuItem>Contact</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
                          <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditUser(user)}>
                            Edit User
                          </DropdownMenuItem>
                          {user.role === "user" && (
                            <DropdownMenuItem onClick={() => handlePromoteToOfficer(user)}>
                              Promote to Officer
                            </DropdownMenuItem>
                          )}
                          {user.role === "officer" && (
                            <DropdownMenuItem onClick={() => handleDemoteToUser(user)}>
                              Demote to User
                            </DropdownMenuItem>
                          )}
                          {user.status === "active" ? (
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeactivate(user)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleActivate(user)}>
                              Activate
                            </DropdownMenuItem>
                          )}
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
                {users
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
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Manage Document Types", description: "Opening document types configuration" })}>Manage</Button>
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
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "Storage Details", description: "Viewing storage usage breakdown" })}>View Details</Button>
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
                  <Button variant="outline" size="sm" onClick={() => toast({ title: "System Logs", description: "Opening system activity logs" })}>View Logs</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Institution Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Institution</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedInstitution?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rejectionReason">Reason for Rejection</Label>
              <Textarea
                id="rejectionReason"
                placeholder="Please provide a detailed reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRejectInstitution}
                disabled={!rejectionReason.trim()}
                className="flex-1"
              >
                Reject Institution
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
