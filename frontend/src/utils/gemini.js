// ── Gemini 2.5 Flash API ─────────────────────────────────────────
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("Missing VITE_GEMINI_API_KEY in .env file");
}
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

// ── System prompt ────────────────────────────────────────────────
function buildSystemPrompt(scanResult) {
  const hasScan = scanResult !== null && scanResult !== undefined;

  const scanContext = hasScan
    ? `
CURRENT SCAN RESULTS (just analyzed):
- Detected: ${scanResult.tumor_type.toUpperCase()}
- Confidence Scores:
  • Glioma:      ${(scanResult.confidence.glioma * 100).toFixed(1)}%
  • Meningioma:  ${(scanResult.confidence.meningioma * 100).toFixed(1)}%
  • Pituitary:   ${(scanResult.confidence.pituitary * 100).toFixed(1)}%
  • No Tumor:    ${(scanResult.confidence.notumor * 100).toFixed(1)}%
- Highest Confidence: ${(Math.max(...Object.values(scanResult.confidence)) * 100).toFixed(1)}%
- Models: EfficientNetB0 (93.62% accuracy) + UNet (Dice: 0.8456)

Always refer to these exact numbers when the user asks about their scan.
If tumor detected, be empathetic but informative.
If no tumor, reassure but still recommend consulting a doctor.`
    : `
No scan has been analyzed yet.
If the user asks about results, tell them to upload an MRI scan first using the upload section above.`;

  return `You are MIAD Assistant — an AI built into the Medical Image Anomaly Detection system.
You help users understand their brain MRI scan results and learn about brain tumors.
${scanContext}

YOUR BEHAVIOR:
- If a scan was analyzed, always refer to the actual results when answering
- Start by acknowledging the specific finding (e.g. "Based on your scan showing Glioma...")
- Explain what each tumor type means in simple, plain language
- Explain confidence scores when asked — higher means more certain
- Explain what Grad-CAM heatmaps and segmentation masks visually represent
- Be empathetic — the user may be anxious about their results

WHAT YOU SHOULD HELP WITH:
- What glioma, meningioma, and pituitary tumors are
- What the confidence percentages mean
- What the segmentation mask and heatmap visuals show
- **General info about brain tumor symptoms, treatment options, and next steps
- What questions the user should ask their doctor

STRICT RULES:
- Never diagnose, prescribe, or give specific treatment advice
- Always recommend consulting a neurologist or radiologist for real medical decisions
- Keep responses to 3-5 sentences unless user asks for more detail
- If asked something unrelated to medical or brain tumor topics, politely redirect
- Never claim this system replaces professional medical imaging or diagnosis
- Always be transparent that you are an AI when asked`;
}

// ── Main function ────────────────────────────────────────────────
export async function askGemini(userMessage, scanResult, chatHistory = []) {
  const history = chatHistory.slice(1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

  const body = {
    system_instruction: {
      parts: [{ text: buildSystemPrompt(scanResult) }],
    },
    contents: [
      ...history,
      {
        role: "user",
        parts: [{ text: userMessage }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  let res;
  try {
    res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (networkErr) {
    console.error("[gemini] Network error:", networkErr);
    throw new Error("Network error — check internet connection.");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Gemini API error ${res.status}`;
    console.error("[gemini] API error:", res.status, msg);
    throw new Error(msg);
  }

  const data = await res.json();
  return (
    data.candidates?.[0]?.content?.parts?.[0]?.text ||
    "Sorry, I couldn't generate a response."
  );
}