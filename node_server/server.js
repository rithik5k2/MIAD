/**
 * Node.js Gateway Server — port 4000
 *
 * Receives multipart image uploads from the React frontend,
 * forwards them to the Python FastAPI inference server (port 8000),
 * and returns the JSON result to the frontend.
 *
 * This separation keeps inference (Python/PyTorch) clean
 * and gives you a Node layer for auth, rate-limiting, logging, etc.
 */

const express  = require("express");
const cors     = require("cors");
const morgan   = require("morgan");
const multer   = require("multer");
const axios    = require("axios");
const FormData = require("form-data");

const app    = express();
const upload = multer({ storage: multer.memoryStorage() }); // keep file in RAM

const PY_BACKEND = process.env.PY_BACKEND_URL || "http://localhost:8000";
const PORT       = process.env.PORT            || 4000;

// ── Middleware ──────────────────────────────────────────────────
app.use(morgan("dev"));
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
}));
app.use(express.json());

// ── Health ──────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ status: "Node gateway running", port: PORT });
});

app.get("/health", async (req, res) => {
  try {
    const r = await axios.get(`${PY_BACKEND}/health`, { timeout: 3000 });
    res.json({ node: "ok", python: r.data });
  } catch {
    res.status(503).json({ node: "ok", python: "unreachable" });
  }
});

// ── Main Predict Route ──────────────────────────────────────────
app.post("/api/predict", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  // Validate extension
  const name = req.file.originalname.toLowerCase();
  const valid = [".jpg", ".jpeg", ".png", ".tif", ".tiff"];
  if (!valid.some(e => name.endsWith(e))) {
    return res.status(400).json({ error: "Unsupported file type. Upload JPG, PNG, or TIF." });
  }

  try {
    // Forward file to Python backend
    const form = new FormData();
    form.append("file", req.file.buffer, {
      filename:    req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post(`${PY_BACKEND}/api/predict`, form, {
      headers:       { ...form.getHeaders() },
      timeout:       120_000,   // 2 min — CPU inference can be slow
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    return res.json(response.data);

  } catch (err) {
    console.error("[node] Python backend error:", err.message);

    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({
        error: "Python inference server is not running. Start it with: uvicorn main:app --reload"
      });
    }
    return res.status(500).json({ error: "Internal server error." });
  }
});

// ── Start ───────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅ Node gateway running  → http://localhost:${PORT}`);
  console.log(`   Python backend target → ${PY_BACKEND}`);
  console.log(`   React frontend        → http://localhost:5173\n`);
});
