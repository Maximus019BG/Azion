package com.azion.Azion.Config;

import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@Configuration
public class OpenCVConfig {
    static {
        try {
            if(System.getProperty("os.name").toLowerCase().contains("win")) {
                
                System.out.println("Windows");
                InputStream in = OpenCVConfig.class.getClassLoader().getResourceAsStream("libs/opencv/opencv_java460.dll");
                if (in == null) {
                    throw new RuntimeException("OpenCV library not found in resources");
                }
                
                File tempFile = File.createTempFile("opencv_java460", ".dll");
                tempFile.deleteOnExit();
                
                Files.copy(in, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                System.load(tempFile.getAbsolutePath());
            }
            else{
                System.out.println("Linux");
                InputStream in = OpenCVConfig.class.getClassLoader().getResourceAsStream("libs/opencv/libopencv_java460.so");
                if (in == null) {
                    throw new RuntimeException("OpenCV library not found in resources");
                }
                
                File tempFile = File.createTempFile("libopencv_java460", ".so");
                tempFile.deleteOnExit();
                
                Files.copy(in, tempFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                System.load(tempFile.getAbsolutePath());
            }

        } catch (Exception e) {
            throw new RuntimeException("Failed to load OpenCV library", e);
        }
    }
}