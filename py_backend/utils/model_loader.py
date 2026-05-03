import os
import sys
import torch
import torch.nn as nn
from torchvision import models
from utils.unet import UNet
import requests
from pathlib import Path
import gc

# ── Globals ──────────────────────────────────────────────────────
clf_model = None
seg_model = None
device    = None

CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]

# ── Paths — relative to py_backend/ ──────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WEIGHTS_DIR = os.path.join(BASE_DIR, "model_weights")
CLF_MODEL_PATH = os.path.join(WEIGHTS_DIR, "efficientnet_brain_tumor_best.pth")
SEG_MODEL_PATH = os.path.join(WEIGHTS_DIR, "unet_brain_segmentation.pth")

# ── Model download URLs (Hugging Face) ──────────────────────────
CLF_MODEL_URL = "https://huggingface.co/Rithik2006/efficientnet_brain_tumor_best/resolve/main/efficientnet_brain_tumor_best.pth"
SEG_MODEL_URL = "https://huggingface.co/Rithik2006/efficientnet_brain_tumor_best/resolve/main/unet_brain_segmentation.pth"


def download_file(url, dest_path):
    """Download a file from URL to destination path with progress"""
    if os.path.exists(dest_path):
        print(f"✅ Model already exists at {dest_path}")
        return True
    
    print(f"📥 Downloading model from {url}...")
    print(f"   This may take a few minutes...")
    
    try:
        response = requests.get(url, stream=True)
        response.raise_for_status()
        
        total_size = int(response.headers.get('content-length', 0))
        Path(dest_path).parent.mkdir(parents=True, exist_ok=True)
        
        with open(dest_path, 'wb') as f:
            if total_size == 0:
                f.write(response.content)
            else:
                downloaded = 0
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
                    downloaded += len(chunk)
                    progress = int(100 * downloaded / total_size)
                    if progress % 10 == 0:
                        print(f"   Progress: {progress}%", end='\r')
                print(f"\n✅ Downloaded to {dest_path}")
        return True
        
    except Exception as e:
        print(f"❌ Download failed: {e}")
        return False


def load_models():
    global clf_model, seg_model, device
    
    # Force CPU only to save memory (CUDA libraries take extra RAM)
    device = torch.device("cpu")
    print(f"[model_loader] Using device: {device} (forced CPU for memory efficiency)")
    
    # Create weights directory if it doesn't exist
    Path(WEIGHTS_DIR).mkdir(parents=True, exist_ok=True)
    
    # Download models if they don't exist
    if not os.path.exists(CLF_MODEL_PATH):
        print(f"[model_loader] Classifier weights not found locally. Downloading...")
        if not download_file(CLF_MODEL_URL, CLF_MODEL_PATH):
            raise FileNotFoundError(f"Failed to download classifier weights from {CLF_MODEL_URL}")
    
    if not os.path.exists(SEG_MODEL_PATH):
        print(f"[model_loader] Segmentation weights not found locally. Downloading...")
        if not download_file(SEG_MODEL_URL, SEG_MODEL_PATH):
            raise FileNotFoundError(f"Failed to download segmentation weights from {SEG_MODEL_URL}")
    
    # ── 1. Classification — EfficientNetB0 ───────────────────────
    print("[model_loader] Loading classifier...")
    clf = models.efficientnet_b0(weights=None)
    clf.classifier = nn.Sequential(
        nn.Dropout(p=0.3, inplace=True),
        nn.Linear(1280, 4),
    )
    clf.load_state_dict(torch.load(CLF_MODEL_PATH, map_location=device))
    clf.to(device).eval()
    clf_model = clf
    print("[model_loader] ✅ Classifier ready.")
    
    # Force garbage collection to free memory
    gc.collect()
    
    # ── 2. Segmentation — UNet ────────────────────────────────────
    print("[model_loader] Loading segmenter...")
    seg = UNet(in_channels=3, out_channels=1)
    seg.load_state_dict(torch.load(SEG_MODEL_PATH, map_location=device))
    seg.to(device).eval()
    seg_model = seg
    print("[model_loader] ✅ Segmenter ready.")
    
    # Final memory cleanup
    gc.collect()


def get_clf_model():
    return clf_model, device

def get_seg_model():
    return seg_model, device

def get_class_names():
    return CLASS_NAMES