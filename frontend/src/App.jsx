import { useState, useRef } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import UploadZone from "./components/UploadZone";
import ConfidenceBar from "./components/ConfidenceBar";
import ImagePanel from "./components/ImagePanel";
import LoadingState from "./components/LoadingState";
import DiagnosisBanner from "./components/DiagnosisBanner";
import RiskMeter from "./components/RiskMeter";
import ReportDownload from "./components/ReportDownload";
import Chatbot from "./components/Chatbot";
import { predictTumor } from "./utils/api";
import About from "./pages/about";
import HowItWorks from "./pages/howitworks";

const FEATURES = [
  {
    title: "Tumor Classification",
    desc: "Identifies 4 tumor types — Glioma, Meningioma, Pituitary, and No Tumor — with 93.6% accuracy using EfficientNetB0.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" />
      </svg>
    ),
  },
  {
    title: "Pixel Segmentation",
    desc: "UNet model draws an exact mask around the tumor region with a Dice score of 0.84, highlighting affected tissue.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6v6H9zM9 3v6M15 3v6M9 15v6M15 15v6M3 9h6M15 9h6M3 15h6M15 15h6" />
      </svg>
    ),
  },
  {
    title: "Grad-CAM Explainability",
    desc: "Visual heatmaps show exactly which regions of the MRI influenced the model's decision — transparent and interpretable.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 5v2M12 17v2M5 12H3M21 12h-2" />
      </svg>
    ),
  },
];

