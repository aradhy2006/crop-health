
import api from "../api/axios";

/**
 * Sends a leaf image and crop metrics to the FastAPI prediction endpoint.
 * 
 * @param {Object} params
 * @param {File} params.file - The selected image file object from <input type="file">
 * @param {string} params.crop - Name of the crop (e.g., "potato")
 * @param {number} params.temperature - Temperature value
 * @param {number} params.humidity - Relative humidity percentage
 * @param {number} params.soilMoisture - Soil moisture percentage
 */
export const predictCropDisease = async ({ file, crop, temperature, humidity, soilMoisture }) => {

  const formData = new FormData();

  formData.append("file", file);
  formData.append("crop", crop || "potato");
  formData.append("temperature", temperature || 0);
  formData.append("humidity", humidity || 0);
  formData.append("soil_moisture", soilMoisture || 0); 
  const response = await api.post("/prediction/predict", formData);

  return response.data;
};