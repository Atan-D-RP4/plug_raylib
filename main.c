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

void init_grid(Cell **cells, int cols, int rows);

#define COLOR_ALIVE = YELLOW;

#define ScreenWidth 1000
#define ScreenHeight 1000

int main() {

	if (!reload_libplug()) return 1;

	InitWindow(ScreenWidth, ScreenHeight, "Game Of Life");
	SetWindowTitle("Game Of Life");
	SetTargetFPS(12);
	// Close, minimize. maximize buttons

	Plug *plug = plug_init();
	init_grid(plug->cells, plug->cols, plug->rows);

	while (!WindowShouldClose()) {
		if (IsKeyPressed(KEY_R)) {
			void *state = plug_pre_load();
			if (!reload_libplug()) return 1;
			plug_post_load(state);
		}
		plug_update((void *) plug);
	}


	CloseWindow();
	return 0;
}

void init_grid(Cell **cells, int cols, int rows) {
	BeginDrawing();
		ClearBackground(RAYWHITE);
		int cellWidth = GetScreenWidth() / cols;
		int cellHeight = GetScreenHeight() / rows;
		for (int i = 0; i < cols; i++) {
			for (int j = 0; j < rows; j++) {
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, RAYWHITE);
				DrawRectangleLines(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLACK);
				cells[i][j].x = i;
				cells[i][j].y = j;
				cells[i][j].status = DEAD;
			}
		}
	EndDrawing();
}
