from fastapi import APIRouter, UploadFile, File, Form, Response, Depends
from app.api.deps import current_user
from app.image_processing.io import upload_to_bgr, encode_png
from app.image_processing.sketch import make_sketch
from app.image_processing.cartoon import make_cartoon
from app.image_processing.numbered_pattern import numbered_pattern

router = APIRouter(prefix="/image-tools", tags=["image-tools"])

@router.post("/sketch")
async def sketch(
    image: UploadFile = File(...),
    detail: int = Form(6),
    _=Depends(current_user)
):
    img = await upload_to_bgr(image)
    out = make_sketch(img, detail)
    return Response(encode_png(out), media_type="image/png")

@router.post("/cartoon")
async def cartoon(
    image: UploadFile = File(...),
    colors: int = Form(6),
    detail: int = Form(6),
    min_area: int = Form(80),
    _=Depends(current_user)
):
    img = await upload_to_bgr(image)
    out, labels, palette, centers = make_cartoon(img, colors, detail, min_area)
    response = Response(encode_png(out), media_type="image/png")
    response.headers["X-Palette"] = ",".join(p["hex"] for p in palette)
    return response

@router.post("/numbered")
async def numbered(
    image: UploadFile = File(...),
    colors: int = Form(6),
    detail: int = Form(6),
    min_area: int = Form(80),
    _=Depends(current_user)
):
    img = await upload_to_bgr(image)
    _, labels, palette, centers = make_cartoon(img, colors, detail, min_area)
    out = numbered_pattern(labels, centers)
    response = Response(encode_png(out), media_type="image/png")
    response.headers["X-Palette"] = ",".join(p["hex"] for p in palette)
    return response
