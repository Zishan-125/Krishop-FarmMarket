"""Hand-crafted image features shared by training and inference (no deep-learning framework needed).

Per image (resized 128x128): joint hue-saturation histogram, per-cell HSV mean/std on a 4x4 grid,
edge-density grid and a gradient-orientation histogram. These capture lesion colour, spatial spread and
texture, which is most of the signal in PlantVillage's uniform-background leaf photos."""
import io
import numpy as np
from PIL import Image

SIZE = 128


def _load(src) -> Image.Image:
    img = Image.open(io.BytesIO(src)) if isinstance(src, (bytes, bytearray)) else Image.open(src)
    return img.convert("RGB").resize((SIZE, SIZE))


def features(src) -> np.ndarray:
    img = _load(src)
    hsv = np.asarray(img.convert("HSV")).astype(np.float32)
    h, s, v = hsv[..., 0], hsv[..., 1], hsv[..., 2]
    joint, _, _ = np.histogram2d(h.ravel(), s.ravel(), bins=[18, 6], range=[[0, 256], [0, 256]])
    joint = joint.ravel() / joint.sum()
    grid = []
    step = SIZE // 4
    for i in range(4):
        for j in range(4):
            cell = hsv[i * step:(i + 1) * step, j * step:(j + 1) * step].reshape(-1, 3)
            grid += list(cell.mean(0) / 255) + list(cell.std(0) / 255)
    gray = np.asarray(img.convert("L")).astype(np.float32)
    gx, gy = np.gradient(gray)
    mag = np.hypot(gx, gy)
    ang = (np.arctan2(gy, gx) + np.pi) / (2 * np.pi)
    ori, _ = np.histogram(ang.ravel(), bins=12, range=(0, 1), weights=mag.ravel())
    ori = ori / (ori.sum() + 1e-6)
    edge = [float(mag[i * step:(i + 1) * step, j * step:(j + 1) * step].mean() / 255) for i in range(4) for j in range(4)]
    dark = float((v < 60).mean()); bright = float((v > 200).mean())
    return np.concatenate([joint, grid, ori, edge, [dark, bright, float(mag.mean() / 255)]]).astype(np.float32)


def normalize_label(folder: str) -> str:
    """Map GitHub-mirror folder names to the labels in plantvillage_image_labels.csv
    (the CSV shortens 'Cherry_(including_sour)' and 'Corn_(maize)' and drops a trailing '_')."""
    return folder.replace("Cherry_(including_sour)", "Cherry").replace("Corn_(maize)", "Corn").rstrip("_")
