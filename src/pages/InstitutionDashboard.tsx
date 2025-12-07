import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, FileText, Upload, Users, CheckCircle, XCircle, 
  Clock, Search, MoreVertical, Plus, Loader2, AlertTriangle 
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface InstitutionDocument {
  id: string;
  document_type: string;
  batch_name: string | null;
  batch_year: number | null;
  recipient_name: string;
  recipient_identifier: string | null;
  status: string;
  created_at: string;
}

interface VerificationRequest {
  id: string;
  document_reference: string;
  recipient_name: string;
  recipient_identifier: string | null;
  status: string;
  created_at: string;
}

export default function InstitutionDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [documents, setDocuments] = useState<InstitutionDocument[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [search, setSearch] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    documentType: "",
    batchName: "",
    batchYear: new Date().getFullYear().toString(),
    recipientName: "",
    recipientIdentifier: "",
  });

  useEffect(() => {
    checkInstitutionAccess();
  }, []);

  const checkInstitutionAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: inst, error } = await supabase
        .from("institutions")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!inst) {
        navigate("/");
        return;
      }

      if (inst.status !== "approved") {
        navigate("/institution-pending");
        return;
      }

      setInstitution(inst);
      await fetchDocuments(inst.id);
      await fetchVerificationRequests(inst.id);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to load institution data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDocuments = async (institutionId: string) => {
    const { data, error } = await supabase
      .from("institution_documents")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setDocuments(data);
    }
  };

  const fetchVerificationRequests = async (institutionId: string) => {
    const { data, error } = await supabase
      .from("verification_requests")
      .select("*")
      .eq("institution_id", institutionId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setVerificationRequests(data);
    }
  };

  const handleUploadDocument = async () => {
    if (!institution || !uploadForm.recipientName || !uploadForm.documentType) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.from("institution_documents").insert({
        institution_id: institution.id,
        document_type: uploadForm.documentType,
        batch_name: uploadForm.batchName || null,
        batch_year: uploadForm.batchYear ? parseInt(uploadForm.batchYear) : null,
        recipient_name: uploadForm.recipientName,
        recipient_identifier: uploadForm.recipientIdentifier || null,
        file_path: `documents/${institution.id}/${Date.now()}`,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Document Added",
        description: "Document record has been created successfully",
      });

      setIsUploadDialogOpen(false);
      setUploadForm({
        documentType: "",
        batchName: "",
        batchYear: new Date().getFullYear().toString(),
        recipientName: "",
        recipientIdentifier: "",
      });
      await fetchDocuments(institution.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add document",
        variant: "destructive",
      });
    }
  };

  const handleVerificationAction = async (requestId: string, action: "approved" | "denied") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("verification_requests")
        .update({
          status: action,
          responded_by: user?.id,
          responded_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: `Request ${action === "approved" ? "Approved" : "Denied"}`,
        description: `Verification request has been ${action}`,
      });

      await fetchVerificationRequests(institution.id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
      doc.document_type.toLowerCase().includes(search.toLowerCase())
  );

  const pendingRequests = verificationRequests.filter((r) => r.status === "pending");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <h2 className="text-xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground">You don't have access to this page</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            {institution.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your institution's documents and verification requests
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Document</DialogTitle>
              <DialogDescription>
                Add a document record for an individual or as part of a batch upload
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="documentType">Document Type *</Label>
                <Select
                  value={uploadForm.documentType}
                  onValueChange={(value) => setUploadForm({ ...uploadForm, documentType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="certificate">Certificate</SelectItem>
                    <SelectItem value="degree">Degree</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="transcript">Transcript</SelectItem>
                    <SelectItem value="license">License</SelectItem>
                    <SelectItem value="permit">Permit</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batchName">Batch Name</Label>
                  <Input
                    id="batchName"
                    placeholder="e.g., Class of 2025"
                    value={uploadForm.batchName}
                    onChange={(e) => setUploadForm({ ...uploadForm, batchName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batchYear">Year</Label>
                  <Input
                    id="batchYear"
                    type="number"
                    value={uploadForm.batchYear}
                    onChange={(e) => setUploadForm({ ...uploadForm, batchYear: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientName">Recipient Name *</Label>
                <Input
                  id="recipientName"
                  placeholder="Full name of document recipient"
                  value={uploadForm.recipientName}
                  onChange={(e) => setUploadForm({ ...uploadForm, recipientName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recipientIdentifier">Recipient ID</Label>
                <Input
                  id="recipientIdentifier"
                  placeholder="Student ID, NIN, or other identifier"
                  value={uploadForm.recipientIdentifier}
                  onChange={(e) => setUploadForm({ ...uploadForm, recipientIdentifier: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleUploadDocument} className="flex-1 bg-gradient-hero">
                  Add Document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Documents"
          value={documents.length}
          icon={FileText}
          variant="primary"
        />
        <StatsCard
          title="Active Documents"
          value={documents.filter((d) => d.status === "active").length}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequests.length}
          icon={Clock}
          variant="secondary"
        />
        <StatsCard
          title="Processed Requests"
          value={verificationRequests.filter((r) => r.status !== "pending").length}
          icon={Users}
          variant="default"
        />
      </div>

      <Tabs defaultValue="documents" className="space-y-6">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Verification Requests
            {pendingRequests.length > 0 && (
              <Badge className="ml-2 bg-primary text-primary-foreground">{pendingRequests.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Document Records</CardTitle>
              <CardDescription>
                Manage official documents issued by your institution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search documents..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No documents found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{doc.recipient_name}</h4>
                            <Badge variant="outline">{doc.document_type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {doc.batch_name && `${doc.batch_name} · `}
                            {doc.batch_year && `${doc.batch_year} · `}
                            {doc.recipient_identifier || "No ID"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={doc.status === "active" ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"}>
                          {doc.status}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Revoke</DropdownMenuItem>
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

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>
                Review and respond to document verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {verificationRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No verification requests yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {verificationRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-card"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{request.recipient_name}</h4>
                          <Badge
                            className={
                              request.status === "pending"
                                ? "bg-yellow-500/10 text-yellow-600"
                                : request.status === "approved"
                                ? "bg-green-500/10 text-green-600"
                                : "bg-red-500/10 text-red-600"
                            }
                          >
                            {request.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reference: {request.document_reference}
                          {request.recipient_identifier && ` · ID: ${request.recipient_identifier}`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Requested: {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleVerificationAction(request.id, "denied")}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Deny
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleVerificationAction(request.id, "approved")}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}