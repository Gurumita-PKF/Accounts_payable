import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { InvoiceRecord } from "@/pages/Index";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  records: InvoiceRecord[];
  loading: boolean;
}

export const RecentActivity = ({ records, loading }: Props) => {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-card">
      <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : records.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No activity yet. Upload your first invoice to start extraction.
        </p>
      ) : (
        <div className="space-y-2">
          {records.slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-md border p-2 text-sm">
              <p className="font-medium truncate" title={r.fileName}>{r.fileName}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {r.status === "processing" && (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-warning" />
                    Processing
                  </>
                )}
                {r.status === "extracted" && (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-success" />
                    Extracted
                  </>
                )}
                {r.status === "failed" && (
                  <>
                    <XCircle className="h-3 w-3 text-destructive" />
                    Failed
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
