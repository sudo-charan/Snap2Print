import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, FileText, Clock, CheckCircle2, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import QRCodeDisplay from "@/components/QRCodeDisplay";
import PrintJobCard from "@/components/PrintJobCard";
import StatsCard from "@/components/StatsCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const storedShop = (() => {
    try { return JSON.parse(localStorage.getItem("shop") || "null"); } catch { return null; }
  })();
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  })();
  const shopId = storedShop?.shopId || storedUser?.shopId;

  const ensureShop = useQuery({
    queryKey: ["shop", shopId || ""],
    queryFn: async () => {
      if (!shopId) throw new Error("Missing shopId");
      const res = await fetch(`${API_BASE}/api/shops/${encodeURIComponent(shopId)}`);
      if (!res.ok) throw new Error("Failed to load shop");
      return res.json();
    },
    enabled: !!shopId,
  });

  const jobsQuery = useQuery({
    queryKey: ["jobs", shopId || ""],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/print-jobs/${encodeURIComponent(shopId || "")}`);
      if (!res.ok) throw new Error("Failed to load jobs");
      return res.json();
    },
    enabled: ensureShop.isSuccess && !!shopId,
    refetchInterval: 5000,
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pending" | "completed" }) => {
      const res = await fetch(`${API_BASE}/api/print-jobs/status/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs", shopId || ""] });
    },
    onError: (e: any) => toast.error(e.message || "Update failed"),
  });

  const printJobs = jobsQuery.data || [];
  const totalJobs = printJobs.length;
  const pendingJobs = printJobs.filter((job: any) => job.status === "pending").length;
  const completedJobs = printJobs.filter((job: any) => job.status === "completed").length;

  // Sort jobs by creation date (most recent first)
  const sortedJobs = printJobs.sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleStatusChange = (id: string, newStatus: "pending" | "completed") => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDeleteJob = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/print-jobs/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success("Print job deleted successfully");
        queryClient.invalidateQueries({ queryKey: ["jobs", shopId || ""] });
      } else {
        throw new Error("Failed to delete job");
      }
    } catch (error) {
      toast.error("Failed to delete print job");
    }
  };

  const filteredJobs = useMemo(() => (sortedJobs || []).filter((job: any) =>
    job.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.fileOriginalName?.toLowerCase().includes(searchQuery.toLowerCase())
  ), [sortedJobs, searchQuery]);

  const handleLogout = () => {
    try {
      // Clear authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("shop");
      sessionStorage.clear();
      queryClient.clear();
    } catch (_) {}
    navigate("/auth", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                <Printer className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Snap2Print</h1>
                <p className="text-sm text-muted-foreground">{storedUser?.shopName || storedShop?.name || "Your Print Shop"}</p>
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <StatsCard
            title="Total Prints Today"
            value={totalJobs}
            icon={FileText}
            gradient="from-primary to-secondary"
          />
          <StatsCard
            title="Pending Jobs"
            value={pendingJobs}
            icon={Clock}
            gradient="from-warning to-orange-500"
          />
          <StatsCard
            title="Completed Jobs"
            value={completedJobs}
            icon={CheckCircle2}
            gradient="from-success to-emerald-500"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <div className="lg:col-span-1 animate-scale-in">
            {shopId ? (
              <QRCodeDisplay shopId={shopId} />
            ) : (
              <Card className="p-6"><CardTitle>Set up your shop</CardTitle><CardDescription>Go to Auth and sign up to create a shop.</CardDescription></Card>
            )}
          </div>

          {/* Print Jobs Section */}
          <div className="lg:col-span-2 space-y-4 animate-fade-in" style={{ animationDelay: "100ms" }}>
            <Card className="shadow-card border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Print Jobs
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Manage all incoming print requests
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {filteredJobs.length} Jobs
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by student name or file name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Jobs List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {filteredJobs.length > 0 ? (
                    filteredJobs.map((job: any, index: number) => (
                      <div
                        key={job._id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <PrintJobCard
                          job={job}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDeleteJob}
                        />
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                      <p>No print jobs found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
