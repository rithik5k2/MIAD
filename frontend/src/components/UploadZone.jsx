import { useRef, useState } from "react";

export default function UploadZone({ onFileSelect, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    const ok = ["image/jpeg","image/png","image/webp","image/tiff"].some(t => file.type === t)
      || file.name.match(/\.(jpg|jpeg|png|tif|tiff|webp)$/i);
    if (ok) onFileSelect(file);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false);
    if (disabled) return;
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div
      className={`drop-zone ${dragging ? "dragging" : ""}`}
      onClick={() => !disabled && inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <div className="drop-zone-glow" />

      {/* Geometric upload icon — no emoji */}
      <div className="upload-icon-wrap">
        <div className="upload-icon-ring" />
        <div className="upload-icon-ring-outer" />
        <svg
          className="upload-icon-arrow"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 16V8M8 12l4-4 4 4" />
          <path d="M20 16.5A3.5 3.5 0 0 0 16.5 13H15a5 5 0 1 0-9.9 1A4 4 0 0 0 6 22h13a3 3 0 0 0 1-5.5" opacity="0.4"/>
        </svg>
      </div>

      <div className="drop-title">Drop your MRI scan here</div>
      <div className="drop-sub">
        or click to browse from your files
      </div>
      <div className="drop-formats">
        {["JPG","PNG","TIFF","WEBP"].map(f => (
          <span key={f} className="fmt-tag">{f}</span>
        ))}
      </div>

      <input
        ref={inputRef} type="file" hidden
        accept=".jpg,.jpeg,.png,.tif,.tiff,.webp"
        onChange={(e) => handleFile(e.target.files[0])}
      />
    </div>
  );
}
