import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

const PORT = Number(process.env.PORT) || 3000;

const SCRIPT_URL =
  process.env.SCRIPT_URL ||
  "https://script.google.com/macros/s/AKfycbwqeld0hUwb6T7FJXjBpqXHoYtWKnB41_L81xGC0MBgrqxOUcylj_lsWEe_x1MVyw8Ghg/exec";

app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/api/tenants", async (req, res) => {
  try {
    const url = new URL(SCRIPT_URL);

    const r = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    const text = await r.text();

    try {
      return res.status(r.status).json(JSON.parse(text));
    } catch {
      return res.status(r.status).send(text);
    }
  } catch (e) {
    return res
      .status(500)
      .json({ error: "Server error", message: e?.message || String(e) });
  }
});

app.get("/api/filter", async (req, res) => {
  try {
    const { complaint_id } = req.query;

    if (!complaint_id) {
      return res.status(400).json({ error: "complaint_id is required" });
    }

    const r = await fetch(SCRIPT_URL, {
      headers: { Accept: "application/json" },
    });

    const data = await r.json();

    const record = data.find(
      (complaint) => String(complaint.complaint_id) === String(complaint_id),
    );

    if (!record) {
      return res.status(404).json({ error: "Complaint not found" });
    }

    return res.json(record); // 👈 return single object
  } catch (e) {
    return res.status(500).json({
      error: "Server error",
      message: e?.message || String(e),
    });
  }
});

app.listen(PORT, () => console.log(`Server running on :${PORT}`));
