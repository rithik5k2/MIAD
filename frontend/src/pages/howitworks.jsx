import { useEffect } from "react";

const PIPELINE = [
  { num: "01", label: "Upload & Validate",   color: "blue",   desc: "User uploads a JPG, PNG, or TIF brain MRI. The backend validates format and file integrity before proceeding." },
  { num: "02", label: "Preprocessing",        color: "blue",   desc: "Images resized (224×224 for classification, 256×256 for segmentation), normalized with ImageNet stats, converted to tensors." },
  { num: "03", label: "Classify + Segment",   color: "green",  desc: "EfficientNetB0 predicts tumor type with confidence scores. UNet simultaneously generates a binary pixel mask of the tumor region." },
  { num: "04", label: "Grad-CAM",             color: "purple", desc: "Gradient-weighted activation maps from the last conv layer are overlaid on the MRI, showing exactly what the model focused on." },
  { num: "05", label: "Results & Report",     color: "amber",  desc: "Tumor type, confidence bars, risk score, heatmap, and segmentation mask are displayed. A downloadable clinical report is generated." },
];

const GCAM_STEPS = [
  { icon: "🔗", text: "Attach forward + backward hooks to model.features[−1]" },
  { icon: "↗",  text: "Forward pass → capture activation maps" },
  { icon: "∂",  text: "Backprop → compute gradient w.r.t. predicted class" },
  { icon: "⊗",  text: "Global avg pool gradients → channel importance weights" },
  { icon: "🎨", text: "ReLU → normalize [0,1] → upsample 224×224 → JET overlay" },
];

const RISKS = [
  { cls: "low",  label: "Low Risk",      range: "0–20",   advice: "No tumor detected. Routine monitoring as advised."                       },
  { cls: "mod",  label: "Moderate Risk", range: "21–50",  advice: "Low concern. Consult doctor for follow-up scan."                          },
  { cls: "high", label: "High Risk",     range: "51–75",  advice: "Seek specialist neurologist consultation promptly."                       },
  { cls: "crit", label: "Critical Risk", range: "76–100", advice: "Immediate neurosurgical consultation strongly advised."                   },
];

const TECH = [
  { name: "PyTorch",     cat: "Deep Learning",   color: "blue"   },
  { name: "FastAPI",     cat: "Backend API",     color: "blue"   },
  { name: "React.js",    cat: "Frontend UI",     color: "teal"   },
  { name: "OpenCV",      cat: "Image Processing",color: "green"  },
  { name: "NumPy",       cat: "Array Ops",       color: "amber"  },
  { name: "Gemini 2.5",  cat: "AI Chatbot",      color: "purple" },
  { name: "torchvision", cat: "Model Zoo",       color: "red"    },
  { name: "sklearn",     cat: "Metrics",         color: "gray"   },
  { name: "Pillow",      cat: "Image Utilities", color: "pink"   },
  { name: "Matplotlib",  cat: "Visualization",   color: "green"  },
  { name: "Vite",        cat: "Build Tool",      color: "teal"   },
  { name: "CUDA 13.0",   cat: "GPU Compute",     color: "blue"   },
];

const ARCH = [
  { head: "Data Input",  items: [{ label: "Hospital MRI Sources", c: "blue" }, { label: "Manual Upload (Web UI)", c: "gray" }, { label: "JPG · PNG · TIF", c: "gray" }] },
  { head: "Processing",  items: [{ label: "Data Validation", c: "gray" }, { label: "Resize + Normalize", c: "gray" }, { label: "Noise Reduction", c: "gray" }, { label: "Augmentation", c: "gray" }] },
  { head: "ML Layer",    items: [{ label: "EfficientNetB0", c: "blue" }, { label: "UNet Segmenter", c: "green" }, { label: "Grad-CAM XAI", c: "purple" }] },
  { head: "Inference",   items: [{ label: "Tumor Classification", c: "blue" }, { label: "Tumor Segmentation", c: "green" }, { label: "Explainability Map", c: "purple" }, { label: "Results Generation", c: "amber" }] },
  { head: "Application", items: [{ label: "Dashboard & Viz", c: "gray" }, { label: "Prediction Reports", c: "gray" }, { label: "Risk Score Meter", c: "amber" }, { label: "AI Chatbot (Gemini)", c: "purple" }] },
];

