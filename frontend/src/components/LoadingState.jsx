import { useEffect, useState } from "react";

const STEPS = [
  "Preprocessing MRI image...",
  "Running EfficientNetB0 classifier...",
  "Generating Grad-CAM heatmap...",
  "Running UNet segmentation...",
  "Encoding and returning results...",
];

export default function LoadingState() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive(s => (s + 1) % STEPS.length), 1900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="loading-view">
      <div className="rings">
        <div className="ring r1" />
        <div className="ring r2" />
        <div className="ring r3" />
      </div>
      <div className="loading-title">Analyzing Scan</div>
      <div className="loading-sub">Please wait — this may take 15–30 seconds on CPU</div>
      <div className="steps">
        {STEPS.map((s, i) => (
          <div key={i} className={`step${i === active ? " active" : ""}`}>
            {i === active ? "▶ " : "  "}{s}
          </div>
        ))}
      </div>
    </div>
  );
}
