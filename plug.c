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

#include "include/cell.h"

Plug *plug = NULL;

int count_alive_neighbours(Cell **cells, int x, int y, int rows, int cols) {
	int count = 0;
	for (int i = -1; i < 2; i++) {
		for (int j = -1; j < 2; j++) {
			if (i == 0 && j == 0) continue;
			int nx = x + i, ny = y + j;
			if (nx >= 0 && nx < rows && ny >= 0 && ny < cols && cells[nx][ny].status_prev == ALIVE)
				count++;
		}
	}
	return count;
}

void update_cells(Plug *plug) {
	// update cells
	for (int i = 0; i < plug->cols; ++i) {
		for (int j = 0; j < plug->rows; ++j) {
			int alive = count_alive_neighbours(plug->cells, i, j, plug->rows, plug->cols);
			if (plug->cells[i][j].status_prev == ALIVE) {
				if (alive < 2 || alive > 3) {
					plug->cells[i][j].status_next = DEAD;
				}
			} else {
				if (alive == 3) {
					plug->cells[i][j].status_next = ALIVE;
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
		plug->cells[x + i][y - 2].status_next = ALIVE;
		plug->cells[x + i][y + 2].status_next = ALIVE;
		plug->cells[x - 2][y + i].status_next = ALIVE;
		plug->cells[x + 2][y + i].status_next = ALIVE;
	}
}

void create_gun(Plug *plug) {
	// create a gun in the grid
	int x = (plug->cols / 2) - 10;
	int y = (plug->rows / 2) - 10;
	for (int i = -4; i < 4; i++) {
		plug->cells[x + i][y - 1].status_next = ALIVE;
		plug->cells[x + i][y + 1].status_next = ALIVE;
	}
	plug->cells[x - 4][y].status_next = ALIVE;
	plug->cells[x + 4][y].status_next = ALIVE;
	plug->cells[x - 5][y + 1].status_next = ALIVE;
	plug->cells[x + 5][y + 1].status_next = ALIVE;
	plug->cells[x - 6][y + 2].status_next = ALIVE;
	plug->cells[x + 6][y + 2].status_next = ALIVE;
	plug->cells[x - 7][y + 3].status_next = ALIVE;
	plug->cells[x + 7][y + 3].status_next = ALIVE;
	plug->cells[x - 7][y - 3].status_next = ALIVE;
	plug->cells[x + 7][y - 3].status_next = ALIVE;
	plug->cells[x - 6][y - 4].status_next = ALIVE;
	plug->cells[x + 6][y - 4].status_next = ALIVE;
	plug->cells[x - 5][y - 5].status_next = ALIVE;
	plug->cells[x + 5][y - 5].status_next = ALIVE;
	plug->cells[x - 4][y - 6].status_next = ALIVE;
	plug->cells[x + 4][y - 6].status_next = ALIVE;
	plug->cells[x - 3][y - 6].status_next = ALIVE;
	plug->cells[x + 3][y - 6].status_next = ALIVE;
	plug->cells[x - 2][y - 6].status_next = ALIVE;
	plug->cells[x + 2][y - 6].status_next = ALIVE;
	plug->cells[x - 1][y - 6].status_next = ALIVE;
	plug->cells[x + 1][y - 6].status_next = ALIVE;
	plug->cells[x][y - 6].status_next = ALIVE;
}

void DrawFrame(Plug *plug) {
	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	for (int i = 0; i < plug->cols; i++) {
		for (int j = 0; j < plug->rows; j++) {
			if (plug->cells[i][j].status_next == ALIVE)
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLUE);
			DrawRectangleLines(i * cellWidth, j * cellHeight,
					cellWidth, cellHeight, BLACK);
			plug->cells[i][j].status_prev = plug->cells[i][j].status_next;
		}
	}
}

void plug_update() {
	BeginDrawing();
	srand(time(NULL));

	ClearBackground(RAYWHITE);

	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	if (IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
		int x = GetMouseX() / cellWidth;
		int y = GetMouseY() / cellHeight;
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
		grid[i] = (Cell *) malloc(GRID_ROWS * sizeof(Cell));
	}

	init->cells = grid;
	init->rows = GRID_ROWS;
	init->cols = GRID_COLS;

	init->windowWidth = GetScreenWidth();
	init->windowHeight = GetScreenHeight();
	init->playing = false;

	plug = init;
	fprintf(stdout, "INFO: Plug initialized\n");

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
	printf(	"Plug initialized with %d rows and %d cols\n", init->rows, init->cols);

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
	printf("cpy: %p -> [%d] [%d]\n", cpy, cpy->rows, cpy->cols);
	printf("plug: %p -> [%d] [%d]\n", plug, plug->rows, plug->cols);
	printf("playing: %d\n", plug->playing);

	for (int i = 0; i < cpy->cols; i++) {
		for (int j = 0; j < cpy->rows; j++) {
			if (i >= plug->cols || j >= plug->rows) {
				break;
			}
			plug->cells[i][j].status_next = cpy->cells[i][j].status_next;
			plug->cells[i][j].status_prev = cpy->cells[i][j].status_prev;
		}
		printf("\n");
		printf("\rfreeing %d", i);
		free(cpy->cells[i]);
	}
	printf("\n");
	free(cpy->cells);
	free(cpy);
	printf("plug: %p\n", plug);
	printf("cpy: %p\n", cpy);
}
