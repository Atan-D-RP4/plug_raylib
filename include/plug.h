#ifndef PLUG_H_
#define PLUG_H_

#include <stdbool.h>

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

typedef void (plug_hello_t)(void);
typedef void (plug_init_t)(Plug *plug, Cell **cells, int rows, int cols);
typedef void (plug_update_t)(Plug *plug);
typedef void (plug_pre_load_t)(Plug *plug);
typedef void (plug_post_load_t)(Plug *plug);

#define PLUGS_LIST 		\
	PLUG(plug_init) 	\
	PLUG(plug_update)	\
	PLUG(plug_pre_load) \
	PLUG(plug_post_load) \
	PLUG(plug_hello)

#endif // PLUG_H_
