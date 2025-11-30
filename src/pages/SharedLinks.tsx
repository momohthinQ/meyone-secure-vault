import { useState } from "react";
import { Share2, Copy, ExternalLink, Trash2, Plus, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ShareLink {
  id: string;
  documentName: string;
  token: string;
  expiresAt: string;
  viewCount: number;
  hasPin: boolean;
  isActive: boolean;
}

const mockShareLinks: ShareLink[] = [
  { id: "1", documentName: "Birth Certificate", token: "abc123xyz", expiresAt: "Dec 5, 2024", viewCount: 3, hasPin: true, isActive: true },
  { id: "2", documentName: "Academic Degree", token: "def456uvw", expiresAt: "Dec 1, 2024", viewCount: 7, hasPin: false, isActive: true },
  { id: "3", documentName: "Property Deed", token: "ghi789rst", expiresAt: "Nov 28, 2024", viewCount: 12, hasPin: true, isActive: false },
];

export default function SharedLinks() {
  const { toast } = useToast();
  const [links, setLinks] = useState<ShareLink[]>(mockShareLinks);

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/shared/${token}`);
    toast({
      title: "Link Copied",
      description: "Share link copied to clipboard",
    });
  };

  const openLink = (token: string) => {
    window.open(`${window.location.origin}/shared/${token}`, "_blank");
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter(l => l.id !== id));
    toast({
      title: "Link Deleted",
      description: "The share link has been deactivated",
    });
  };

  const createNewLink = () => {
    toast({
      title: "Create Share Link",
      description: "Navigate to My Documents to create a share link for a document",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Shared Links</h1>
          <p className="text-muted-foreground mt-1">
            Manage your secure document share links
          </p>
        </div>
        <Button variant="hero" onClick={createNewLink}>
          <Plus className="h-5 w-5" />
          Create Share Link
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Share Links</CardTitle>
          <CardDescription>
            Links you've created to share documents securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No share links created yet</p>
                <p className="text-sm mt-2">Create share links from your documents</p>
              </div>
            ) : (
              links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-secondary/10">
                      <Share2 className="h-5 w-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{link.documentName}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires: {link.expiresAt}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {link.viewCount} views
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={link.isActive ? "default" : "secondary"}>
                          {link.isActive ? "Active" : "Expired"}
                        </Badge>
                        {link.hasPin && (
                          <Badge variant="outline">PIN Protected</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyLink(link.token)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openLink(link.token)}
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteLink(link.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
