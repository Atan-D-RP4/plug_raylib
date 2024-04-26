#ifndef PLUG_H_
#define PLUG_H_

#define COLOR_ALIVE = YELLOW;

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
} Plug;

typedef void (*plug_hello_t)(void);
typedef void (*plug_init_t)(Plug *plug, Cell **cells, int rows, int cols, int windowWidth, int windowHeight);
typedef void (*plug_update_t)(Plug *plug);

#endif // PLUG_H_ 
