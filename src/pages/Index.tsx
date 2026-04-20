import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Settings, Moon, Sun, Trash, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { ApiKeyDialog } from "@/components/ApiKeyDialog";
import { UploadZone } from "@/components/UploadZone";
import { StatsCards } from "@/components/StatsCards";
import { InvoiceTable } from "@/components/InvoiceTable";
import { extractInvoice, validateApiKey, InvoiceData } from "@/lib/gemini";
import { exportToExcel } from "@/lib/excel";
import { useTheme } from "@/hooks/useTheme";

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

const STORAGE_KEY = "gst_invoice_records";
const API_KEY_STORAGE = "gemini_api_key";

const Index = () => {
  const { theme, toggle } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [files, setFiles] = useState<PendingFile[]>([]);
  const [records, setRecords] = useState<InvoiceRecord[]>([]);
  const [processing, setProcessing] = useState(false);

  // Load persisted state
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    setApiKey(savedKey);
    if (savedKey) validateApiKey(savedKey).then(setApiKeyValid);
    else setShowSettings(true);

    const savedRecords = localStorage.getItem(STORAGE_KEY);
    if (savedRecords) {
      try {
        const parsed = JSON.parse(savedRecords) as InvoiceRecord[];
        // mark any stale "processing" as failed
        setRecords(parsed.map((r) => (r.status === "processing" ? { ...r, status: "failed", error: "Interrupted" } : r)));
      } catch {}
    }
  }, []);

  // Persist records
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem(API_KEY_STORAGE, key);
    validateApiKey(key).then(setApiKeyValid);
  };

  const handleAddFiles = (newFiles: File[]) => {
    setFiles((prev) => [
      ...prev,
      ...newFiles.map((file) => ({ id: crypto.randomUUID(), file })),
    ]);
  };

  const handleExtract = async () => {
    if (!apiKey) {
      toast.error("Please set your Gemini API key first");
      setShowSettings(true);
      return;
    }
    if (files.length === 0) return;

    setProcessing(true);
    const toProcess = files;
    setFiles([]);

    // Add placeholder records
    const placeholders: InvoiceRecord[] = toProcess.map((f) => ({
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

    // Process in parallel (limited concurrency could be added)
    await Promise.all(
      toProcess.map(async (pf) => {
        try {
          const data = await extractInvoice(pf.file, apiKey);
          setRecords((prev) =>
            prev.map((r) =>
              r.id === pf.id ? { ...r, ...data, status: "extracted" as const } : r
            )
          );
        } catch (e: any) {
          console.error("Extraction failed:", e);
          setRecords((prev) =>
            prev.map((r) =>
              r.id === pf.id ? { ...r, status: "failed" as const, error: e.message } : r
            )
          );
          toast.error(`Failed: ${pf.file.name}`, { description: e.message?.slice(0, 100) });
        }
      })
    );

    setProcessing(false);
    toast.success("Extraction complete");
  };

  const handleUpdate = (id: string, field: keyof InvoiceRecord, value: any) => {
    setRecords((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  const handleDelete = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    toast.success("Record deleted");
  };

  const handleClearHistory = () => {
    if (confirm("Clear all extracted records? This cannot be undone.")) {
      setRecords([]);
      toast.success("History cleared");
    }
  };

  const handleExport = () => {
    if (records.length === 0) {
      toast.error("No records to export");
      return;
    }
    exportToExcel(records);
    toast.success("Excel file downloaded");
  };

  const stats = useMemo(() => {
    const extracted = records.filter((r) => r.status === "extracted");
    const sum = (k: keyof InvoiceRecord) =>
      extracted.reduce((acc, r) => acc + (Number(r[k]) || 0), 0);
    return {
      totalInvoices: extracted.length,
      totalTaxable: sum("taxable_amount"),
      totalGst: sum("cgst") + sum("sgst") + sum("igst"),
      totalValue: sum("total_amount"),
    };
  }, [records]);

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container max-w-7xl mx-auto py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-elegant">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">GST Invoice Extractor</h1>
              <p className="text-xs text-muted-foreground">AI-powered invoice data extraction</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              API Key
              {apiKeyValid === true && <span className="ml-2 text-success">✓</span>}
              {apiKeyValid === false && <span className="ml-2 text-destructive">✗</span>}
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto py-8 space-y-8">
        <StatsCards {...stats} />

        <section>
          <h2 className="text-lg font-semibold mb-3">Upload Invoices</h2>
          <UploadZone
            files={files}
            onAdd={handleAddFiles}
            onRemove={(id) => setFiles((prev) => prev.filter((f) => f.id !== id))}
            onExtract={handleExtract}
            processing={processing}
            hasApiKey={!!apiKey}
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Extracted Records</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleClearHistory} disabled={records.length === 0}>
                <Trash className="h-4 w-4 mr-2" />
                Clear History
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                disabled={records.length === 0}
                className="gradient-primary text-primary-foreground hover:opacity-90"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Excel
              </Button>
            </div>
          </div>
          <InvoiceTable records={records} onUpdate={handleUpdate} onDelete={handleDelete} />
        </section>
      </main>

      <ApiKeyDialog
        open={showSettings}
        onOpenChange={setShowSettings}
        apiKey={apiKey}
        onSave={handleSaveKey}
        isValid={apiKeyValid}
      />
    </div>
  );
};

export default Index;
