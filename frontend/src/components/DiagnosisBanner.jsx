const TUMOR_META = {
  glioma:     { emoji:"🔴", label:"Glioma Detected",          desc:"Malignant tumor in glial cells of the brain or spine. Specialist consultation recommended.", type:"tumor" },
  meningioma: { emoji:"🟡", label:"Meningioma Detected",      desc:"Tumor arising from the meninges surrounding the brain. Often slow-growing and treatable.", type:"tumor" },
  pituitary:  { emoji:"🟣", label:"Pituitary Tumor Detected", desc:"Tumor in the pituitary gland. Most pituitary tumors are benign and highly treatable.", type:"tumor" },
  notumor:    { emoji:"🟢", label:"No Tumor Detected",        desc:"No detectable tumor found in this MRI scan. Continue routine monitoring as advised.", type:"clear" },
};

export default function DiagnosisBanner({ result }) {
  const meta = TUMOR_META[result.tumor_type];
  const pct  = (result.confidence[result.tumor_type] * 100).toFixed(1);

  return (
    <div className={`diag-banner ${meta.type}`}>
      <div className="diag-inner">
        <div className="diag-icon">{meta.emoji}</div>
        <div className="diag-body">
          <div className="diag-eyebrow">
            {meta.type === "tumor" ? "Anomaly Detected" : "Analysis Complete"}
          </div>
          <div className="diag-title">{meta.label}</div>
          <div className="diag-desc">{meta.desc}</div>
        </div>
        <div className="diag-conf">
          <div className="conf-big">{pct}%</div>
          <div className="conf-lbl">Confidence</div>
        </div>
      </div>
    </div>
  );
}
