import { Upload, Shield, Share2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      icon: Upload,
      label: "Upload Document",
      description: "Securely upload a new document",
      variant: "default" as const,
      path: "/upload",
    },
    {
      icon: Shield,
      label: "Verify Hash",
      description: "Check document authenticity",
      variant: "secondary" as const,
      path: "/verify",
    },
    {
      icon: Share2,
      label: "Create Share Link",
      description: "Share document securely",
      variant: "outline" as const,
      path: "/documents",
    },
    {
      icon: Search,
      label: "Search Documents",
      description: "Find your documents",
      variant: "ghost" as const,
      path: "/documents",
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.label}
              variant={action.variant}
              className="h-auto flex-col gap-2 py-4 px-3"
              onClick={() => navigate(action.path)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{action.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
