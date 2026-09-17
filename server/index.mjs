/**
 * BG Signature admin API — file-based, independent from any external DB.
 * Writes to data/*.json and public/images/activities/
 */
import crypto from "crypto";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "data");
const activitiesPath = path.join(dataDir, "activities.json");
const categoriesPath = path.join(dataDir, "categories.json");
const sitePath = path.join(dataDir, "site.json");
const imagesRoot = path.join(root, "public", "images", "activities");

function loadEnvFile() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const i = line.indexOf("=");
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    // Local .env always wins so password changes apply on restart.
    process.env[k] = v;
  }
}

loadEnvFile();

const PORT = Number(process.env.ADMIN_PORT || 8787);
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "bg-admin-change-me");
const TOKEN_SECRET = String(process.env.ADMIN_TOKEN_SECRET || ADMIN_PASSWORD);

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "4mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n");
}

function makeToken() {
  const payload = `bg-admin:${Date.now()}`;
  const sig = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

function verifyToken(token) {
  try {
    const raw = Buffer.from(String(token || ""), "base64url").toString("utf8");
    const [payload, sig] = raw.split(".");
    if (!payload || !sig) return false;
    const expected = crypto
      .createHmac("sha256", TOKEN_SECRET)
      .update(payload)
      .digest("hex");
    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return false;
    if (!crypto.timingSafeEqual(sigBuf, expBuf)) return false;
    const ts = Number(payload.split(":")[1] || 0);
    // Token valid 7 days
    return Date.now() - ts < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function requireAuth(req, res, next) {
  const header = String(req.headers.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verifyToken(token)) {
    return res.status(401).json({ error: "Non autorisé" });
  }
  return next();
}

function slugify(name) {
  return String(name || "activity")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function emptyLocalized(fr = "", bg = "") {
  return { fr: String(fr || ""), bg: String(bg || "") };
}

function normalizeActivity(input, fallbackId) {
  const id = String(input.id || fallbackId || crypto.randomUUID());
  const nameFr = String(input.name?.fr ?? input.nameFr ?? "").trim();
  const slugBase = slugify(nameFr) || "activite";
  const slug = String(input.slug || `${slugBase}-${id.slice(0, 8)}`);
  return {
    id,
    slug,
    category: String(input.category || "desert"),
    name: emptyLocalized(input.name?.fr ?? "", input.name?.bg ?? ""),
    description: emptyLocalized(
      input.description?.fr ?? "",
      input.description?.bg ?? ""
    ),
    notes: emptyLocalized(input.notes?.fr ?? "", input.notes?.bg ?? ""),
    priceAdult: Number(input.priceAdult) || 0,
    priceChild: Number(input.priceChild) || 0,
    priceBaby: Number(input.priceBaby) || 0,
    ageChild: String(input.ageChild || ""),
    ageBaby: String(input.ageBaby || ""),
    babiesForbidden: Boolean(input.babiesForbidden),
    currency: String(input.currency || "EUR"),
    availableDays: Array.isArray(input.availableDays)
      ? input.availableDays.map(Boolean)
      : [true, true, true, true, true, true, true],
    popular: Boolean(input.popular),
    catalogPaused: Boolean(input.catalogPaused),
    images: Array.isArray(input.images)
      ? input.images.filter((u) => typeof u === "string")
      : [],
  };
}

function saveActivities(list) {
  writeJson(activitiesPath, {
    importedAt: new Date().toISOString(),
    source: "admin",
    count: list.length,
    activities: list,
  });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "bg-signature-admin" });
});

app.post("/api/admin/login", (req, res) => {
  const password = String(req.body?.password || "");
  if (password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }
  return res.json({ token: makeToken() });
});

app.get("/api/admin/me", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/admin/activities", requireAuth, (_req, res) => {
  const data = readJson(activitiesPath);
  res.json(data);
});

app.get("/api/admin/categories", requireAuth, (_req, res) => {
  res.json(readJson(categoriesPath));
});

app.get("/api/admin/site", requireAuth, (_req, res) => {
  res.json(readJson(sitePath));
});

