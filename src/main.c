#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#define PLUG_IMPLEMENTATION
#include "include/plug.h"

int ScreenWidth  = 1000;
int ScreenHeight = 1000;

int main(int argc, char **argv) {

	if (argc == 0) {
		TraceLog(LOG_ERROR, "Usage: %s <libplug.so>", argv[0]);
		return 1;
	}

	char* libplug_path = argv[1];
	set_libplug_path(libplug_path);

	TraceLog(LOG_INFO, "--------------------------------------------------");
	if (!reload_libplug()) return 1;
	TraceLog(LOG_INFO, "--------------------------------------------------");


	InitWindow(ScreenWidth, ScreenHeight, "Game Of Life");
	srand(time(NULL));
	SetWindowTitle("Game Of Life");
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

	CloseWindow();
	return 0;
}
