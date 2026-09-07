import tensorflow as tf

print("Converting crop_classifier.keras...")
crop_model = tf.keras.models.load_model("ml-pro/trained_models/crop_classifier.keras")
converter = tf.lite.TFLiteConverter.from_keras_model(crop_model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_crop = converter.convert()

with open("ml-pro/trained_models/crop_classifier.tflite", "wb") as f:
    f.write(tflite_crop)

print("Converting crop_disease_model.keras...")
disease_model = tf.keras.models.load_model("ml-pro/trained_models/crop_disease_model.keras")
converter = tf.lite.TFLiteConverter.from_keras_model(disease_model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
tflite_disease = converter.convert()

with open("ml-pro/trained_models/crop_disease_model.tflite", "wb") as f:
    f.write(tflite_disease)

print("Done! Both .tflite files generated in ml-pro/trained_models/")