app.put("/api/admin/site", requireAuth, (req, res) => {
  const current = readJson(sitePath);
  const next = { ...current, ...req.body };
  writeJson(sitePath, next);
  res.json(next);
});

app.post("/api/admin/activities", requireAuth, (req, res) => {
  const data = readJson(activitiesPath);
  const list = Array.isArray(data.activities) ? data.activities : [];
  const activity = normalizeActivity(req.body || {}, crypto.randomUUID());
  if (!activity.name.fr) {
    return res.status(400).json({ error: "Le nom FR est obligatoire" });
  }
  fs.mkdirSync(path.join(imagesRoot, activity.slug), { recursive: true });
  list.push(activity);
  list.sort((a, b) => a.name.fr.localeCompare(b.name.fr, "fr"));
  saveActivities(list);
  res.status(201).json(activity);
});

app.put("/api/admin/activities/:id", requireAuth, (req, res) => {
  const data = readJson(activitiesPath);
  const list = Array.isArray(data.activities) ? data.activities : [];
  const idx = list.findIndex((a) => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });

  const prev = list[idx];
  const merged = normalizeActivity(
    { ...prev, ...req.body, id: prev.id, images: req.body.images ?? prev.images },
    prev.id
  );
  if (!merged.name.fr) {
    return res.status(400).json({ error: "Le nom FR est obligatoire" });
  }

  // Keep slug stable to preserve image folders unless explicitly changed
  if (!req.body.slug) merged.slug = prev.slug;

  list[idx] = merged;
  list.sort((a, b) => a.name.fr.localeCompare(b.name.fr, "fr"));
  saveActivities(list);
  res.json(merged);
});

app.delete("/api/admin/activities/:id", requireAuth, (req, res) => {
  const data = readJson(activitiesPath);
  const list = Array.isArray(data.activities) ? data.activities : [];
  const idx = list.findIndex((a) => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });
  const [removed] = list.splice(idx, 1);
  saveActivities(list);
  res.json({ ok: true, removedId: removed.id });
});

app.post(
  "/api/admin/activities/:id/images",
  requireAuth,
  upload.array("files", 12),
  (req, res) => {
    const data = readJson(activitiesPath);
    const list = Array.isArray(data.activities) ? data.activities : [];
    const idx = list.findIndex((a) => a.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });

    const activity = list[idx];
    const folder = path.join(imagesRoot, activity.slug);
    fs.mkdirSync(folder, { recursive: true });

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "Aucun fichier" });
    }

    const existing = activity.images || [];
    const start = existing.length + 1;
    const added = [];

    files.forEach((file, i) => {
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)
        ? ext
        : ".jpg";
      const filename = `${String(start + i).padStart(2, "0")}${safeExt}`;
      fs.writeFileSync(path.join(folder, filename), file.buffer);
      const publicPath = `/images/activities/${activity.slug}/${filename}`;
      added.push(publicPath);
    });

    activity.images = [...existing, ...added].slice(0, 12);
    list[idx] = activity;
    saveActivities(list);
    res.json(activity);
  }
);

app.delete("/api/admin/activities/:id/images", requireAuth, (req, res) => {
  const imagePath = String(req.body?.path || "");
  if (!imagePath.startsWith("/images/activities/")) {
    return res.status(400).json({ error: "Chemin image invalide" });
  }

  const data = readJson(activitiesPath);
  const list = Array.isArray(data.activities) ? data.activities : [];
  const idx = list.findIndex((a) => a.id === req.params.id);
  if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });

  const activity = list[idx];
  activity.images = (activity.images || []).filter((p) => p !== imagePath);
  list[idx] = activity;
  saveActivities(list);

  const diskPath = path.join(root, "public", imagePath.replace(/^\//, ""));
  if (fs.existsSync(diskPath)) {
    try {
      fs.unlinkSync(diskPath);
    } catch {
      /* ignore */
    }
  }

  res.json(activity);
});

app.listen(PORT, () => {
  console.log(`BG Signature admin API on http://localhost:${PORT}`);
});
