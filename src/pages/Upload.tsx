import { useState, useCallback } from "react";
import { Upload as UploadIcon, FileText, X, Shield, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const documentTypes = [
  "Birth Certificate",
  "Academic Degree",
  "Property Deed",
  "ID Card",
  "Passport",
  "Marriage Certificate",
  "Death Certificate",
  "Business License",
  "Tax Document",
  "Other",
];

interface UploadedFile {
  file: File;
  progress: number;
  status: "uploading" | "encrypting" | "hashing" | "complete" | "error";
  hash?: string;
}

export default function Upload() {
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [documentType, setDocumentType] = useState("");
  const [documentName, setDocumentName] = useState("");

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const simulateUpload = (file: File) => {
    const uploadedFile: UploadedFile = {
      file,
      progress: 0,
      status: "uploading",
    };
    
    setFiles((prev) => [...prev, uploadedFile]);

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                progress: Math.min(progress, 100),
                status:
                  progress >= 100
                    ? "encrypting"
                    : progress >= 70
                    ? "hashing"
                    : "uploading",
              }
            : f
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? {
                    ...f,
                    status: "complete",
                    hash: generateMockHash(),
                  }
                : f
            )
          );
          toast({
            title: "Upload Complete",
            description: `${file.name} has been encrypted and stored securely.`,
          });
        }, 1500);
      }
    }, 200);
  };

  const generateMockHash = () => {
    return Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      droppedFiles.forEach(simulateUpload);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      selectedFiles.forEach(simulateUpload);
    }
  };

  const removeFile = (file: File) => {
    setFiles((prev) => prev.filter((f) => f.file !== file));
  };

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "encrypting":
        return <Lock className="h-5 w-5 text-secondary animate-pulse" />;
      case "hashing":
        return <Shield className="h-5 w-5 text-primary animate-pulse" />;
      default:
        return <UploadIcon className="h-5 w-5 text-muted-foreground animate-pulse" />;
    }
  };

  const getStatusText = (status: UploadedFile["status"]) => {
    switch (status) {
      case "complete":
        return "Encrypted & Stored";
      case "error":
        return "Upload Failed";
      case "encrypting":
        return "Encrypting...";
      case "hashing":
        return "Computing Hash...";
      default:
        return "Uploading...";
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Upload Document</h1>
        <p className="text-muted-foreground mt-1">
          Securely upload and encrypt your documents
        </p>
      </div>

      {/* Security Info */}
      <div className="bg-gradient-hero/10 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 rounded-lg bg-primary/20">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">End-to-End Encryption</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Your documents are encrypted using AES-256 before upload. Only you can access the decrypted files.
          </p>
        </div>
      </div>

      {/* Document Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Document Name</Label>
          <Input
            id="name"
            placeholder="e.g., Birth Certificate"
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {documentTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Upload Area */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          dragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-hero/20 flex items-center justify-center mb-4">
          <UploadIcon className="h-8 w-8 text-primary" />
        </div>
        <h3 className="font-semibold text-lg mb-2">Drop files here or click to upload</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Supported formats: PDF, JPG, PNG, DOCX (Max 50MB)
        </p>
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.docx"
          multiple
          onChange={handleFileInput}
        />
        <Button variant="outline" asChild>
          <label htmlFor="file-upload" className="cursor-pointer">
            Select Files
          </label>
        </Button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Uploaded Files</h3>
          {files.map((uploadedFile, index) => (
            <div
              key={index}
              className="bg-card border border-border rounded-lg p-4 animate-scale-in"
            >
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium truncate">{uploadedFile.file.name}</p>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(uploadedFile.status)}
                      {uploadedFile.status !== "complete" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFile(uploadedFile.file)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB • {getStatusText(uploadedFile.status)}
                  </p>
                  {uploadedFile.status !== "complete" && (
                    <Progress value={uploadedFile.progress} className="mt-2 h-1.5" />
                  )}
                  {uploadedFile.hash && (
                    <p className="text-xs font-mono text-muted-foreground mt-2 truncate">
                      SHA-256: {uploadedFile.hash}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button
          variant="hero"
          disabled={files.length === 0 || files.some((f) => f.status !== "complete")}
        >
          <Lock className="h-4 w-4" />
          Save to Vault
        </Button>
      </div>
    </div>
  );
}
