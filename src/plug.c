#include "include/plug.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <unistd.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#define CELL_IMPLEMENTATION
#include "include/cell.h"

static Plug *plug = NULL;

void plug_update() {
	BeginDrawing();

	ClearBackground(COLOR_BACKGROUND);

	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	if (IsMouseButtonDown(MOUSE_LEFT_BUTTON)) {
		int x = GetMouseX() / cellWidth;
		int y = GetMouseY() / cellHeight;
		// Check if x and y are within the bounds of the grid
		if (x >= 0 && x < plug->cols && y >= 0 && y < plug->rows)
			plug->cells[x][y].status_next = !plug->cells[x][y].status_next;
	}

	if (IsKeyPressed(KEY_SPACE)) {
		plug->playing = !plug->playing;
	}

	if (IsKeyPressed(KEY_C)) {
		for (int i = 0; i < plug->cols; i++) {
			for (int j = 0; j < plug->rows; j++) {
				plug->cells[i][j].status_next = DEAD;
			}
		}
	}

	if (IsKeyDown(KEY_LEFT_CONTROL) && IsKeyPressed(KEY_C)) {
		system("clear");
	}

	if (IsKeyPressed(KEY_G)) {
		for (int i = 0; i < plug->cols; i++) {
			for (int j = 0; j < plug->rows; j++) {
				plug->cells[i][j].status_next = rand() % 2;
			}
		}
	}

	if (IsKeyDown(KEY_P)) {
		create_pulsar(plug);
	}

	if (IsKeyPressed(KEY_W)) {
		create_gun(plug);
	}

	DrawFrame(plug);

	if (!plug->playing) {
		EndDrawing();
		return;
	}

	update_cells(plug);

	EndDrawing();
}

void plug_init(void) {
	Plug *init = (Plug *) malloc(sizeof(Plug));
	Cell **grid = (Cell **) calloc(GRID_COLS, sizeof(Cell *));
	for (int i = 0; i < GRID_COLS; i++) {
		grid[i] = (Cell *) calloc(GRID_ROWS, sizeof(Cell));
	}

	init->cells = grid;
	init->rows = GRID_ROWS;
	init->cols = GRID_COLS;

	init->windowWidth = GetScreenWidth();
	init->windowHeight = GetScreenHeight();
	init->playing = false;

	plug = init;
	TraceLog(LOG_INFO, "Plug initialized");

	BeginDrawing();
		ClearBackground(RAYWHITE);
		int cellWidth = GetScreenWidth() / init->cols;
		int cellHeight = GetScreenHeight() / init->rows;
		for (int i = 0; i < init->cols; i++) {
			for (int j = 0; j < init->rows; j++) {
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, RAYWHITE);
				DrawRectangleLines(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLACK);
				init->cells[i][j].status_next = DEAD;
			}
		}
	EndDrawing();
	TraceLog(LOG_INFO,"Plug initialized with %d rows and %d cols\n",
			init->rows, init->cols);

}

void *plug_pre_load(void) {
	fprintf(stdout, "INFO: Plug Pre-Load\n");
	// some deinitalization
	if (plug == NULL) {
		plug_init();
		return plug;
	}

	Plug *copy = (Plug *) malloc(sizeof(Plug));

	Cell **grid = (Cell **) calloc(plug->cols, sizeof(Cell *));
	for (int i = 0; i < plug->cols; i++) {
		grid[i] = (Cell *) malloc(plug->rows * sizeof(Cell));
	}
	copy->cells = grid;

	for (int i = 0; i < plug->cols; i++) {
		for (int j = 0; j < plug->rows; j++) {
			copy->cells[i][j].status_next = plug->cells[i][j].status_next;
			copy->cells[i][j].status_prev = plug->cells[i][j].status_prev;
		}
	}

	for (int i = 0; i < plug->cols; i++) {
		free(plug->cells[i]);
	}
	free(plug->cells);

	copy->rows = plug->rows;
	copy->cols = plug->cols;
	copy->windowWidth = plug->windowWidth;
	copy->windowHeight = plug->windowHeight;
	copy->playing = plug->playing;


	free(plug);
	return copy;
}

void plug_post_load(void *state) {
	fprintf(stdout, "INFO: Plug Post-Load\n");
	// reinitialization
	Plug *cpy = (Plug *) state;
	plug_init();

	plug->playing = cpy->playing;

	for (int i = 0; i < cpy->cols; i++) {
		for (int j = 0; j < cpy->rows; j++) {
			if (i >= plug->cols || j >= plug->rows) {
				break;
			}
			plug->cells[i][j].status_next = cpy->cells[i][j].status_next;
			plug->cells[i][j].status_prev = cpy->cells[i][j].status_prev;
		}
		free(cpy->cells[i]);
	}
	free(cpy->cells);
	free(cpy);
}
