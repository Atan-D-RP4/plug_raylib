#include "include/plug.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

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
	for (size_t i = 0; i < plug->cols; ++i) {
		temp[i] = (bool *)malloc(plug->rows * sizeof(bool));
		for (size_t j = 0; j < plug->rows; ++j) {
			temp[i][j] = plug->cells[i][j].status;
		}
	}

	for (size_t i = 0; i < plug->cols; ++i) {
		for (size_t j = 0; j < plug->rows; ++j) {
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

void DrawFrame(Plug *plug) {
	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	for (int i = 0; i < plug->cols; i++) {
		for (int j = 0; j < plug->rows; j++) {
			if (plug->cells[i][j].status == ALIVE)
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, YELLOW);
			DrawRectangleLines(i * cellWidth, j * cellHeight,
					cellWidth, cellHeight, BLACK);
		}
	}
}

void plug_hello() {
	printf("\rHello from pluggin\n");
}

void plug_init(Plug *plug, Cell **cells, int rows, int cols) {
	plug->cells = cells;
	plug->rows = rows;
	plug->cols = cols;

	plug->windowWidth = GetScreenWidth();
	plug->windowHeight = GetScreenHeight();
	plug->playing = false;
}

void plug_update(Plug *plug) {
	BeginDrawing();

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

	if (IsKeyPressed(KEY_G)) {
		for (int i = 0; i < plug->cols; i++) {
			for (int j = 0; j < plug->rows; j++) {
				plug->cells[i][j].status = rand() % 2;
			}
		}
	}

	DrawFrame(plug);

	if (!plug->playing) {
		EndDrawing();
		return;
	}

	update_cells(plug);

	EndDrawing();
}

void plug_pre_load(Plug *plug) {
	printf("\nPlug pre load\n");
	// some deinitalization
}

void plug_post_load(Plug *plug) {
	printf("Plug loaded\n");
	// reinitialization
}


