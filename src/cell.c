#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#include "include/cell.h"

void DrawFrame(Plug *plug) {
	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;

	for (int i = 0; i < plug->cols; i++) {
		for (int j = 0; j < plug->rows; j++) {
			if (plug->cells[i][j].status_next == ALIVE)
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, COLOR_ALIVE);
			DrawRectangleLines(i * cellWidth, j * cellHeight,
					cellWidth, cellHeight, COLOR_LINES);
			plug->cells[i][j].status_prev = plug->cells[i][j].status_next;
		}
	}
}

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
					plug->cells[i][j].status_next = DEAD;
				if (alive < 2 || alive > 3) {
				}
			} else {
				if (alive == 3) {
					plug->cells[i][j].status_next = ALIVE;
				}
			}
		}
	}
}

void create_pulsar(Plug *plug) {
	// create a pulsar in the grid
	int x = GetMouseX() / (GetScreenWidth() / plug->cols);
	int y = GetMouseY() / (GetScreenHeight() / plug->rows);

	// Ensure the pulsar fits in the grid
	if (x < 2 || x > plug->cols - 2 || y < 2 || y > plug->rows - 2) return;

	for (int i = -2; i < 3; i++) {
		// Ensure each of the access points exist in the grid
		if (x + i < 0 || x + i >= plug->cols || y + i < 0 || y + i >= plug->rows) return;
		if (x - 2 < 0 || x + 2 >= plug->cols || y - 2 < 0 || y + 2 >= plug->rows) return;
		plug->cells[x + i][y - 2].status_next = ALIVE;
		plug->cells[x + i][y + 2].status_next = ALIVE;

		plug->cells[x - 2][y + i].status_next = ALIVE;
		plug->cells[x + 2][y + i].status_next = ALIVE;
	}
}

void create_gun(Plug *plug) {
	// Gosper's Glider Gun
	int x = plug->cols / 2;
	int y = plug->rows / 2;
	plug->cells[x][y].status_next = ALIVE;
	plug->cells[x][y + 1].status_next = ALIVE;
	plug->cells[x + 1][y].status_next = ALIVE;
	plug->cells[x + 1][y + 1].status_next = ALIVE;
	plug->cells[x - 1][y + 10].status_next = ALIVE;
	plug->cells[x - 1][y + 11].status_next = ALIVE;
	plug->cells[x - 2][y + 10].status_next = ALIVE;
	plug->cells[x - 2][y + 11].status_next = ALIVE;
	plug->cells[x + 2][y + 10].status_next = ALIVE;
	plug->cells[x + 2][y + 11].status_next = ALIVE;
	plug->cells[x + 3][y + 12].status_next = ALIVE;
	plug->cells[x + 3][y + 14].status_next = ALIVE;
	plug->cells[x + 4][y + 12].status_next = ALIVE;
	plug->cells[x + 4][y + 14].status_next = ALIVE;
	plug->cells[x + 5][y + 12].status_next = ALIVE;
	plug->cells[x + 5][y + 13].status_next = ALIVE;
	plug->cells[x + 5][y + 14].status_next = ALIVE;
	plug->cells[x + 6][y + 11].status_next = ALIVE;
	plug->cells[x + 6][y + 15].status_next = ALIVE;
	plug->cells[x + 7][y + 10].status_next = ALIVE;
	plug->cells[x + 7][y + 11].status_next = ALIVE;
	plug->cells[x + 7][y + 15].status_next = ALIVE;
	plug->cells[x + 7][y + 16].status_next = ALIVE;
}
