#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <DHT.h>

#define DHT_PIN 4
#define DHT_TYPE DHT11
#define SOIL_PIN 34

// =====================================================
// SOIL SENSOR CALIBRATION
// =====================================================
#define SOIL_DRY 2913
#define SOIL_WET 1626

// =====================================================
// DEVICE
// =====================================================
const char* DEVICE_ID = "ESP32-003";

// =====================================================
// WIFI
// Fill these before flashing. Do not commit real passwords.
// =====================================================
const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// =====================================================
// LIVE BACKEND (Render)
// The website stays offline unless the ESP32 posts here.
// =====================================================
const char* SERVER_URL =
    "https://crop-health-l64s.onrender.com/api/sensors/readings";

DHT dht(DHT_PIN, DHT_TYPE);

int readSoilMoisture() {
    const int samples = 15;
    long total = 0;

    for (int i = 0; i < samples; i++) {
        total += analogRead(SOIL_PIN);
        delay(20);
    }

    int averageRaw = total / samples;

    int soilMoisture = map(
        averageRaw,
        SOIL_DRY,
        SOIL_WET,
        0,
        100
    );

    soilMoisture = constrain(soilMoisture, 0, 100);

    Serial.print("Soil average ADC: ");
    Serial.println(averageRaw);

    return soilMoisture;
}

void connectWiFi() {
    Serial.println();
    Serial.print("Connecting to Wi-Fi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;

    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Wi-Fi connected!");
        Serial.print("ESP32 IP address: ");
        Serial.println(WiFi.localIP());
    } else {
        Serial.println("Wi-Fi connection failed.");
    }
}

void sendSensorData(
    float temperature,
    float humidity,
    int soilMoisture
) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Wi-Fi disconnected. Reconnecting...");
        connectWiFi();
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Cannot send data: Wi-Fi unavailable.");
        return;
    }

    WiFiClientSecure client;
    client.setInsecure();

    HTTPClient http;
    http.begin(client, SERVER_URL);
    http.addHeader("Content-Type", "application/json");

    String jsonData = "{";
    jsonData += "\"deviceId\":\"";
    jsonData += DEVICE_ID;
    jsonData += "\",";
    jsonData += "\"temperature\":";
    jsonData += String(temperature, 1);
    jsonData += ",";
    jsonData += "\"humidity\":";
    jsonData += String(humidity, 1);
    jsonData += ",";
    jsonData += "\"soilMoisture\":";
    jsonData += String(soilMoisture);
    jsonData += "}";

    Serial.println();
    Serial.println("Sending sensor data:");
    Serial.println(jsonData);

    int httpResponseCode = http.POST(jsonData);

    Serial.print("HTTP response code: ");
    Serial.println(httpResponseCode);

    if (httpResponseCode > 0) {
        Serial.println("Server response:");
        Serial.println(http.getString());
    } else {
        Serial.print("HTTP request failed: ");
        Serial.println(http.errorToString(httpResponseCode));
    }

    http.end();
}

void setup() {
    Serial.begin(115200);
    delay(1000);

    dht.begin();
    analogReadResolution(12);

    Serial.println();
    Serial.println("================================");
    Serial.println("Crop Health ESP32");
    Serial.println("================================");
    Serial.println("DHT11 DATA -> GPIO 4");
    Serial.println("Soil AO    -> GPIO 34");
    Serial.print("Device ID  -> ");
    Serial.println(DEVICE_ID);
    Serial.print("API URL    -> ");
    Serial.println(SERVER_URL);

    connectWiFi();
}

void loop() {
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int soilMoisture = readSoilMoisture();

    Serial.println("--------------------------------");

    if (isnan(temperature) || isnan(humidity)) {
        Serial.println("DHT11: Failed to read sensor");
    } else {
        Serial.print("Temperature: ");
        Serial.print(temperature);
        Serial.println(" °C");

        Serial.print("Humidity: ");
        Serial.print(humidity);
        Serial.println(" %");

        Serial.print("Soil moisture: ");
        Serial.print(soilMoisture);
        Serial.println(" %");

        sendSensorData(temperature, humidity, soilMoisture);
    }

    delay(10000);
}
