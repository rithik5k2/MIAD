import { useEffect } from "react";

const TEAM = [
  { initials: "RR", name: "Renith Reddy Banda",     id: "23241A05D9", role: "Backend · AI",      color: "blue"   },
  { initials: "VR", name: "Veeraneni Rithik Rao",   id: "23241A05K2", role: "Model Training",    color: "green"  },
  { initials: "VS", name: "Vennam Samuel Rufus",     id: "23241A05K3", role: "Segmentation",      color: "amber"  },
  { initials: "YJ", name: "Yerraballi Jaya Aditya",  id: "23241A05K5", role: "Frontend · UI",     color: "purple" },
  { initials: "KV", name: "Kondapally Vivek",        id: "24245A0517", role: "Explainability",    color: "pink"   },
];

const FACULTY = [
  { initials: "PCR", name: "Dr. P. Chandrasekhar Reddy", role: "Project Guide",       dept: "Professor, Dept. of CSE",         color: "blue"   },
];

const STATS = [
  { val: "93.62%", label: "Classification Accuracy",   accent: true  },
  { val: "0.8456", label: "Dice Score (Segmentation)", accent: true  },
  { val: "7,000+", label: "MRI Images (Classification)", accent: false },
  { val: "3,929",  label: "Image–Mask Pairs (LGG)",    accent: false },
];

export default function About() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="about-page">

      {/* ── Hero ── */}
      <div className="about-hero">
        <div className="about-eyebrow">About the Project</div>
        <h1 className="about-h1">Built by Students,<br />Guided by Science</h1>
        <p className="about-sub">
          A comprehensive deep learning system for brain tumor detection —
          developed as a B.Tech mini project at GRIET, Hyderabad.
        </p>
      </div>

      <div className="about-body">

        {/* ── Stats ── */}
        <div className="about-section-label">Project at a Glance</div>
        <div className="about-stat-row">
          {STATS.map((s, i) => (
            <div className="about-stat-cell" key={i}>
              <span className={`about-stat-num${s.accent ? " accent" : ""}`}>{s.val}</span>
              <span className="about-stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Overview ── */}
        <div className="about-section-label">What We Built</div>
        <div className="about-overview-card">
          <h2 className="about-overview-title">Medical Image Anomaly Detection System</h2>
          <div className="about-overview-cols">
            <p>
              Brain tumors are among the most lethal diseases when undetected. Diagnosis through MRI traditionally
              demands hours of expert radiologist time and is prone to inter-observer variability. MIAD is an
              end-to-end deep learning pipeline that simultaneously <strong>classifies, localizes, and explains</strong> brain
              tumor findings from a single MRI scan upload — bridging the gap between AI research and real clinical utility.
            </p>
            <p>
              The system unifies three AI modules: an <strong>EfficientNetB0 classifier</strong> trained via two-stage transfer
              learning on ~7,000 labeled MRIs, a custom <strong>UNet segmentation model</strong> trained on 3,929 image-mask
              pairs from the LGG dataset, and a <strong>Grad-CAM explainability layer</strong> that generates spatial
              attention heatmaps. Everything is served through a FastAPI backend with a React frontend.
            </p>
          </div>
        </div>

        {/* ── Team ── */}
        <div className="about-section-label">Student Team</div>
        <div className="about-team-grid">
          {TEAM.map((m) => (
            <div className="about-team-card" key={m.id}>
              <div className={`about-avatar about-avatar-${m.color}`}>{m.initials}</div>
              <div className="about-member-name">{m.name}</div>
              <div className="about-member-id">{m.id}</div>
              <span className="about-role-tag">{m.role}</span>
            </div>
          ))}
        </div>

        {/* ── Faculty ── */}
        <div className="about-section-label">Faculty &amp; Guidance</div>
        <div className="about-faculty-grid">
          {FACULTY.map((f) => (
            <div className="about-faculty-card" key={f.initials}>
              <div className={`about-faculty-avatar about-avatar-${f.color}`}>{f.initials}</div>
              <div className="about-faculty-info">
                <div className="about-faculty-role">{f.role}</div>
                <div className="about-faculty-name">{f.name}</div>
                <div className="about-faculty-dept">{f.dept}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Institution ── */}
        <div className="about-section-label">Institution</div>
        <div className="about-inst-card">
          <div className="about-inst-logo">G</div>
          <div className="about-inst-text">
            <h3>Gokaraju Rangaraju Institute of Engineering and Technology (Autonomous)</h3>
            <p>Bachupalli, Kukatpally, Hyderabad, Telangana, India — 500090<br />
            Department of Computer Science and Engineering · Academic Year 2025–2026</p>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="about-section-label">Project Timeline</div>
        <div className="about-timeline-bar">
          <div className="about-tl-end">
            <span className="about-tl-tag">START</span>
            <span className="about-tl-date">12 Dec 2025</span>
          </div>
          <div className="about-tl-line">
            <span className="about-tl-mid">B.Tech Mini Project · CSE · GRIET</span>
          </div>
          <div className="about-tl-end">
            <span className="about-tl-date">25 Apr 2026</span>
            <span className="about-tl-tag">END</span>
          </div>
        </div>

      </div>
    </div>
  );
}