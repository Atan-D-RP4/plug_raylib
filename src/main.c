#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <time.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#define PLUG_IMPLEMENTATION
#include "include/plug.h"

int ScreenWidth  = 800;
int ScreenHeight = 800;

int main(int argc, char **argv) {

	if (argc == 0) {
		TraceLog(LOG_ERROR, "Usage: %s <libplug.so>", argv[0]);
		return 1;
	}

	char* libplug_path = argv[1];
	set_libplug_path(libplug_path);

	char *title = NULL;
	if (strcmp(libplug_path, "./build/liblife.so") == 0) {
		printf("Game Of Life\n");
		title = "Game Of Life";
	} else if (strcmp(libplug_path, "./build/libcube.so") == 0) {
		printf("Cubes\n");
		title = "Cubes";
	} else if (strcmp(libplug_path, "./build/libimager.so") == 0) {
		printf("Imager\n");
		title = "Flow Fields";
	} else if (strcmp(libplug_path, "./build/libbezier.so") == 0) {
		printf("Bezier Curves\n");
		title = "Bezier Curves";
	} else {
		printf("Experimental\n");
		title = "Experimental";
	}

	TraceLog(LOG_INFO, "--------------------------------------------------");
	if (!reload_libplug()) return 1;
	TraceLog(LOG_INFO, "--------------------------------------------------");

	InitWindow(ScreenWidth, ScreenHeight, title);
	srand(time(NULL));
	SetTargetFPS(60);


	plug_init();
	while(!WindowShouldClose()) {
		if (IsKeyPressed(KEY_R)) {
			TraceLog(LOG_INFO, "--------------------------------------------------");
			TraceLog(LOG_INFO, "Reloading libplug.so...");
			void *state = plug_pre_load();
			if (!reload_libplug()) return 1;
			plug_post_load(state);
		}
		plug_update();
	}
	plug_free();

	CloseWindow();
	return 0;
}

