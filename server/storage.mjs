/**
 * Storage for admin data/images.
 * - Local: read/write filesystem
 * - Vercel: GitHub Contents API (persists + triggers redeploy)
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(__dirname, "..");

function githubConfig() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
  const repoFromVercel =
    process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG
      ? `${process.env.VERCEL_GIT_REPO_OWNER}/${process.env.VERCEL_GIT_REPO_SLUG}`
      : "";
  const repo = process.env.GITHUB_REPO || repoFromVercel;
  const branch =
    process.env.GITHUB_BRANCH ||
    process.env.VERCEL_GIT_COMMIT_REF ||
    "main";
  if (!token || !repo) return null;
  return { token, repo, branch };
}

export function usesGithubStorage() {
  return Boolean(githubConfig());
}

function toPosix(relPath) {
  return String(relPath).replace(/\\/g, "/").replace(/^\//, "");
}

async function githubRequest(relPath, init = {}) {
  const cfg = githubConfig();
  if (!cfg) throw new Error("GitHub storage non configuré");
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${toPosix(relPath)}?ref=${encodeURIComponent(cfg.branch)}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "bg-signature-admin",
      ...(init.headers || {}),
    },
  });
  return res;
}

async function githubGetFile(relPath) {
  const res = await githubRequest(relPath);
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub lecture échouée (${res.status}): ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const content = Buffer.from(String(data.content || "").replace(/\n/g, ""), "base64");
  return { sha: data.sha, content };
}

async function githubPutFile(relPath, contentBuffer, message) {
  const cfg = githubConfig();
  if (!cfg) throw new Error("GitHub storage non configuré (GITHUB_TOKEN + GITHUB_REPO)");
  const existing = await githubGetFile(relPath);
  const body = {
    message,
    content: contentBuffer.toString("base64"),
    branch: cfg.branch,
    ...(existing?.sha ? { sha: existing.sha } : {}),
  };
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${toPosix(relPath)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "bg-signature-admin",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub écriture échouée (${res.status}): ${text.slice(0, 200)}`);
  }
  return res.json();
}

async function githubDeleteFile(relPath, message) {
  const cfg = githubConfig();
  if (!cfg) return;
  const existing = await githubGetFile(relPath);
  if (!existing?.sha) return;
  const url = `https://api.github.com/repos/${cfg.repo}/contents/${toPosix(relPath)}`;
  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${cfg.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "bg-signature-admin",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      sha: existing.sha,
      branch: cfg.branch,
    }),
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`GitHub suppression échouée (${res.status}): ${text.slice(0, 200)}`);
  }
}

export async function readJson(relPath) {
  const cfg = githubConfig();
  if (cfg) {
    const file = await githubGetFile(relPath);
    if (!file) throw new Error(`Fichier introuvable: ${relPath}`);
    return JSON.parse(file.content.toString("utf8"));
  }
  const abs = path.join(root, relPath);
  return JSON.parse(fs.readFileSync(abs, "utf8"));
}

export async function writeJson(relPath, data) {
  const payload = `${JSON.stringify(data, null, 2)}\n`;
  const buf = Buffer.from(payload, "utf8");
  const cfg = githubConfig();
  if (cfg) {
    await githubPutFile(relPath, buf, `admin: update ${toPosix(relPath)}`);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Écriture impossible sur Vercel sans GITHUB_TOKEN. Ajoutez GITHUB_TOKEN et GITHUB_REPO dans les variables d’environnement Vercel."
    );
  }
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, payload);
}

export async function writeBinary(relPath, buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const cfg = githubConfig();
  if (cfg) {
    await githubPutFile(relPath, buf, `admin: upload ${toPosix(relPath)}`);
    return;
  }
  if (process.env.VERCEL) {
    throw new Error(
      "Upload impossible sur Vercel sans GITHUB_TOKEN. Ajoutez GITHUB_TOKEN et GITHUB_REPO dans Vercel."
    );
  }
  const abs = path.join(root, relPath);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, buf);
}

export async function removeFile(relPath) {
  const cfg = githubConfig();
  if (cfg) {
    await githubDeleteFile(relPath, `admin: delete ${toPosix(relPath)}`);
    return;
  }
  if (process.env.VERCEL) return;
  const abs = path.join(root, relPath);
  if (fs.existsSync(abs)) fs.unlinkSync(abs);
}

export function ensureLocalDir(relPath) {
  if (githubConfig() || process.env.VERCEL) return;
  fs.mkdirSync(path.join(root, relPath), { recursive: true });
}
