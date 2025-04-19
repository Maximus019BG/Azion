#include <Arduino.h>

#include <WiFi.h>
#include <WiFiMulti.h>
#include <WiFiClientSecure.h>

#include <WebSocketsClient.h>
#include <HTTPClient.h>

const char *ssid = "WIFI_NAME";     // Replace with your Wi-Fi SSID
const char *password = "WIFI_PASS"; // Replace with your Wi-Fi Password
const char *apiEndpoint = "https://api.azion.online/cam/sec"; // Replace with your API endpoint

WebSocketsClient webSocket; // Create WebSocket client instance

void sendImageToAPI(uint8_t *image_data, size_t length) {
    HTTPClient http;
    http.begin(apiEndpoint);
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("Origin", "AzionCam");
    http.addHeader("authorization", "CAM-eV85kBL6dHmd9iBFKtCAG0LrquG5URaF");  // CAMERA_ID

    // Send POST request
    int httpResponseCode = http.POST(image_data, length);

    // Check response
    if (httpResponseCode > 0) {
        Serial.printf("Image sent to API, response code: %d\n", httpResponseCode);
        String response = http.getString();
        Serial.println("Server response: " + response);
    } else {
        Serial.printf("Failed to send image, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    // End HTTP connection
    http.end();
}

// Handle WebSocket events (Receiving image data)
void onWebSocketEvent(WStype_t type, uint8_t *payload, size_t length) {
    switch (type) {
        case WStype_TEXT:
            break;
        case WStype_BIN:
            Serial.println("Image received via WebSocket");
            // Forward the image to the API
            sendImageToAPI(payload, length);
            break;
        default:
            break;
    }
}

void setup() {
    Serial.begin(115200);

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    // Set WebSocket event handler
    webSocket.begin("your.server.com", 81, "/"); // Replace with your WebSocket server URL and port
    webSocket.onEvent(onWebSocketEvent);

    // Start WebSocket
    Serial.println("WebSocket connected.");
}

void loop() {
    // Maintain WebSocket connection
    webSocket.loop();
}
