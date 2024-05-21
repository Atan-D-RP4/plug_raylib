#ifndef CELL_H_
#define CELL_H_

#include "../raylib/include/raylib.h"

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

void DrawFrame(Plug *plug);
int count_alive_neighbours(Cell **cells, int x, int y, int rows, int cols);
void update_cells(Plug *plug);
void create_pulsar(Plug *plug);
void create_gun(Plug *plug);
void rand_square(Plug *plug);
#endif // CELL_H_

