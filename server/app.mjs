/**
 * BG Signature admin API — file-based (local) or GitHub-backed (Vercel).
 */
import crypto from "crypto";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import {
  ensureLocalDir,
  readJson,
  removeFile,
  root,
  writeBinary,
  writeJson,
} from "./storage.mjs";

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
    process.env[k] = v;
  }
}

loadEnvFile();

const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "bg-admin-change-me");
const TOKEN_SECRET = String(process.env.ADMIN_TOKEN_SECRET || ADMIN_PASSWORD);

const ACTIVITIES = "data/activities.json";
const CATEGORIES = "data/categories.json";
const SITE = "data/site.json";

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "4mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024 },
});

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

async function saveActivities(list) {
  await writeJson(ACTIVITIES, {
    importedAt: new Date().toISOString(),
    source: "admin",
    count: list.length,
    activities: list,
  });
}

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
      console.error(err);
      if (!res.headersSent) {
        res.status(500).json({
          error: err instanceof Error ? err.message : "Erreur serveur",
        });
      }
    });
  };
}

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bg-signature-admin",
    vercel: Boolean(process.env.VERCEL),
  });
});

app.post(
  "/api/admin/login",
  asyncHandler(async (req, res) => {
    const password = String(req.body?.password || "");
    if (password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Mot de passe incorrect" });
    }
    return res.json({ token: makeToken() });
  })
);

app.get("/api/admin/me", requireAuth, (_req, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/admin/activities",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json(await readJson(ACTIVITIES));
  })
);

app.get(
  "/api/admin/categories",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json(await readJson(CATEGORIES));
  })
);

app.get(
  "/api/admin/site",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json(await readJson(SITE));
  })
);

app.put(
  "/api/admin/site",
  requireAuth,
  asyncHandler(async (req, res) => {
    const current = await readJson(SITE);
    const next = { ...current, ...req.body };
    await writeJson(SITE, next);
    res.json(next);
  })
);

app.post(
  "/api/admin/activities",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await readJson(ACTIVITIES);
    const list = Array.isArray(data.activities) ? data.activities : [];
    const activity = normalizeActivity(req.body || {}, crypto.randomUUID());
    if (!activity.name.fr) {
      return res.status(400).json({ error: "Le nom FR est obligatoire" });
    }
    ensureLocalDir(path.join("public/images/activities", activity.slug));
    list.push(activity);
    list.sort((a, b) => a.name.fr.localeCompare(b.name.fr, "fr"));
    await saveActivities(list);
    res.status(201).json(activity);
  })
);

app.put(
  "/api/admin/activities/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await readJson(ACTIVITIES);
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
    if (!req.body.slug) merged.slug = prev.slug;

    list[idx] = merged;
    list.sort((a, b) => a.name.fr.localeCompare(b.name.fr, "fr"));
    await saveActivities(list);
    res.json(merged);
  })
);

app.delete(
  "/api/admin/activities/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const data = await readJson(ACTIVITIES);
    const list = Array.isArray(data.activities) ? data.activities : [];
    const idx = list.findIndex((a) => a.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });
    const [removed] = list.splice(idx, 1);
    await saveActivities(list);
    res.json({ ok: true, removedId: removed.id });
  })
);

app.post(
  "/api/admin/activities/:id/images",
  requireAuth,
  upload.array("files", 12),
  asyncHandler(async (req, res) => {
    const data = await readJson(ACTIVITIES);
    const list = Array.isArray(data.activities) ? data.activities : [];
    const idx = list.findIndex((a) => a.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });

    const activity = list[idx];
    ensureLocalDir(path.join("public/images/activities", activity.slug));

    const files = req.files || [];
    if (!files.length) {
      return res.status(400).json({ error: "Aucun fichier" });
    }

    const existing = activity.images || [];
    const start = existing.length + 1;
    const added = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
      const safeExt = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(ext)
        ? ext
        : ".jpg";
      const filename = `${String(start + i).padStart(2, "0")}${safeExt}`;
      const rel = `public/images/activities/${activity.slug}/${filename}`;
      await writeBinary(rel, file.buffer);
      added.push(`/images/activities/${activity.slug}/${filename}`);
    }

    activity.images = [...existing, ...added].slice(0, 12);
    list[idx] = activity;
    await saveActivities(list);
    res.json(activity);
  })
);

app.delete(
  "/api/admin/activities/:id/images",
  requireAuth,
  asyncHandler(async (req, res) => {
    const imagePath = String(req.body?.path || "");
    if (!imagePath.startsWith("/images/activities/")) {
      return res.status(400).json({ error: "Chemin image invalide" });
    }

    const data = await readJson(ACTIVITIES);
    const list = Array.isArray(data.activities) ? data.activities : [];
    const idx = list.findIndex((a) => a.id === req.params.id);
    if (idx < 0) return res.status(404).json({ error: "Activité introuvable" });

    const activity = list[idx];
    activity.images = (activity.images || []).filter((p) => p !== imagePath);
    list[idx] = activity;
    await saveActivities(list);

    const rel = `public${imagePath}`;
    await removeFile(rel);

    res.json(activity);
  })
);

export default app;
