#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoWebsockets.h>

using namespace websockets;

const char *ssid = "A1_52AA";
const char *password = "48575443B02A32A4";
const char *apiEndpoint = "https://api.azion.online/cam/sec";

// Use a reliable public IP echo service
const char *publicIPService = "http://api.ipify.org"; // returns plain text IP

WebsocketsClient client;

void sendImageToAPI(uint8_t *image_data, size_t length) {
    HTTPClient http;
    http.begin(apiEndpoint);
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("Origin", "AzionCam");
    http.addHeader("authorization", "CAM-eV85kBL6dHmd9iBFKtCAG0LrquG5URaF");

    int httpResponseCode = http.POST(image_data, length);

    if (httpResponseCode > 0) {
        Serial.printf("Image sent to API, response code: %d\n", httpResponseCode);
        String response = http.getString();
        Serial.println("Server response: " + response);
    } else {
        Serial.printf("Failed to send image, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    http.end();
}

String getPublicIP() {
    HTTPClient http;
    http.begin(publicIPService);
    int httpCode = http.GET();

    if (httpCode == 200) {
        String ip = http.getString();
        http.end();
        return ip;
    } else {
        http.end();
        return "Failed to get public IP";
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

    Serial.println("\nWiFi connected.");
    Serial.print("Local IP: ");
    Serial.println(WiFi.localIP());

    // Fetch and print public IP
    String publicIP = getPublicIP();
    Serial.print("Public IP: ");
    Serial.println(publicIP);

    // WebSocket message handler
    client.onMessage([](WebsocketsMessage message) {
        Serial.println("Received binary message via WebSocket.");
        if (message.isBinary()) {
            sendImageToAPI((uint8_t *)message.data().c_str(), message.length());
        }
    });

    client.onEvent([](WebsocketsEvent event, String data) {
        if (event == WebsocketsEvent::ConnectionOpened) {
            Serial.println("WebSocket connection opened.");
        } else if (event == WebsocketsEvent::ConnectionClosed) {
            Serial.println("WebSocket connection closed.");
        } else if (event == WebsocketsEvent::GotPing) {
            Serial.println("Got a ping!");
        }
    });

    // Connect to your WebSocket server
    bool connected = client.connect("ws://your.server.ip:81/"); // Replace with actual server

    if (!connected) {
        Serial.println("WebSocket connection failed!");
    }
}

void loop() {
    client.poll();
}
