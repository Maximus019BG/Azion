package com.azion.Azion.Services;

import com.azion.Azion.Models.Network;
import com.azion.Azion.Utils.NetworkUtil;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class NetworkService {
    
    public String getDataForNetwork(Network network) {
        try {
            LocalDateTime today = LocalDateTime.now().minusHours(3);
            LocalDateTime thirtyDaysAgo = today.minusDays(30);
            
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");
            String beginTimestamp = thirtyDaysAgo.format(formatter);
            String endTimestamp = today.format(formatter);
            
            String siteId = network.getSiteId();
            String hostId = network.getHostId();
            
            String jsonBody = String.format("""
                    {
                      "sites": [
                        {
                          "beginTimestamp": "%s",
                          "endTimestamp": "%s",
                          "siteId": "%s",
                          "hostId": "%s"
                        }
                      ]
                    }
                    """, beginTimestamp, endTimestamp, siteId, hostId);
            
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(new URI("https://api.ui.com/ea/isp-metrics/1h/query"))
                    .header("Content-Type", "application/json")
                    .header("X-API-Key", NetworkUtil.decrypt(network.getUnifyApiKey()))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();
            
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            return response.body();
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
