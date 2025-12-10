import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Download, ExternalLink, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface QRCodeGeneratorProps {
  documentId: string;
  documentName: string;
  qrToken: string;
}

export function QRCodeGenerator({ documentId, documentName, qrToken }: QRCodeGeneratorProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  
  const verificationUrl = `${window.location.origin}/verify?token=${qrToken}`;

  const copyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    toast({
      title: "Link Copied",
      description: "Verification link copied to clipboard",
    });
  };

  const downloadQR = () => {
    const svg = document.getElementById(`qr-${documentId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${documentName.replace(/\s+/g, "_")}_QR.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <QrCode className="h-4 w-4 mr-2" />
          QR Code
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Document QR Code</DialogTitle>
          <DialogDescription>
            Scan this QR code to verify the authenticity of "{documentName}"
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              id={`qr-${documentId}`}
              value={verificationUrl}
              size={200}
              level="H"
              includeMargin
              imageSettings={{
                src: "/favicon.ico",
                x: undefined,
                y: undefined,
                height: 24,
                width: 24,
                excavate: true,
              }}
            />
          </div>
          
          <div className="w-full space-y-2">
            <Label htmlFor="verify-link">Verification Link</Label>
            <div className="flex gap-2">
              <Input
                id="verify-link"
                value={verificationUrl}
                readOnly
                className="font-mono text-xs"
              />
              <Button variant="outline" size="icon" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex gap-2 w-full">
            <Button variant="outline" className="flex-1" onClick={downloadQR}>
              <Download className="h-4 w-4 mr-2" />
              Download QR
            </Button>
            <Button className="flex-1" asChild>
              <a href={verificationUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Link
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
