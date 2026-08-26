import cv2
import numpy as np

def make_sketch(img, detail: int = 6):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    sigma = max(0.7, 2.4 - detail * 0.15)
    blur = cv2.GaussianBlur(gray, (0,0), sigma)
    edges = cv2.Canny(blur, max(20, 90-detail*6), max(70, 180-detail*7))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, np.ones((2,2),np.uint8))
    canvas = np.full_like(gray, 255)
    canvas[edges > 0] = 20
    return cv2.cvtColor(canvas, cv2.COLOR_GRAY2BGR)
