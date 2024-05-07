#ifndef STRUCTS_H
#define STRUCTS_H

#define GRID_COLS 25
#define GRID_ROWS 25

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

#endif // STRUCTS_H
