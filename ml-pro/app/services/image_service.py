from PIL import Image
from io import BytesIO


def open_image(image_bytes: bytes) -> Image.Image:
    """
    Convert uploaded image bytes into a PIL Image.
    """
    image = Image.open(BytesIO(image_bytes))
    return image.convert("RGB")