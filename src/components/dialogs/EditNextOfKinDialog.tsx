import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface EditNextOfKinDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: { id: string; name: string; email: string; phone?: string; relationship: string } | null;
  onSave: (data: { id: string; name: string; email: string; phone: string; relationship: string }) => void;
}

export function EditNextOfKinDialog({ open, onOpenChange, entry, onSave }: EditNextOfKinDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");

  useEffect(() => {
    if (entry) {
      setName(entry.name);
      setEmail(entry.email);
      setPhone(entry.phone || "");
      setRelationship(entry.relationship);
    }
  }, [entry]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!entry || !name || !email || !relationship) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    onSave({ id: entry.id, name, email, phone, relationship });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Next of Kin</DialogTitle>
          <DialogDescription>
            Update contact information for this trusted person.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address *</Label>
            <Input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-phone">Phone Number</Label>
            <Input
              id="edit-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+232 XX XXXXXX"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-relationship">Relationship *</Label>
            <Select value={relationship} onValueChange={setRelationship}>
              <SelectTrigger>
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Spouse">Spouse</SelectItem>
                <SelectItem value="Parent">Parent</SelectItem>
                <SelectItem value="Child">Child</SelectItem>
                <SelectItem value="Sibling">Sibling</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
