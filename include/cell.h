#ifndef CELL_H_
#define CELL_H_

#define GRID_COLS 50
#define GRID_ROWS 50

#define COLOR_ALIVE = YELLOW;

#define ScreenWidth 1000
#define ScreenHeight 1000

typedef enum {
	DEAD,
	ALIVE
}Status;

typedef struct {
	Status status_prev;
	Status status_next;
} Cell;

typedef struct {
	Cell **cells;
	int rows;
	int cols;
	int windowWidth;
	int windowHeight;
	bool playing;
} Plug;

int count_alive_neighbours(Cell **cells, int x, int y, int rows, int cols);
void update_cells(Plug *plug);
void create_pulsar(Plug *plug);
void create_gun(Plug *plug);
void DrawFrame(Plug *plug);
#endif // CELL_H_


#ifdef CELL_IMPLEMENTATION

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

void create_pulsar(Plug *plug) {
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

#endif // CELL_IMPLEMENTATION
