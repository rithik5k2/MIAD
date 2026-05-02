import torch
import numpy as np
from torchvision import transforms
from PIL import Image
import io

# ─────────────────────────────────────────────
# CLASSIFICATION TRANSFORM (EfficientNet)
# Matches test_transform from train.py
# ─────────────────────────────────────────────
clf_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])

# ─────────────────────────────────────────────
# SEGMENTATION TRANSFORM (UNet)
# Matches LGGDataset img_transform from segmentation_train.py
# ─────────────────────────────────────────────
seg_transform = transforms.Compose([
    transforms.Resize((256, 256)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    ),
])


# ─────────────────────────────────────────────
# BYTE → PIL
# ─────────────────────────────────────────────
def bytes_to_pil(image_bytes: bytes) -> Image.Image:
    return Image.open(io.BytesIO(image_bytes)).convert("RGB")


# ─────────────────────────────────────────────
# CLASSIFICATION PREPROCESS
# Output shape: (1, 3, 224, 224)
# ─────────────────────────────────────────────
def preprocess_for_classification(pil_image: Image.Image) -> torch.Tensor:
    tensor = clf_transform(pil_image)
    return tensor.unsqueeze(0)


# ─────────────────────────────────────────────
# SEGMENTATION PREPROCESS
# Output shape: (1, 3, 256, 256)
# ─────────────────────────────────────────────
def preprocess_for_segmentation(pil_image: Image.Image) -> torch.Tensor:
    tensor = seg_transform(pil_image)
    return tensor.unsqueeze(0)


# ─────────────────────────────────────────────
# DENORMALIZE (for visualization)
# Input:  (3, H, W) tensor (single image, no batch dim)
# Output: (H, W, 3) numpy float32 in [0, 1]
# ─────────────────────────────────────────────
def denormalize(tensor: torch.Tensor) -> np.ndarray:
    mean = np.array([0.485, 0.456, 0.406])
    std  = np.array([0.229, 0.224, 0.225])
    img  = tensor.cpu().permute(1, 2, 0).numpy()
    img  = img * std + mean
    return np.clip(img, 0, 1)
