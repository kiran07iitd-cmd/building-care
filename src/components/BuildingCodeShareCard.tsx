import { useEffect, useState } from "react";
import { Check, Copy, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type BuildingCodeShareCardProps = {
  buildingCode: string;
  className?: string;
};

export function BuildingCodeShareCard({ buildingCode, className }: BuildingCodeShareCardProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(buildingCode, {
      margin: 1,
      width: 220,
      color: { dark: "#0f172a", light: "#ffffff" },
    })
      .then((dataUrl: string) => {
        if (!cancelled) setQrDataUrl(dataUrl);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl(null);
      });

    return () => {
      cancelled = true;
    };
  }, [buildingCode]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(buildingCode);
      setCopied(true);
      toast.success("Building code copied");
    } catch {
      toast.error("Couldn't copy the building code");
    }
  };

  return (
    <Card className={className}>
      <div className="flex flex-col gap-4 rounded-lg border border-dashed p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            <QrCode className="h-3.5 w-3.5" /> Building code
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Share this code with residents or show the QR code for quick joining.
            </p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-wide">{buildingCode}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={copyCode}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? "Copied" : "Copy code"}
          </Button>
        </div>
        <div className="flex min-h-[180px] items-center justify-center rounded-lg bg-white p-3 shadow-sm">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`QR code for ${buildingCode}`}
              className="h-[180px] w-[180px]"
            />
          ) : (
            <div className="flex h-[180px] w-[180px] items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
              Generating QR…
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
