import cv2
import numpy as np

def quantize_lab(img, colors: int = 6):
    colors = int(max(2, min(16, colors)))
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    data = lab.reshape((-1,3)).astype(np.float32)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 35, 0.6)
    _, labels, centers = cv2.kmeans(
        data, colors, None, criteria, 5, cv2.KMEANS_PP_CENTERS
    )
    centers = np.uint8(centers)
    out_lab = centers[labels.flatten()].reshape(lab.shape)
    out = cv2.cvtColor(out_lab, cv2.COLOR_LAB2BGR)
    return out, labels.reshape(img.shape[:2]), centers
