import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  variant?: "default" | "primary" | "secondary" | "success";
}

export function StatsCard({ title, value, icon: Icon, trend, variant = "default" }: StatsCardProps) {
  const variants = {
    default: {
      bg: "bg-card",
      iconBg: "bg-muted",
      iconColor: "text-foreground",
    },
    primary: {
      bg: "bg-card",
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    secondary: {
      bg: "bg-card",
      iconBg: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    success: {
      bg: "bg-card",
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
  };

  const style = variants[variant];

  return (
    <div className={cn(
      "rounded-xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow animate-fade-in",
      style.bg
    )}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={cn(
              "text-sm font-medium flex items-center gap-1",
              trend.positive ? "text-success" : "text-destructive"
            )}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%
              <span className="text-muted-foreground font-normal">vs last month</span>
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", style.iconBg)}>
          <Icon className={cn("h-6 w-6", style.iconColor)} />
        </div>
      </div>
    </div>
  );
}
