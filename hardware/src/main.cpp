#include <Arduino.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <time.h>

#define DHT_PIN 4
#define DHT_TYPE DHT11
#define SOIL_PIN 34

#define SOIL_DRY 2913
#define SOIL_WET 1626

const char* DEVICE_ID = "ESP32-003";

const char* WIFI_SSID = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

const char* HOST = "crop-health-l64s.onrender.com";
const char* PATH = "/api/sensors/readings";

DHT dht(DHT_PIN, DHT_TYPE);

int readSoilMoisture() {
    const int samples = 15;
    long total = 0;

    for (int i = 0; i < samples; i++) {
        total += analogRead(SOIL_PIN);
        delay(20);
    }

    int averageRaw = total / samples;
    int soilMoisture = constrain(map(averageRaw, SOIL_DRY, SOIL_WET, 0, 100), 0, 100);

    Serial.print("Soil average ADC: ");
    Serial.println(averageRaw);

    return soilMoisture;
}

void syncTime() {
    Serial.println("Syncing time for HTTPS...");
    Serial.flush();

    configTime(19800, 0, "pool.ntp.org", "time.google.com");

    struct tm timeinfo;
    for (int i = 0; i < 25; i++) {
        if (getLocalTime(&timeinfo, 1000)) {
            Serial.println(&timeinfo, "Time OK: %Y-%m-%d %H:%M:%S");
            Serial.flush();
            return;
        }
        Serial.print(".");
        Serial.flush();
    }

    Serial.println();
    Serial.println("Time sync failed.");
}

void connectWiFi() {
    Serial.println();
    Serial.print("Connecting to Wi-Fi: ");
    Serial.println(WIFI_SSID);

    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 40) {
        delay(500);
        Serial.print(".");
        attempts++;
    }

    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("Wi-Fi connected!");
        Serial.print("ESP32 IP address: ");
        Serial.println(WiFi.localIP());
        Serial.print("RSSI: ");
        Serial.println(WiFi.RSSI());
        syncTime();
    } else {
        Serial.println("Wi-Fi connection failed.");
    }
}

bool sendSensorData(float temperature, float humidity, int soilMoisture) {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Wi-Fi disconnected. Reconnecting...");
        connectWiFi();
    }

    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Cannot send data: Wi-Fi unavailable.");
        return false;
    }

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
    Serial.flush();

    IPAddress ip;
    if (WiFi.hostByName(HOST, ip) != 1) {
        Serial.println("DNS lookup failed.");
        return false;
    }

    Serial.print("DNS ");
    Serial.print(HOST);
    Serial.print(" -> ");
    Serial.println(ip);
    Serial.flush();

    for (int attempt = 1; attempt <= 3; attempt++) {
        Serial.print("TLS attempt ");
        Serial.println(attempt);
        Serial.flush();

        WiFiClientSecure client;
        client.setInsecure();
        client.setTimeout(20);
        client.setHandshakeTimeout(45);

        if (!client.connect(HOST, 443)) {
            Serial.println("TLS connect failed.");
            delay(3000);
            continue;
        }

        Serial.println("TLS connected. Sending POST...");
        Serial.flush();

        String request = "";
        request += "POST ";
        request += PATH;
        request += " HTTP/1.1\r\n";
        request += "Host: ";
        request += HOST;
        request += "\r\n";
        request += "Content-Type: application/json\r\n";
        request += "Connection: close\r\n";
        request += "Content-Length: ";
        request += String(jsonData.length());
        request += "\r\n\r\n";
        request += jsonData;

        client.print(request);

        unsigned long start = millis();
        while (client.connected() && !client.available() && millis() - start < 25000) {
            delay(10);
        }

        if (!client.available()) {
            Serial.println("No HTTP response (timeout).");
            client.stop();
            delay(3000);
            continue;
        }

        String statusLine = client.readStringUntil('\n');
        statusLine.trim();
        Serial.print("Status: ");
        Serial.println(statusLine);

        while (client.connected() || client.available()) {
            if (client.available()) {
                Serial.write(client.read());
            }
        }

        Serial.println();
        client.stop();

        if (statusLine.indexOf("201") >= 0 || statusLine.indexOf("200") >= 0) {
            Serial.println("Sensor data saved.");
            return true;
        }
    }

    Serial.println("All HTTPS attempts failed.");
    return false;
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

    delay(15000);
}
