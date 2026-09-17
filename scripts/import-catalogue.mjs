/**
 * ONE-SHOT: normalize live/snapshot export → local data + download images.
 * Not used at runtime by the BG Signature app.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const livePath = path.join(__dirname, "_live_export.json");
const snapshotPath = path.resolve(
  root,
  "../hurghada-dream-intranet/public/hd_activities_restore.json"
);

const CATEGORY_LABELS = {
  desert: { fr: "Désert", bg: "Пустиня" },
  aquatique: { fr: "Aquatique", bg: "Водни" },
  exploration_bien_etre: {
    fr: "Exploration / Bien-être",
    bg: "Разходки / Уелнес",
  },
  luxor_caire: { fr: "Louxor & Le Caire", bg: "Луксор и Кайро" },
  marsa_alam: { fr: "Marsa Alam", bg: "Марса Алам" },
  transfert: { fr: "Transfert", bg: "Трансфер" },
};

function slugify(name) {
  return String(name || "activity")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function loadSource() {
  if (fs.existsSync(livePath)) {
    const live = JSON.parse(fs.readFileSync(livePath, "utf8"));
    if (Array.isArray(live.activities) && live.activities.length) {
      console.log("Using live export:", live.count);
      return { source: "live", ...live };
    }
  }
  const snap = JSON.parse(fs.readFileSync(snapshotPath, "utf8"));
  console.log("Using snapshot:", snap.count);
  return { source: "snapshot", ...snap };
}

function mapRow(row, index) {
  const name = String(row.name || row.Name || "").trim();
  const id = String(row.id || row.supabase_id || `act-${index + 1}`);
  const slug = `${slugify(name) || "activite"}-${id.slice(0, 8)}`;
  const category = String(row.category || "desert");
  const imagesRaw = row.catalog_image_urls || row.catalogImageUrls || [];
  const images = Array.isArray(imagesRaw)
    ? imagesRaw.filter((u) => typeof u === "string" && /^https?:\/\//i.test(u))
    : [];

  return {
    id,
    slug,
    category,
    name: { fr: name, bg: "" },
    description: {
      fr: String(row.description || "").trim(),
      bg: "",
    },
    notes: {
      fr: String(row.notes || "").trim(),
      bg: "",
    },
    priceAdult: Number(row.price_adult ?? row.priceAdult ?? 0) || 0,
    priceChild: Number(row.price_child ?? row.priceChild ?? 0) || 0,
    priceBaby: Number(row.price_baby ?? row.priceBaby ?? 0) || 0,
    ageChild: String(row.age_child ?? row.ageChild ?? "").trim(),
    ageBaby: String(row.age_baby ?? row.ageBaby ?? "").trim(),
    babiesForbidden: Boolean(row.babies_forbidden ?? row.babiesForbidden),
    currency: String(row.currency || "EUR"),
    availableDays: Array.isArray(row.available_days || row.availableDays)
      ? row.available_days || row.availableDays
      : [true, true, true, true, true, true, true],
    popular: Boolean(row.popular),
    catalogPaused: Boolean(row.catalog_paused ?? row.catalogPaused),
    sourceImageUrls: images,
    images: [],
  };
}

function download(url, dest) {
  return new Promise((resolve) => {
    const proto = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    const req = proto.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        file.close();
        fs.unlinkSync(dest);
        download(res.headers.location, dest).then(resolve);
        return;
      }
      if (res.statusCode !== 200) {
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch {}
        resolve(false);
        return;
      }
      res.pipe(file);
      file.on("finish", () => {
        file.close(() => resolve(true));
      });
    });
    req.on("error", () => {
      try {
        file.close();
        fs.unlinkSync(dest);
      } catch {}
      resolve(false);
    });
    req.on("timeout", () => {
      req.destroy();
      try {
        file.close();
        fs.unlinkSync(dest);
      } catch {}
      resolve(false);
    });
  });
}

function extFromUrl(url) {
  try {
    const p = new URL(url).pathname;
    const m = p.match(/\.(jpe?g|png|webp|gif|avif)$/i);
    return m ? m[0].toLowerCase() : ".jpg";
  } catch {
    return ".jpg";
  }
}

const raw = loadSource();
let activities = raw.activities.map(mapRow).filter((a) => a.name.fr);
activities = activities.filter((a) => !a.catalogPaused);

const imgRoot = path.join(root, "public", "images", "activities");
fs.mkdirSync(imgRoot, { recursive: true });
fs.mkdirSync(path.join(root, "data"), { recursive: true });

let downloaded = 0;
let failed = 0;

for (const act of activities) {
  const folder = path.join(imgRoot, act.slug);
  fs.mkdirSync(folder, { recursive: true });
  const local = [];
  for (let i = 0; i < act.sourceImageUrls.length; i++) {
    const url = act.sourceImageUrls[i];
    const ext = extFromUrl(url);
    const filename = `${String(i + 1).padStart(2, "0")}${ext}`;
    const dest = path.join(folder, filename);
    const publicPath = `/images/activities/${act.slug}/${filename}`;
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      local.push(publicPath);
      continue;
    }
    const ok = await download(url, dest);
    if (ok) {
      local.push(publicPath);
      downloaded += 1;
      process.stdout.write(".");
    } else {
      failed += 1;
      process.stdout.write("x");
    }
  }
  act.images = local;
  delete act.sourceImageUrls;
}

console.log("\nimages downloaded:", downloaded, "failed:", failed);

const categories = Object.entries(CATEGORY_LABELS).map(([key, labels]) => ({
  key,
  label: labels,
}));

fs.writeFileSync(
  path.join(root, "data", "categories.json"),
  JSON.stringify({ categories }, null, 2)
);

fs.writeFileSync(
  path.join(root, "data", "activities.json"),
  JSON.stringify(
    {
      importedAt: new Date().toISOString(),
      source: raw.source,
      count: activities.length,
      activities,
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(root, "data", "site.json"),
  JSON.stringify(
    {
      brand: "BG Signature",
      tagline: {
        fr: "Excursions et expériences à Hurghada",
        bg: "Екскурзии и преживявания в Хургада",
      },
      whatsappNumber: "",
      email: "",
      address: "",
      instagram: "",
      facebook: "",
      defaultLocale: "fr",
      locales: ["fr", "bg"],
    },
    null,
    2
  )
);

console.log("Wrote data/activities.json with", activities.length, "activities");
