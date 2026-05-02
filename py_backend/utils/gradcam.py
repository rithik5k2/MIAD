import torch
import numpy as np
import cv2


class GradCAM:
    """Grad-CAM for EfficientNetB0. Target: model.features[-1]"""

    def __init__(self, model, target_layer):
        self.model        = model
        self.target_layer = target_layer
        self.gradients    = None
        self.activations  = None
        self._register_hooks()

    def _register_hooks(self):
        def fwd(module, inp, out):
            self.activations = out.detach()

        def bwd(module, gin, gout):
            self.gradients = gout[0].detach()

        self.target_layer.register_forward_hook(fwd)
        self.target_layer.register_full_backward_hook(bwd)

    def generate(self, image_tensor: torch.Tensor, class_idx: int = None):
        """
        image_tensor: (1, 3, 224, 224) on correct device
        Returns: heatmap (H,W) float [0,1], predicted class_idx
        """
        self.model.eval()
        output = self.model(image_tensor)

        if class_idx is None:
            class_idx = output.argmax(dim=1).item()

        self.model.zero_grad()
        output[0, class_idx].backward()

        pooled_grads = self.gradients.mean(dim=[0, 2, 3])
        activations  = self.activations[0]

        for i in range(activations.shape[0]):
            activations[i] *= pooled_grads[i]

        heatmap = activations.mean(dim=0).cpu().numpy()
        heatmap = np.maximum(heatmap, 0)
        heatmap /= (heatmap.max() + 1e-8)
        return heatmap, class_idx


def apply_gradcam_overlay(original_rgb: np.ndarray, heatmap: np.ndarray, alpha: float = 0.4) -> np.ndarray:
    """
    original_rgb : (H,W,3) float [0,1]
    heatmap      : (h,w)   float [0,1]
    Returns      : (H,W,3) uint8
    """
    H, W = original_rgb.shape[:2]
    img  = (original_rgb * 255).astype(np.uint8)
    hmap = cv2.resize(heatmap, (W, H))
    hmap = np.uint8(255 * hmap)
    hmap = cv2.applyColorMap(hmap, cv2.COLORMAP_JET)
    hmap = cv2.cvtColor(hmap, cv2.COLOR_BGR2RGB)
    return ((1 - alpha) * img + alpha * hmap).astype(np.uint8)


def create_tumor_overlay(original_rgb: np.ndarray, pred_mask: np.ndarray) -> np.ndarray:
    """
    Highlights tumor pixels in red.
    original_rgb : (H,W,3) float [0,1]
    pred_mask    : (H,W)   binary float {0,1}
    Returns      : (H,W,3) uint8
    """
    overlay = original_rgb.copy()
    tumor   = pred_mask > 0.5
    overlay[tumor, 0] = 1.0
    overlay[tumor, 1] = 0.0
    overlay[tumor, 2] = 0.0
    return (overlay * 255).astype(np.uint8)
