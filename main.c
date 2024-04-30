#include <dlfcn.h>
#include <math.h>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

#include "raylib/include/raylib.h"
#include "raylib/include/raymath.h"
#include "raylib/include/rlgl.h"

#include "include/plug.h"

#define COLOR_ALIVE = YELLOW;

const int GRID_ROWS = 50;
const int GRID_COLS = 50;

const int windowWidth = 1000;
const int windowHeight = 1000;

const int cellWidth = windowWidth / GRID_COLS;
const int cellHeight = windowHeight / GRID_ROWS;

const char* libplug_file_name = "./libplug.so";
void* libplug = NULL;

#ifdef HOT_RELOADABLE
	#define PLUG(name) name##_t *name = NULL;
#else
	#define PLUG(name) name##_t name;
#endif
PLUGS_LIST
#undef PLUG

Plug plug = { 0 };

#ifdef HOT_RELOADABLE
bool reload_libplug(void) {

	if (libplug != NULL) {
		dlclose(libplug);
	}

	libplug = dlopen(libplug_file_name, RTLD_LAZY);
	if (libplug == NULL) {
		fprintf(stderr, "Error: %s\n", dlerror());
		return false;
	}

	if (libplug == NULL) {
		fprintf(stderr, "Error: %s\n", dlerror());
		return false;
	}

	#define PLUG(name) \
		name = dlsym(libplug, #name); \
		if (name == NULL) { \
			fprintf(stderr, "Error: %s\n", dlerror()); \
			return false; \
		}
	PLUGS_LIST
	#undef PLUG

	return true;
}
#else
	#define reload_libplug() true
#endif

void init_grid(Cell **cells, int cols, int rows);

int main() {

	if (!reload_libplug()) return 1;

	Cell **grid = (Cell **) calloc(GRID_COLS, sizeof(Cell *));
	for (int i = 0; i < GRID_COLS; i++) {
		grid[i] = (Cell *) malloc(GRID_ROWS * sizeof(Cell));
	}

	InitWindow(windowWidth, windowHeight, "Game Of Life");
	SetWindowTitle("Game Of Life");
	SetTargetFPS(12);
	init_grid(grid, GRID_COLS, GRID_ROWS);

	plug_init(&plug, grid, GRID_COLS, GRID_ROWS);
	while (!WindowShouldClose()) {
#ifdef HOT_RELOADABLE
		if (IsKeyPressed(KEY_R)) {
			plug_pre_load(&plug);
			if (!reload_libplug()) return 1;
			plug_post_load(&plug);
		}
#endif
		plug_update(&plug);
	}


	CloseWindow();
	for (int i = 0; i < GRID_COLS; i++) {
		free(grid[i]);
	}
	free(grid);
	return 0;
}

void init_grid(Cell **cells, int cols, int rows) {
	BeginDrawing();
		ClearBackground(RAYWHITE);
		for (int i = 0; i < cols; i++) {
			for (int j = 0; j < rows; j++) {
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, YELLOW);
				DrawRectangleLines(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLACK);
				cells[i][j].x = i;
				cells[i][j].y = j;
				cells[i][j].status = DEAD;
			}
		}
		fprintf(stdout, "INFO: Plug initialized\n");
	EndDrawing();
}
