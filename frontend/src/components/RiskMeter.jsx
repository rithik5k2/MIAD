import React from "react";

const RISK_LEVELS = [
  { label: "Low",      range: "0–20",   color: "#059669", min: 0,  max: 20  },
  { label: "Moderate", range: "21–50",  color: "#d97706", min: 21, max: 50  },
  { label: "High",     range: "51–75",  color: "#ea580c", min: 51, max: 75  },
  { label: "Critical", range: "76–100", color: "#dc2626", min: 76, max: 100 },
];

function getRiskLevel(score) {
  return RISK_LEVELS.find(r => score >= r.min && score <= r.max) || RISK_LEVELS[0];
}

function computeRiskScore(confidence, tumorType) {
  if (!confidence) return 0;
  const type = (tumorType || "").toLowerCase();
  const conf = confidence[type] ?? confidence[Object.keys(confidence)[0]] ?? 0;
  const pct = typeof conf === "number" ? conf * 100 : parseFloat(conf);

  const severityWeight = {
    glioma: 1.0,
    meningioma: 0.75,
    pituitary: 0.6,
    notumor: 0.0,
    "no tumor": 0.0,
  };
  const weight = severityWeight[type] ?? 0.5;
  return Math.round(pct * weight);
}

export default function RiskMeter({ confidence, tumorType }) {
  const score = computeRiskScore(confidence, tumorType);
  const risk  = getRiskLevel(score);

  // SVG arc gauge math
  // viewBox: 0 0 220 130  (semi-circle)
  const cx = 110, cy = 110, r = 80;
  const startAngle = -180; // left
  const endAngle   = 0;    // right
  const totalDeg   = 180;

  // Full arc path (background)
  const toRad = (deg) => (deg * Math.PI) / 180;
  const arcPath = (start, end, radius) => {
    const s = { x: cx + radius * Math.cos(toRad(start)), y: cy + radius * Math.sin(toRad(start)) };
    const e = { x: cx + radius * Math.cos(toRad(end)),   y: cy + radius * Math.sin(toRad(end))   };
    const large = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y}`;
  };

  // Score arc: map score (0–100) → angle (-180 to 0)
  const scoreAngle = startAngle + (score / 100) * totalDeg;
  const scorePath  = arcPath(startAngle, scoreAngle, r);

  // Needle
  const needleAngle = startAngle + (score / 100) * totalDeg;
  const needleRad   = toRad(needleAngle);
  const needleLen   = 60;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  // Badge text
  const badgeLabel = risk.label.toUpperCase() + " RISK";

  // Advice
  const adviceMap = {
    Low:      { text: "Low concern. Routine monitoring advised.", icon: "✅", bg: "rgba(5,150,105,0.08)",  border: "rgba(5,150,105,0.2)",  color: "#065f46" },
    Moderate: { text: "Moderate concern. Follow up with a specialist.", icon: "🔶", bg: "rgba(217,119,6,0.08)", border: "rgba(217,119,6,0.2)",  color: "#92400e" },
    High:     { text: "Elevated risk detected. Please consult a qualified neurologist or radiologist at the earliest — early evaluation matters.", icon: "💡", bg: "rgba(234,88,12,0.08)", border: "rgba(234,88,12,0.2)", color: "#9a3412" },
    Critical: { text: "Critical. Immediate medical attention required.", icon: "🚨", bg: "rgba(220,38,38,0.08)", border: "rgba(220,38,38,0.2)",  color: "#991b1b" },
  };
  const advice = adviceMap[risk.label];

  return (
    <div className="risk-meter-card">
      {/* Header */}
      <div className="panel-head">
        <div>
          <div className="panel-title">Patient Risk Score</div>
          <div className="panel-sub">Weighted severity · Clinical estimate</div>
        </div>
        <span
          className="badge"
          style={{
            background: `${risk.color}18`,
            color: risk.color,
            border: `1px solid ${risk.color}44`,
          }}
        >
          {badgeLabel}
        </span>
      </div>

      <div className="risk-body">
        {/* Gauge */}
        <div className="risk-gauge-wrap">
          <svg
            className="risk-svg"
            viewBox="0 0 220 120"
            xmlns="http://www.w3.org/2000/svg"
            style={{ overflow: "visible" }}
          >
            {/* Background arc */}
            <path
              d={arcPath(-180, 0, r)}
              fill="none"
              stroke="var(--bg-deep)"
              strokeWidth="14"
              strokeLinecap="round"
            />

            {/* Colored score arc */}
            {score > 0 && (
              <path
                d={scorePath}
                fill="none"
                stroke={risk.color}
                strokeWidth="14"
                strokeLinecap="round"
                style={{ transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)" }}
              />
            )}

            {/* Needle */}
            <line
              x1={cx} y1={cy}
              x2={nx} y2={ny}
              stroke={risk.color}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transition: "all 1.2s cubic-bezier(0.22,1,0.36,1)" }}
            />
            <circle cx={cx} cy={cy} r="6" fill={risk.color} />
            <circle cx={cx} cy={cy} r="3" fill="white" />

            {/* Score text */}
            <text
              x={cx} y={cy - 14}
              textAnchor="middle"
              fontSize="32"
              fontWeight="800"
              fontFamily="'Syne', sans-serif"
              fill={risk.color}
              style={{ transition: "fill 0.6s" }}
            >
              {score}
            </text>
            

            {/* Min / Max labels */}
            <text x="18"  y="118" fontSize="9" fontFamily="'DM Mono', monospace" fill="var(--text-tertiary)">0</text>
            <text x="192" y="118" fontSize="9" fontFamily="'DM Mono', monospace" fill="var(--text-tertiary)">100</text>
          </svg>
        </div>

        {/* Risk Scale */}
        <div className="risk-scale" style={{ marginBottom: "14px" }}>
          {RISK_LEVELS.map((lvl) => (
            <div
              className="risk-scale-item"
              key={lvl.label}
              style={{
                background: score >= lvl.min && score <= lvl.max
                  ? `${lvl.color}12` : "var(--bg-elevated)",
                border: score >= lvl.min && score <= lvl.max
                  ? `1px solid ${lvl.color}44` : "1px solid transparent",
                borderRadius: "var(--r-sm)",
                padding: "5px 8px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <div className="risk-dot" style={{ background: lvl.color }} />
              <span className="risk-scale-label">{lvl.label}</span>
              <span className="risk-scale-range">{lvl.range}</span>
            </div>
          ))}
        </div>

        {/* Advice box */}
        <div
          className="risk-advice"
          style={{
            background: advice.bg,
            borderColor: advice.border,
          }}
        >
          <span className="risk-advice-icon">{advice.icon}</span>
          <span className="risk-advice-text" style={{ color: advice.color }}>
            {advice.text}
          </span>
        </div>
      </div>
    </div>
  );
}