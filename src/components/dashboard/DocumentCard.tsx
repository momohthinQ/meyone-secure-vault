import { FileText, MoreVertical, Download, Share2, Eye, Shield, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type DocumentStatus = "verified" | "pending" | "rejected";

interface DocumentCardProps {
  name: string;
  type: string;
  uploadDate: string;
  status: DocumentStatus;
  hash?: string;
  onClick?: () => void;
}

const statusConfig = {
  verified: {
    label: "Verified",
    icon: Shield,
    className: "bg-success/10 text-success border-success/20",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning border-warning/20",
  },
  rejected: {
    label: "Rejected",
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
};

const documentTypeIcons: Record<string, string> = {
  "Birth Certificate": "📜",
  "Academic Degree": "🎓",
  "Property Deed": "🏠",
  "ID Card": "🪪",
  "Passport": "🛂",
  "Default": "📄",
};

export function DocumentCard({ name, type, uploadDate, status, hash, onClick }: DocumentCardProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const typeIcon = documentTypeIcons[type] || documentTypeIcons["Default"];

  return (
    <div 
      className="group bg-card rounded-xl border border-border p-4 hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer animate-fade-in"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Document Icon */}
        <div className="w-12 h-12 rounded-lg bg-gradient-hero flex items-center justify-center text-2xl shadow-sm">
          {typeIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {name}
              </h3>
              <p className="text-sm text-muted-foreground">{type}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="mr-2 h-4 w-4" />
                  Preview
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
            <Badge variant="outline" className={cn("gap-1.5", statusInfo.className)}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
            <span className="text-xs text-muted-foreground">{uploadDate}</span>
          </div>

          {hash && (
            <p className="mt-2 text-xs font-mono text-muted-foreground truncate">
              Hash: {hash.slice(0, 16)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
