package com.azion.Azion;

import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;

@Configuration
public class OpenCVConfig {
    static {
        try {
            InputStream in = OpenCVConfig.class.getClassLoader().getResourceAsStream("libs/opencv/libopencv_java460.so");
            File tempFile = File.createTempFile("libopencv_java460", ".so");
            tempFile.deleteOnExit();
            try (FileOutputStream out = new FileOutputStream(tempFile)) {
                byte[] buffer = new byte[1024];
                int bytesRead;
                while ((bytesRead = in.read(buffer)) != -1) {
                    out.write(buffer, 0, bytesRead);
                }
                System.load(tempFile.getAbsolutePath());
            }
          
        } catch (Exception e) {
            throw new RuntimeException(" " +
                    " " +
                    " " +
                    " " +
                    "Failed to load OpenCV library" +
                    " " +
                    " " +
                    " " +
                    " ", e);
        }
    }
}