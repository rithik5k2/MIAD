import base64
import io
import numpy as np
from PIL import Image


def numpy_to_base64(img_array: np.ndarray) -> str:
    """(H,W,3) uint8 → base64 PNG string"""
    pil  = Image.fromarray(img_array.astype(np.uint8))
    buf  = io.BytesIO()
    pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def mask_to_base64(mask_np: np.ndarray) -> str:
    """(H,W) float {0,1} → base64 PNG grayscale"""
    img = (mask_np * 255).astype(np.uint8)
    pil = Image.fromarray(img, mode="L")
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
