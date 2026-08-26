import cv2, numpy as np
from fastapi import UploadFile

async def upload_to_bgr(file: UploadFile):
    raw = await file.read()
    arr = np.frombuffer(raw, np.uint8)
    img = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Invalid image")
    return img

def encode_png(img):
    ok, buf = cv2.imencode(".png", img)
    if not ok:
        raise ValueError("Could not encode image")
    return buf.tobytes()
