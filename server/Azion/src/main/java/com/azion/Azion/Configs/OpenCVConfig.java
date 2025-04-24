package com.azion.Azion.Configs;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.io.File;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;

@Configuration
@Slf4j
public class OpenCVConfig {
    static {
        try {
            if(System.getProperty("os.name").toLowerCase().contains("win")) {
                log.info("Windows");
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
                log.info("Linux");
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