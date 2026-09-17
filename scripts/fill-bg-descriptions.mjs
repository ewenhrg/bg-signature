/**
 * One-shot: fill description.bg and notes.bg from French via Google Translate.
 * Run: node scripts/fill-bg-descriptions.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import translate from "google-translate-api-x";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.resolve(__dirname, "../data/activities.json");
const CHUNK = 4200;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateFrToBg(text) {
  const src = String(text || "").trim();
  if (!src) return "";

  if (src.length <= CHUNK) {
    const res = await translate(src, { from: "fr", to: "bg" });
    return String(res.text || "").trim();
  }

  // Split on blank lines to keep structure
  const parts = src.split(/\n{2,}/);
  const out = [];
  let buf = "";

  async function flush() {
    if (!buf.trim()) return;
    const res = await translate(buf, { from: "fr", to: "bg" });
    out.push(String(res.text || "").trim());
    buf = "";
    await sleep(350);
  }

  for (const part of parts) {
    if ((buf + "\n\n" + part).length > CHUNK) {
      await flush();
    }
    buf = buf ? `${buf}\n\n${part}` : part;
  }
  await flush();
  return out.join("\n\n");
}

async function main() {
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const list = Array.isArray(data.activities) ? data.activities : [];
  let updated = 0;
  let skipped = 0;

  for (let i = 0; i < list.length; i++) {
    const a = list[i];
    const name = a.name?.fr || a.slug || a.id;
    const frDesc = String(a.description?.fr || "").trim();
    const bgDesc = String(a.description?.bg || "").trim();
    const frNotes = String(a.notes?.fr || "").trim();
    const bgNotes = String(a.notes?.bg || "").trim();

    let changed = false;

    if (frDesc && !bgDesc) {
      process.stdout.write(`[${i + 1}/${list.length}] desc: ${name}… `);
      try {
        a.description = {
          fr: a.description?.fr || "",
          bg: await translateFrToBg(frDesc),
        };
        changed = true;
        console.log("ok");
        await sleep(400);
      } catch (err) {
        console.log("FAIL", err?.message || err);
        await sleep(1200);
      }
    }

    if (frNotes && !bgNotes) {
      process.stdout.write(`[${i + 1}/${list.length}] notes: ${name}… `);
      try {
        a.notes = {
          fr: a.notes?.fr || "",
          bg: await translateFrToBg(frNotes),
        };
        changed = true;
        console.log("ok");
        await sleep(400);
      } catch (err) {
        console.log("FAIL", err?.message || err);
        await sleep(1200);
      }
    }

    if (changed) updated++;
    else skipped++;

    // Persist periodically
    if ((i + 1) % 5 === 0 || i === list.length - 1) {
      data.importedAt = new Date().toISOString();
      data.source = data.source || "admin";
      data.count = list.length;
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n");
    }
  }

  console.log(`Done. updated=${updated} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
