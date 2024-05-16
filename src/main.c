#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#define PLUG_IMPLEMENTATION
#include "include/plug.h"
#include "include/cell.h"

int ScreenWidth = 1200;
int ScreenHeight = 1200;

int main() {

	if (!reload_libplug()) return 1;

	InitWindow(ScreenWidth, ScreenHeight, "Game Of Life");
	srand(time(NULL));
	SetWindowTitle("Game Of Life");
	SetTargetFPS(FPS);

	plug_init();

	while(!WindowShouldClose()) {
		if (IsKeyPressed(KEY_R)) {
			TraceLog(LOG_INFO, "--------------------------------------------------");
			TraceLog(LOG_INFO, "Reloading libplug.so...");
			void *state = plug_pre_load();
			if (!reload_libplug()) return 1;
			plug_post_load(state);
			TraceLog(LOG_INFO, "--------------------------------------------------");
		}
		plug_update();
	}

	CloseWindow();
	return 0;
}
