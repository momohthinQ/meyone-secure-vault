import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  Shield, CheckCircle, XCircle, Loader2, FileText, Building2, 
  User, Calendar, Hash, Lock, AlertTriangle, Clock, ExternalLink
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";

interface DocumentData {
  title: string;
  type: string;
  owner: string;
  recipientId?: string;
  issuer: string;
  issuerType?: string;
  issuerLogo?: string;
  status: string;
  issuedAt?: string;
  createdAt: string;
  digitalSignature?: string;
  hash?: string;
}

export default function VerifyDocument() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationLogs, setVerificationLogs] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      verifyDocument();
    } else {
      setIsLoading(false);
      setError("No verification token provided");
    }
  }, [token]);

  const verifyDocument = async () => {
    try {
      const response = await fetch(
        `https://sxkkgroempfnvdyhvusf.supabase.co/functions/v1/verify-document?token=${token}`
      );
      
      const data = await response.json();
      
      if (data.valid) {
        setIsValid(true);
        setDocument(data.document);
        
        // Fetch verification history
        const { data: logs } = await supabase
          .from("verification_logs")
          .select("*")
          .or(`document_id.eq.${data.document?.id},institution_document_id.eq.${data.document?.id}`)
          .order("verified_at", { ascending: false })
          .limit(10);
        
        if (logs) setVerificationLogs(logs);
      } else {
        setIsValid(false);
        setError(data.error || "Verification failed");
      }
    } catch (err) {
      setError("Failed to verify document");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Verifying document authenticity...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:underline mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-xl font-bold">MeYone Vault</span>
          </Link>
          <h1 className="text-2xl font-bold">Document Verification</h1>
          <p className="text-muted-foreground">Verify the authenticity of this document</p>
        </div>

        {/* Verification Result */}
        <Card className={isValid ? "border-green-500/50 bg-green-500/5" : "border-destructive/50 bg-destructive/5"}>
          <CardContent className="py-8 text-center">
            {isValid ? (
              <>
                <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-10 w-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">Document Verified</h2>
                <p className="text-muted-foreground">
                  This document is authentic and has not been tampered with.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
                  <XCircle className="h-10 w-10 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold text-destructive mb-2">Verification Failed</h2>
                <p className="text-muted-foreground">{error}</p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Document Details */}
        {isValid && document && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Document Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Document Title</p>
                    <p className="font-medium">{document.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <Badge variant="outline">{document.type}</Badge>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-medium">{document.owner}</p>
                      {document.recipientId && (
                        <p className="text-xs text-muted-foreground">ID: {document.recipientId}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Issuer</p>
                      <p className="font-medium">{document.issuer}</p>
                      {document.issuerType && (
                        <Badge variant="secondary" className="mt-1">{document.issuerType}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {document.issuedAt ? "Issued Date" : "Upload Date"}
                      </p>
                      <p className="font-medium">
                        {new Date(document.issuedAt || document.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={
                        document.status === "active" || document.status === "verified" 
                          ? "bg-green-500/10 text-green-600" 
                          : "bg-yellow-500/10 text-yellow-600"
                      }>
                        {document.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {document.hash && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-3">
                      <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">SHA-256 Hash</p>
                        <p className="font-mono text-xs break-all bg-muted p-2 rounded mt-1">
                          {document.hash}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {document.digitalSignature && (
                  <div className="flex items-start gap-3">
                    <Lock className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Digital Signature</p>
                      <Badge className="bg-primary/10 text-primary">Signed</Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Logs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Verification History
                </CardTitle>
                <CardDescription>
                  Tamper-proof log of all verification attempts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    This is the first verification of this document.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {verificationLogs.slice(0, 5).map((log, i) => (
                      <div key={log.id} className="flex items-center gap-3 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          log.verification_result === "valid" ? "bg-green-500" : "bg-yellow-500"
                        }`} />
                        <span className="text-muted-foreground">
                          {new Date(log.verified_at).toLocaleString("en-GB")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.verification_result}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warning */}
            <Card className="border-yellow-500/50 bg-yellow-500/5">
              <CardContent className="py-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-700">Important Notice</p>
                  <p className="text-muted-foreground">
                    This verification confirms the document's presence in MeYone Vault. 
                    Always verify the issuing institution for additional confirmation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Powered by MeYone Vault - Sierra Leone's Secure Document Platform</p>
          <Button variant="link" size="sm" asChild className="text-primary">
            <Link to="/">
              <ExternalLink className="h-3 w-3 mr-1" />
              Learn more about MeYone Vault
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