export default function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeNav, setActiveNav] = useState("home");
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const uploadRef = useRef(null);

  const scrollTo = (ref, name) => {
    setActiveNav(name);
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goHome = () => {
    setResult(null);
    setLoading(false);
    setActiveNav("home");
    navigate("/"); // ✅ THIS IS THE KEY FIX
  };
  const onFile = (f) => {
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  };

  const onAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      setResult(await predictTumor(file));
    } catch (e) {
      setError(
        e.response?.data?.error ||
          e.response?.data?.detail ||
          "Cannot reach the server. Make sure both servers are running.",
      );
    } finally {
      setLoading(false);
    }
  };
  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview); // cleanup

    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };
  const onReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setActiveNav("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-radial" />
      <div className="app-root">
        {/* ── NAVBAR ── */}
        <header className="header">
          <div className="container">
            <div className="header-inner">
              <div
                className="logo-mark"
                onClick={goHome}
                style={{ cursor: "pointer" }}
              >
                <span className="logo-wordmark">
                  MI<span>AD</span>
                </span>
              </div>

              <div className="logo-text">
                <div className="logo-sub">Medical Image Anomaly Detection</div>
              </div>

              <div className="nav-divider" />

              <nav className="nav-links">
                <span
                  className={`nav-link ${activeNav === "home" ? "active" : ""}`}
                  onClick={goHome}
                >
                  Home
                </span>
                <span
                  onClick={() => {
                    setActiveNav("about");
                    navigate("/about");
                  }}
                  className={`nav-link ${activeNav === "about" ? "active" : ""}`}
                >
                  About
                </span>
                <span
                  onClick={() => {
                    setActiveNav("howitworks");
                    navigate("/how-it-works");
                  }}
                  className={`nav-link ${activeNav === "howitworks" ? "active" : ""}`}
                >
                  How it Works
                </span>
              </nav>

              <div className="spacer" />

              <div className="status-pill">
                <div className="status-dot" />
                <span className="status-text">System Online</span>
              </div>
            </div>
          </div>
        </header>
        <main style={{ flex: 1 }}>
          <Routes>
            {/* ───────── HOME PAGE ───────── */}
            <Route
              path="/"
              element={
                <div className="container">
                  {/* ── HOME: HERO + FEATURES + UPLOAD ── */}
                  {!result && !loading && (
                    <>
                      {/* Hero */}
                      <div className="hero" ref={heroRef}>
                        <div className="hero-chip">
                          <div className="hero-chip-dot" />
                          <span className="hero-chip-text">
                            Deep Learning · Brain MRI Analysis
                          </span>
                        </div>
                        <h1 className="hero-h1">
                          AI-Powered Brain
                          <br />
                          Tumor <em>Detection</em>
                        </h1>
                        <p className="hero-p">
                          Upload a brain MRI scan and receive instant tumor
                          classification, pixel-level segmentation, and
                          explainable AI insights — all in seconds.
                        </p>
                      </div>

                      {/* Feature Cards */}
                      <section className="features-section" ref={featuresRef}>
                        <div className="features-grid">
                          {FEATURES.map((f, i) => (
                            <div className="feature-card" key={i}>
                              <div className="feature-icon">{f.icon}</div>
                              <div className="feature-title">{f.title}</div>
                              <div className="feature-desc">{f.desc}</div>
                            </div>
                          ))}
                        </div>
                      </section>

                      {/* Upload */}
                      <div className="upload-wrap" ref={uploadRef}>
                        <div className="upload-section-label">
                          Upload your MRI scan to begin
                        </div>

                        <UploadZone onFileSelect={onFile} disabled={loading} />

                        {preview && (
                          <div className="preview-card">
                            <div className="preview-head">
                              <span className="preview-lbl">Preview</span>
                              <span className="preview-fname">
                                {file?.name}
                              </span>

                              <button
                                className="btn-remove"
                                onClick={removeImage}
                              >
                                ✖ Remove
                              </button>
                            </div>
                            <div className="preview-body">
                              <img
                                src={preview}
                                alt="preview"
                                className="preview-img"
                              />
                            </div>
                          </div>
                        )}

                        {error && (
                          <div className="error-box">
                            <span className="error-ico">⚠️</span>
                            <span className="error-msg">{error}</span>
                          </div>
                        )}

                        <button
                          className="btn-analyze"
                          onClick={onAnalyze}
                          disabled={!file || loading}
                        >
                          <span className="btn-inner">
                            Analyze MRI Scan &nbsp;→
                          </span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* ── LOADING ── */}
                  {loading && <LoadingState />}

                  {/* ── RESULTS ── */}
                  {result && (
                    <div className="results-view">
                      <DiagnosisBanner result={result} />

                      <div className="res-grid">
                        {/* LEFT */}
                        <div className="col">
                          <RiskMeter
                            confidence={result.confidence}
                            tumorType={result.tumor_type}
                          />

                          <div className="panel">
                            <div className="panel-head">
                              <div className="panel-title-col">
                                <div className="panel-title">
                                  Classification Scores
                                </div>
                                <div className="panel-sub">
                                  EfficientNetB0 · Softmax
                                </div>
                              </div>
                              <span className="badge badge-cyan">
                                Classifier
                              </span>
                            </div>

                            <div className="panel-body">
                              <ConfidenceBar
                                confidence={result.confidence}
                                predicted={result.tumor_type}
                              />
                            </div>
                          </div>

                          <div className="panel">
                            <div className="panel-head">
                              <div className="panel-title-col">
                                <div className="panel-title">Original MRI</div>
                                <div className="panel-sub">Input scan</div>
                              </div>
                              <span className="badge badge-gray">Input</span>
                            </div>

                            <div className="panel-img-box">
                              <img
                                src={preview}
                                alt="MRI"
                                className="panel-img"
                              />
                            </div>
                          </div>
                        </div>

                        {/* RIGHT */}
                        <div className="col">
                          <ImagePanel
                            title="Grad-CAM Heatmap"
                            sub="Regions driving the classification decision"
                            base64={result.gradcam_overlay}
                            badgeClass="badge-purple"
                            badgeText="Explainability"
                          />

                          <ImagePanel
                            title="Tumor Overlay"
                            sub="UNet segmented region highlighted"
                            base64={result.tumor_overlay}
                            badgeClass="badge-amber"
                            badgeText="UNet"
                          />

                          <ImagePanel
                            title="Segmentation Mask"
                            sub="Raw UNet output · sigmoid threshold 0.5"
                            base64={result.segmentation_mask}
                            badgeClass="badge-cyan"
                            badgeText="Mask"
                          />
                        </div>
                      </div>

                      {/* Disclaimer */}
                      <div className="disclaimer">
                        <span className="disc-icon">⚠️</span>
                        <span className="disc-text">
                          For{" "}
                          <strong>
                            educational and research purposes only
                          </strong>
                          . Not a substitute for professional medical diagnosis.
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="results-actions">
                        <ReportDownload result={result} preview={preview} />

                        <button className="btn-reset" onClick={onReset}>
                          ← Analyze Another Scan
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              }
            />

            {/* ───────── ABOUT PAGE ───────── */}
            <Route path="/about" element={<About />} />

            {/* ───────── HOW IT WORKS ───────── */}
            <Route path="/how-it-works" element={<HowItWorks />} />
          </Routes>
        </main>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <div className="container">
            <div className="footer-inner">
              <span className="footer-copy">
                © 2026 · Medical Image Anomaly Detection · B.Tech Research
              </span>
              <div className="footer-tags">
                {[
                  "EfficientNetB0",
                  "UNet",
                  "Grad-CAM",
                  "FastAPI",
                  "Gemini 2.5",
                ].map((t) => (
                  <span key={t} className="footer-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Chatbot — always visible */}
      <Chatbot scanResult={result} />
    </>
  );
}
