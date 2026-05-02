const META = {
  glioma:     { label: "Glioma",      fill: "fill-glioma"     },
  meningioma: { label: "Meningioma",  fill: "fill-meningioma" },
  pituitary:  { label: "Pituitary",   fill: "fill-pituitary"  },
  notumor:    { label: "No Tumor",    fill: "fill-notumor"    },
};

export default function ConfidenceBar({ confidence, predicted }) {
  const sorted = Object.entries(confidence).sort((a, b) => b[1] - a[1]);
  return (
    <div className="conf-list">
      {sorted.map(([cls, prob]) => {
        const pct  = (prob * 100).toFixed(1);
        const top  = cls === predicted;
        const meta = META[cls] || { label: cls, fill: "fill-glioma" };
        return (
          <div className="conf-row" key={cls}>
            <div className="conf-row-head">
              <span className={`conf-name${top ? " top" : ""}`}>
                {meta.label}
                {top && <span className="pred-pill">Predicted</span>}
              </span>
              <span className={`conf-pct${top ? " top" : ""}`}>{pct}%</span>
            </div>
            <div className="track">
              <div className={`fill ${meta.fill}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
