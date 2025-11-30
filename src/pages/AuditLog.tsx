import { useState } from "react";
import { History, Upload, Download, Shield, Share2, Eye, Filter, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AuditEntry {
  id: string;
  action: "upload" | "download" | "verify" | "share" | "view" | "delete";
  document: string;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

const actionConfig = {
  upload: { icon: Upload, label: "Upload", color: "text-primary", bg: "bg-primary/10" },
  download: { icon: Download, label: "Download", color: "text-secondary", bg: "bg-secondary/10" },
  verify: { icon: Shield, label: "Verify", color: "text-success", bg: "bg-success/10" },
  share: { icon: Share2, label: "Share", color: "text-info", bg: "bg-info/10" },
  view: { icon: Eye, label: "View", color: "text-muted-foreground", bg: "bg-muted" },
  delete: { icon: History, label: "Delete", color: "text-destructive", bg: "bg-destructive/10" },
};

const mockAuditLogs: AuditEntry[] = [
  { id: "1", action: "upload", document: "Birth Certificate", timestamp: "Nov 30, 2024 10:30 AM", ipAddress: "192.168.1.1", userAgent: "Chrome/Windows" },
  { id: "2", action: "verify", document: "Academic Degree", timestamp: "Nov 30, 2024 09:15 AM", ipAddress: "192.168.1.1", userAgent: "Chrome/Windows" },
  { id: "3", action: "share", document: "Property Deed", timestamp: "Nov 29, 2024 04:45 PM", ipAddress: "192.168.1.2", userAgent: "Safari/macOS" },
  { id: "4", action: "download", document: "ID Card", timestamp: "Nov 29, 2024 02:30 PM", ipAddress: "192.168.1.1", userAgent: "Chrome/Windows" },
  { id: "5", action: "view", document: "Passport", timestamp: "Nov 28, 2024 11:00 AM", ipAddress: "10.0.0.5", userAgent: "Firefox/Linux" },
  { id: "6", action: "upload", document: "Marriage Certificate", timestamp: "Nov 28, 2024 09:00 AM", ipAddress: "192.168.1.1", userAgent: "Chrome/Windows" },
];

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch = log.document.toLowerCase().includes(search.toLowerCase());
    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground mt-1">
          Track all activities on your documents
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by document name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="upload">Uploads</SelectItem>
            <SelectItem value="download">Downloads</SelectItem>
            <SelectItem value="verify">Verifications</SelectItem>
            <SelectItem value="share">Shares</SelectItem>
            <SelectItem value="view">Views</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Complete audit trail of all document activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No audit logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => {
                const config = actionConfig[log.action];
                const Icon = config.icon;
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("p-2 rounded-lg", config.bg)}>
                        <Icon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div>
                        <p className="font-medium">
                          <span className={config.color}>{config.label}</span>{" "}
                          <span className="text-foreground">{log.document}</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {log.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground hidden sm:block">
                      <p>{log.ipAddress}</p>
                      <p>{log.userAgent}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
