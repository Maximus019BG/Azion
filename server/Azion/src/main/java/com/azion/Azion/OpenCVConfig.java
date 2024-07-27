package com.azion.Azion;

import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenCVConfig {
    static {
        System.setProperty("java.library.path", "/usr/lib/jni");
        System.load("/usr/lib/jni/libopencv_java460.so");
    }
}