#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#define NOB_IMPLEMENTATION
#include "include/nob.h"

#define SRC_DIR "./src"
#define BUILD_DIR "./build"
#define RAYLIB_SRC_DIR "./raylib/src"

bool build_raylib();
bool build_web_raylib();

bool build_life(Nob_Cmd *cmd);
bool build_bezier(Nob_Cmd *cmd);
bool build_imager(Nob_Cmd *cmd);
bool build_cube(Nob_Cmd *cmd);

bool build_game(Nob_Cmd *cmd);

bool hot_reloadable = true;

const char *compile_cmd = "clang";
const char *src_file = SRC_DIR "/main.c";
const char *out_file = BUILD_DIR "/main";

Nob_String_View CFLAGS_ARR[] = {
    (Nob_String_View) {.data = "-O3", .count = 3},
    (Nob_String_View) {.data = "-Wall", .count = 5},
    (Nob_String_View) {.data = "-Wextra", .count = 7},
    (Nob_String_View) {.data = "-pedantic", .count = 9},
    (Nob_String_View) {.data = "-ggdb", .count = 5},
};

Nob_String_View LDFLAGS_ARR[] = {
    (Nob_String_View) {.data = "-I./", .count = 12},
    (Nob_String_View) {.data = "-I./raylib/src", .count = 18},
    //(Nob_String_View) { .data = "./raylib_t/lib/libraylib.so.5.0.0", .count =
    // 30 },
    (Nob_String_View) {.data = "./build/libraylib.so.5.0.0", .count = 30},
    (Nob_String_View) {.data = "-lm", .count = 3},
    (Nob_String_View) {.data = "-ldl", .count = 4},
    (Nob_String_View) {.data = "-lpthread", .count = 9},
    //(Nob_String_View) { .data = "-Wl,-rpath=./raylib_t/lib", .count = 21 },
    (Nob_String_View) {.data = "-Wl,-rpath=./build/", .count = 21},
};

Nob_String_View PLUGFLAGS_ARR[] = {
    (Nob_String_View) {.data = "-fPIC", .count = 5},
    (Nob_String_View) {.data = "-shared", .count = 8},
};

