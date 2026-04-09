import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

/* ---------------- CONFIG ---------------- */

const PORT = Number(process.env.PORT) || 3000;
const SCRIPT_URL = process.env.SCRIPT_URL;

/* ---------------- HEALTH ---------------- */

app.get("/health", (req, res) => res.json({ ok: true }));

/* ---------------- FETCH FUNCTION ---------------- */

async function fetchTenants() {
  const url = new URL(SCRIPT_URL);

  // prevent google caching
  url.searchParams.set("_", Date.now());

  const r = await fetch(url.toString(), {
    headers: { Accept: "application/json" },
  });

  return await r.json();
}

/* ---------------- ROUTES ---------------- */

app.get("/api/tenants", async (req, res) => {
  try {
    const data = await fetchTenants();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/filter", async (req, res) => {
  try {
    const { complaint_id } = req.query;

    if (!complaint_id)
      return res.status(400).json({ error: "complaint_id is required" });

    const data = await fetchTenants();

    const record = data.find(
      (complaint) => String(complaint.complaint_id) === String(complaint_id),
    );

    if (!record) return res.status(404).json({ error: "Complaint not found" });

    res.json(record);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/* ---------------- START ---------------- */

app.listen(PORT, () => console.log(`Server running on :${PORT}`));