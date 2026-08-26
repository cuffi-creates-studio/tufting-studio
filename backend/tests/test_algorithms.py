import numpy as np
from app.image_processing.sketch import make_sketch
from app.image_processing.cartoon import make_cartoon
from app.image_processing.numbered_pattern import numbered_pattern

def test_algorithms_smoke():
    img = np.full((200, 300, 3), 255, np.uint8)
    img[40:160, 80:220] = (20, 100, 220)
    sk = make_sketch(img, 6)
    assert sk.shape == img.shape
    cart, labels, palette, centers = make_cartoon(img, 4, 6, 20)
    assert cart.shape == img.shape
    assert len(palette) == 4
    num = numbered_pattern(labels, centers, 20)
    assert num.shape == img.shape
