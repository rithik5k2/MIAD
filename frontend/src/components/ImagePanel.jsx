export default function ImagePanel({ title, sub, base64, badgeClass, badgeText }) {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title-col">
          <div className="panel-title">{title}</div>
          <div className="panel-sub">{sub}</div>
        </div>
        <span className={`badge ${badgeClass}`}>{badgeText}</span>
      </div>
      <div className="panel-img-box">
        <img
          src={`data:image/png;base64,${base64}`}
          alt={title}
          className="panel-img"
        />
      </div>
    </div>
  );
}
