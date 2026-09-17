import app from "./app.mjs";

const PORT = Number(process.env.ADMIN_PORT || 8787);

app.listen(PORT, () => {
  console.log(`BG Signature admin API on http://localhost:${PORT}`);
});