int main(int argc, char **argv) {
    NOB_GO_REBUILD_URSELF(argc, argv);

    Nob_Cmd cmd = {0};
    if (nob_file_exists("nob.old")) {
        nob_cmd_append(&cmd, "rm");
        nob_cmd_append(&cmd, "nob.old");
        if (!nob_cmd_run_sync(cmd))
            return 1;
    }
    // setenv("LD_LIBRARY_PATH", "./raylib/lib", 1);

    if (!nob_file_exists(src_file)) {
        nob_log(NOB_ERROR, "Source file not found: %s\n", src_file);
        return 1;
    }

    const char *program = nob_shift_args(&argc, &argv);
    const char *subcmd = NULL;
    if (argc <= 0) {
        subcmd = "build";
    } else {
        subcmd = nob_shift_args(&argc, &argv);
    }

    nob_log(NOB_INFO, "--------------------------------------------------");
    if (hot_reloadable) {
        nob_log(NOB_INFO, "Hot reloadable");
    } else {
        nob_log(NOB_INFO, "Not hot reloadable");
    }

    if (strcmp(subcmd, "build") == 0) {

        nob_mkdir_if_not_exists("./build");
        if (!build_raylib())
            return 1;

        nob_log(NOB_INFO, "Building Plug and Game");
        cmd.count = 0;
        if (!build_bezier(&cmd))
            return 1;
        if (!build_life(&cmd))
            return 1;
        if (!build_imager(&cmd))
            return 1;
        if (!build_cube(&cmd))
            return 1;

        if (!build_game(&cmd))
            return 1;
        ;

        nob_log(NOB_INFO, "--------------------------------------------------");
        nob_log(NOB_INFO, "Built Plug and Game Successfully");
        nob_log(NOB_INFO, "--------------------------------------------------");

        return 0;
    } else if (strcmp(subcmd, "run") == 0) {

        nob_mkdir_if_not_exists("./build");
        if (!nob_file_exists("./build/raylib")) {
            if (!build_raylib())
                return 1;
        }

        nob_log(NOB_INFO, "Application: %s", argv[0]);

        cmd.count = 0;
        if (!build_life(&cmd))
            return 1;
        if (!build_bezier(&cmd))
            return 1;
        if (!build_imager(&cmd))
            return 1;
        if (!build_cube(&cmd))
            return 1;

        if (!build_game(&cmd))
            return 1;
        ;

        nob_log(NOB_INFO, "--------------------------------------------------");
        nob_log(NOB_INFO, "Running");

        cmd.count = 0;
        nob_cmd_append(&cmd, out_file);
        nob_da_append_many(&cmd, argv, argc);
        if (!nob_cmd_run_sync(cmd))
            return 1;
        nob_log(NOB_INFO, "--------------------------------------------------");

        return 0;

    } else if (strcmp(subcmd, "reload") == 0) {
        if (hot_reloadable) {
            if (argc <= 0) {
                if (!build_life(&cmd))
                    return 1;
                if (!build_bezier(&cmd))
                    return 1;
                if (!build_imager(&cmd))
                    return 1;
                if (!build_cube(&cmd))
                    return 1;

                nob_log(NOB_INFO,
                        "--------------------------------------------------");
                nob_log(NOB_INFO, "Rebuilt All Plugs");
                nob_log(NOB_INFO,
                        "--------------------------------------------------");
            } else {
                subcmd = nob_shift_args(&argc, &argv);
                if (strcmp(subcmd, "life") == 0) {
                    if (!build_life(&cmd))
                        return 1;
                } else if (strcmp(subcmd, "bezier") == 0) {
                    if (!build_bezier(&cmd))
                        return 1;
                } else if (strcmp(subcmd, "imager") == 0) {
                    if (!build_imager(&cmd))
                        return 1;
                } else if (strcmp(subcmd, "cube") == 0) {
                    if (!build_cube(&cmd))
                        return 1;
                } else if (strcmp(subcmd, "raylib") == 0) {

                    if (nob_file_exists("./build/libraylib.so.5.0.0")) {
                        Nob_Cmd cmd_t = {0};
                        nob_cmd_append(&cmd_t, "rm",
                                       "./build/libraylib.so.5.0.0");
                        if (!nob_cmd_run_sync(cmd_t))
                            return 1;
                    }
                    if (!build_raylib())
                        return 1;

                } else if (strcmp(subcmd, "raylib-web") == 0) {

                    if (nob_file_exists("./build/libraylib.so.5.0.0")) {
                        Nob_Cmd cmd_t = {0};
                        nob_cmd_append(&cmd_t, "rm",
                                       "./build/libraylib.so.5.0.0");
                        if (!nob_cmd_run_sync(cmd_t))
                            return 1;
                    }
                    if (!build_web_raylib())
                        return 1;

                } else if (strcmp(subcmd, "game") == 0) {
                    if (!build_game(&cmd))
                        return 1;
                } else {
                    nob_log(NOB_ERROR, "Unknown subcommand: %s\n", subcmd);
                    return 1;
                }
            }

        } else {
            nob_log(NOB_INFO,
                    "--------------------------------------------------");
            nob_log(NOB_ERROR, "Not HOT_RELOADABLE");
            nob_log(NOB_INFO,
                    "--------------------------------------------------");
            return 1;
        }

    } else if (strcmp(subcmd, "clean") == 0) {

        cmd.count = 0;
        nob_cmd_append(&cmd, "rm");
        if (nob_file_exists("nob"))
            nob_cmd_append(&cmd, "nob");
        if (nob_file_exists(BUILD_DIR)) {
            nob_cmd_append(&cmd, "-r");
            nob_cmd_append(&cmd, BUILD_DIR);
        }
        if (!nob_cmd_run_sync(cmd))
            return 1;
        nob_log(NOB_INFO, "--------------------------------------------------");
        nob_log(NOB_INFO, "Cleaned");
        nob_log(NOB_INFO, "--------------------------------------------------");
        return 0;

    } else {
        nob_log(NOB_ERROR, "Unknown subcommand: %s\n", subcmd);
        return 1;
    }

    nob_cmd_free(cmd);
    return 0;
}

