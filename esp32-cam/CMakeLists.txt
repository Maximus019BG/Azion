cmake_minimum_required(VERSION 3.24.0)
project(esp32cam)
set(IDF_TARGET "esp32")
include($ENV{IDF_PATH}/tools/cmake/project.cmake)

project(esp32_cam_project)

# Specify source files
set(SRCS
        esp32.ino
)

# Specify include directories
set(INCLUDES
        .
)

# Add executable
idf_component_register(SRCS ${SRCS} INCLUDE_DIRS ${INCLUDES})