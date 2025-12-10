import { useState, useEffect } from "react";
import { 
  MessageSquare, Search, Send, Building2, User, Clock, 
  ChevronLeft, Loader2, Plus, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  institution_id: string;
  institution_name: string;
  institution_type: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  is_from_institution: boolean;
}

interface Institution {
  id: string;
  name: string;
  institution_type: string;
}

export default function Messages() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [search, setSearch] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [isNewMessageOpen, setIsNewMessageOpen] = useState(false);
  const [newConversation, setNewConversation] = useState({
    institutionId: "",
    subject: "",
    message: "",
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
    fetchInstitutions();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get unique conversations grouped by institution
      const { data, error } = await supabase
        .from("messages")
        .select(`
          id,
          institution_id,
          content,
          created_at,
          is_read,
          sender_id,
          institutions (name, institution_type)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group by institution
      const grouped = (data || []).reduce((acc: Record<string, any>, msg) => {
        if (!msg.institution_id) return acc;
        
        if (!acc[msg.institution_id]) {
          acc[msg.institution_id] = {
            id: msg.institution_id,
            institution_id: msg.institution_id,
            institution_name: (msg.institutions as any)?.name || "Unknown",
            institution_type: (msg.institutions as any)?.institution_type || "other",
            last_message: msg.content,
            last_message_time: msg.created_at,
            unread_count: 0,
          };
        }
        
        if (!msg.is_read && msg.sender_id !== user.id) {
          acc[msg.institution_id].unread_count++;
        }
        
        return acc;
      }, {});

      setConversations(Object.values(grouped));
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInstitutions = async () => {
    const { data } = await supabase
      .from("institutions")
      .select("id, name, institution_type")
      .eq("status", "approved")
      .order("name");

    if (data) setInstitutions(data);
  };

  const fetchMessages = async (institutionId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("institution_id", institutionId)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data.map(m => ({
        ...m,
        is_from_institution: m.sender_id !== user.id,
      })));

      // Mark as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("institution_id", institutionId)
        .neq("sender_id", user.id);
    }
  };

  const selectConversation = (conv: Conversation) => {
    setSelectedConversation(conv);
    fetchMessages(conv.institution_id);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      institution_id: selectedConversation.institution_id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage("");
    fetchMessages(selectedConversation.institution_id);
    fetchConversations();
  };

  const startNewConversation = async () => {
    if (!newConversation.institutionId || !newConversation.message) {
      toast({
        title: "Required",
        description: "Please select an institution and enter a message",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      institution_id: newConversation.institutionId,
      subject: newConversation.subject || null,
      content: newConversation.message,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Message Sent",
      description: "Your message has been sent to the institution",
    });

    setIsNewMessageOpen(false);
    setNewConversation({ institutionId: "", subject: "", message: "" });
    fetchConversations();
  };

  const filteredConversations = conversations.filter((c) =>
    c.institution_name.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">Communicate with institutions</p>
        </div>
        <Dialog open={isNewMessageOpen} onOpenChange={setIsNewMessageOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-hero hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              New Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Message</DialogTitle>
              <DialogDescription>
                Start a conversation with an institution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Institution *</Label>
                <Select
                  value={newConversation.institutionId}
                  onValueChange={(v) =>
                    setNewConversation((p) => ({ ...p, institutionId: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an institution" />
                  </SelectTrigger>
                  <SelectContent>
                    {institutions.map((inst) => (
                      <SelectItem key={inst.id} value={inst.id}>
                        {inst.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Optional subject line"
                  value={newConversation.subject}
                  onChange={(e) =>
                    setNewConversation((p) => ({ ...p, subject: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Message *</Label>
                <Textarea
                  placeholder="Write your message..."
                  rows={4}
                  value={newConversation.message}
                  onChange={(e) =>
                    setNewConversation((p) => ({ ...p, message: e.target.value }))
                  }
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNewMessageOpen(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={startNewConversation}>
                  Send Message
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Conversations List */}
        <Card className={cn("lg:col-span-1", selectedConversation && "hidden lg:block")}>
          <CardHeader className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-20rem)]">
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm mt-1">Start a conversation with an institution</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => selectConversation(conv)}
                      className={cn(
                        "w-full p-3 rounded-lg text-left transition-colors",
                        "hover:bg-muted",
                        selectedConversation?.id === conv.id && "bg-primary/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary/20 text-primary">
                            <Building2 className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">{conv.institution_name}</p>
                            {conv.unread_count > 0 && (
                              <Badge className="bg-primary text-primary-foreground">
                                {conv.unread_count}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Messages View */}
        <Card className={cn("lg:col-span-2 flex flex-col", !selectedConversation && "hidden lg:flex")}>
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Building2 className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">
                      {selectedConversation.institution_name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {selectedConversation.institution_type}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        !msg.is_from_institution && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={cn(
                            msg.is_from_institution
                              ? "bg-primary/20 text-primary"
                              : "bg-secondary text-secondary-foreground"
                          )}
                        >
                          {msg.is_from_institution ? (
                            <Building2 className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2 max-w-[70%]",
                          msg.is_from_institution
                            ? "bg-muted rounded-tl-none"
                            : "bg-primary text-primary-foreground rounded-tr-none"
                        )}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {new Date(msg.created_at).toLocaleTimeString("en-GB", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  />
                  <Button onClick={sendMessage} className="bg-gradient-hero">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
