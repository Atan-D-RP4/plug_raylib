#include "include/plug.h"
#include <stdio.h>
#include <math.h>
#include <time.h>

#include "raylib/include/raylib.h"
#include "raylib/include/raymath.h"
#include "raylib/include/rlgl.h"

void plug_hello() {
	printf("\rHello from pluggin\n");
}

void plug_init(Plug *plug, Cell **cells, int rows, int cols, int windowWidth, int windowHeight) {
	plug->cells = cells;
	plug->rows = rows;
	plug->cols = cols;

	int	cellWidth = windowWidth / cols;
	int cellHeight = windowHeight / rows;

	printf("Plug->Grid: %d x %d\n", plug->cols, plug->rows);
		ClearBackground(RAYWHITE);
		for (int i = 0; i < cols; i++) {
			for (int j = 0; j < rows; j++) {
				DrawRectangleLines(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLACK);
				cells[i][j].x = i;
				cells[i][j].y = j;
				cells[i][j].status = DEAD;
			}
		}
}

void plug_update(Plug *plug) {

	int cellWidth = plug->windowWidth / plug->cols;
	int cellHeight = plug->windowHeight / plug->rows;
	BeginDrawing();
		if (IsKeyPressed(MOUSE_LEFT_BUTTON)) {
			int x = GetMouseX() / plug->windowWidth/ plug->cols;
			int y = GetMouseY() / plug->windowHeight / plug->rows;
			plug->cells[x][y].status = !plug->cells[x][y].status;
		}
		for (int i = 0; i < plug->cols; i++) {
			for (int j = 0; j < plug->rows; j++) {
				DrawRectangleLines(i * cellWidth, j * cellHeight,
						cellWidth, cellHeight, BLACK);
				plug->cells[i][j].x = i;
				plug->cells[i][j].y = j;
				if (plug->cells[i][j].status == ALIVE) {
					DrawRectangle(i * cellWidth, j * cellHeight,
							cellWidth, cellHeight, YELLOW);
				}
			}
		}
	EndDrawing();
}
