#include "esp_camera.h"
#include <WiFi.h>
#include <WebSocketsClient.h>

// Network credentials
const char *ssid = "WIFI_NAME"; // Replace with real!!!
const char *password = "WIFI_PASS"; // Replace with real!!!

const char *webSocketServerIP = "RECEIVER_IP"; // IP address of the second Arduino (WebSocket server)
const int webSocketServerPort = 81;  // Port to communicate with the second Arduino (WebSocket server)

WebSocketsClient webSocket;

void startCamera() {
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = 5;
    config.pin_d1 = 18;
    config.pin_d2 = 19;
    config.pin_d3 = 21;
    config.pin_d4 = 36;
    config.pin_d5 = 39;
    config.pin_d6 = 34;
    config.pin_d7 = 35;
    config.pin_xclk = 0;
    config.pin_pclk = 22;
    config.pin_vsync = 25;
    config.pin_href = 23;
    config.pin_sscb_sda = 26;
    config.pin_sscb_scl = 27;
    config.pin_pwdn = 32;
    config.pin_reset = -1;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;
    config.frame_size = FRAMESIZE_UXGA;   // UXGA is 1600x1200
    config.jpeg_quality = 9;              // Image quality
    config.fb_count = psramFound() ? 2 : 1; // Use 2 frame buffers if PSRAM is available

    // Camera initialization
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("Camera init failed with error 0x%x\n", err);
        return;
    }
}

void sendImageToWebSocket() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        return;
    }

    if (webSocket.connected()) {
        // Send image size first
        webSocket.sendBIN(fb->buf, fb->len);
        Serial.println("Image sent to receiver over WebSocket");
    } else {
        Serial.println("WebSocket not connected");
    }

    // Clean up
    esp_camera_fb_return(fb);
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

    // Set up WebSocket client
    webSocket.begin(webSocketServerIP, webSocketServerPort, "/");

    // Start the camera
    startCamera();
}

void loop() {
    webSocket.loop(); // Keep the WebSocket connection alive
    sendImageToWebSocket();
    delay(5000); // Delay between captures
}
