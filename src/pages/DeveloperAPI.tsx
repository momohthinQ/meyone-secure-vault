import { useState } from "react";
import { 
  Code, Key, Copy, Eye, EyeOff, Plus, Trash2, 
  CheckCircle, ExternalLink, FileCode, Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

const codeExamples = {
  verify: `// Verify a document using the API
const response = await fetch(
  'https://sxkkgroempfnvdyhvusf.supabase.co/functions/v1/verify-document?token=YOUR_QR_TOKEN',
  {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    }
  }
);

const result = await response.json();
console.log(result);
// {
//   valid: true,
//   document: {
//     title: "BSc Computer Science",
//     owner: "John Doe",
//     issuer: "University of Sierra Leone",
//     status: "active"
//   }
// }`,
  webhook: `// Webhook payload example
{
  "event": "document.verified",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "document_id": "uuid-here",
    "verification_result": "valid",
    "verifier_info": {
      "ip": "192.168.1.1",
      "user_agent": "Mozilla/5.0..."
    }
  }
}`,
  python: `import requests

# Verify a document
response = requests.get(
    'https://sxkkgroempfnvdyhvusf.supabase.co/functions/v1/verify-document',
    params={'token': 'YOUR_QR_TOKEN'},
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)

result = response.json()
print(result)`,
};

export default function DeveloperAPI() {
  const { toast } = useToast();
  const [showKey, setShowKey] = useState(false);
  const [isCreateKeyOpen, setIsCreateKeyOpen] = useState(false);
  const [keyName, setKeyName] = useState("");

  // Mock API keys
  const [apiKeys] = useState([
    {
      id: "1",
      name: "Production Key",
      key: "mv_live_xxxxxxxxxxxxx",
      created: "2024-01-01",
      lastUsed: "2024-01-15",
      status: "active",
    },
    {
      id: "2",
      name: "Development Key",
      key: "mv_test_xxxxxxxxxxxxx",
      created: "2024-01-10",
      lastUsed: "Never",
      status: "active",
    },
  ]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const createApiKey = () => {
    if (!keyName.trim()) {
      toast({
        title: "Required",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "API Key Created",
      description: "Your new API key has been generated",
    });
    setIsCreateKeyOpen(false);
    setKeyName("");
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-3">
          <Code className="h-8 w-8 text-primary" />
          Developer API
        </h1>
        <p className="text-muted-foreground mt-1">
          Integrate MeYone Vault verification into your applications
        </p>
      </div>

      {/* Quick Start */}
      <Card className="bg-gradient-hero/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Get started with MeYone Vault API in minutes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              1
            </div>
            <p>Generate an API key from the API Keys section below</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              2
            </div>
            <p>Include the API key in your request headers</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
              3
            </div>
            <p>Call the verification endpoint with a document token</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keys">
            <Key className="h-4 w-4 mr-2" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="docs">
            <FileCode className="h-4 w-4 mr-2" />
            Documentation
          </TabsTrigger>
          <TabsTrigger value="examples">
            <Code className="h-4 w-4 mr-2" />
            Code Examples
          </TabsTrigger>
        </TabsList>

        <TabsContent value="keys">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>API Keys</CardTitle>
                <CardDescription>
                  Manage your API keys for integrations
                </CardDescription>
              </div>
              <Dialog open={isCreateKeyOpen} onOpenChange={setIsCreateKeyOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-hero hover:opacity-90">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Key
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create API Key</DialogTitle>
                    <DialogDescription>
                      Generate a new API key for your application
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Key Name</Label>
                      <Input
                        placeholder="e.g., Production Server"
                        value={keyName}
                        onChange={(e) => setKeyName(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsCreateKeyOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={createApiKey}>
                        Generate Key
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{key.name}</p>
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600"
                        >
                          {key.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-0.5 rounded">
                          {showKey ? key.key : "mv_****_**********"}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(key.key)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created: {key.created} • Last used: {key.lastUsed}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Complete reference for MeYone Vault API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Endpoint */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Verify Document</h3>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">GET</Badge>
                  <code className="text-sm bg-muted px-2 py-1 rounded flex-1">
                    /functions/v1/verify-document
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Verify the authenticity of a document using its QR token
                </p>
                
                <Separator />
                
                <div className="space-y-2">
                  <h4 className="font-medium">Query Parameters</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <code className="text-sm font-mono bg-background px-2 py-0.5 rounded">
                        token
                      </code>
                      <div>
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                        <p className="text-sm mt-1">
                          The unique verification token from the document's QR code
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Response</h4>
                  <div className="bg-muted rounded-lg p-4">
                    <pre className="text-sm overflow-x-auto">
{`{
  "valid": true,
  "document": {
    "title": "Document Title",
    "type": "certificate",
    "owner": "John Doe",
    "issuer": "Institution Name",
    "status": "active",
    "createdAt": "2024-01-01T00:00:00Z",
    "hash": "sha256-hash-here"
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Webhooks */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg">Webhooks</h3>
                <p className="text-sm text-muted-foreground">
                  Receive real-time notifications when documents are verified
                </p>
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">Available Events</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <code>document.verified</code> - Document successfully verified
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <code>document.failed</code> - Verification failed
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <code>document.created</code> - New document uploaded
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples">
          <Card>
            <CardHeader>
              <CardTitle>Code Examples</CardTitle>
              <CardDescription>
                Ready-to-use code snippets for common integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="js" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="js">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="webhook">Webhook</TabsTrigger>
                </TabsList>

                <TabsContent value="js">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.verify)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.verify}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="python">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.python)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.python}</code>
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value="webhook">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.webhook)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm">
                      <code>{codeExamples.webhook}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
