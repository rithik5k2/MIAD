import { calcRiskScore, getRiskLevel, getRiskAdvice } from "../utils/riskScore";

export default function ReportDownload({ result, preview }) {
  const score  = calcRiskScore(result.confidence);
  const risk   = getRiskLevel(score);
  const advice = getRiskAdvice(score, result.tumor_type);
  const now    = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const topConf = (Math.max(...Object.values(result.confidence)) * 100).toFixed(1);

  const TUMOR_INFO = {
    glioma:     { full: "Glioma", desc: "A tumor that starts in the glial cells of the brain or spine. Can be low-grade (slow growing) or high-grade (aggressive). Requires immediate neurological evaluation.", next: "Neurosurgery consult, MRI with contrast, possible biopsy." },
    meningioma: { full: "Meningioma", desc: "A tumor arising from the meninges — membranes surrounding the brain and spinal cord. Usually benign and slow-growing. May not require immediate surgery.", next: "Neurology follow-up, monitoring MRI in 3–6 months." },
    pituitary:  { full: "Pituitary Adenoma", desc: "A benign tumor of the pituitary gland. Often causes hormonal imbalances. Most are non-cancerous and treatable with medication or surgery.", next: "Endocrinology consult, hormone panel blood tests." },
    notumor:    { full: "No Tumor Detected", desc: "Analysis indicates no significant tumor presence in the MRI scan. The brain tissue appears within normal parameters for AI detection.", next: "Continue routine check-ups. Consult physician if symptoms persist." },
  };

  const info = TUMOR_INFO[result.tumor_type] || TUMOR_INFO.notumor;

  const handleDownload = () => {
    const win = window.open("", "_blank");

    const confRows = Object.entries(result.confidence).map(([k, v]) => {
      const pct = (v * 100).toFixed(1);
      const barColor =
        k === "glioma"     ? "#dc2626" :
        k === "meningioma" ? "#d97706" :
        k === "pituitary"  ? "#7c3aed" : "#059669";
      return `
        <tr>
          <td style="padding:7px 10px;text-transform:capitalize;font-weight:${k === result.tumor_type ? "700" : "400"};color:${k === result.tumor_type ? "#0f172a" : "#475569"}">
            ${k === "notumor" ? "No Tumor" : k.charAt(0).toUpperCase() + k.slice(1)}
            ${k === result.tumor_type ? ' <span style="background:#eff6ff;color:#2563eb;font-size:8px;padding:2px 6px;border-radius:3px;border:1px solid #bfdbfe;letter-spacing:0.08em;text-transform:uppercase">PREDICTED</span>' : ""}
          </td>
          <td style="padding:7px 10px;">
            <div style="background:#e2e8f0;border-radius:99px;height:6px;width:180px;overflow:hidden">
              <div style="background:${barColor};height:100%;width:${pct}%;border-radius:99px"></div>
            </div>
          </td>
          <td style="padding:7px 10px;font-weight:600;color:#0f172a;font-family:'Courier New',monospace">${pct}%</td>
        </tr>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>MIAD Report — ${dateStr}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', Arial, sans-serif; background: #fff; color: #0f172a; font-size: 13px; }
    .page { max-width: 780px; margin: 0 auto; padding: 40px 48px; }

    /* Header */
    .rpt-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; border-bottom: 2px solid #2563eb; margin-bottom: 24px; }
    .rpt-logo { font-size: 28px; font-weight: 800; letter-spacing: -0.04em; color: #0f172a; }
    .rpt-logo span { color: #2563eb; }
    .rpt-logo-sub { font-size: 9px; color: #94a3b8; letter-spacing: 0.18em; text-transform: uppercase; margin-top: 3px; font-family: 'Courier New', monospace; }
    .rpt-meta { text-align: right; }
    .rpt-meta-title { font-size: 11px; color: #94a3b8; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; font-family: 'Courier New', monospace; }
    .rpt-meta-val { font-size: 12px; color: #475569; line-height: 1.8; }

    /* Diagnosis box */
    .diag-box { border-radius: 10px; padding: 20px 24px; margin-bottom: 20px; border-left: 4px solid ${result.tumor_type === "notumor" ? "#059669" : "#dc2626"}; background: ${result.tumor_type === "notumor" ? "rgba(5,150,105,0.04)" : "rgba(220,38,38,0.04)"}; border: 1px solid ${result.tumor_type === "notumor" ? "rgba(5,150,105,0.15)" : "rgba(220,38,38,0.15)"}; border-left: 4px solid ${result.tumor_type === "notumor" ? "#059669" : "#dc2626"}; }
    .diag-label { font-size: 9px; color: ${result.tumor_type === "notumor" ? "#059669" : "#dc2626"}; letter-spacing: 0.2em; text-transform: uppercase; margin-bottom: 6px; font-family: 'Courier New', monospace; }
    .diag-name { font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px; }
    .diag-conf-line { font-size: 11px; color: #475569; }

    /* Risk box */
    .risk-box { border-radius: 10px; padding: 16px 20px; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; background: ${risk.bg}; border: 1px solid ${risk.border}; }
    .risk-score-big { font-size: 42px; font-weight: 800; color: ${risk.color}; letter-spacing: -0.04em; line-height: 1; flex-shrink: 0; }
    .risk-score-label { font-size: 9px; color: #94a3b8; font-family: 'Courier New', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
    .risk-level-badge { display: inline-block; background: ${risk.color}; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; }
    .risk-advice-text { font-size: 12px; color: #475569; line-height: 1.6; }

    /* Section */
    .section { margin-bottom: 20px; }
    .section-title { font-size: 10px; color: #94a3b8; letter-spacing: 0.18em; text-transform: uppercase; font-family: 'Courier New', monospace; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }

    /* Table */
    table { width: 100%; border-collapse: collapse; }
    th { padding: 7px 10px; text-align: left; font-size: 9px; color: #94a3b8; letter-spacing: 0.12em; text-transform: uppercase; font-family: 'Courier New', monospace; border-bottom: 1px solid #e2e8f0; }
    td { border-bottom: 1px solid #f1f5f9; font-size: 12.5px; }

    /* Info rows */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-item { background: #f8fafc; border-radius: 8px; padding: 12px 14px; border: 1px solid #e2e8f0; }
    .info-item-label { font-size: 9px; color: #94a3b8; letter-spacing: 0.14em; text-transform: uppercase; font-family: 'Courier New', monospace; margin-bottom: 4px; }
    .info-item-val { font-size: 12.5px; font-weight: 600; color: #0f172a; }

    /* Tumor info */
    .tumor-desc { background: #f8fafc; border-radius: 8px; padding: 14px 16px; border: 1px solid #e2e8f0; margin-bottom: 10px; font-size: 12.5px; color: #475569; line-height: 1.7; }
    .next-steps { background: rgba(37,99,235,0.04); border-radius: 8px; padding: 14px 16px; border: 1px solid rgba(37,99,235,0.12); font-size: 12.5px; color: #1e40af; line-height: 1.7; }
    .next-label { font-size: 9px; color: #2563eb; letter-spacing: 0.14em; text-transform: uppercase; font-family: 'Courier New', monospace; margin-bottom: 5px; }

    /* Disclaimer */
    .disclaimer { margin-top: 24px; padding: 12px 16px; border-radius: 8px; background: rgba(217,119,6,0.05); border: 1px solid rgba(217,119,6,0.2); border-left: 3px solid #d97706; font-size: 11px; color: #92400e; line-height: 1.7; }

    /* Footer */
    .rpt-footer { margin-top: 28px; padding-top: 14px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 9.5px; color: #94a3b8; font-family: 'Courier New', monospace; letter-spacing: 0.05em; }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .page { padding: 20px 28px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="rpt-header">
    <div>
      <div class="rpt-logo">MI<span>AD</span></div>
      <div class="rpt-logo-sub">Medical Image Anomaly Detection</div>
    </div>
    <div class="rpt-meta">
      <div class="rpt-meta-title">Analysis Report</div>
      <div class="rpt-meta-val">
        Date: ${dateStr}<br/>
        Time: ${timeStr}<br/>
        Report ID: MIAD-${Date.now().toString().slice(-8)}
      </div>
    </div>
  </div>

  <!-- Diagnosis -->
  <div class="section">
    <div class="section-title">Primary Diagnosis</div>
    <div class="diag-box">
      <div class="diag-label">${result.tumor_type === "notumor" ? "✓ No Tumor Detected" : "⚠ Tumor Detected"}</div>
      <div class="diag-name">${info.full}</div>
      <div class="diag-conf-line">Model confidence: <strong>${topConf}%</strong> &nbsp;·&nbsp; Classification model: EfficientNetB0 &nbsp;·&nbsp; Segmentation: UNet</div>
    </div>
  </div>

  <!-- Risk Score -->
  <div class="section">
    <div class="section-title">Patient Risk Assessment</div>
    <div class="risk-box">
      <div>
        <div class="risk-score-big">${score}</div>
        <div class="risk-score-label">/ 100</div>
      </div>
      <div>
        <div class="risk-level-badge">${risk.label}</div>
        <div class="risk-advice-text">${advice}</div>
      </div>
    </div>
  </div>

  <!-- Confidence Scores -->
  <div class="section">
    <div class="section-title">Classification Confidence Scores</div>
    <table>
      <thead><tr><th>Tumor Type</th><th>Confidence Bar</th><th>Score</th></tr></thead>
      <tbody>${confRows}</tbody>
    </table>
  </div>

  <!-- Model Info -->
  <div class="section">
    <div class="section-title">Model Performance</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-item-label">Classification Model</div>
        <div class="info-item-val">EfficientNetB0</div>
      </div>
      <div class="info-item">
        <div class="info-item-label">Classification Accuracy</div>
        <div class="info-item-val">93.62%</div>
      </div>
      <div class="info-item">
        <div class="info-item-label">Segmentation Model</div>
        <div class="info-item-val">Custom UNet</div>
      </div>
      <div class="info-item">
        <div class="info-item-label">Dice Score (Segmentation)</div>
        <div class="info-item-val">0.8456</div>
      </div>
      <div class="info-item">
        <div class="info-item-label">IoU Score</div>
        <div class="info-item-val">0.7475</div>
      </div>
      <div class="info-item">
        <div class="info-item-label">Explainability</div>
        <div class="info-item-val">Grad-CAM</div>
      </div>
    </div>
  </div>

  <!-- About Tumor -->
  <div class="section">
    <div class="section-title">About the Detected Condition</div>
    <div class="tumor-desc">${info.desc}</div>
    <div class="next-label">Recommended Next Steps</div>
    <div class="next-steps">${info.next}</div>
  </div>

  <!-- Disclaimer -->
  <div class="disclaimer">
    <strong>⚠ Medical Disclaimer:</strong> This report is generated by an AI system for <strong>educational and research purposes only</strong>.
    It is not a substitute for professional medical diagnosis. The results must be reviewed and validated by a qualified
    radiologist, neurologist, or neurosurgeon before any clinical decisions are made.
    Always consult a licensed medical professional.
  </div>

  <!-- Footer -->
  <div class="rpt-footer">
    <span>MIAD · Medical Image Anomaly Detection System · B.Tech Research Project · 2026</span>
    <span>Generated: ${dateStr} ${timeStr}</span>
  </div>

</div>
<script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    win.document.write(html);
    win.document.close();
  };

  return (
    <button className="btn-report" onClick={handleDownload} title="Download PDF Report">
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="12" y1="18" x2="12" y2="12"/>
        <line x1="9" y1="15" x2="15" y2="15"/>
      </svg>
      Download Report
    </button>
  );
}
