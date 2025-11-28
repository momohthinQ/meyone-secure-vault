import { useState } from "react";
import { FileText, Grid, List, Filter, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DocumentCard, DocumentStatus } from "@/components/dashboard/DocumentCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: DocumentStatus;
  hash: string;
}

const allDocuments: Document[] = [
  { id: "1", name: "Birth Certificate - John Doe", type: "Birth Certificate", uploadDate: "Nov 25, 2024", status: "verified", hash: "a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5" },
  { id: "2", name: "BSc Computer Science", type: "Academic Degree", uploadDate: "Nov 20, 2024", status: "pending", hash: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9" },
  { id: "3", name: "Land Deed - Plot 45A", type: "Property Deed", uploadDate: "Nov 15, 2024", status: "verified", hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0" },
  { id: "4", name: "National ID Card", type: "ID Card", uploadDate: "Nov 10, 2024", status: "rejected", hash: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1" },
  { id: "5", name: "Passport", type: "Passport", uploadDate: "Nov 5, 2024", status: "verified", hash: "e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2" },
  { id: "6", name: "Masters Degree Certificate", type: "Academic Degree", uploadDate: "Nov 1, 2024", status: "pending", hash: "f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3" },
];

export default function Documents() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "list">("list");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredDocuments = allDocuments.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const documentTypes = [...new Set(allDocuments.map((d) => d.type))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">My Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your secure documents
          </p>
        </div>
        <Button variant="hero" onClick={() => navigate("/upload")}>
          <Plus className="h-5 w-5" />
          Upload New
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {documentTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1 border rounded-lg p-1">
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setView("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All ({allDocuments.length})</TabsTrigger>
          <TabsTrigger value="verified">Verified ({allDocuments.filter(d => d.status === "verified").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({allDocuments.filter(d => d.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({allDocuments.filter(d => d.status === "rejected").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <DocumentList documents={filteredDocuments} view={view} />
        </TabsContent>
        <TabsContent value="verified">
          <DocumentList documents={filteredDocuments.filter(d => d.status === "verified")} view={view} />
        </TabsContent>
        <TabsContent value="pending">
          <DocumentList documents={filteredDocuments.filter(d => d.status === "pending")} view={view} />
        </TabsContent>
        <TabsContent value="rejected">
          <DocumentList documents={filteredDocuments.filter(d => d.status === "rejected")} view={view} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DocumentList({ documents, view }: { documents: Document[]; view: "grid" | "list" }) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No documents found</p>
      </div>
    );
  }

  return (
    <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-3"}>
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          name={doc.name}
          type={doc.type}
          uploadDate={doc.uploadDate}
          status={doc.status}
          hash={doc.hash}
        />
      ))}
    </div>
  );
}