export default function HowItWorks() {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="hiw-page">

      {/* ── Hero ── */}
      <div className="hiw-hero">
        <div className="hiw-eyebrow">System Architecture</div>
        <h1 className="hiw-h1">From MRI Upload<br />to Clinical Insight</h1>
        <p className="hiw-sub">
          Three specialized deep learning modules work in unison — classification, segmentation,
          and explainability — all within a single API call.
        </p>
      </div>

      <div className="hiw-body">

        {/* ── Pipeline ── */}
        <div className="hiw-section-label">End-to-End Pipeline</div>
        <div className="hiw-pipeline">
          {PIPELINE.map((s, i) => (
            <div className="hiw-pipe-step" key={i}>
              <span className="hiw-pipe-num">{s.num}</span>
              <div className={`hiw-pipe-dot hiw-dot-${s.color}`} />
              <h4 className="hiw-pipe-title">{s.label}</h4>
              <p className="hiw-pipe-desc">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* ── Models ── */}
        <div className="hiw-section-label">Deep Learning Models</div>
        <div className="hiw-model-grid">

          {/* EfficientNetB0 */}
          <div className="hiw-model-card hiw-model-blue">
            <div className="hiw-model-badge hiw-badge-blue">Classification · EfficientNetB0</div>
            <h3 className="hiw-model-title">Tumor Classifier</h3>
            <div className="hiw-model-sub">4-class softmax · Transfer Learning · CrossEntropyLoss · Adam 1e-4</div>
            <p className="hiw-model-desc">
              The EfficientNetB0 backbone (pre-trained on ImageNet) is fine-tuned on ~7,000 brain MRI scans
              covering four classes: <strong>Glioma, Meningioma, Pituitary Tumor,</strong> and <strong>No Tumor</strong>.
              A custom classifier head replaces the original — Dropout(0.3) + Linear(1280→4) — to reduce
              overfitting on the smaller medical dataset.
            </p>
            <div className="hiw-phases">
              <div className="hiw-phase">
                <span className="hiw-phase-num">PHASE 1</span>
                <div>
                  <strong>Epochs 1–5: Frozen backbone</strong>
                  <p>Only the classifier head is trained. This prevents the pre-trained features from being corrupted by large gradients early on.</p>
                </div>
              </div>
              <div className="hiw-phase">
                <span className="hiw-phase-num">PHASE 2</span>
                <div>
                  <strong>Epochs 6–20: Full fine-tuning</strong>
                  <p>All layers unfrozen. Backbone trained at LR/10 = 1e-5. ReduceLROnPlateau halves LR after 3 stagnant epochs. Early stopping at patience = 5.</p>
                </div>
              </div>
            </div>
            <div className="hiw-pills">
              <span className="hiw-pill hiw-pill-blue">Accuracy <strong>93.62%</strong></span>
              <span className="hiw-pill">Dataset <strong>~7,000 MRIs</strong></span>
              <span className="hiw-pill">Best epoch <strong>18</strong></span>
              <span className="hiw-pill">No Tumor F1 <strong>1.00</strong></span>
            </div>
          </div>

          {/* UNet */}
          <div className="hiw-model-card hiw-model-green">
            <div className="hiw-model-badge hiw-badge-green">Segmentation · UNet</div>
            <h3 className="hiw-model-title">Tumor Segmenter</h3>
            <div className="hiw-model-sub">Binary sigmoid mask · Dice + BCE loss · Adam 1e-4</div>
            <p className="hiw-model-desc">
              A symmetric encoder-decoder UNet is trained from scratch on 3,929 image-mask pairs from the
              LGG Segmentation Dataset (110 lower-grade glioma patients, Cancer Genome Atlas). Skip connections
              preserve fine spatial detail lost during downsampling.
            </p>
            <div className="hiw-arch-box">
              <div className="hiw-arch-label">Architecture</div>
              <p>
                Encoder: 4× DoubleConv + MaxPool2d (channels: 3→64→128→256→512, bottleneck 1024)<br />
                Decoder: 4× ConvTranspose2d + DoubleConv with skip connections<br />
                Output: 1×1 Conv → single-channel logit mask → sigmoid threshold 0.5
              </p>
            </div>
            <p className="hiw-model-desc" style={{ marginTop: 12 }}>
              Tumor pixels occupy only 5–15% of an MRI slice. Pure BCE loss causes the model to predict
              all-background. The <strong>Dice + BCE combined loss</strong> directly penalizes false negatives
              and forces the model to learn tumor overlap.
            </p>
            <div className="hiw-pills">
              <span className="hiw-pill hiw-pill-green">Dice Score <strong>0.8456</strong></span>
              <span className="hiw-pill hiw-pill-green">IoU Score <strong>0.7475</strong></span>
              <span className="hiw-pill">Best epoch <strong>23</strong></span>
              <span className="hiw-pill">Dataset <strong>LGG / 3,929</strong></span>
            </div>
          </div>
        </div>

        {/* ── Grad-CAM ── */}
        <div className="hiw-gradcam-card">
          <div className="hiw-model-badge hiw-badge-purple">Explainability · Grad-CAM</div>
          <h3 className="hiw-model-title">Visual Decision Explainer</h3>
          <div className="hiw-model-sub">Gradient-weighted Class Activation Mapping · JET colormap overlay · 40% transparency</div>
          <p className="hiw-model-desc" style={{ maxWidth: 680 }}>
            Grad-CAM generates a spatial attention heatmap highlighting which regions of the MRI most influenced
            the classification decision. No model retraining is required — hooks are attached to the last
            convolutional layer of EfficientNetB0 at inference time, making explainability essentially free
            to compute.
          </p>
          <p className="hiw-model-desc" style={{ maxWidth: 680 }}>
            Gliomas activate the infiltrating FLAIR hyperintensity region. Meningiomas produce focal activation
            at the cortex-meninges interface. Pituitary lesions show activation confined to the sella/suprasella
            region — confirming the model has learned anatomically meaningful features.
          </p>
          <div className="hiw-gcam-steps">
            {GCAM_STEPS.map((s, i) => (
              <div className="hiw-gcam-step" key={i}>
                <span className="hiw-gcam-icon">{s.icon}</span>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── System Architecture ── */}
        <div className="hiw-section-label">System Layers</div>
        <div className="hiw-arch-grid">
          {ARCH.map((col) => (
            <div className="hiw-arch-col" key={col.head}>
              <div className="hiw-arch-col-head">{col.head}</div>
              <div className="hiw-arch-col-items">
                {col.items.map((item) => (
                  <div className={`hiw-arch-item hiw-arch-${item.c}`} key={item.label}>{item.label}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Risk Scores ── */}
        <div className="hiw-section-label">Risk Score System</div>
        <div className="hiw-risk-row">
          {RISKS.map((r) => (
            <div className={`hiw-risk-cell hiw-risk-${r.cls}`} key={r.cls}>
              <span className="hiw-risk-lbl">{r.label}</span>
              <span className="hiw-risk-val">{r.range}</span>
              <span className="hiw-risk-advice">{r.advice}</span>
            </div>
          ))}
        </div>

        {/* ── Tech Stack ── */}
        <div className="hiw-section-label">Technology Stack</div>
        <div className="hiw-tech-grid">
          {TECH.map((t) => (
            <div className="hiw-tech-item" key={t.name}>
              <span className={`hiw-tech-dot hiw-dot-${t.color}`} />
              <div>
                <span className="hiw-tech-name">{t.name}</span>
                <span className="hiw-tech-cat">{t.cat}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Datasets ── */}
        <div className="hiw-section-label">Datasets Used</div>
        <div className="hiw-dataset-grid">
          <div className="hiw-dataset-card">
            <div className="hiw-dataset-eyebrow hiw-ds-blue">Classification Dataset</div>
            <h4 className="hiw-dataset-title">Brain Tumor MRI Dataset</h4>
            <p className="hiw-dataset-desc">
              ~7,000 JPG/PNG brain MRI images from Kaggle, split equally across 4 classes. Used to train the
              EfficientNetB0 classifier with augmentation (horizontal flip, ±15° rotation, color jitter).
            </p>
            <div className="hiw-ds-tags">
              <span className="hiw-ds-tag hiw-badge-blue">Glioma</span>
              <span className="hiw-ds-tag hiw-badge-green">Meningioma</span>
              <span className="hiw-ds-tag hiw-badge-amber">Pituitary</span>
              <span className="hiw-ds-tag">No Tumor</span>
            </div>
          </div>
          <div className="hiw-dataset-card">
            <div className="hiw-dataset-eyebrow hiw-ds-green">Segmentation Dataset</div>
            <h4 className="hiw-dataset-title">LGG Segmentation Dataset</h4>
            <p className="hiw-dataset-desc">
              3,929 TIFF image-mask pairs from 110 lower-grade glioma patients in The Cancer Genome Atlas.
              Each mask is a binary FLAIR abnormality annotation. 3-channel T1 pre/post-contrast + FLAIR
              sequences per patient.
            </p>
            <div className="hiw-ds-tags">
              <span className="hiw-ds-tag hiw-badge-green">110 Patients</span>
              <span className="hiw-ds-tag">TIFF Format</span>
              <span className="hiw-ds-tag">TCGA Source</span>
            </div>
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="hiw-disclaimer">
          <span className="hiw-disclaimer-icon">⚠</span>
          <p>
            For <strong>educational and research purposes only.</strong> MIAD is a diagnostic support tool,
            not a replacement for qualified radiologist or physician assessment. Always consult a medical
            professional for diagnosis and treatment decisions.
          </p>
        </div>

      </div>
    </div>
  );
}