import { useEffect, useMemo, useState } from "react";
import { Trash2, Loader2, CheckCircle2, XCircle, ArrowUpDown, RotateCcw, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InvoiceRecord } from "@/pages/Index";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  records: InvoiceRecord[];
  onDelete: (id: string) => void;
  selectedRecordId: string | null;
  onSelectRecord: (id: string) => void;
  onRetry: (id: string) => void;
  onOpenExcelPreview: (id: string) => void;
  onOpenDetails: (id: string) => void;
  retryableIds: Set<string>;
  compact: boolean;
  loading: boolean;
}

const COLUMNS: { key: keyof InvoiceRecord; label: string; numeric?: boolean }[] = [
  { key: "fileName", label: "File Name" },
  { key: "invoice_number", label: "Invoice #" },
  { key: "seller_gstin", label: "Seller GSTIN" },
  { key: "buyer_gstin", label: "Buyer GSTIN" },
  { key: "taxable_amount", label: "Taxable", numeric: true },
  { key: "total_amount", label: "Total", numeric: true },
];

const formatNumeric = (value: unknown) =>
  value == null || value === "" ? "-" : Number(value).toLocaleString("en-IN");

export const InvoiceTable = ({
  records,
  onDelete,
  selectedRecordId,
  onSelectRecord,
  onRetry,
  onOpenExcelPreview,
  onOpenDetails,
  retryableIds,
  compact,
  loading,
}: Props) => {
  const [sortKey, setSortKey] = useState<keyof InvoiceRecord | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const sorted = [...records];
  if (sortKey) {
    sorted.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }

  const handleSort = (key: keyof InvoiceRecord) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  useEffect(() => {
    setPage(1);
  }, [records.length, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pagedRecords = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return sorted.slice(start, start + PAGE_SIZE);
  }, [page, sorted]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-[#c8d6e8] bg-white p-12 text-center shadow-[0_14px_34px_rgba(15,42,85,0.12)] space-y-2">
        <p className="font-medium">No extracted invoices yet</p>
        <p className="text-sm text-muted-foreground">
          Upload invoice files on the left panel and click Extract All to populate this table.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#c8d6e8] bg-white shadow-[0_14px_32px_rgba(15,42,85,0.12)] scale-[1.005] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-[#f3f8ff] border-b border-[#d6e2f0]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold tracking-wide text-slate-600 uppercase w-12">#</th>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-4 py-3 text-xs font-bold tracking-wide text-slate-600 uppercase whitespace-nowrap",
                    col.numeric ? "text-right" : "text-left"
                  )}
                >
                  <button
                    onClick={() => handleSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 hover:text-slate-900",
                      col.numeric ? "justify-end w-full" : "justify-start"
                    )}
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-bold tracking-wide text-slate-600 uppercase">Status</th>
              <th className="px-4 py-3 w-[170px] text-right text-xs font-bold tracking-wide text-slate-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr className="border-b">
                <td colSpan={COLUMNS.length + 3} className="px-3 py-3">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                  </div>
                </td>
              </tr>
            )}
            {pagedRecords.map((rec, idx) => (
              <tr
                key={rec.id}
                className={cn(
                  "border-b border-[#e3ecf7] last:border-0 hover:bg-[#f8fbff] transition-smooth cursor-pointer",
                  selectedRecordId === rec.id && "bg-[#eef5ff]"
                )}
                onClick={() => onSelectRecord(rec.id)}
                title="Click to open details"
              >
                <td className={cn("text-muted-foreground align-middle", compact ? "px-3 py-2" : "px-4 py-2.5")}>
                  {(page - 1) * PAGE_SIZE + idx + 1}
                </td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className={cn("align-middle", compact ? "px-3 py-2" : "px-4 py-2.5")}>
                    <div className={cn("truncate", col.numeric ? "text-right tabular-nums" : "text-left")}>
                      {col.numeric ? formatNumeric(rec[col.key]) : String(rec[col.key] ?? "-")}
                    </div>
                  </td>
                ))}
                <td className={cn("align-middle", compact ? "px-3 py-2" : "px-4 py-2.5")}>
                  {rec.status === "processing" && (
                    <span className="inline-flex items-center gap-1 text-warning text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" /> Processing
                    </span>
                  )}
                  {rec.status === "extracted" && (
                    <span className="inline-flex items-center gap-1 text-success text-xs">
                      <CheckCircle2 className="h-3 w-3" /> Extracted
                    </span>
                  )}
                  {rec.status === "failed" && (
                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1 text-destructive text-xs" title={rec.error}>
                        <XCircle className="h-3 w-3" /> Failed
                      </span>
                      {rec.error && (
                        <p className="text-[11px] text-muted-foreground max-w-[220px] truncate">{rec.error}</p>
                      )}
                    </div>
                  )}
                </td>
                <td className={cn("whitespace-nowrap align-middle text-right", compact ? "px-3 py-2" : "px-4 py-2.5")}>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenDetails(rec.id);
                      }}
                    >
                      Details
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenExcelPreview(rec.id);
                      }}
                      title="Preview and download single-invoice Excel"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {rec.status === "failed" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        disabled={!retryableIds.has(rec.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetry(rec.id);
                        }}
                        title={
                          retryableIds.has(rec.id)
                            ? "Retry extraction"
                            : "Retry available for current-session files only"
                        }
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(rec.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="border-t border-[#d6e2f0] px-3 py-2 flex items-center justify-between text-xs text-muted-foreground bg-[#f9fbff]">
        <span>
          Page {page} / {totalPages} · {sorted.length} record(s)
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
