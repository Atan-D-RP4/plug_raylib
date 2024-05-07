#include "include/plug.h"

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#include "include/cell.h"

int count_alive_neighbours(bool **cells, int x, int y, int rows, int cols) {
	int count = 0;
	for (int i = -1; i < 2; i++) {
		for (int j = -1; j < 2; j++) {
			if (i == 0 && j == 0) continue;
			int nx = x + i, ny = y + j;
			if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && cells[nx][ny] == ALIVE)
				count++;
		}
	}
	return count;
}

void update_cells(Plug *plug) {
	// update cells
	bool **temp = (bool **)malloc(plug->cols * sizeof(bool *));
	for (int i = 0; i < plug->cols; ++i) {
		temp[i] = (bool *)malloc(plug->rows * sizeof(bool));
		for (int j = 0; j < plug->rows; ++j) {
			temp[i][j] = plug->cells[i][j].status;
		}
	}

	for (int i = 0; i < plug->cols; ++i) {
		for (int j = 0; j < plug->rows; ++j) {
			int alive = count_alive_neighbours(temp, i, j, plug->rows, plug->cols);
			if (temp[i][j] == ALIVE) {
				if (alive < 2 || alive > 3) {
					plug->cells[i][j].status = DEAD;
				}
			} else {
				if (alive == 3) {
					plug->cells[i][j].status = ALIVE;
				}
			}
		}
	}
}

void create_pulsar(Plug *plug){
	// create a pulsar in the grid
	int x = plug->cols / 2;
	int y = plug->rows / 2;
	for (int i = -2; i < 3; i++) {
		plug->cells[x + i][y - 2].status = ALIVE;
		plug->cells[x + i][y + 2].status = ALIVE;
		plug->cells[x - 2][y + i].status = ALIVE;
		plug->cells[x + 2][y + i].status = ALIVE;
	}
}

void create_gun(Plug *plug) {
	// create a gun in the grid
	int x = (plug->cols / 2) - 10;
	int y = (plug->rows / 2) - 10;
	for (int i = -4; i < 4; i++) {
		plug->cells[x + i][y - 1].status = ALIVE;
		plug->cells[x + i][y + 1].status = ALIVE;
	}
	plug->cells[x - 4][y].status = ALIVE;
	plug->cells[x + 4][y].status = ALIVE;
	plug->cells[x - 5][y + 1].status = ALIVE;
	plug->cells[x + 5][y + 1].status = ALIVE;
	plug->cells[x - 6][y + 2].status = ALIVE;
	plug->cells[x + 6][y + 2].status = ALIVE;
	plug->cells[x - 7][y + 3].status = ALIVE;
	plug->cells[x + 7][y + 3].status = ALIVE;
	plug->cells[x - 7][y - 3].status = ALIVE;
	plug->cells[x + 7][y - 3].status = ALIVE;
	plug->cells[x - 6][y - 4].status = ALIVE;
	plug->cells[x + 6][y - 4].status = ALIVE;
	plug->cells[x - 5][y - 5].status = ALIVE;
	plug->cells[x + 5][y - 5].status = ALIVE;
	plug->cells[x - 4][y - 6].status = ALIVE;
	plug->cells[x + 4][y - 6].status = ALIVE;
	plug->cells[x - 3][y - 6].status = ALIVE;
	plug->cells[x + 3][y - 6].status = ALIVE;
	plug->cells[x - 2][y - 6].status = ALIVE;
	plug->cells[x + 2][y - 6].status = ALIVE;
	plug->cells[x - 1][y - 6].status = ALIVE;
	plug->cells[x + 1][y - 6].status = ALIVE;
	plug->cells[x][y - 6].status = ALIVE;
}

void DrawFrame(Plug *plug) {
	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	for (int i = 0; i < plug->cols; i++) {
		for (int j = 0; j < plug->rows; j++) {
			if (plug->cells[i][j].status == ALIVE)
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLUE);
			DrawRectangleLines(i * cellWidth, j * cellHeight,
					cellWidth, cellHeight, BLACK);
		}
	}
}

void *plug_init(void) {
	Plug *plug = (Plug *) malloc(sizeof(Plug));
	Cell **grid = (Cell **) calloc(GRID_COLS, sizeof(Cell *));
	for (int i = 0; i < GRID_COLS; i++) {
		grid[i] = (Cell *) malloc(GRID_ROWS * sizeof(Cell));
	}

	plug->cells = grid;
	plug->rows = GRID_ROWS;
	plug->cols = GRID_COLS;

	plug->windowWidth = GetScreenWidth();
	plug->windowHeight = GetScreenHeight();
	plug->playing = false;

	fprintf(stdout, "INFO: Plug initialized\n");

	return plug;
}

void plug_update(void *state) {
	Plug *plug = (Plug *) state;
	BeginDrawing();
	srand(time(NULL));

	ClearBackground(RAYWHITE);

	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
		int x = GetMouseX() / cellWidth;
		int y = GetMouseY() / cellHeight;
		plug->cells[x][y].status = !plug->cells[x][y].status;
	}

	if (IsKeyPressed(KEY_SPACE)) {
		plug->playing = !plug->playing;
	}

	if (IsKeyPressed(KEY_C)) {
		for (int i = 0; i < plug->cols; i++) {
			for (int j = 0; j < plug->rows; j++) {
				plug->cells[i][j].status = DEAD;
			}
		}
	}

	if (IsKeyDown(KEY_LEFT_CONTROL) && IsKeyPressed(KEY_C)) {
		system("clear");
	}

	if (IsKeyPressed(KEY_G)) {
		for (int i = 0; i < plug->cols; i++) {
			for (int j = 0; j < plug->rows; j++) {
				plug->cells[i][j].status = rand() % 2;
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

void *plug_pre_load(void) {
	fprintf(stdout, "INFO: Plug Pre-Load\n");
	// some deinitalization
	return NULL;
}

void plug_post_load(void *state) {
	fprintf(stdout, "INFO: Plug Post-Load\n");
	// reinitialization
}


