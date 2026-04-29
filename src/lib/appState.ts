export const STORAGE_KEY = "gst_invoice_records";
export const API_KEY_STORAGE = "gemini_api_key";
export const APP_PREFS_STORAGE = "gst_app_preferences";

export interface AppPreferences {
  autoRefreshLogs: boolean;
  compactTable: boolean;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  autoRefreshLogs: true,
  compactTable: true,
};

export function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(APP_PREFS_STORAGE);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw) as Partial<AppPreferences>;
    return {
      autoRefreshLogs:
        typeof parsed.autoRefreshLogs === "boolean"
          ? parsed.autoRefreshLogs
          : DEFAULT_PREFERENCES.autoRefreshLogs,
      compactTable:
        typeof parsed.compactTable === "boolean"
          ? parsed.compactTable
          : DEFAULT_PREFERENCES.compactTable,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(preferences: AppPreferences) {
  localStorage.setItem(APP_PREFS_STORAGE, JSON.stringify(preferences));
}
