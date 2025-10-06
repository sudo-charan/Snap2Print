import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const SCHEME = import.meta.env.VITE_DEEPLINK_SCHEME || "snap2print";

const StudentFallback = () => {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const initialShopId = params.shopId || searchParams.get("shopId") || "";
  const [shopId] = useState(initialShopId);

  const [studentName, setStudentName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [copies, setCopies] = useState(1);
  const [printType, setPrintType] = useState<"bw" | "color">("bw");
  const [submitting, setSubmitting] = useState(false);
  const [showWebForm, setShowWebForm] = useState(false);

  useEffect(() => {
    // Try to open the mobile app via deep link. If it fails, show web form after a short delay.
    const url = `${SCHEME}://shop/${encodeURIComponent(initialShopId)}`;
    // Attempt to open deep link
    window.location.href = url;
    const t = setTimeout(() => setShowWebForm(true), 1200);
    return () => clearTimeout(t);
  }, [initialShopId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopId) {
      toast.error("Invalid link. Missing shop ID.");
      return;
    }
    if (!studentName.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!files.length) {
      toast.error("Please select at least one file to upload");
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("studentName", studentName.trim());
      form.append("copies", String(copies));
      form.append("printType", printType);
      for (const f of files) form.append("files", f);

      const res = await fetch(`${API_BASE}/api/print-jobs/${encodeURIComponent(shopId)}/uploads`, { method: "POST", body: form });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as any)?.message || "Upload failed");
      }
      toast.success("Sent Successfully");
      setStudentName("");
      setFiles([]);
      setCopies(1);
      setPrintType("bw");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-10 max-w-xl">
        <Card className="shadow-elevated border-border/50">
          <CardHeader>
            <CardTitle>Send Files to Xerox Center</CardTitle>
            <CardDescription>
              Shop: <code className="text-xs">{shopId || "Unknown"}</code>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showWebForm ? (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>Trying to open the Snap2Print app...</p>
                <p>If nothing happens, the web form will appear shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="studentName">Your Name</Label>
                  <Input id="studentName" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="e.g. Rahul Sharma" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Select File(s)</Label>
                  <Input id="file" type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="copies">Copies</Label>
                    <Input id="copies" type="number" min={1} value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value) || 1))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Print Type</Label>
                    <Select value={printType} onValueChange={(v) => setPrintType(v as "bw" | "color") }>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bw">Black & White</SelectItem>
                        <SelectItem value="color">Color</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Files"}
                </Button>

                <div className="text-xs text-muted-foreground pt-2">
                  Prefer the app? Open: <code>{`${SCHEME}://shop/${shopId}`}</code>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentFallback;


