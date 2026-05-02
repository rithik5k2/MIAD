import os
import sys
import torch
import torch.nn as nn
from torchvision import models
from utils.unet import UNet

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


def load_models():
    global clf_model, seg_model, device
    if not os.path.exists(CLF_MODEL_PATH):
        raise FileNotFoundError(f"Classifier weights not found at {CLF_MODEL_PATH}")
    if not os.path.exists(SEG_MODEL_PATH):
        raise FileNotFoundError(f"Segmentation weights not found at {SEG_MODEL_PATH}")
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[model_loader] Using device: {device}")

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

    # ── 2. Segmentation — UNet ────────────────────────────────────
    print("[model_loader] Loading segmenter...")
    seg = UNet(in_channels=3, out_channels=1)
    seg.load_state_dict(torch.load(SEG_MODEL_PATH, map_location=device))
    seg.to(device).eval()
    seg_model = seg
    print("[model_loader] ✅ Segmenter ready.")


def get_clf_model():
    return clf_model, device

def get_seg_model():
    return seg_model, device

def get_class_names():
    return CLASS_NAMES
