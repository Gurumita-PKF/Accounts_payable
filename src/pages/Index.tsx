import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Lightbulb, Search, Trash } from "lucide-react";
import { toast } from "sonner";
import { UploadZone } from "@/components/UploadZone";
import { StatsCards } from "@/components/StatsCards";
import { InvoiceTable } from "@/components/InvoiceTable";
import { InvoiceCards } from "@/components/InvoiceCards";
import { extractInvoice, InvoiceData, getBackendHealth, getLogs, ApiLog } from "@/lib/gemini";
import { exportSingleInvoiceToExcel, exportToExcel } from "@/lib/excel";
import { AppHeader } from "@/components/AppHeader";
import { Link } from "react-router-dom";
import { API_KEY_STORAGE, STORAGE_KEY, loadPreferences } from "@/lib/appState";
import { RecentActivity } from "@/components/RecentActivity";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { InvoiceExcelPreviewDialog } from "@/components/InvoiceExcelPreviewDialog";
import { BrandBackground } from "@/components/BrandBackground";

export interface InvoiceRecord extends InvoiceData {
  id: string;
  fileName: string;
  status: "processing" | "extracted" | "failed";
  error?: string;
}

interface PendingFile {
  id: string;
  file: File;
}

const Index = () => {
  const [apiKey, setApiKey] = useState("");
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  const [processing, setProcessing] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [hasServerApiKey, setHasServerApiKey] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"all" | InvoiceRecord["status"]>("all");
  const [search, setSearch] = useState("");
  const [recordsView, setRecordsView] = useState<"cards" | "table">("cards");
  const [compactTable, setCompactTable] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [excelPreviewOpen, setExcelPreviewOpen] = useState(false);
  const [excelPreviewRecordId, setExcelPreviewRecordId] = useState<string | null>(null);
  const [traceLogs, setTraceLogs] = useState<ApiLog[]>([]);
  const [traceLoading, setTraceLoading] = useState(false);
  const fileCacheRef = useRef<Map<string, File>>(new Map());

  // Load persisted state
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    setApiKey(savedKey);
    const preferences = loadPreferences();
    setCompactTable(preferences.compactTable);

    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords) as InvoiceRecord[];
        // mark any stale "processing" as failed
        setRecords(parsed.map((r) => (r.status === "processing" ? { ...r, status: "failed", error: "Interrupted" } : r)));
      } catch {
        setRecords([]);
      }
    }

    getBackendHealth()
      .then((health) => {
        setBackendOnline(health.ok);
        setHasServerApiKey(health.hasServerApiKey);
      })
      .catch(() => {
        setBackendOnline(false);
      });
  }, []);

  // Persist records
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleAddFiles = (newFiles: File[]) => {
    const mapped = newFiles.map((file) => ({ id: crypto.randomUUID(), file }));
    mapped.forEach((item) => fileCacheRef.current.set(item.id, item.file));
    setFiles((prev) => [...prev, ...mapped]);
  };

  const runExtraction = async (toProcess: PendingFile[]) => {
    if (!backendOnline) {
      toast.error("Backend is not running. Start backend with npm run server.");
      return;
    }
    if (!apiKey && !hasServerApiKey) {
      toast.error("Set API key from Settings to continue.");
      return;
    }
    if (toProcess.length === 0) return;

    setProcessing(true);
    setFiles((prev) => prev.filter((f) => !toProcess.some((p) => p.id === f.id)));

    const existingIds = new Set(records.map((r) => r.id));
    setRecords((prev) =>
      prev.map((r) =>
        toProcess.some((p) => p.id === r.id)
          ? { ...r, status: "processing", error: undefined }
          : r
      )
    );

    // Add placeholder records
    const placeholders: InvoiceRecord[] = toProcess
      .filter((f) => !existingIds.has(f.id))
      .map((f) => ({
      id: f.id,
      fileName: f.file.name,
      status: "processing",
      invoice_number: null,
      invoice_date: null,
      seller_name: null,
      seller_gstin: null,
      buyer_name: null,
      buyer_gstin: null,
      taxable_amount: null,
      cgst: null,
      sgst: null,
      igst: null,
      total_amount: null,
      currency: null,
      }));
    setRecords((prev) => [...placeholders, ...prev]);

    let failedCount = 0;
    await Promise.all(
      toProcess.map(async (pf) => {
        try {
          const data = await extractInvoice(pf.file, apiKey);
          setRecords((prev) =>
            prev.map((r) =>
              r.id === pf.id ? { ...r, ...data, status: "extracted" as const } : r
            )
          );
        } catch (e) {
          const message = e instanceof Error ? e.message : "Unknown extraction error";
          console.error("Extraction failed:", e);
          failedCount += 1;
          setRecords((prev) =>
            prev.map((r) =>
              r.id === pf.id ? { ...r, status: "failed" as const, error: message } : r
            )
          );
        }
      })
    );

    setProcessing(false);
    if (failedCount > 0) toast.error(`${failedCount} invoice(s) failed. Review inline errors and retry.`);
    else toast.success("Extraction complete");
  };

  const handleExtract = async () => {
    await runExtraction(files);
  };

  const handleUpdate = (id: string, field: keyof InvoiceRecord, value: string | number | null) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    if (selectedRecordId === id) setSelectedRecordId(null);
    toast.success("Record deleted");
  };

  const handleClearHistory = () => {
    if (confirm("Clear all extracted records? This cannot be undone.")) {
      setRecords([]);
      setSelectedRecordId(null);
      toast.success("History cleared");
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      toast.error("No records to export");
      return;
    }
    exportToExcel(records)
      .then(() => toast.success("Excel file downloaded"))
      .catch((error) => {
        const message = error instanceof Error ? error.message : "Failed to export Excel";
        toast.error(message);
      });
  };

  const handleRetry = async (id: string) => {
    const file = fileCacheRef.current.get(id);
    if (!file) {
      toast.error("Retry unavailable for old sessions. Re-upload this invoice.");
      return;
    }
    await runExtraction([{ id, file }]);
  };

  const selectedRecord = useMemo(
    () => records.find((r) => r.id === selectedRecordId) || null,
    [records, selectedRecordId]
  );
  const excelPreviewRecord = useMemo(
    () => records.find((r) => r.id === excelPreviewRecordId) || null,
    [excelPreviewRecordId, records]
  );

  useEffect(() => {
    if (!detailsOpen || !selectedRecord) return;
    let alive = true;
    const loadTrace = async () => {
      try {
        setTraceLoading(true);
        const response = await getLogs({ limit: 300 });
        if (!alive) return;
        const filtered = response.logs.filter((log) => {
          const fileName = String((log.meta as { fileName?: string } | undefined)?.fileName || "");
          return fileName === selectedRecord.fileName;
        });
        setTraceLogs(filtered.slice(0, 20));
      } catch {
        if (alive) setTraceLogs([]);
      } finally {
        if (alive) setTraceLoading(false);
      }
    };
    loadTrace();
    return () => {
      alive = false;
    };
  }, [detailsOpen, selectedRecord]);

  const stats = useMemo(() => {
    const extracted = records.filter((r) => r.status === "extracted");
    const selected = extracted.find((r) => r.id === selectedRecordId) || null;
    const source = selected ? [selected] : extracted;
    const sum = (k: keyof InvoiceRecord) => source.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
    return {
      totalInvoices: extracted.length,
      totalTaxable: sum("taxable_amount"),
      totalGst: sum("cgst") + sum("sgst") + sum("igst"),
      totalValue: sum("total_amount"),
      scopeLabel: selected
        ? `Showing totals for selected invoice: ${selected.fileName}`
        : "Showing totals for all extracted invoices",
    };
  }, [records, selectedRecordId]);

  const canExtract = Boolean(apiKey) || hasServerApiKey;
  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    return records.filter((r) => {
      const statusOk = statusFilter === "all" ? true : r.status === statusFilter;
      if (!statusOk) return false;
      if (!term) return true;
      return [r.fileName, r.invoice_number, r.seller_gstin, r.buyer_gstin]
        .map((v) => String(v || "").toLowerCase())
        .some((value) => value.includes(term));
    });
  }, [records, search, statusFilter]);

  return (
    <div className="min-h-screen bg-[#edf2f8] relative flex flex-col">
      <BrandBackground variant="app-surface" />
      <AppHeader
        title="Accounts Payable"
        subtitle="Structured workspace for extraction and review"
      />

      <main className="relative z-10 container max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 space-y-6 flex-1 px-3 sm:px-4 md:px-6">
        <section className="grid gap-6 xl:grid-cols-12 items-start">
          <div className="xl:col-span-7">
            <section className="rounded-xl border border-[#c8d6e8] bg-[#f7fbff] p-4 sm:p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold">Upload & Extract</h2>
                  <p className="text-sm text-muted-foreground">
                    Drop invoice files and run extraction in one click.
                  </p>
                </div>
                {!canExtract && (
                  <Badge variant="outline" className="text-warning border-warning/40">
                    API key required
                  </Badge>
                )}
              </div>
              {!backendOnline && (
                <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
                  Backend is offline. Start it with `npm run server`.
                </div>
              )}
              {!canExtract && (
                <div className="rounded-md border p-3 text-sm">
                  Configure your key from{" "}
                  <Link to="/settings" className="text-primary underline">
                    Settings
                  </Link>{" "}
                  before extraction.
                </div>
              )}
              <UploadZone
                files={files}
                onAdd={handleAddFiles}
                onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
                onExtract={handleExtract}
                processing={processing}
                hasApiKey={canExtract}
              />
            </section>
          </div>

          <div className="xl:col-span-5">
            <StatsCards {...stats} loading={processing} />
          </div>
        </section>

        <section className="rounded-xl border border-[#c8d6e8] bg-[#f7fbff] shadow-sm">
          <div className="border-b border-[#d6e2f0] p-3 sm:p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-semibold">Extracted Records</h2>
                <p className="text-xs text-muted-foreground">
                  Compact table with quick filters. Click row for full details.
                </p>
              </div>
              <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-2">
                <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={records.length === 0}>
                  <Trash className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
                <Button
                  size="sm"
                  onClick={handleExport}
                  disabled={records.length === 0}
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Download All Excel
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 overflow-x-auto pb-1">
                <div className="inline-flex rounded-md border overflow-hidden shrink-0">
                <Button
                  size="sm"
                  variant={recordsView === "cards" ? "default" : "ghost"}
                  className="rounded-none"
                  onClick={() => setRecordsView("cards")}
                >
                  Cards
                </Button>
                <Button
                  size="sm"
                  variant={recordsView === "table" ? "default" : "ghost"}
                  className="rounded-none border-l"
                  onClick={() => setRecordsView("table")}
                >
                  Table
                </Button>
                </div>
                {(["all", "processing", "extracted", "failed"] as const).map((status) => (
                  <Button
                    key={status}
                    size="sm"
                    variant={statusFilter === status ? "default" : "outline"}
                    className={`shrink-0 ${
                      statusFilter === status
                        ? status === "processing"
                          ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                          : status === "extracted"
                            ? "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent"
                            : status === "failed"
                              ? "bg-red-600 hover:bg-red-700 text-white border-transparent"
                              : "bg-[#2f88db] hover:bg-[#2678c3] text-white border-transparent"
                        : ""
                    }`}
                    onClick={() => setStatusFilter(status)}
                  >
                    {status === "all" ? "All" : status[0].toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
              <div className="relative w-full sm:min-w-[240px] sm:flex-1 sm:max-w-md">
                <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8 h-9"
                  placeholder="Search file, invoice, GSTIN..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {recordsView === "cards" ? (
              <InvoiceCards
                records={filteredRecords}
                onDelete={handleDelete}
                onRetry={handleRetry}
                onOpenDetails={(id) => {
                  setSelectedRecordId(id);
                  setDetailsOpen(true);
                }}
                onOpenExcelPreview={(id) => {
                  setExcelPreviewRecordId(id);
                  setExcelPreviewOpen(true);
                }}
                retryableIds={new Set(Array.from(fileCacheRef.current.keys()))}
                loading={processing}
              />
            ) : (
              <InvoiceTable
                records={filteredRecords}
                onDelete={handleDelete}
                selectedRecordId={selectedRecordId}
                onSelectRecord={(id) => {
                  setSelectedRecordId(id);
                  setDetailsOpen(true);
                }}
                onOpenDetails={(id) => {
                  setSelectedRecordId(id);
                  setDetailsOpen(true);
                }}
                onRetry={handleRetry}
                onOpenExcelPreview={(id) => {
                  setExcelPreviewRecordId(id);
                  setExcelPreviewOpen(true);
                }}
                retryableIds={new Set(Array.from(fileCacheRef.current.keys()))}
                compact={compactTable}
                loading={processing}
              />
            )}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <RecentActivity records={records} loading={processing} />
          <section className="rounded-2xl border border-[#d7e1ee] bg-[#f2f6fb] p-4 lg:sticky lg:top-24 lg:self-start transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_16px_30px_rgba(15,42,85,0.12)]">
            <div>
            <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Quick Tips
            </h3>
            <ul className="text-sm text-slate-700 space-y-2">
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />Use clear file names so records are easier to search later.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />Upload multiple invoices in one batch to speed up processing.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />Review extracted GSTIN and invoice number before export.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />Open Details to verify errors and trace logs quickly.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />Retry failed records from the current session for fast recovery.</li>
              <li className="flex items-start gap-2"><span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-black shrink-0" />Save API key and table preferences once in Settings.</li>
            </ul>
            </div>
          </section>
        </section>
      </main>
      <InvoiceDetailsDialog
        record={selectedRecord}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onSave={(updated) => {
          setRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
          toast.success("Invoice details saved");
        }}
        logTrace={traceLogs}
        loadingTrace={traceLoading}
        onRetry={() => selectedRecord && handleRetry(selectedRecord.id)}
        canRetry={selectedRecord ? fileCacheRef.current.has(selectedRecord.id) : false}
      />
      <InvoiceExcelPreviewDialog
        open={excelPreviewOpen}
        record={excelPreviewRecord}
        onOpenChange={setExcelPreviewOpen}
        onDownload={async (record) => {
          try {
            await exportSingleInvoiceToExcel(record);
            toast.success(`Excel downloaded for ${record.fileName}`);
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to export invoice Excel";
            toast.error(message);
          }
        }}
      />
    </div>
  );
};

export default Index;
