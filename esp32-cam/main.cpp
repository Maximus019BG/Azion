#include <WiFi.h>
#include <WebServer.h>
#include "CameraHandler.h"

const char *ssid = "YOUR_SSID";
const char *password = "YOUR_PASSWORD";

WebServer server(80);

void setup() {
    Serial.begin(115200);

    // Connect to Wi-Fi
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());

    // Start the camera
    startCamera();

    // Define server routes
    server.on("/", HTTP_GET, handleRoot);
    server.on("/capture", HTTP_GET, handleCapture);

    // Start server
    server.begin();
}

void loop() {
    server.handleClient();
}
