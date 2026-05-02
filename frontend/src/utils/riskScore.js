// ── Risk Score Calculator ─────────────────────────────────────
// Weighted formula based on clinical severity of each tumor type:
//   Glioma      → 1.0  (highest — often malignant)
//   Meningioma  → 0.65 (medium  — usually benign but needs monitoring)
//   Pituitary   → 0.45 (lower   — mostly benign, treatable)
//   No Tumor    → 0.0  (zero risk)

export function calcRiskScore(confidence) {
  const { glioma = 0, meningioma = 0, pituitary = 0, notumor = 0 } = confidence;
  const raw =
    glioma     * 1.00 +
    meningioma * 0.65 +
    pituitary  * 0.45 +
    notumor    * 0.00;
  return Math.round(Math.min(raw * 100, 100));
}

export function getRiskLevel(score) {
  if (score <= 20) return { label: "Low Risk",      color: "#059669", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)"  };
  if (score <= 50) return { label: "Moderate Risk", color: "#d97706", bg: "rgba(217,119,6,0.08)",  border: "rgba(217,119,6,0.2)"  };
  if (score <= 75) return { label: "High Risk",     color: "#ea580c", bg: "rgba(234,88,12,0.08)",  border: "rgba(234,88,12,0.2)"  };
  return              { label: "Critical Risk",  color: "#dc2626", bg: "rgba(220,38,38,0.08)",  border: "rgba(220,38,38,0.2)"  };
}

export function getRiskAdvice(score, tumorType) {
  if (tumorType === "notumor") {
    return "No tumor detected. Continue routine check-ups as advised by your physician.";
  }
  if (score <= 20) return "Low concern. Consult your doctor for a follow-up scan.";
  if (score <= 50) return "Moderate concern. Schedule an appointment with a neurologist soon.";
  if (score <= 75) return "High concern. Seek specialist consultation promptly.";
  return "Critical concern. Immediate consultation with a neurosurgeon is strongly advised.";
}
