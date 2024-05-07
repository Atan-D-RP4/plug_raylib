#ifndef STRUCTS_H
#define STRUCTS_H

#define GRID_COLS 50
#define GRID_ROWS 50

typedef enum {
	DEAD,
	ALIVE
}Status;

typedef struct {
	int x;
	int y;
	Status status;
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
