cmake_minimum_required(VERSION 3.28)
project(AzionDesktop)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)

# Update Qt path for Linux
set(QT_PATH_LINUX "/usr/lib/x86_64-linux-gnu/cmake/Qt5")

# Update the MinGW toolchain file path for cross-compilation
set(MINGW_TOOLCHAIN_FILE "/usr/x86_64-w64-mingw32/Toolchain-cross-mingw32-linux.cmake")

# Check if we are targeting Windows from a Linux build system
if(CMAKE_SYSTEM_NAME STREQUAL "Linux" AND TARGET_PLATFORM STREQUAL "Windows")
  set(CMAKE_PREFIX_PATH ${QT_PATH_LINUX})
  set(CMAKE_TOOLCHAIN_FILE ${MINGW_TOOLCHAIN_FILE})
  # Ensure static linking for Windows build
  set(Qt5Widgets_EXECUTABLE_COMPILE_FLAGS "-static")
elseif(CMAKE_SYSTEM_NAME STREQUAL "Linux")
  set(CMAKE_PREFIX_PATH ${QT_PATH_LINUX})
  # Ensure static linking for Linux build
  set(Qt5Widgets_EXECUTABLE_COMPILE_FLAGS "-static")
endif()

find_package(Qt5 COMPONENTS Widgets WebEngineWidgets REQUIRED)
include_directories(${Qt5Widgets_INCLUDES})
add_definitions(${Qt5Widgets_DEFINITIONS})
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${Qt5Widgets_EXECUTABLE_COMPILE_FLAGS}")

add_executable(AzionDesktop main.cpp icon.cpp "manage.h")
target_link_libraries(AzionDesktop Qt5::Widgets Qt5::WebEngineWidgets)