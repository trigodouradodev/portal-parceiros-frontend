# 3D Engine (C++ / OpenGL)

Minimal modular 3D engine with GLFW window, OpenGL 3.3 core rendering, FPS camera, and mesh/scene management.

## Requirements

- CMake 3.15+
- C++17 compiler (MSVC, GCC, or Clang)
- [GLFW](https://www.glfw.org/) — fetched automatically by CMake if not installed

**Windows:** Install an OpenGL loader or use a driver that exports OpenGL 3.3+. MSVC links `opengl32` automatically.

## Build

```bash
cd 3DEngine
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release
```

**Windows (Visual Studio):**

```powershell
cmake -B build
cmake --build build --config Release
.\build\Release\3DEngine.exe
```

## Controls

| Input | Action |
|--------|--------|
| W / A / S / D | Move forward / left / back / right |
| Space / Shift | Move up / down |
| Mouse | Look around (cursor captured) |
| ESC | Release cursor / exit |

## Project layout

```
include/Engine/   Public headers
src/              Implementation
shaders/          GLSL vertex & fragment shaders
CMakeLists.txt
```

## Next steps

- Load `.obj` models (e.g. tinyobjloader)
- Texture support and material system
- Directional/point lights in shaders
- Entity-component or scene graph transforms
- Optional: GLAD for extension loading, Dear ImGui for debug UI
