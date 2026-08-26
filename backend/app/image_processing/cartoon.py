import cv2
import numpy as np
from .quantize import quantize_lab
from .cleanup import cleanup_regions

def make_cartoon(img, colors=6, detail=6, min_area=80):
    # Edge preserving smooth
    smooth = cv2.bilateralFilter(img, d=9, sigmaColor=55 + detail*5, sigmaSpace=55)
    quantized, labels, centers = quantize_lab(smooth, colors)
    labels = cleanup_regions(labels, min_area=min_area)

    # rebuild using original kmeans centers
    lab = cv2.cvtColor(smooth, cv2.COLOR_BGR2LAB)
    # convert centers to BGR palette for reconstruction
    centers_img = centers.reshape((-1,1,3))
    centers_bgr = cv2.cvtColor(centers_img, cv2.COLOR_LAB2BGR).reshape((-1,3))
    out = centers_bgr[labels].astype(np.uint8)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.adaptiveThreshold(
        cv2.medianBlur(gray,5),255,
        cv2.ADAPTIVE_THRESH_MEAN_C,
        cv2.THRESH_BINARY,9,6
    )
    edges_bgr = cv2.cvtColor(edges, cv2.COLOR_GRAY2BGR)
    out = cv2.bitwise_and(out, edges_bgr)

    palette = []
    for i, c in enumerate(centers_bgr):
        b,g,r = map(int,c)
        palette.append({
            "index": i+1,
            "hex": f"#{r:02X}{g:02X}{b:02X}",
            "rgb": [r,g,b]
        })
    return out, labels, palette, centers_bgr
