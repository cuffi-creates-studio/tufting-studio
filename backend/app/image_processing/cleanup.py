import cv2
import numpy as np

def cleanup_regions(labels, min_area: int = 80):
    labels = labels.copy()
    unique = np.unique(labels)
    for lab in unique:
        mask = (labels == lab).astype(np.uint8)
        n, comps, stats, _ = cv2.connectedComponentsWithStats(mask, 8)
        for i in range(1, n):
            if stats[i, cv2.CC_STAT_AREA] < min_area:
                ys, xs = np.where(comps == i)
                if len(xs) == 0:
                    continue
                x0, y0 = xs[0], ys[0]
                y1, y2 = max(0,y0-2), min(labels.shape[0], y0+3)
                x1, x2 = max(0,x0-2), min(labels.shape[1], x0+3)
                neigh = labels[y1:y2, x1:x2].ravel()
                neigh = neigh[neigh != lab]
                if len(neigh):
                    vals, counts = np.unique(neigh, return_counts=True)
                    labels[comps == i] = vals[counts.argmax()]
    return labels
