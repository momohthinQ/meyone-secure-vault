import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Mail, Building2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function InstitutionPending() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("pending");
  const [institutionName, setInstitutionName] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/");
        return;
      }

      const { data: institution, error } = await supabase
        .from("institutions")
        .select("name, status, rejection_reason")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!institution) {
        navigate("/");
        return;
      }

      setInstitutionName(institution.name);
      setStatus(institution.status);
      setRejectionReason(institution.rejection_reason);

      if (institution.status === "approved") {
        toast({
          title: "Account Approved!",
          description: "Your institution account has been approved. Redirecting to dashboard...",
        });
        setTimeout(() => navigate("/institution"), 2000);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();

    // Set up real-time subscription for status changes
    const channel = supabase
      .channel("institution-status")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "institutions",
        },
        () => {
          checkStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleRefresh = () => {
    setIsLoading(true);
    checkStatus();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: "bg-yellow-500/10 text-yellow-600",
      title: "Registration Pending",
      description: "Your institution registration is being reviewed by our administrators.",
    },
    approved: {
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-600",
      title: "Registration Approved",
      description: "Congratulations! Your institution has been approved.",
    },
    rejected: {
      icon: XCircle,
      color: "bg-red-500/10 text-red-600",
      title: "Registration Rejected",
      description: "Unfortunately, your registration was not approved.",
    },
    suspended: {
      icon: XCircle,
      color: "bg-red-500/10 text-red-600",
      title: "Account Suspended",
      description: "Your institution account has been suspended.",
    },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className={`w-20 h-20 rounded-full ${config.color} mx-auto mb-4 flex items-center justify-center`}>
            <StatusIcon className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
          <CardDescription>{config.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted/50 p-4 rounded-lg space-y-3">
            <div className="flex items-center gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Institution</p>
                <p className="font-medium">{institutionName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={config.color}>{status}</Badge>
              </div>
            </div>
          </div>

          {status === "rejected" && rejectionReason && (
            <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg">
              <p className="text-sm font-medium text-destructive mb-1">Reason for rejection:</p>
              <p className="text-sm text-muted-foreground">{rejectionReason}</p>
            </div>
          )}

          {status === "pending" && (
            <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>What's next?</strong> Our team will review your registration and verify your institution's credentials. 
                This typically takes 1-3 business days. You'll receive an email notification once your account is approved.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRefresh} className="flex-1">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            <Button variant="outline" onClick={handleSignOut} className="flex-1">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}