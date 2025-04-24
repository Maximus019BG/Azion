cmake_minimum_required(VERSION 3.24.0)
task(esp32cam)
set(IDF_TARGET "cam")
include($ENV{IDF_PATH}/tools/cmake/task.cmake)

task(esp32_cam_project)

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