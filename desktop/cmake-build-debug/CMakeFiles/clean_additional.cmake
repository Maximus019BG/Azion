# Additional clean files
cmake_minimum_required(VERSION 3.16)

if("${CONFIG}" STREQUAL "" OR "${CONFIG}" STREQUAL "Debug")
  file(REMOVE_RECURSE
  "AzionDesktop_autogen"
  "CMakeFiles/AzionDesktop_autogen.dir/AutogenUsed.txt"
  "CMakeFiles/AzionDesktop_autogen.dir/ParseCache.txt"
  )
endif()
