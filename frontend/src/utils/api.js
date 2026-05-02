import axios from "axios";

// Vite proxy forwards /api → http://localhost:4000
// So we just use relative paths here
const api = axios.create({ baseURL: "/" });

export async function predictTumor(imageFile) {
  const form = new FormData();
  form.append("file", imageFile);
  const res = await api.post("/api/predict", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  });
  return res.data;
}