bool build_game(Nob_Cmd *cmd) {

    cmd->count = 0;
    nob_cmd_append(cmd, compile_cmd);

    nob_cmd_append(cmd, "-o", out_file);
    nob_cmd_append(cmd, src_file);

    for (size_t i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
        nob_cmd_append(cmd, CFLAGS_ARR[i].data);
    }

    // This does not really work for no hot reloading
    // But I'll leave it here as a reference when I want to
    // make a fully integrated application which this project is not
    if (hot_reloadable) {
        nob_cmd_append(cmd, "-DHOT_RELOADABLE");
    } else {
        nob_cmd_append(cmd, BUILD_DIR "/liblife.so");
        nob_cmd_append(cmd, BUILD_DIR "/libbezier.so");
    }

    for (int i = 0; i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
        nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
    }

    return nob_cmd_run_sync(*cmd);
}

bool build_life(Nob_Cmd *cmd) {

    if (!nob_file_exists(SRC_DIR "/life.c"))
        return 1;
    if (!nob_file_exists(SRC_DIR "/cell.c"))
        return 1;

    cmd->count = 0;
    nob_cmd_append(cmd, compile_cmd);

    nob_cmd_append(cmd, "-o", BUILD_DIR "/liblife.so");
    nob_cmd_append(cmd, SRC_DIR "/life.c");
    nob_cmd_append(cmd, SRC_DIR "/cell.c");

    for (int i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
        nob_cmd_append(cmd, CFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(PLUGFLAGS_ARR); i++) {
        nob_cmd_append(cmd, PLUGFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
        nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
    }

    return nob_cmd_run_sync(*cmd);
}

bool build_bezier(Nob_Cmd *cmd) {

    if (!nob_file_exists(SRC_DIR "/bezier.c"))
        return 1;

    cmd->count = 0;
    nob_cmd_append(cmd, compile_cmd);

    nob_cmd_append(cmd, "-o", BUILD_DIR "/libbezier.so");
    nob_cmd_append(cmd, SRC_DIR "/bezier.c");

    for (int i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
        nob_cmd_append(cmd, CFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(PLUGFLAGS_ARR); i++) {
        nob_cmd_append(cmd, PLUGFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
        nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
    }

    return nob_cmd_run_sync(*cmd);
}

bool build_imager(Nob_Cmd *cmd) {

    if (!nob_file_exists(SRC_DIR "/imager.c"))
        return 1;

    cmd->count = 0;
    nob_cmd_append(cmd, compile_cmd);

    nob_cmd_append(cmd, "-o", BUILD_DIR "/libimager.so");
    nob_cmd_append(cmd, SRC_DIR "/imager.c", SRC_DIR "/perlin.c");

    for (int i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
        nob_cmd_append(cmd, CFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(PLUGFLAGS_ARR); i++) {
        nob_cmd_append(cmd, PLUGFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
        nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
    }

    return nob_cmd_run_sync(*cmd);
}

bool build_cube(Nob_Cmd *cmd) {

    if (!nob_file_exists(SRC_DIR "/cube.c"))
        return 1;

    cmd->count = 0;
    nob_cmd_append(cmd, compile_cmd);

    nob_cmd_append(cmd, "-o", BUILD_DIR "/libcube.so");
    nob_cmd_append(cmd, SRC_DIR "/cube.c");

    for (int i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
        nob_cmd_append(cmd, CFLAGS_ARR[i].data);
    }

    for (int i = 0; i < NOB_ARRAY_LEN(PLUGFLAGS_ARR); i++) {
        nob_cmd_append(cmd, PLUGFLAGS_ARR[i].data);
    }

    for (int i = 0; (size_t) i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
        nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
    }

    return nob_cmd_run_sync(*cmd);
}

bool build_raylib() {
    const char *compiler = compile_cmd;

    Nob_String_View SRC_FILES[] = {
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rcore.c", .count = 24},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rmodels.c", .count = 26},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/raudio.c", .count = 25},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rglfw.c", .count = 24},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rshapes.c", .count = 26},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rtext.c", .count = 24},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rtextures.c", .count = 28},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/utils.c", .count = 25},
    };

    Nob_String_View OUT_FILES[] = {
        (Nob_String_View) {.data = BUILD_DIR "/rcore.o", .count = 24},
        (Nob_String_View) {.data = BUILD_DIR "/rmodels.o", .count = 26},
        (Nob_String_View) {.data = BUILD_DIR "/raudio.o", .count = 25},
        (Nob_String_View) {.data = BUILD_DIR "/rglfw.o", .count = 24},
        (Nob_String_View) {.data = BUILD_DIR "/rshapes.o", .count = 26},
        (Nob_String_View) {.data = BUILD_DIR "/rtext.o", .count = 24},
        (Nob_String_View) {.data = BUILD_DIR "/rtextures.o", .count = 28},
        (Nob_String_View) {.data = BUILD_DIR "/utils.o", .count = 25},
    };

    if (nob_file_exists(BUILD_DIR "/libraylib.so.5.0.0"))
        return true;

    nob_mkdir_if_not_exists(BUILD_DIR);

    nob_log(NOB_INFO, "--------------------------------------------------");
    nob_log(NOB_INFO, "Building raylib");

    Nob_Cmd cmd = {0};
    for (size_t i = 0; i < NOB_ARRAY_LEN(SRC_FILES); i++) {
        cmd.count = 0;
        nob_cmd_append(&cmd, compiler);
        nob_cmd_append(&cmd, "-O1", "-Wall", "-Wextra");
        nob_cmd_append(&cmd, "-ggdb");
        nob_cmd_append(&cmd, "-std=c2x");
        nob_cmd_append(&cmd, "-I" RAYLIB_SRC_DIR);
        nob_cmd_append(&cmd, "-I" RAYLIB_SRC_DIR "/external/glfw/include");
        nob_cmd_append(&cmd, "-DPLATFORM_DESKTOP", "-DGRAPHICS_API_OPENGL_33");
        nob_cmd_append(&cmd, "-D_GLFW_X11", "-DSUPPORT_FILEFORMAT_FLAC=1");
        nob_cmd_append(&cmd, "-fPIC");
        nob_cmd_append(&cmd, "-c", SRC_FILES[i].data);
        nob_cmd_append(&cmd, "-o", OUT_FILES[i].data);
        if (!nob_cmd_run_sync(cmd)) {
            return false;
        }
    }

    // Build a shared library
    cmd.count = 0;
    nob_cmd_append(&cmd, compiler);
    for (int j = 0; (size_t) j < NOB_ARRAY_LEN(CFLAGS_ARR); j++) {
        nob_cmd_append(&cmd, CFLAGS_ARR[j].data);
    }
    nob_cmd_append(&cmd, "-shared");
    nob_cmd_append(&cmd, "-o", "./build/libraylib.so.5.0.0");
    for (size_t i = 0; i < NOB_ARRAY_LEN(OUT_FILES); i++) {
        nob_cmd_append(&cmd, OUT_FILES[i].data);
    }

    int success = nob_cmd_run_sync(cmd);
    cmd.count = 0;
    nob_cmd_append(&cmd, "rm");
    for (size_t i = 0; i < NOB_ARRAY_LEN(OUT_FILES); i++) {
        nob_cmd_append(&cmd, OUT_FILES[i].data);
    }
    if (!nob_cmd_run_sync(cmd)) {
        nob_log(NOB_ERROR, "Failed to clean up");
    }
    nob_log(NOB_INFO, "--------------------------------------------------");

    nob_cmd_free(cmd);
    return true;
}

bool build_web_raylib() {
    // Run this shell command to allow building raylib for web
    // source /home/atan/Software/emsdk/emsdk_env.sh

    // example game build command
    // emcc -o build/game.html src/game.c -Os -Wall -ggdb ./build/libraylib.a
    // -I./ -Iraylib/src -Iraylib/src/external/glfw/include \ -DPLATFORM_WEB
    // -DGRAPHICS_API_OPENGL_ES3 -s USE_GLFW=3 -s USE_WEBGL2=1 -s FULL_ES3=1
    const char *compiler = "emcc";
    Nob_String_View SRC_FILES[] = {
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rcore.c", .count = 24},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rmodels.c", .count = 26},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/raudio.c", .count = 25},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rshapes.c", .count = 26},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rtext.c", .count = 24},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/rtextures.c", .count = 28},
        (Nob_String_View) {.data = RAYLIB_SRC_DIR "/utils.c", .count = 25},
    };

    Nob_String_View OUT_FILES[] = {
        (Nob_String_View) {.data = BUILD_DIR "/rcore.o", .count = 24},
        (Nob_String_View) {.data = BUILD_DIR "/rmodels.o", .count = 26},
        (Nob_String_View) {.data = BUILD_DIR "/raudio.o", .count = 25},
        (Nob_String_View) {.data = BUILD_DIR "/rshapes.o", .count = 26},
        (Nob_String_View) {.data = BUILD_DIR "/rtext.o", .count = 24},
        (Nob_String_View) {.data = BUILD_DIR "/rtextures.o", .count = 28},
        (Nob_String_View) {.data = BUILD_DIR "/utils.o", .count = 25},
    };

    if (nob_file_exists(BUILD_DIR "/libraylib.a"))
        return true;

    nob_mkdir_if_not_exists(BUILD_DIR);

    nob_log(NOB_INFO, "--------------------------------------------------");
    nob_log(NOB_INFO, "Building raylib");

    Nob_Cmd cmd = {0};
    for (size_t i = 0; i < NOB_ARRAY_LEN(SRC_FILES); i++) {
        cmd.count = 0;
        nob_cmd_append(&cmd, compiler);
        nob_cmd_append(&cmd, "-c", SRC_FILES[i].data);
        nob_cmd_append(&cmd, "-o", OUT_FILES[i].data);
        nob_cmd_append(&cmd, "-Os", "-Wall");
        nob_cmd_append(&cmd, "-ggdb");
        nob_cmd_append(&cmd, "-I" RAYLIB_SRC_DIR);
        nob_cmd_append(&cmd, "-I" RAYLIB_SRC_DIR "/external/glfw/include");
        nob_cmd_append(&cmd, "-I/home/atan/Software/emsdk/upstream/emscripten/"
                             "cache/sysroot/include");
        nob_cmd_append(&cmd, "-DPLATFORM_WEB", "-DGRAPHICS_API_OPENGL_ES3");
        if (!nob_cmd_run_sync(cmd)) {
            return false;
        }
    }

    // Build a static web library
    cmd.count = 0;
    nob_cmd_append(&cmd, "emar", "rcs", "./build/libraylib.a");
    for (size_t i = 0; i < NOB_ARRAY_LEN(OUT_FILES); i++) {
        nob_cmd_append(&cmd, OUT_FILES[i].data);
    }

    int success = nob_cmd_run_sync(cmd);

    nob_cmd_free(cmd);
    return success;
}
