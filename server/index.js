import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 5000);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const JWT_SECRET = process.env.JWT_SECRET || "";
const MODEL_CANDIDATES = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash",
];
const PROMPT =
  "You are a GST invoice data extractor. Extract the following fields from this invoice and return ONLY a valid JSON object with no extra text: invoice_number, invoice_date, seller_name, seller_gstin, buyer_name, buyer_gstin, taxable_amount, cgst, sgst, igst, total_amount, currency. If a field is not found, return null for that field.";
const MAX_LOGS = 300;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.join(__dirname, "data");
const DB_PATH = path.join(DB_DIR, "logs.db");
const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID);

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Database will be initialized in startServer()
let db;

async function startServer() {
  try {
    // Initialize database
    console.log("🔧 Initializing database...");
    await fs.mkdir(DB_DIR, { recursive: true });
    db = new Database(DB_PATH);
    db.exec(`
      CREATE TABLE IF NOT EXISTS logs (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        level TEXT NOT NULL,
        message TEXT NOT NULL,
        meta TEXT
      );
    `);
    console.log("✅ Database initialized successfully");

    // Start server
    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`✅ Server is running on port ${PORT}`);
      console.log(`🌐 Listening on 0.0.0.0:${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("⚠️  SIGTERM received, shutting down gracefully...");
      server.close(() => {
        console.log("✅ Server closed");
        process.exit(0);
      });
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

async function addLog(level, message, meta = undefined) {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  db.prepare(
    "INSERT INTO logs (id, timestamp, level, message, meta) VALUES (?, ?, ?, ?, ?)"
  ).run(id, timestamp, level, message, meta ? JSON.stringify(meta) : null);
  
  db.prepare(
    `DELETE FROM logs
     WHERE id NOT IN (
       SELECT id FROM logs ORDER BY timestamp DESC LIMIT ?
     )`
  ).run(MAX_LOGS);

  if (level === "error") console.error("[api]", message, meta || "");
  else console.log("[api]", message);
}

function parseLogRow(row) {
  return {
    id: row.id,
    timestamp: row.timestamp,
    level: row.level,
    message: row.message,
    meta: row.meta ? JSON.parse(row.meta) : undefined,
  };
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (text.includes('"') || text.includes(",") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function getBearerToken(req) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return "";
  return header.slice("Bearer ".length).trim();
}

function requireAuth(req, res, next) {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Missing JWT_SECRET in backend environment." });
  }
  const token = getBearerToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.authUser = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

function buildLogWhereClause({ level, from, to }) {
  const clauses = [];
  const params = [];

  const normalizeDate = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
      const [dd, mm, yyyy] = raw.split("-");
      return `${yyyy}-${mm}-${dd}`;
    }
    return "";
  };
  const normalizedFrom = normalizeDate(from);
  const normalizedTo = normalizeDate(to);

  if (level === "info" || level === "error") {
    clauses.push("level = ?");
    params.push(level);
  }
  if (normalizedFrom) {
    clauses.push("date(timestamp, 'localtime') >= ?");
    params.push(normalizedFrom);
  }
  if (normalizedTo) {
    clauses.push("date(timestamp, 'localtime') <= ?");
    params.push(normalizedTo);
  }

  const where = clauses.length > 0 ? `WHERE ${clauses.join(" AND ")}` : "";
  return { where, params };
}

async function callGemini({ base64, mimeType, apiKey }) {
  const body = {
    contents: [
      {
        parts: [
          { text: PROMPT },
          { inline_data: { mime_type: mimeType, data: base64 } },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  };

  let lastErrorMessage = "";
  for (const model of MODEL_CANDIDATES) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.text();
      lastErrorMessage = `Gemini API error (${model}): ${res.status} ${err}`;
      if (res.status === 404) continue;
      throw new Error(lastErrorMessage);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error(`Empty response from Gemini (${model})`);
    const cleaned = text.replace(/```json\s*|\s*```/g, "").trim();
    return JSON.parse(cleaned);
  }

  throw new Error(
    lastErrorMessage ||
      "No compatible Gemini model found for generateContent. Please verify your API key and model access."
  );
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, hasServerApiKey: Boolean(GEMINI_API_KEY) });
});

app.post("/api/auth/google", async (req, res) => {
  const credential = String(req.body?.credential || "");
  if (!credential) return res.status(400).json({ message: "Missing Google credential" });
  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "Missing GOOGLE_CLIENT_ID in backend environment." });
  }
  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Missing JWT_SECRET in backend environment." });
  }

  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub || !payload?.email) {
      return res.status(401).json({ message: "Invalid Google identity token" });
    }

    const user = {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.email,
      picture: payload.picture || undefined,
    };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: "12h" });
    addLog("info", "SSO login successful", { email: user.email });
    return res.json({ token, user });
  } catch (error) {
    addLog("error", "SSO login failed", { error: String(error) });
    return res.status(401).json({ message: "Invalid Google credential" });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: req.authUser });
});

app.get("/api/logs", requireAuth, async (req, res) => {
  const requested = Number(req.query.limit || 100);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_LOGS) : 100;
  const requestedOffset = Number(req.query.offset || 0);
  const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;
  const level = typeof req.query.level === "string" ? req.query.level : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const { where, params } = buildLogWhereClause({ level, from, to });

  const countRow = db.prepare(
    `SELECT COUNT(*) AS total FROM logs ${where}`
  ).get(...params);
  const total = Number(countRow?.total || 0);
  const rows = db.prepare(
    `SELECT id, timestamp, level, message, meta
     FROM logs ${where}
     ORDER BY timestamp DESC
     LIMIT ? OFFSET ?`
  ).all(...params, limit, offset);
  res.json({
    logs: rows.map(parseLogRow),
    total,
    hasMore: offset + rows.length < total,
  });
});

app.get("/api/log-dates", requireAuth, async (req, res) => {
  const level = typeof req.query.level === "string" ? req.query.level : undefined;
  const params = [];
  let where = "";
  if (level === "info" || level === "error") {
    where = "WHERE level = ?";
    params.push(level);
  }

  const rows = db.prepare(
    `SELECT DISTINCT date(timestamp, 'localtime') AS d
     FROM logs
     ${where}
     ORDER BY d DESC`
  ).all(...params);

  res.json({ dates: rows.map((r) => r.d).filter(Boolean) });
});

app.delete("/api/logs", requireAuth, async (_req, res) => {
  db.prepare("DELETE FROM logs").run();
  res.json({ ok: true });
});

app.get("/api/logs/export.csv", requireAuth, async (req, res) => {
  const requested = Number(req.query.limit || MAX_LOGS);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), MAX_LOGS) : MAX_LOGS;
  const level = typeof req.query.level === "string" ? req.query.level : undefined;
  const from = typeof req.query.from === "string" ? req.query.from : undefined;
  const to = typeof req.query.to === "string" ? req.query.to : undefined;
  const { where, params } = buildLogWhereClause({ level, from, to });
  const rows = db.prepare(
    `SELECT id, timestamp, level, message, meta
     FROM logs ${where}
     ORDER BY timestamp DESC
     LIMIT ?`
  ).all(...params, limit);
  const header = ["id", "timestamp", "level", "message", "meta"].join(",");
  const lines = rows.map((row) =>
    [
      csvEscape(row.id),
      csvEscape(row.timestamp),
      csvEscape(row.level),
      csvEscape(row.message),
      csvEscape(row.meta ?? ""),
    ].join(",")
  );
  const csv = `${header}\n${lines.join("\n")}`;
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=backend-logs.csv");
  res.send(csv);
});

app.post("/api/validate-key", requireAuth, async (req, res) => {
  const incomingKey = String(req.body?.apiKey || "").trim();
  const apiKey = incomingKey || GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({ ok: false, message: "No API key configured." });
  }

  try {
    const validateRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    addLog("info", "API key validation attempted", { ok: validateRes.ok });
    return res.json({ ok: validateRes.ok });
  } catch (error) {
    addLog("error", "API key validation failed", { error: String(error) });
    return res.status(500).json({ ok: false });
  }
});

app.post("/api/extract", requireAuth, async (req, res) => {
  const { fileName, mimeType, base64, apiKey: incomingKey } = req.body || {};
  const apiKey = String(incomingKey || "").trim() || GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(400).json({
      message: "API key missing. Add GEMINI_API_KEY in backend .env or pass API key from UI.",
    });
  }
  if (!base64 || typeof base64 !== "string") {
    return res.status(400).json({ message: "Missing invoice payload." });
  }

  addLog("info", "Extraction started", {
    fileName: String(fileName || "unknown"),
    mimeType: String(mimeType || "application/octet-stream"),
  });

  try {
    const data = await callGemini({
      base64,
      mimeType: String(mimeType || "application/pdf"),
      apiKey,
    });
    addLog("info", "Extraction completed", {
      fileName: String(fileName || "unknown"),
      invoiceNumber: data?.invoice_number || null,
    });
    return res.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown extraction error";
    addLog("error", "Extraction failed", {
      fileName: String(fileName || "unknown"),
      error: message,
    });
    return res.status(500).json({ message });
  }
});

// Start the server
startServer();
