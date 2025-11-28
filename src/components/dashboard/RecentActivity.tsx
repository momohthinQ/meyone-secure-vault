import { Upload, Download, Shield, Share2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  action: "upload" | "download" | "verify" | "share" | "view";
  document: string;
  time: string;
  details?: string;
}

const actionConfig = {
  upload: {
    icon: Upload,
    label: "Uploaded",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  download: {
    icon: Download,
    label: "Downloaded",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  verify: {
    icon: Shield,
    label: "Verified",
    color: "text-success",
    bg: "bg-success/10",
  },
  share: {
    icon: Share2,
    label: "Shared",
    color: "text-info",
    bg: "bg-info/10",
  },
  view: {
    icon: Eye,
    label: "Viewed",
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

const recentActivities: ActivityItem[] = [
  { id: "1", action: "upload", document: "Birth Certificate", time: "2 hours ago" },
  { id: "2", action: "verify", document: "Academic Degree", time: "5 hours ago" },
  { id: "3", action: "share", document: "Property Deed", time: "1 day ago", details: "Link expires in 24h" },
  { id: "4", action: "download", document: "ID Card Copy", time: "2 days ago" },
  { id: "5", action: "view", document: "Passport", time: "3 days ago", details: "Via shared link" },
];

export function RecentActivity() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-lg mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {recentActivities.map((activity) => {
          const config = actionConfig[activity.action];
          const Icon = config.icon;
          
          return (
            <div key={activity.id} className="flex items-start gap-3 animate-fade-in">
              <div className={cn("p-2 rounded-lg", config.bg)}>
                <Icon className={cn("h-4 w-4", config.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">
                  <span className={cn("font-medium", config.color)}>{config.label}</span>
                  {" "}
                  <span className="font-medium text-foreground">{activity.document}</span>
                </p>
                {activity.details && (
                  <p className="text-xs text-muted-foreground">{activity.details}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
