import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Shield,
  Share2,
  History,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Lock,
  UserCog,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: FileText, label: "My Documents", path: "/documents" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Shield, label: "Verification", path: "/verification" },
  { icon: Share2, label: "Shared Links", path: "/shared" },
  { icon: History, label: "Audit Log", path: "/audit" },
];

const accountNavItems: NavItem[] = [
  { icon: Users, label: "Next of Kin", path: "/next-of-kin" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminNavItems: NavItem[] = [
  { icon: UserCog, label: "Admin Panel", path: "/admin" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = () => {
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
    navigate("/");
  };

  const NavItemComponent = ({ item }: { item: NavItem }) => {
    const isActive = location.pathname === item.path;
    const Icon = item.icon;

    return (
      <NavLink
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "drop-shadow-sm")} />
        {!collapsed && (
          <span className="font-medium truncate">{item.label}</span>
        )}
        {!collapsed && item.badge && (
          <span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
            {item.badge}
          </span>
        )}
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full" />
        )}
      </NavLink>
    );
  };

  return (
    <aside
      className={cn(
        "bg-gradient-sidebar h-screen flex flex-col transition-all duration-300 border-r border-sidebar-border",
        collapsed ? "w-[70px]" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-sidebar-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-glow-primary">
          <Lock className="h-5 w-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-lg text-sidebar-foreground tracking-tight">
              MeYone<span className="text-sidebar-primary">Vault</span>
            </h1>
            <p className="text-xs text-sidebar-foreground/50">Secure Document Vault</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2">
              Main
            </p>
          )}
          {mainNavItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2">
              Account
            </p>
          )}
          {accountNavItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider mb-2">
              Admin
            </p>
          )}
          {adminNavItems.map((item) => (
            <NavItemComponent key={item.path} item={item} />
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        <button
          onClick={handleSignOut}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-200",
            "text-sidebar-foreground/70 hover:bg-destructive/20 hover:text-destructive"
          )}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Sign Out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center w-full py-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
