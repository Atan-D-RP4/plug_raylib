#ifndef CELL_H_
#define CELL_H_

#include "raylib.h"

#define GRID_COLS 80
#define GRID_ROWS 80

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

void DrawFrame(Cell **cells, int rows, int cols, int windowWidth, int windowHeight);
int count_alive_neighbours(Cell **cells, int x, int y, int rows, int cols);
void update_cells(Cell **cells, int rows, int cols);
void create_pulsar(Cell **cells, int rows, int cols);
void create_gun(Cell **cells, int rows, int cols);
void rand_square(Cell **cells, int rows, int cols);
void rand_square2(Cell **cells, int rows, int cols);
#endif // CELL_H_

