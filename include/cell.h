#ifndef CELL_H_
#define CELL_H_

#define GRID_COLS 80
#define GRID_ROWS 80

#define COLOR_BACKGROUND RAYWHITE
#define COLOR_LINES DARKGRAY
#define COLOR_ALIVE YELLOW

#define FPS 8

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

