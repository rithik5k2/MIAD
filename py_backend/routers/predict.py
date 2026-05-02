import torch
import numpy as np
from fastapi import APIRouter, UploadFile, File, HTTPException

from utils.model_loader   import get_clf_model, get_seg_model, get_class_names
from utils.preprocessing  import bytes_to_pil, preprocess_for_classification, preprocess_for_segmentation
from utils.gradcam        import GradCAM, apply_gradcam_overlay, create_tumor_overlay
from utils.image_utils    import numpy_to_base64, mask_to_base64

router = APIRouter()


@router.post("/predict")
async def predict(file: UploadFile = File(...)):
    ext = (file.filename or "").lower()
    if not any(ext.endswith(e) for e in [".jpg", ".jpeg", ".png", ".tif", ".tiff"]):
        raise HTTPException(400, "Unsupported file. Upload JPG, PNG, or TIF.")

    raw = await file.read()
    if not raw:
        raise HTTPException(400, "Empty file.")

    try:
        pil = bytes_to_pil(raw)
    except Exception:
        raise HTTPException(400, "Cannot read image.")

    clf_model, device = get_clf_model()
    seg_model, _      = get_seg_model()
    class_names       = get_class_names()

    # Step 1: Classification
    clf_tensor = preprocess_for_classification(pil).to(device)
    with torch.no_grad():
        probs = torch.softmax(clf_model(clf_tensor), dim=1)[0]
    pred_idx   = probs.argmax().item()
    tumor_type = class_names[pred_idx]
    confidence = {n: round(probs[i].item(), 4) for i, n in enumerate(class_names)}

    # Step 2: Grad-CAM
    gradcam        = GradCAM(clf_model, target_layer=clf_model.features[-1])
    heatmap, _     = gradcam.generate(clf_tensor, class_idx=pred_idx)
    orig_224       = np.array(pil.resize((224, 224))).astype(np.float32) / 255.0
    gradcam_result = apply_gradcam_overlay(orig_224, heatmap)

    # Step 3: Segmentation
    seg_tensor = preprocess_for_segmentation(pil).to(device)
    with torch.no_grad():
        seg_out     = seg_model(seg_tensor)
        seg_sigmoid = torch.sigmoid(seg_out)
        binary_mask = (seg_sigmoid > 0.5).float()

    mask_np       = binary_mask.squeeze().cpu().numpy()
    orig_256      = np.array(pil.resize((256, 256))).astype(np.float32) / 255.0
    tumor_result  = create_tumor_overlay(orig_256, mask_np)

    return {
        "tumor_type":        tumor_type,
        "confidence":        confidence,
        "segmentation_mask": mask_to_base64(mask_np),
        "gradcam_overlay":   numpy_to_base64(gradcam_result),
        "tumor_overlay":     numpy_to_base64(tumor_result),
    }
