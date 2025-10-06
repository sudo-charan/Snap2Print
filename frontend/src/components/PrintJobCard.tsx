import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, User, FileText, Copy, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PrintJob {
  _id: string;
  studentName: string;
  fileOriginalName: string;
  createdAt: string;
  printType: string;
  copies: number;
  status: "pending" | "completed";
  filePath: string;
}

interface PrintJobCardProps {
  job: PrintJob;
  onStatusChange: (id: string, newStatus: "pending" | "completed") => void;
  onDelete?: (id: string) => void;
}

const PrintJobCard = ({ job, onStatusChange, onDelete }: PrintJobCardProps) => {
  const handleDownload = () => {
    const url = job.filePath.startsWith("http") ? job.filePath : `${import.meta.env.VITE_API_BASE || "http://localhost:4000"}${job.filePath}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    toast.success(`Sending ${job.fileOriginalName} to printer...`);
    if (job.status === "pending") {
      onStatusChange(job._id, "completed");
    }
  };

  const toggleStatus = () => {
    const newStatus = job.status === "pending" ? "completed" : "pending";
    onStatusChange(job._id, newStatus);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(job._id);
    }
  };

  return (
    <Card className="shadow-card hover:shadow-elevated transition-all duration-300 border-border/50 hover:border-primary/20">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-foreground truncate text-sm">{job.studentName}</h4>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(job.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Badge
              variant={job.status === "completed" ? "default" : "secondary"}
              className={
                job.status === "completed"
                  ? "bg-success hover:bg-success/90 text-success-foreground text-xs"
                  : "bg-warning hover:bg-warning/90 text-warning-foreground text-xs"
              }
            >
              {job.status === "completed" ? "Done" : "Pending"}
            </Badge>
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        <div className="bg-muted/30 rounded-lg p-2 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-3 h-3 text-primary flex-shrink-0" />
            <span className="font-medium truncate">{job.fileOriginalName}</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Printer className="w-3 h-3" />
              <span>{job.printType}</span>
            </div>
            <div className="flex items-center gap-1">
              <Copy className="w-3 h-3" />
              <span>{job.copies} {job.copies === 1 ? 'copy' : 'copies'}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-1 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="flex-1 h-7 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Download
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handlePrint}
            className="flex-1 h-7 text-xs"
          >
            <Printer className="w-3 h-3 mr-1" />
            Print
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleStatus}
            className="px-2 h-7 text-xs"
          >
            {job.status === "completed" ? "Undo" : "Done"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintJobCard;
