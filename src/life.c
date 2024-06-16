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
#include "cell.h"
#include "include/plug.h"

extern Color COLOR_BACKGROUND;

static Plug *plug = NULL;

void plug_update() {

	BeginDrawing();
	{
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

		if (IsKeyDown(KEY_P)) create_pulsar(plug->cells, plug->cols, plug->rows);

		if (IsKeyDown(KEY_O)) rand_square(plug->cells, plug->cols, plug->rows);

		if (IsKeyDown(KEY_I)) rand_square2(plug->cells, plug->cols, plug->rows);

		if (IsKeyPressed(KEY_W)) create_gun(plug->cells, plug->cols, plug->rows);

		DrawFrame(plug->cells, plug->cols, plug->rows,
				plug->windowWidth, plug->windowHeight);
	}
	EndDrawing();

	if (!plug->playing) {
		return;
	}

	update_cells(plug->cells, plug->cols, plug->rows);
}

void plug_init(void) {

	TraceLog(LOG_INFO, "Plug Init");
	Plug *init = (Plug *) malloc(sizeof(Plug));
	if (init == NULL) {
		TraceLog(LOG_ERROR, "Failed to allocate memory for plug");
		exit(1);
	}
	Cell **grid = (Cell **) calloc(GRID_COLS, sizeof(Cell *));
	if (grid == NULL) {
		TraceLog(LOG_ERROR, "Failed to allocate memory for grid");
		exit(1);
	}
	for (int i = 0; i < GRID_COLS; i++) {
		grid[i] = (Cell *) calloc(GRID_ROWS, sizeof(Cell));
		if (grid[i] == NULL) {
			TraceLog(LOG_ERROR, "Failed to allocate memory for grid[%d]", i);
			exit(1);
		}
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
	return plug;
}

void plug_post_load(void *state) {
	fprintf(stdout, "INFO: Plug Post-Load\n");
	// reinitialization
	Plug *cpy = (Plug *) state;
	plug_init();

	TraceLog(LOG_INFO, "Plug Playing: %d", cpy->playing);
	plug->playing = cpy->playing;

	TraceLog(LOG_INFO, "Plug Post-Load Complete");
	for (int i = 0; i < cpy->cols; i++) {
		memcpy(plug->cells[i], cpy->cells[i], cpy->rows * sizeof(Cell));
		free(cpy->cells[i]);
	}
	free(cpy->cells);
	free(cpy);
}

void plug_free(void) {
	for (int i = 0; i < plug->cols; i++) {
		free(plug->cells[i]);
	}
	free(plug->cells);
	free(plug);
	TraceLog(LOG_INFO, "Plug Freed");
}
