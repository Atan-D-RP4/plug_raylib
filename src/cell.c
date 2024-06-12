#include <stdlib.h>
#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#include "cell.h"

const Color COLOR_BACKGROUND = { 245, 245, 245, 255 }; // WHITE
const Color COLOR_LINES = { 0, 0, 0, 255 }; // BLACK
const Color COLOR_ALIVE = { 230, 41, 55, 255 }; // RED

void DrawFrame(Cell **cells, int rows, int cols, int windowWidth, int windowHeight) {
	int cellWidth = windowWidth / cols;
	int cellHeight = windowHeight / rows;

	for (int i = 0; i < cols; i++) {
		for (int j = 0; j < rows; j++) {
			if (cells[i][j].status_next == ALIVE)
				DrawRectangle(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, COLOR_ALIVE);
			DrawRectangleLines(i * cellWidth, j * cellHeight,
					cellWidth, cellHeight, COLOR_LINES);
			cells[i][j].status_prev = cells[i][j].status_next;
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

void update_cells(Cell **cells, int rows, int cols) {
	// update cells
	for (int i = 0; i < cols; ++i) {
		for (int j = 0; j < rows; ++j) {
			int alive = count_alive_neighbours(cells, i, j, rows, cols);
			if (cells[i][j].status_prev == ALIVE) {
					cells[i][j].status_next = DEAD;
				if (alive < 2 || alive > 3) {
					cells[i][j].status_next = DEAD;
				} else {
					cells[i][j].status_next = ALIVE;
				}
			} else {
				if (alive == 3) {
					cells[i][j].status_next = ALIVE;
				}
			}
		}
	}
}

void create_pulsar(Cell **cells, int rows, int cols) {
	// create a pulsar in the grid
	int x = GetMouseX() / (GetScreenWidth() / cols);
	int y = GetMouseY() / (GetScreenHeight() / rows);

	// Ensure the pulsar fits in the grid
	if (x < 2 || x > cols - 2 || y < 2 || y > rows - 2) return;

	for (int i = -2; i < 3; i++) {
		// Ensure each of the access points exist in the grid
		if (x + i < 0 || x + i >= cols || y + i < 0 || y + i >= rows) return;
		if (x - 2 < 0 || x + 2 >= cols || y - 2 < 0 || y + 2 >= rows) return;
		cells[x + i][y - 2].status_next = ALIVE;
		cells[x + i][y + 2].status_next = ALIVE;

		cells[x - 2][y + i].status_next = ALIVE;
		cells[x + 2][y + i].status_next = ALIVE;
	}
}

void create_gun(Cell **cells, int rows, int cols) {
	// Gosper's Glider Gun
	int x = cols / 2;
	int y = rows / 2;
	cells[x][y].status_next = ALIVE;
	cells[x][y + 1].status_next = ALIVE;
	cells[x + 1][y].status_next = ALIVE;
	cells[x + 1][y + 1].status_next = ALIVE;
	cells[x - 1][y + 10].status_next = ALIVE;
	cells[x - 1][y + 11].status_next = ALIVE;
	cells[x - 2][y + 10].status_next = ALIVE;
	cells[x - 2][y + 11].status_next = ALIVE;
	cells[x + 2][y + 10].status_next = ALIVE;
	cells[x + 2][y + 11].status_next = ALIVE;
	cells[x + 3][y + 12].status_next = ALIVE;
	cells[x + 3][y + 14].status_next = ALIVE;
	cells[x + 4][y + 12].status_next = ALIVE;
	cells[x + 4][y + 14].status_next = ALIVE;
	cells[x + 5][y + 12].status_next = ALIVE;
	cells[x + 5][y + 13].status_next = ALIVE;
	cells[x + 5][y + 14].status_next = ALIVE;
	cells[x + 6][y + 11].status_next = ALIVE;
	cells[x + 6][y + 15].status_next = ALIVE;
	cells[x + 7][y + 10].status_next = ALIVE;
	cells[x + 7][y + 11].status_next = ALIVE;
	cells[x + 7][y + 15].status_next = ALIVE;
	cells[x + 7][y + 16].status_next = ALIVE;
}

void rand_square(Cell **cells, int rows, int cols) {
	int x = GetMouseX() / (GetScreenWidth() / cols);
	int y = GetMouseY() / (GetScreenHeight() / rows);

	// Ensure the pulsar fits in the grid
	if (x < 2 || x > cols - 2 || y < 2 || y > rows - 2) return;

	for (int i = -2; i < 3; i++) {
		// Ensure each of the access points exist in the grid
		if (x + i < 0 || x + i >= cols || y + i < 0 || y + i >= rows) return;
		if (x - 2 < 0 || x + 2 >= cols || y - 2 < 0 || y + 2 >= rows) return;
		cells[x + i][y - 2].status_next = rand() % 2;
		cells[x + i][y + 2].status_next = rand() % 2;

		cells[x - 2][y + i].status_next = rand() % 2;
		cells[x + 2][y + i].status_next = rand() % 2;
	}
}

void rand_square2(Cell **cells, int rows, int cols) {
	int x = GetMouseX() / (GetScreenWidth() / cols);
	int y = GetMouseY() / (GetScreenHeight() / rows);

	for (int i = -4; i < 5; i++) {
		// Ensure each of the access points exist in the grid
		if (x + i < 0 || x + i >= cols || y + i < 0 || y + i >= rows) continue;
		if (x - 4 < 0 || x + 4 >= cols || y - 4 < 0 || y + 4 >= rows) continue;;

		cells[x + i][y - 4].status_next = rand() % 2;
		cells[x + i][y + 4].status_next = rand() % 2;

		cells[x - 4][y + i].status_next = rand() % 2;
		cells[x + 4][y + i].status_next = rand() % 2;

		cells[x + i][y - 3].status_next = rand() % 2;
		cells[x + i][y + 3].status_next = rand() % 2;

		cells[x - 3][y + i].status_next = rand() % 2;
		cells[x + 3][y + i].status_next = rand() % 2;

		cells[x + i][y - 2].status_next = rand() % 2;
		cells[x + i][y + 2].status_next = rand() % 2;

		cells[x - 2][y + i].status_next = rand() % 2;
		cells[x + 2][y + i].status_next = rand() % 2;

		cells[x + i][y - 1].status_next = rand() % 2;
		cells[x + i][y + 1].status_next = rand() % 2;

		cells[x - 1][y + i].status_next = rand() % 2;
		cells[x + 1][y + i].status_next = rand() % 2;

		cells[x + i][y].status_next = rand() % 2;
		cells[x][y + i].status_next = rand() % 2;
	}
}
