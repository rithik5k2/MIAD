# 🧠 Medical Image Anomaly Detection
**EfficientNetB0 Classification · UNet Segmentation · Grad-CAM**
**Stack: React → Node.js Gateway → Python FastAPI → PyTorch**

---

## 📁 Complete Project Structure

```
MIAD/
│
├── py_backend/                        ← Python FastAPI (port 8000)
│   ├── main.py                        ← FastAPI app entry point
│   ├── requirements.txt
│   ├── model_weights/                 ← ⚠️ PUT YOUR .pth FILES HERE
│   │   ├── efficientnet_brain_tumor_best.pth
│   │   └── unet_brain_segmentation.pth
│   ├── routers/
│   │   ├── __init__.py
│   │   └── predict.py                 ← POST /api/predict (inference)
│   └── utils/
│       ├── __init__.py
│       ├── unet.py                    ← UNet architecture (exact match)
│       ├── model_loader.py            ← loads both models at startup
│       ├── preprocessing.py           ← YOUR exact transforms (clf+seg)
│       ├── gradcam.py                 ← Grad-CAM implementation
│       └── image_utils.py             ← base64 encoding helpers
│
├── node_server/                       ← Node.js Gateway (port 4000)
│   ├── package.json
│   └── server.js                      ← forwards uploads to Python
│
├── frontend/                          ← React + Vite (port 5173)
│   ├── package.json
│   ├── vite.config.js                 ← proxy /api → localhost:4000
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx                    ← main app logic
│       ├── index.css                  ← full design system (no Tailwind)
│       ├── utils/
│       │   └── api.js                 ← axios to /api/predict
│       └── components/
│           ├── UploadZone.jsx         ← drag & drop MRI upload
│           ├── DiagnosisBanner.jsx    ← result header card
│           ├── ConfidenceBar.jsx      ← animated class bars
│           ├── ImagePanel.jsx         ← base64 image display
│           └── LoadingState.jsx       ← animated loading rings
│
└── README.md
```

---

## 🚀 Setup: 3 Terminals, 3 Servers

### ── STEP 1: Copy Model Weights ──────────────────────────────
```
py_backend/model_weights/
  ├── efficientnet_brain_tumor_best.pth    ← from your models/ folder
  └── unet_brain_segmentation.pth          ← from your models/ folder
```

### ── STEP 2: Python Backend (Terminal 1) ────────────────────
```bash
cd MIAD/py_backend

python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```
✅ http://localhost:8000
✅ http://localhost:8000/docs  (Swagger UI — test here first)

### ── STEP 3: Node Gateway (Terminal 2) ──────────────────────
```bash
cd MIAD/node_server

npm install
npm run dev           # uses nodemon (auto-reload)
# OR: npm start       # plain node
```
✅ http://localhost:4000

### ── STEP 4: React Frontend (Terminal 3) ────────────────────
```bash
cd MIAD/frontend

npm install
npm run dev
```
✅ http://localhost:5173  ← open this in browser

---

## 🔌 Request Flow

```
Browser (5173)
    │  POST /api/predict  (multipart image)
    ▼
Vite proxy → Node.js (4000)
    │  forwards file with FormData
    ▼
Python FastAPI (8000)
    │  1. EfficientNetB0 → tumor_type + confidence
    │  2. Grad-CAM       → heatmap overlay
    │  3. UNet           → segmentation mask + tumor overlay
    ▼
JSON response (base64 images)
    │
    ▼
React renders results
```

---

## 📡 API Reference

### POST /api/predict
**Request:**
```
Content-Type: multipart/form-data
Body: file = <image>   (JPG / PNG / TIF)
```

**Response:**
```json
{
  "tumor_type": "glioma",
  "confidence": {
    "glioma":     0.8742,
    "meningioma": 0.0812,
    "pituitary":  0.0312,
    "notumor":    0.0134
  },
  "segmentation_mask": "<base64 PNG>",
  "gradcam_overlay":   "<base64 PNG>",
  "tumor_overlay":     "<base64 PNG>"
}
```

**Class order (must match training):**
```python
["glioma", "meningioma", "notumor", "pituitary"]
```

---

## 🔧 Model Specs

| Property       | Classification        | Segmentation         |
|----------------|-----------------------|----------------------|
| Architecture   | EfficientNetB0        | UNet (custom)        |
| Input size     | 224 × 224             | 256 × 256            |
| Channels       | 3 (RGB)               | 3 (RGB)              |
| Norm mean      | [0.485,0.456,0.406]   | [0.485,0.456,0.406]  |
| Norm std       | [0.229,0.224,0.225]   | [0.229,0.224,0.225]  |
| Output         | 4-class softmax       | Binary mask (sigmoid)|
| Threshold      | argmax                | > 0.5                |

---

## 🧪 Quick Test (no frontend needed)

```bash
# Test Python directly
curl -X POST http://localhost:8000/api/predict \
  -F "file=@your_mri.jpg"

# Test through Node gateway
curl -X POST http://localhost:4000/api/predict \
  -F "file=@your_mri.jpg"
```

Or visit http://localhost:8000/docs for interactive Swagger UI.

---

## ⚠️ Disclaimer
Educational and research use only.
Not a substitute for professional medical diagnosis.
