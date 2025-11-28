import { useState } from "react";
import { Search, Shield, CheckCircle, XCircle, Clock, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface VerificationResult {
  valid: boolean;
  documentName?: string;
  documentType?: string;
  verifiedDate?: string;
  uploadDate?: string;
  owner?: string;
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

export default function Verification() {
  const { toast } = useToast();
  const [searchHash, setSearchHash] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (!searchHash.trim()) return;

    setIsVerifying(true);
    setVerificationResult(null);

    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock result - in production, this would check against the blockchain/database
    if (searchHash.length >= 32) {
      setVerificationResult({
        valid: Math.random() > 0.3,
        documentName: "Birth Certificate - John Doe",
        documentType: "Birth Certificate",
        verifiedDate: "Nov 25, 2024",
        uploadDate: "Nov 20, 2024",
        owner: "John Doe",
      });
    } else {
      setVerificationResult({ valid: false });
    }

    setIsVerifying(false);
  };

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Hash Copied",
      description: "Document hash copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Document Verification</h1>
        <p className="text-muted-foreground mt-1">
          Verify document authenticity using SHA-256 hash
        </p>
      </div>

      <Tabs defaultValue="verify" className="space-y-6">
        <TabsList>
          <TabsTrigger value="verify">Verify Hash</TabsTrigger>
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
                Public Hash Verification
              </CardTitle>
              <CardDescription>
                Enter a document hash to verify its authenticity. This feature allows anyone to verify if a document is genuine.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Enter SHA-256 hash (e.g., a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5...)"
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    className="pl-10 font-mono text-sm"
                  />
                </div>
                <Button onClick={handleVerify} disabled={isVerifying || !searchHash.trim()}>
                  {isVerifying ? (
                    <>
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Verify
                    </>
                  )}
                </Button>
              </div>

              {/* Verification Result */}
              {verificationResult && (
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
                          <p><span className="text-muted-foreground">Verified On:</span> {verificationResult.verifiedDate}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-2">
                          This hash does not match any verified document in our system. The document may be tampered with or not registered.
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
