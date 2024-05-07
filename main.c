#include <dlfcn.h>
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


int main() {

	if (!reload_libplug()) return 1;

	InitWindow(ScreenWidth, ScreenHeight, "Game Of Life");

	SetWindowTitle("Game Of Life");
	SetTargetFPS(12);
	// Close, minimize. maximize buttons

	plug_init();
	while(!WindowShouldClose()) {
		if (IsKeyPressed(KEY_R)) {
			void *state = plug_pre_load();
			if (!reload_libplug()) return 1;
			plug_post_load(state);
		}
		plug_update();
	}

	CloseWindow();
	return 0;
}
