import { useState } from "react";
import { Users, Plus, Mail, Phone, Trash2, CheckCircle, AlertCircle, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AddNextOfKinDialog } from "@/components/dialogs/AddNextOfKinDialog";
import { EditNextOfKinDialog } from "@/components/dialogs/EditNextOfKinDialog";

interface NextOfKinEntry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  relationship: string;
  isVerified: boolean;
}

const mockNextOfKin: NextOfKinEntry[] = [
  { id: "1", name: "Jane Doe", email: "jane.doe@email.com", phone: "+232 76 123456", relationship: "Spouse", isVerified: true },
  { id: "2", name: "James Doe", email: "james.doe@email.com", phone: "+232 77 654321", relationship: "Sibling", isVerified: false },
];

export default function NextOfKin() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<NextOfKinEntry[]>(mockNextOfKin);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<NextOfKinEntry | null>(null);

  const handleAddContact = (data: { name: string; email: string; phone: string; relationship: string }) => {
    const newEntry: NextOfKinEntry = {
      id: Date.now().toString(),
      ...data,
      isVerified: false,
    };
    setEntries([...entries, newEntry]);
    toast({
      title: "Contact Added",
      description: `${data.name} has been added. A verification email will be sent.`,
    });
  };

  const handleEditContact = (data: { id: string; name: string; email: string; phone: string; relationship: string }) => {
    setEntries(entries.map(e => e.id === data.id ? { ...e, ...data } : e));
    toast({
      title: "Contact Updated",
      description: `${data.name}'s information has been updated.`,
    });
  };

  const resendVerification = (name: string) => {
    toast({
      title: "Verification Sent",
      description: `A verification email has been sent to ${name}`,
    });
  };

  const removeEntry = (id: string, name: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast({
      title: "Next of Kin Removed",
      description: `${name} has been removed from your next of kin list`,
    });
  };

  const openEditDialog = (entry: NextOfKinEntry) => {
    setEditingEntry(entry);
    setEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Next of Kin</h1>
          <p className="text-muted-foreground mt-1">
            Manage trusted contacts for legacy access
          </p>
        </div>
        <Button variant="hero" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-5 w-5" />
          Add Contact
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-secondary/5 border-secondary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-secondary/20">
              <Users className="h-5 w-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-semibold">Legacy Access Feature</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If your account remains inactive for 12 months, your verified next of kin will be granted access to your document vault. You can add up to 3 trusted contacts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Trusted Contacts</CardTitle>
          <CardDescription>
            These people will have access to your vault after extended inactivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No next of kin added yet</p>
                <p className="text-sm mt-2">Add trusted contacts to enable legacy access</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-hero flex items-center justify-center text-lg font-bold text-white">
                      {entry.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{entry.name}</h4>
                        <Badge variant={entry.isVerified ? "default" : "secondary"}>
                          {entry.isVerified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pending
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.relationship}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {entry.email}
                        </span>
                        {entry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {entry.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!entry.isVerified && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendVerification(entry.name)}
                      >
                        Resend Verification
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEntry(entry.id, entry.name)}
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

      <AddNextOfKinDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAdd={handleAddContact}
      />
      <EditNextOfKinDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        entry={editingEntry}
        onSave={handleEditContact}
      />
    </div>
  );
}
