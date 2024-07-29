package com.azion.Azion;

import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenCVConfig {
    static {
        System.load(OpenCVConfig.class.getClassLoader().getResource("libs/opencv/libopencv_java460.so").getPath());
    }
}