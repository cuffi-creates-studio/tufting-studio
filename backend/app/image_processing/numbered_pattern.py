import cv2
import numpy as np

def numbered_pattern(labels, palette_bgr, min_label_area=250):
    h,w = labels.shape
    canvas = np.full((h,w,3), 255, np.uint8)

    # boundaries
    boundaries = np.zeros((h,w), np.uint8)
    boundaries[1:,:] |= (labels[1:,:] != labels[:-1,:])
    boundaries[:,1:] |= (labels[:,1:] != labels[:,:-1])
    canvas[boundaries > 0] = (20,20,20)

    for lab in np.unique(labels):
        mask = (labels == lab).astype(np.uint8)
        n, comps, stats, cent = cv2.connectedComponentsWithStats(mask, 8)
        for i in range(1,n):
            area = stats[i, cv2.CC_STAT_AREA]
            if area < min_label_area:
                continue
            x,y = map(int, cent[i])
            txt = str(int(lab)+1)
            cv2.putText(
                canvas, txt, (x-8,y+6),
                cv2.FONT_HERSHEY_SIMPLEX, .55,
                (25,25,25), 2, cv2.LINE_AA
            )
    return canvas
