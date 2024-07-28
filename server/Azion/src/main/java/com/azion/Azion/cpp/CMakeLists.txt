cmake_minimum_required(VERSION 3.28)
project(cpp)

set(CMAKE_CXX_STANDARD 17)

# Find and include OpenCV
find_package(OpenCV REQUIRED)
include_directories(${OpenCV_INCLUDE_DIRS})

# Find and include JNI
find_package(JNI REQUIRED)
include_directories(${JNI_INCLUDE_DIRS})

# Add the shared library target and link the necessary libraries
add_library(cpp_main SHARED main.cpp)
target_link_libraries(cpp_main ${OpenCV_LIBS} ${JNI_LIBRARIES})