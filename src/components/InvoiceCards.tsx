import { CheckCircle2, Download, Loader2, RotateCcw, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { InvoiceRecord } from "@/pages/Index";

interface Props {
  records: InvoiceRecord[];
  onDelete: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenDetails: (id: string) => void;
  onOpenExcelPreview: (id: string) => void;
  retryableIds: Set<string>;
  loading: boolean;
}

const formatAmount = (value: number | null) =>
  value == null ? "-" : Number(value).toLocaleString("en-IN");

export const InvoiceCards = ({
  records,
  onDelete,
  onRetry,
  onOpenDetails,
  onOpenExcelPreview,
  retryableIds,
  loading,
}: Props) => {
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-[#c8d6e8] bg-white p-12 text-center shadow-[0_14px_34px_rgba(15,42,85,0.12)] space-y-2">
        <p className="font-medium">No extracted invoices yet</p>
        <p className="text-sm text-muted-foreground">
          Upload invoice files and run extraction to see records here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {loading && (
        <>
          <div className="rounded-2xl border border-[#c8d6e8] bg-white p-4 space-y-2 shadow-[0_10px_22px_rgba(15,42,85,0.10)]">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="rounded-2xl border border-[#c8d6e8] bg-white p-4 space-y-2 shadow-[0_10px_22px_rgba(15,42,85,0.10)]">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </>
      )}

      {records.map((rec) => (
        <div
          key={rec.id}
          className="rounded-2xl border border-[#c8d6e8] bg-white p-4 shadow-[0_12px_28px_rgba(15,42,85,0.12)] space-y-3"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium break-all line-clamp-2" title={rec.fileName}>{rec.fileName}</p>
              <p className="text-xs text-muted-foreground truncate">
                Invoice: {rec.invoice_number || "-"}
              </p>
            </div>

            {rec.status === "processing" && (
              <Badge variant="outline" className="shrink-0">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Processing
              </Badge>
            )}
            {rec.status === "extracted" && (
              <Badge className="shrink-0">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Extracted
              </Badge>
            )}
            {rec.status === "failed" && (
              <Badge variant="destructive" className="shrink-0">
                <XCircle className="h-3 w-3 mr-1" />
                Failed
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-lg border border-[#d8e3f0] bg-[#f8fbff] p-2">
              <p className="text-xs text-muted-foreground">Seller GSTIN</p>
              <p className="truncate">{rec.seller_gstin || "-"}</p>
            </div>
            <div className="rounded-lg border border-[#d8e3f0] bg-[#f8fbff] p-2">
              <p className="text-xs text-muted-foreground">Buyer GSTIN</p>
              <p className="truncate">{rec.buyer_gstin || "-"}</p>
            </div>
            <div className="rounded-lg border border-[#d8e3f0] bg-[#f8fbff] p-2">
              <p className="text-xs text-muted-foreground">Taxable</p>
              <p>{formatAmount(rec.taxable_amount)}</p>
            </div>
            <div className="rounded-lg border border-[#d8e3f0] bg-[#f8fbff] p-2">
              <p className="text-xs text-muted-foreground">Total</p>
              <p>{formatAmount(rec.total_amount)}</p>
            </div>
          </div>

          {rec.status === "failed" && rec.error && (
            <p className="text-xs text-destructive/90 bg-destructive/5 border border-destructive/20 rounded-md p-2">
              {rec.error}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onOpenDetails(rec.id)}>
              Details
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenExcelPreview(rec.id)}>
              <Download className="h-4 w-4 mr-1" />
              Excel
            </Button>
            {rec.status === "failed" && (
              <Button
                size="sm"
                variant="outline"
                disabled={!retryableIds.has(rec.id)}
                onClick={() => onRetry(rec.id)}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Retry
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => onDelete(rec.id)}>
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
