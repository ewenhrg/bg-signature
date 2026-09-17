import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const acts = JSON.parse(
  fs.readFileSync(path.join(root, "data/activities.json"), "utf8")
).activities;

const urls = [
  "/fr",
  "/bg",
  "/fr/catalogue",
  "/bg/catalogue",
  "/fr/contact",
  "/bg/contact",
];
for (const a of acts) {
  urls.push(`/fr/catalogue/${a.slug}`);
  urls.push(`/bg/catalogue/${a.slug}`);
}

const body = urls
  .map((u) => `  <url>\n    <loc>${u}</loc>\n  </url>`)
  .join("\n");

fs.writeFileSync(
  path.join(root, "public/sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`
);
console.log("sitemap urls", urls.length);
