#include "esp_camera.h"
#include <WiFi.h>
#include <HTTPClient.h>

//Unique camera ID
#define CAMERA_ID "CAM-eV85kBL6dHmd9iBFKtCAG0LrquG5URaF"  //CAMERA_ID for each camera EXAMPLE!!!

//Network credentials
const char *ssid = "WIFI_NAME"; // Replace with real!!!
const char *password = "WIFI_PASS"; // Replace with real!!!

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


//Capture send image  POST request
void sendImageToAPI() {
    camera_fb_t *fb = esp_camera_fb_get();
    if (!fb) {
        Serial.println("Camera capture failed");
        return;
    }

    // Initialize HTTP client
    HTTPClient http;
    http.begin("https://api.azion.online/cam/sec");
    http.addHeader("Content-Type", "image/jpeg");
    http.addHeader("Origin", "AzionCam");
    http.addHeader("authorization", CAMERA_ID);

    // Send POST request
    int httpResponseCode = http.POST((uint8_t *)fb->buf, fb->len);

    // Check response
    if (httpResponseCode > 0) {
        Serial.printf("Image sent, response code: %d\n", httpResponseCode);
        String response = http.getString();
        Serial.println("Server response: " + response);
        //TODO: Add logic to handle server response
    } else {
        Serial.printf("Failed to send image, error: %s\n", http.errorToString(httpResponseCode).c_str());
    }

    // End HTTP connection and release the frame buffer
    http.end();
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

    // Start the camera
    startCamera();

    // Capture and send image
    sendImageToAPI();
}

void loop() {
    // Do nothing 
}
