import numpy as np
from PIL import Image


def preprocess_image(image: Image.Image, image_size=(224, 224)):
    image = image.resize(image_size)
    # Saved Keras models already rescale 0-255 -> 0-1 internally.
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    return image_array