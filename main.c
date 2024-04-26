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

const int GRID_COLS = 80;
const int GRID_ROWS = 80;

const int windowWidth = 800;
const int windowHeight = 800;

const int cellWidth = windowWidth / GRID_COLS;
const int cellHeight = windowHeight / GRID_ROWS;

const char* libplug_file_name = "./libplug.so";
void* libplug = NULL;
plug_hello_t plug_hello = NULL;
plug_init_t plug_init = NULL;
plug_update_t plug_update = NULL;
Plug plug = { 0 };

void DrawCells(Cell **grid, int cols, int rows);

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

	plug_hello = dlsym(libplug, "plug_hello");
	if (plug_hello == NULL) {
		fprintf(stderr, "Error: %s\n", dlerror());
		return false;
	}

	plug_init = dlsym(libplug, "plug_init");
	if (plug_init == NULL) {
		fprintf(stderr, "Error: %s\n", dlerror());
		return false;
	}

	plug_update = dlsym(libplug, "plug_update");
	if (plug_update == NULL) {
		fprintf(stderr, "Error: %s\n", dlerror());
		return false;
	}

	plug_hello();
	return true;
}

int main() {

	if (!reload_libplug()) return 1;

	Cell **grid = (Cell **) calloc(GRID_COLS, sizeof(Cell *));
	for (int i = 0; i < GRID_COLS; i++) {
		grid[i] = (Cell *) malloc(GRID_ROWS * sizeof(Cell));
	}

	InitWindow(windowWidth, windowHeight, "Game Of Life");
	SetTargetFPS(60);

	plug_init(&plug, grid, GRID_COLS, GRID_ROWS, windowWidth, windowHeight);
	while (!WindowShouldClose()) {
		if (IsKeyPressed(KEY_R)) {
			if (!reload_libplug()) return 1;
		}
		plug_update(&plug);
	}

	CloseWindow();
	for (int i = 0; i < GRID_COLS; i++) {
		free(grid[i]);
	}
	free(grid);
	return 0;
}


