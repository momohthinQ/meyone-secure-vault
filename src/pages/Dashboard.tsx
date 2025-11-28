import { FileText, Shield, Share2, Clock } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DocumentCard, DocumentStatus } from "@/components/dashboard/DocumentCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: DocumentStatus;
  hash: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    name: "Birth Certificate - John Doe",
    type: "Birth Certificate",
    uploadDate: "Nov 25, 2024",
    status: "verified",
    hash: "a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5",
  },
  {
    id: "2",
    name: "BSc Computer Science",
    type: "Academic Degree",
    uploadDate: "Nov 20, 2024",
    status: "pending",
    hash: "b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9",
  },
  {
    id: "3",
    name: "Land Deed - Plot 45A",
    type: "Property Deed",
    uploadDate: "Nov 15, 2024",
    status: "verified",
    hash: "c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
  },
  {
    id: "4",
    name: "National ID Card",
    type: "ID Card",
    uploadDate: "Nov 10, 2024",
    status: "rejected",
    hash: "d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">
            Welcome back, <span className="text-gradient-primary">John</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your secure document vault
          </p>
        </div>
        <Button variant="hero" size="lg" onClick={() => navigate("/upload")}>
          <FileText className="h-5 w-5" />
          Upload Document
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Documents"
          value={12}
          icon={FileText}
          variant="primary"
          trend={{ value: 8, positive: true }}
        />
        <StatsCard
          title="Verified"
          value={8}
          icon={Shield}
          variant="success"
          trend={{ value: 15, positive: true }}
        />
        <StatsCard
          title="Pending"
          value={3}
          icon={Clock}
          variant="default"
        />
        <StatsCard
          title="Shared Links"
          value={5}
          icon={Share2}
          variant="secondary"
          trend={{ value: 25, positive: true }}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Documents List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Documents</h2>
            <Button variant="link" onClick={() => navigate("/documents")}>
              View all
            </Button>
          </div>
          <div className="grid gap-4">
            {mockDocuments.map((doc) => (
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
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
