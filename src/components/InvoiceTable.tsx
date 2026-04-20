import { useState } from "react";
import { Trash2, Loader2, CheckCircle2, XCircle, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { InvoiceRecord } from "@/pages/Index";

interface Props {
  records: InvoiceRecord[];
  onUpdate: (id: string, field: keyof InvoiceRecord, value: any) => void;
  onDelete: (id: string) => void;
}

const COLUMNS: { key: keyof InvoiceRecord; label: string; numeric?: boolean }[] = [
  { key: "fileName", label: "File Name" },
  { key: "invoice_number", label: "Invoice #" },
  { key: "invoice_date", label: "Date" },
  { key: "seller_name", label: "Seller" },
  { key: "seller_gstin", label: "Seller GSTIN" },
  { key: "buyer_name", label: "Buyer" },
  { key: "buyer_gstin", label: "Buyer GSTIN" },
  { key: "taxable_amount", label: "Taxable", numeric: true },
  { key: "cgst", label: "CGST", numeric: true },
  { key: "sgst", label: "SGST", numeric: true },
  { key: "igst", label: "IGST", numeric: true },
  { key: "total_amount", label: "Total", numeric: true },
];

export const InvoiceTable = ({ records, onUpdate, onDelete }: Props) => {
  const [sortKey, setSortKey] = useState<keyof InvoiceRecord | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

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

  if (records.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-12 text-center shadow-card">
        <p className="text-muted-foreground">No invoices yet. Upload some to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-3 py-3 text-left font-medium text-muted-foreground w-12">#</th>
              {COLUMNS.map((col) => (
                <th key={col.key} className="px-3 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                  <button
                    onClick={() => handleSort(col.key)}
                    className="inline-flex items-center gap-1 hover:text-foreground"
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </th>
              ))}
              <th className="px-3 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-3 py-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((rec, idx) => (
              <tr key={rec.id} className="border-b last:border-0 hover:bg-muted/30 transition-smooth">
                <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                {COLUMNS.map((col) => (
                  <td key={col.key} className="px-1 py-1 max-w-[200px]">
                    <input
                      value={(rec[col.key] as any) ?? ""}
                      onChange={(e) =>
                        onUpdate(
                          rec.id,
                          col.key,
                          col.numeric ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value
                        )
                      }
                      type={col.numeric ? "number" : "text"}
                      disabled={rec.status === "processing"}
                      className={cn(
                        "w-full bg-transparent px-2 py-1.5 rounded-md border border-transparent",
                        "focus:border-primary focus:outline-none focus:bg-background",
                        "hover:border-border transition-smooth",
                        col.numeric && "text-right tabular-nums"
                      )}
                    />
                  </td>
                ))}
                <td className="px-3 py-2">
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
                    <span className="inline-flex items-center gap-1 text-destructive text-xs" title={rec.error}>
                      <XCircle className="h-3 w-3" /> Failed
                    </span>
                  )}
                </td>
                <td className="px-2 py-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => onDelete(rec.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
