import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, ChevronLeft, ChevronRight, Download, RefreshCw, Trash2 } from "lucide-react";
import { ApiLog } from "@/lib/gemini";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useMemo, useState } from "react";

interface Props {
  logs: ApiLog[];
  loading: boolean;
  onRefresh: () => void;
  onClear: () => void;
  onExportCsv: () => void;
  clearing: boolean;
  level: "all" | "info" | "error";
  date: string;
  availableDates: string[];
  onLevelChange: (value: "all" | "info" | "error") => void;
  onDateChange: (value: string) => void;
  onClearFilters: () => void;
  page: number;
  total: number;
  pageSize: number;
  hasMore: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export const LogsPanel = ({
  logs,
  loading,
  onRefresh,
  onClear,
  onExportCsv,
  clearing,
  level,
  date,
  availableDates,
  onLevelChange,
  onDateChange,
  onClearFilters,
  page,
  total,
  pageSize,
  hasMore,
  onPrevPage,
  onNextPage,
}: Props) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const availableDateSet = useMemo(() => new Set(availableDates), [availableDates]);

  const toKey = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const selectedDate = useMemo(() => {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
    const parsed = new Date(`${date}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [date]);

  const displayDate = date
    ? (() => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
        const [yyyy, mm, dd] = date.split("-");
        return `${dd}-${mm}-${yyyy}`;
      })()
    : "Select date";

  return (
    <section>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Backend Logs</h2>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <select
            className="h-9 rounded-md border bg-background px-3 text-sm w-full sm:w-auto"
            value={level}
            onChange={(e) => onLevelChange(e.target.value as "all" | "info" | "error")}
            title="Log level filter"
          >
            <option value="all">All</option>
            <option value="info">Info</option>
            <option value="error">Error</option>
          </select>
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto justify-start font-normal"
                title="Filter by local date"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                {displayDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(picked) => {
                  if (!picked) return;
                  const key = toKey(picked);
                  if (!availableDateSet.has(key)) return;
                  onDateChange(key);
                  setCalendarOpen(false);
                }}
                disabled={(picked) => !availableDateSet.has(toKey(picked))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button variant="outline" size="sm" onClick={onClearFilters} className="w-full sm:w-auto">
            Clear Filters
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCsv} className="w-full sm:w-auto">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onClear} disabled={clearing} className="w-full sm:w-auto">
            <Trash2 className="h-4 w-4 mr-2" />
            {clearing ? "Clearing..." : "Clear Logs"}
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading} className="w-full sm:w-auto">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>
      <div className="rounded-xl border bg-card shadow-card">
        <ScrollArea className="h-56">
          <div className="p-3 space-y-2">
            {logs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No logs yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="rounded-md border px-3 py-2 text-xs">
                  <p className="font-medium">
                    {new Date(log.timestamp).toLocaleString()} ·{" "}
                    <span className={log.level === "error" ? "text-destructive" : "text-primary"}>
                      {log.level.toUpperCase()}
                    </span>
                  </p>
                  <p className="mt-1">{log.message}</p>
                  {log.meta && (
                    <p className="mt-1 text-muted-foreground break-all">
                      {JSON.stringify(log.meta)}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <div className="border-t px-3 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            Page {page} / {totalPages} · {total} log(s)
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPrevPage} disabled={page <= 1 || loading}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Prev
            </Button>
            <Button variant="outline" size="sm" onClick={onNextPage} disabled={!hasMore || loading}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
