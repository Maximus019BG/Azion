cmake_minimum_required(VERSION 3.28)
project(AzionDesktop)

set(CMAKE_CXX_STANDARD 17)

# Ensure this path points to your static Qt build if you're linking statically
set(CMAKE_PREFIX_PATH "/usr/lib/x86_64-linux-gnu/cmake/Qt5WebEngineWidgets/")

# Correctly find the required Qt components
find_package(Qt5 COMPONENTS Widgets WebEngineWidgets REQUIRED)

set(CMAKE_AUTOMOC ON)
set(CMAKE_AUTORCC ON)
set(CMAKE_AUTOUIC ON)
set(ASSETS_DIR "${CMAKE_CURRENT_SOURCE_DIR}/assets")
set(ASSETS_DIR_DEST "${CMAKE_CURRENT_BINARY_DIR}/assets")

include_directories(${Qt5Widgets_INCLUDES})
add_definitions(${Qt5Widgets_DEFINITIONS})
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} ${Qt5Widgets_EXECUTABLE_COMPILE_FLAGS}")


add_executable(AzionDesktop main.cpp
        icon.cpp
        "manage.h")
target_link_libraries(AzionDesktop Qt5::Widgets Qt5::WebEngineWidgets)

# Custom target to copy assets folder
add_custom_target(copy_assets ALL
        COMMAND ${CMAKE_COMMAND} -E copy_directory ${ASSETS_DIR} ${ASSETS_DIR_DEST}
        COMMENT "Copying assets to build directory"
)

# Now add dependencies
add_dependencies(AzionDesktop copy_assets)