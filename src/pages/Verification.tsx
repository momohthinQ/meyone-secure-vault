import { useState, useRef } from "react";
import { Shield, CheckCircle, XCircle, Clock, Copy, ExternalLink, Upload, Camera, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface VerificationResult {
  valid: boolean;
  documentName?: string;
  documentType?: string;
  verifiedDate?: string;
  uploadDate?: string;
  owner?: string;
  hash?: string;
}

interface PendingDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  owner: string;
  hash: string;
}

const pendingDocuments: PendingDocument[] = [
  { id: "1", name: "BSc Computer Science", type: "Academic Degree", uploadDate: "Nov 20, 2024", owner: "John Doe", hash: "b4c5d6e7f8a9b0c1" },
  { id: "2", name: "Masters Degree Certificate", type: "Academic Degree", uploadDate: "Nov 1, 2024", owner: "Jane Smith", hash: "f8a9b0c1d2e3f4a5" },
  { id: "3", name: "Business License 2024", type: "Business License", uploadDate: "Oct 28, 2024", owner: "ABC Corp", hash: "a1b2c3d4e5f6a7b8" },
];

// Compute SHA-256 hash of a file
async function computeFileHash(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function Verification() {
  const { toast } = useToast();
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [computedHash, setComputedHash] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setVerificationResult(null);
    setIsVerifying(true);

    try {
      // Compute hash
      const hash = await computeFileHash(file);
      setComputedHash(hash);

      // Verify against database
      const { data, error } = await supabase
        .from("document_hashes")
        .select(`
          hash,
          created_at,
          documents (
            name,
            document_type,
            created_at,
            profiles:user_id (
              full_name
            )
          )
        `)
        .eq("hash", hash)
        .maybeSingle();

      if (error) {
        console.error("Verification error:", error);
        toast({
          title: "Verification Error",
          description: "Failed to verify document. Please try again.",
          variant: "destructive",
        });
        setVerificationResult({ valid: false, hash });
      } else if (data && data.documents) {
        // Document found and verified
        const doc = data.documents as any;
        setVerificationResult({
          valid: true,
          documentName: doc.name,
          documentType: doc.document_type,
          uploadDate: new Date(doc.created_at).toLocaleDateString(),
          verifiedDate: new Date(data.created_at).toLocaleDateString(),
          owner: doc.profiles?.full_name || "Unknown",
          hash,
        });
        toast({
          title: "Document Verified!",
          description: "This document is authentic and registered in our system.",
        });
      } else {
        // No matching hash found
        setVerificationResult({ valid: false, hash });
        toast({
          title: "Not Verified",
          description: "This document is not registered in our system.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Hash computation error:", err);
      toast({
        title: "Error",
        description: "Failed to process the file. Please try again.",
        variant: "destructive",
      });
      setVerificationResult({ valid: false });
    } finally {
      setIsVerifying(false);
    }
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Hash Copied",
      description: "Document hash copied to clipboard",
    });
  };

  const resetVerification = () => {
    setSelectedFile(null);
    setComputedHash("");
    setVerificationResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Document Verification</h1>
        <p className="text-muted-foreground mt-1">
          Verify document authenticity by uploading or capturing the document
        </p>
      </div>

      <Tabs defaultValue="verify" className="space-y-6">
        <TabsList>
          <TabsTrigger value="verify">Verify Document</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Review
            <Badge variant="secondary" className="ml-2">
              {pendingDocuments.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="verify" className="space-y-6">
          {/* Public Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Document Verification
              </CardTitle>
              <CardDescription>
                Upload a document or take a photo to verify its authenticity. The system will compute the SHA-256 hash and check it against our database.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png,.docx,image/*"
                className="hidden"
              />
              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />

              {!selectedFile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Upload File Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group"
                  >
                    <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">Upload Document</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Select a file from your device
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        PDF, JPG, PNG, DOCX supported
                      </p>
                    </div>
                  </button>

                  {/* Take Photo Button */}
                  <button
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-4 p-8 border-2 border-dashed border-border rounded-xl hover:border-accent hover:bg-accent/5 transition-all cursor-pointer group"
                  >
                    <div className="p-4 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                      <Camera className="h-8 w-8 text-accent" />
                    </div>
                    <div className="text-center">
                      <h3 className="font-semibold">Take Photo</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Capture document with camera
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Use your device camera
                      </p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Selected File Display */}
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetVerification}>
                      Change File
                    </Button>
                  </div>

                  {/* Hash Display */}
                  {computedHash && (
                    <div className="p-4 bg-muted/30 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-1">SHA-256 Hash:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs font-mono break-all">
                          {computedHash}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyHash(computedHash)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {isVerifying && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-muted-foreground">Verifying document...</span>
                </div>
              )}

              {/* Verification Result */}
              {verificationResult && !isVerifying && (
                <div
                  className={cn(
                    "rounded-xl p-6 border animate-scale-in",
                    verificationResult.valid
                      ? "bg-success/10 border-success/30"
                      : "bg-destructive/10 border-destructive/30"
                  )}
                >
                  <div className="flex items-start gap-4">
                    {verificationResult.valid ? (
                      <CheckCircle className="h-8 w-8 text-success flex-shrink-0" />
                    ) : (
                      <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">
                        {verificationResult.valid
                          ? "Document Verified ✓"
                          : "Verification Failed"}
                      </h3>
                      {verificationResult.valid ? (
                        <div className="mt-3 space-y-2 text-sm">
                          <p><span className="text-muted-foreground">Document:</span> {verificationResult.documentName}</p>
                          <p><span className="text-muted-foreground">Type:</span> {verificationResult.documentType}</p>
                          <p><span className="text-muted-foreground">Owner:</span> {verificationResult.owner}</p>
                          <p><span className="text-muted-foreground">Uploaded:</span> {verificationResult.uploadDate}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          This document does not match any verified document in our system. The document may be tampered with, modified, or not registered.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {/* Officer View - Pending Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents Awaiting Verification</CardTitle>
              <CardDescription>
                Review and verify submitted documents. Only authorized verification officers can access this section.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-warning/10">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{doc.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {doc.type} • Submitted by {doc.owner}
                        </p>
                        <p className="text-xs font-mono text-muted-foreground mt-1 flex items-center gap-2">
                          Hash: {doc.hash}...
                          <button onClick={() => copyHash(doc.hash)} className="hover:text-foreground">
                            <Copy className="h-3 w-3" />
                          </button>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button variant="default" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm">
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
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
