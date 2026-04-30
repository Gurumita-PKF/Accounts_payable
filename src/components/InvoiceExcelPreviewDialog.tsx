import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InvoiceRecord } from "@/pages/Index";
import { InvoiceExcelRow, toInvoiceExcelRow } from "@/lib/excel";

interface Props {
  open: boolean;
  record: InvoiceRecord | null;
  onOpenChange: (open: boolean) => void;
  onDownload: (record: InvoiceRecord) => Promise<void> | void;
}

const TEXT_FIELDS: { key: keyof InvoiceRecord; label: string }[] = [
  { key: "fileName", label: "File Name" },
  { key: "invoice_number", label: "Invoice Number" },
  { key: "invoice_date", label: "Invoice Date" },
  { key: "seller_name", label: "Seller Name" },
  { key: "seller_gstin", label: "Seller GSTIN" },
  { key: "buyer_name", label: "Buyer Name" },
  { key: "buyer_gstin", label: "Buyer GSTIN" },
  { key: "currency", label: "Currency" },
];

const NUMERIC_FIELDS: { key: keyof InvoiceRecord; label: string }[] = [
  { key: "taxable_amount", label: "Taxable Amount" },
  { key: "cgst", label: "CGST" },
  { key: "sgst", label: "SGST" },
  { key: "igst", label: "IGST" },
  { key: "total_amount", label: "Total Amount" },
];

export const InvoiceExcelPreviewDialog = ({ open, record, onOpenChange, onDownload }: Props) => {
  const [draft, setDraft] = useState<InvoiceRecord | null>(record);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setDraft(record);
  }, [record, open]);

  const previewRow = useMemo<InvoiceExcelRow | null>(() => {
    if (!draft) return null;
    return toInvoiceExcelRow(draft);
  }, [draft]);

  if (!record || !draft || !previewRow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Excel Preview (Single Invoice)</DialogTitle>
          <DialogDescription>
            Edit values below, verify preview, and download this one invoice as Excel.
          </DialogDescription>
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

        <div className="rounded-md border overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/50">
              <tr>
                {Object.keys(previewRow).map((header) => (
                  <th key={header} className="px-2 py-2 text-left whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {Object.values(previewRow).map((value, idx) => (
                  <td key={idx} className="px-2 py-2 whitespace-nowrap border-t">
                    {value == null || value === "" ? "-" : String(value)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            disabled={downloading}
            onClick={() => {
              const result = onDownload(draft);
              if (result && typeof (result as Promise<void>).then === "function") {
                setDownloading(true);
                (result as Promise<void>)
                  .then(() => onOpenChange(false))
                  .finally(() => setDownloading(false));
                return;
              }
              onOpenChange(false);
            }}
            className="w-full sm:w-auto"
          >
            {downloading ? "Downloading..." : "Download Excel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
