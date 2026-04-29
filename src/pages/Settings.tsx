import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getBackendHealth, validateApiKey } from "@/lib/gemini";
import { API_KEY_STORAGE, loadPreferences, savePreferences } from "@/lib/appState";
import { BrandBackground } from "@/components/BrandBackground";

const Settings = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const [hasServerApiKey, setHasServerApiKey] = useState(false);
  const [validating, setValidating] = useState(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [compactTable, setCompactTable] = useState(true);

  const refreshBackendHealth = async () => {
    try {
      const health = await getBackendHealth();
      setBackendOnline(health.ok);
      setHasServerApiKey(health.hasServerApiKey);
    } catch {
      setBackendOnline(false);
      setHasServerApiKey(false);
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    setApiKey(savedKey);
    if (savedKey) validateApiKey(savedKey).then(setApiKeyValid);

    const preferences = loadPreferences();
    setAutoRefreshLogs(preferences.autoRefreshLogs);
    setCompactTable(preferences.compactTable);

    refreshBackendHealth();
  }, []);

  const handleSaveApiKey = async () => {
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    if (!apiKey.trim()) {
      setApiKeyValid(null);
      toast.success("API key cleared");
      return;
    }
    setValidating(true);
    const ok = await validateApiKey(apiKey.trim());
    setValidating(false);
    setApiKeyValid(ok);
    if (ok) toast.success("API key saved and validated");
    else toast.error("API key saved, but validation failed");
  };

  const handleSavePreferences = () => {
    savePreferences({ autoRefreshLogs, compactTable });
    toast.success("Preferences saved");
  };

  return (
    <div className="min-h-screen bg-[#edf2f8] relative flex flex-col">
      <BrandBackground variant="app-surface" />
      <AppHeader
        title="Settings"
        subtitle="Manage API key, backend status, and app preferences"
      />

      <main className="relative z-10 container max-w-4xl mx-auto py-8 space-y-6 flex-1">
        <section className="rounded-xl border bg-card p-5 shadow-card space-y-4">
          <div>
            <h2 className="text-lg font-semibold">API Configuration</h2>
            <p className="text-sm text-muted-foreground">
              Store your Gemini API key locally in this browser.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-key">Gemini API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveApiKey} disabled={validating}>
              {validating ? "Validating..." : "Save API Key"}
            </Button>
            {apiKeyValid === true && <Badge>Valid key</Badge>}
            {apiKeyValid === false && <Badge variant="destructive">Invalid key</Badge>}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-card space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Backend Status</h2>
            <p className="text-sm text-muted-foreground">
              Backend is required for extraction and logs.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={backendOnline ? "default" : "destructive"}>
              {backendOnline ? "Online" : "Offline"}
            </Badge>
            <Badge variant={hasServerApiKey ? "secondary" : "outline"}>
              {hasServerApiKey ? "Server key configured" : "No server key in .env"}
            </Badge>
            <Button variant="outline" onClick={refreshBackendHealth}>
              Refresh Status
            </Button>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-card space-y-4">
          <div>
            <h2 className="text-lg font-semibold">App Preferences</h2>
            <p className="text-sm text-muted-foreground">
              Fine tune default behavior for logs and tables.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium text-sm">Auto refresh logs</p>
              <p className="text-xs text-muted-foreground">Refresh logs page every 5 seconds.</p>
            </div>
            <Switch checked={autoRefreshLogs} onCheckedChange={setAutoRefreshLogs} />
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <p className="font-medium text-sm">Compact records table</p>
              <p className="text-xs text-muted-foreground">Use denser row spacing in dashboard table.</p>
            </div>
            <Switch checked={compactTable} onCheckedChange={setCompactTable} />
          </div>

          <Button onClick={handleSavePreferences}>Save Preferences</Button>
        </section>
      </main>
    </div>
  );
};

export default Settings;
