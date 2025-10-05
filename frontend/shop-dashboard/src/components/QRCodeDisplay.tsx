import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { toast } from "sonner";

interface QRCodeDisplayProps {
  shopId: string;
}

const QRCodeDisplay = ({ shopId }: QRCodeDisplayProps) => {
  // QR code should contain just the shopId for the mobile app to scan
  const qrCodeData = shopId;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeData)}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `${shopId}-qr-code.png`;
    link.click();
    toast.success("QR Code downloaded!");
  };

  return (
    <Card className="shadow-elevated border-border/50 overflow-hidden">
      <CardHeader className="bg-gradient-primary text-white">
        <CardTitle className="flex items-center gap-2">
          <QrCode className="w-5 h-5" />
          Your QR Code
        </CardTitle>
        <CardDescription className="text-white/80">
          Students scan this to send files
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-4">
        <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-border">
          <img
            src={qrCodeUrl}
            alt="Shop QR Code"
            className="w-full max-w-[250px] h-auto"
          />
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <p className="text-sm font-medium text-foreground">QR Code Data:</p>
          <code className="text-xs bg-background px-3 py-2 rounded border border-border block font-mono break-all">
            {qrCodeData}
          </code>
        </div>

        <Button onClick={handleDownload} className="w-full" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download QR Code
        </Button>

        <div className="pt-2 space-y-2 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground">How it works:</h4>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Print and display this QR code at your shop</li>
            <li>Students scan it to connect instantly</li>
            <li>They upload files directly to your dashboard</li>
            <li>You receive real-time notifications!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default QRCodeDisplay;
