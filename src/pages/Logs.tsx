import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LogsPanel } from "@/components/LogsPanel";
import { AppHeader } from "@/components/AppHeader";
import {
  ApiLog,
  clearLogs,
  getBackendHealth,
  getLogDates,
  getLogs,
  getLogsCsvUrl,
  LogQuery,
} from "@/lib/gemini";
import { loadPreferences } from "@/lib/appState";
import { BrandBackground } from "@/components/BrandBackground";

const LOG_PAGE_SIZE = 20;
const normalizeLogDate = (value: string) => {
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
    const [dd, mm, yyyy] = raw.split("-");
    return `${yyyy}-${mm}-${dd}`;
  }
  return "";
};

const Logs = () => {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsClearing, setLogsClearing] = useState(false);
  const [logLevel, setLogLevel] = useState<"all" | "info" | "error">("all");
  const [logDate, setLogDate] = useState("");
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [backendOnline, setBackendOnline] = useState(false);
  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);

  const logQuery = useMemo<LogQuery>(() => {
    return {
      limit: LOG_PAGE_SIZE,
      offset: (logsPage - 1) * LOG_PAGE_SIZE,
      level: logLevel,
      from: normalizeLogDate(logDate) || undefined,
      to: normalizeLogDate(logDate) || undefined,
    };
  }, [logDate, logLevel, logsPage]);

  const refreshLogs = useCallback(async () => {
    try {
      setLogsLoading(true);
      const [response, dates] = await Promise.all([getLogs(logQuery), getLogDates(logLevel)]);
      setLogs(response.logs);
      setLogsTotal(response.total);
      setAvailableDates(dates);
      if (logDate && !dates.includes(logDate)) {
        setLogDate("");
      }
    } catch {
      // Keep page usable even if logs endpoint is temporarily unavailable.
    } finally {
      setLogsLoading(false);
    }
  }, [logQuery]);

  useEffect(() => {
    const preferences = loadPreferences();
    setAutoRefreshLogs(preferences.autoRefreshLogs);

    getBackendHealth()
      .then((health) => setBackendOnline(health.ok))
      .catch(() => setBackendOnline(false));
  }, []);

  useEffect(() => {
    refreshLogs();
  }, [refreshLogs]);

  useEffect(() => {
    if (!autoRefreshLogs) return;
    const timer = setInterval(() => {
      refreshLogs();
    }, 5000);
    return () => clearInterval(timer);
  }, [autoRefreshLogs, refreshLogs]);

  const handleClearLogs = async () => {
    if (!confirm("Clear all backend logs?")) return;
    try {
      setLogsClearing(true);
      await clearLogs();
      setLogsPage(1);
      await refreshLogs();
      toast.success("Logs cleared");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to clear logs";
      toast.error(message);
    } finally {
      setLogsClearing(false);
    }
  };

  const handleExportLogsCsv = () => {
    window.open(getLogsCsvUrl({ ...logQuery, limit: 300 }), "_blank");
  };

  return (
    <div className="min-h-screen bg-[#edf2f8] relative flex flex-col">
      <BrandBackground variant="app-surface" />
      <AppHeader
        title="Backend Logs"
        subtitle="Operational logs, filters,and exports"
        actions={
          <span className={`text-xs ${backendOnline ? "text-success" : "text-destructive"}`}>
            {backendOnline ? "Backend Online" : "Backend Offline"}
          </span>
        }
      />

      <main className="relative z-10 container max-w-7xl mx-auto py-8 space-y-8 flex-1">
        <LogsPanel
          logs={logs}
          loading={logsLoading}
          onRefresh={refreshLogs}
          onClear={handleClearLogs}
          onExportCsv={handleExportLogsCsv}
          clearing={logsClearing}
          level={logLevel}
          date={logDate}
          availableDates={availableDates}
          onLevelChange={(value) => {
            setLogLevel(value);
            setLogsPage(1);
          }}
          onDateChange={(value) => {
            setLogDate(value);
            setLogsPage(1);
          }}
          onClearFilters={() => {
            setLogLevel("all");
            setLogDate("");
            setLogsPage(1);
          }}
          page={logsPage}
          total={logsTotal}
          pageSize={LOG_PAGE_SIZE}
          hasMore={logsPage * LOG_PAGE_SIZE < logsTotal}
          onPrevPage={() => setLogsPage((p) => Math.max(1, p - 1))}
          onNextPage={() => setLogsPage((p) => p + 1)}
        />
      </main>
    </div>
  );
};

export default Logs;
