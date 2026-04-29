import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiLog } from "@/lib/gemini";
import { InvoiceRecord } from "@/pages/Index";

interface Props {
  record: InvoiceRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updated: InvoiceRecord) => void;
  logTrace: ApiLog[];
  loadingTrace: boolean;
  onRetry: () => void;
  canRetry: boolean;
}

const NUMERIC_FIELDS: { key: keyof InvoiceRecord; label: string }[] = [
  { key: "taxable_amount", label: "Taxable Amount" },
  { key: "cgst", label: "CGST" },
  { key: "sgst", label: "SGST" },
  { key: "igst", label: "IGST" },
  { key: "total_amount", label: "Total Amount" },
];

const TEXT_FIELDS: { key: keyof InvoiceRecord; label: string }[] = [
  { key: "invoice_number", label: "Invoice Number" },
  { key: "invoice_date", label: "Invoice Date" },
  { key: "seller_name", label: "Seller Name" },
  { key: "seller_gstin", label: "Seller GSTIN" },
  { key: "buyer_name", label: "Buyer Name" },
  { key: "buyer_gstin", label: "Buyer GSTIN" },
  { key: "currency", label: "Currency" },
];

export const InvoiceDetailsDialog = ({
  record,
  open,
  onOpenChange,
  onSave,
  logTrace,
  loadingTrace,
  onRetry,
  canRetry,
}: Props) => {
  const [draft, setDraft] = useState<InvoiceRecord | null>(record);

  useEffect(() => {
    setDraft(record);
  }, [record, open]);

  const isDirty = useMemo(() => {
    if (!record || !draft) return false;
    return JSON.stringify(draft) !== JSON.stringify(record);
  }, [draft, record]);

  if (!record || !draft) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Invoice Details</DialogTitle>
          <DialogDescription className="break-all">{record.fileName}</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-3">
          {TEXT_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label>{field.label}</Label>
              <Input
                value={String(draft[field.key] ?? "")}
                onChange={(e) =>
                  setDraft((prev) => (prev ? { ...prev, [field.key]: e.target.value || null } : prev))
                }
              />
            </div>
          ))}
          {NUMERIC_FIELDS.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label>{field.label}</Label>
              <Input
                type="number"
                value={draft[field.key] == null ? "" : String(draft[field.key])}
                onChange={(e) =>
                  setDraft((prev) =>
                    prev ? { ...prev, [field.key]: e.target.value === "" ? null : Number(e.target.value) } : prev
                  )
                }
              />
            </div>
          ))}
        </div>

        {draft.status === "failed" && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">Extraction failed</p>
            <p className="mt-1 text-muted-foreground">{draft.error || "Unknown error"}</p>
            <div className="mt-2">
              <Button size="sm" onClick={onRetry} disabled={!canRetry}>
                Retry extraction
              </Button>
              {!canRetry && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Retry is available only for files in current session.
                </p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-md border">
          <div className="border-b px-3 py-2 text-sm font-medium">Log Trace</div>
          <ScrollArea className="h-40 p-3">
            {loadingTrace ? (
              <p className="text-sm text-muted-foreground">Loading log trace...</p>
            ) : logTrace.length === 0 ? (
              <p className="text-sm text-muted-foreground">No related logs found.</p>
            ) : (
              <div className="space-y-2">
                {logTrace.map((log) => (
                  <div key={log.id} className="text-xs rounded-md border p-2">
                    <p className="font-medium">
                      {new Date(log.timestamp).toLocaleString()} - {log.level.toUpperCase()}
                    </p>
                    <p className="mt-1">{log.message}</p>
                    {log.meta && (
                      <p className="mt-1 text-muted-foreground break-all">
                        {JSON.stringify(log.meta)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setDraft(record);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (draft) onSave(draft);
              onOpenChange(false);
            }}
            disabled={!isDirty}
          >
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
