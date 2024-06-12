#include <stddef.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#include "./include/nob.h"
#include "./include/plug.h"

#define AXIS_LENGTH 100.0
#define NODE_COLOR BLUE
#define NODE_RADIUS 5.0
#define NODE_HOVER_COLOR GREEN
#define SPLINE_COLOR WHITE
#define SPLINE_THICKNESS 2.0

typedef struct {
	Vector2 *items;
	size_t count;
	size_t capacity;
} Vector2Array;

typedef struct {
	Camera2D camera;
	int dragged_node;
	Vector2Array nodes;
	Vector2Array trail;
} Plug;

Plug *plug = NULL;

void CircleAnim(Vector2 pos, float radius, float thickness, Color color) {
		Vector2 circle2Pos = Vector2Add(pos, (Vector2) { (50 + 25) * cosf(GetTime() * 1.5f), (50 + 25) * sinf(GetTime() * 1.5f) });
		Vector2 circle3Pos = Vector2Add(circle2Pos, (Vector2) { (25 + 10) * cosf(GetTime() * 3.0f), (25 + 10) * sinf(GetTime() * 3.0f) });
		Vector2 circle4Pos = Vector2Add(circle3Pos, (Vector2) { (10 + 5) * cosf(GetTime() * 6.0f), (10 + 5) * sinf(GetTime() * 6.0f) });
		Vector2 circle5Pos = Vector2Add(circle4Pos, (Vector2) { (5 + 2.5) * cosf(GetTime() * 12.0f), (5 + 2.5) * sinf(GetTime() * 12.0f) });
		//DrawCircleLinesV(pos, 50, WHITE);
		// Draw a circle that rolls on mouse circle
		//DrawCircleLinesV(circle2Pos, 25, GREEN);
		//DrawCircleLinesV(circle3Pos, 10, BLUE);
		//DrawCircleLinesV(circle4Pos, 5, VIOLET);
		DrawPixelV(circle5Pos, RED);

		//Vector2 nodes2[4] = {
		//	pos,
		//	circle2Pos,
		//	circle3Pos,
		//	circle4Pos
		//};
		//DrawSplineBezierCubic(nodes2, 4, 0.5, RED);


}

void DrawSplineFrame(Vector2 *nodes, int nodes_count) {
	DrawLineV(Vector2Lerp(nodes[0], nodes[1], 0.5), Vector2Lerp(nodes[1], nodes[2], 0.5), WHITE);
	DrawLineV(Vector2Lerp(nodes[1], nodes[2], 0.5), Vector2Lerp(nodes[2], nodes[3], 0.5), WHITE);
	DrawLineV(Vector2Lerp(Vector2Lerp(nodes[0], nodes[1], 0.5), Vector2Lerp(nodes[1], nodes[2], 0.5), 0.5), Vector2Lerp(Vector2Lerp(nodes[1], nodes[2], 0.5), Vector2Lerp(nodes[2], nodes[3], 0.5), 0.5), WHITE);
	DrawCircleV(Vector2Lerp(nodes[0], nodes[1], 0.5), NODE_RADIUS, WHITE);
	DrawCircleV(Vector2Lerp(nodes[1], nodes[2], 0.5), NODE_RADIUS, WHITE);
	DrawCircleV(Vector2Lerp(nodes[2], nodes[3], 0.5), NODE_RADIUS, WHITE);
	DrawCircleV(Vector2Lerp(Vector2Lerp(nodes[0], nodes[1], 0.5), Vector2Lerp(nodes[1], nodes[2], 0.5), 0.5), NODE_RADIUS, WHITE);
	DrawCircleV(Vector2Lerp(Vector2Lerp(nodes[1], nodes[2], 0.5), Vector2Lerp(nodes[2], nodes[3], 0.5), 0.5), NODE_RADIUS, WHITE);
	DrawCircleV(Vector2Lerp(Vector2Lerp(Vector2Lerp(nodes[0], nodes[1], 0.5), Vector2Lerp(nodes[1], nodes[2], 0.5), 0.5), Vector2Lerp(Vector2Lerp(nodes[1], nodes[2], 0.5), Vector2Lerp(nodes[2], nodes[3], 0.5), 0.5), 0.5), NODE_RADIUS, WHITE);

}

void DrawDynCubes(void) {
	Camera2D camera = {
		.zoom = 1.0,
		.offset = {
			.x = 0,
			.y = 0
		},
	};

	BeginDrawing();
	BeginMode2D(camera);
	{
		ClearBackground(BLACK);
		float x = GetMouseX() - 50;
		float y = GetMouseY() - 50;
		float winW = GetScreenWidth();
		float winH = GetScreenHeight();
		float rw = 100, rh = 100;
		float t = GetTime();

		DrawRectangle(x, y, rw, rh, RED);
		float elastic = (winW - rw) * ((sinf(t * 2) + 1.0f) * 0.5f);
		DrawRectangle(elastic, (winH / 2 - rh / 2), rw, rh, BLUE);

		DrawGrid(10, 1.0);
	}
	EndMode2D();
	EndDrawing();
}

void plug_init(void) {
	TraceLog(LOG_INFO, "Plug Init");
	Plug *init = malloc(sizeof(Plug));
	if (!init) {
		fprintf(stderr, "ERROR: Plug initialization failed\n");
	}
	init->camera = (Camera2D) {
		.zoom = 1.0,
			.offset = {
				.x = (float) GetScreenWidth() / 2,
				.y = (float) GetScreenHeight() / 2
			},
	};

	init->nodes = (Vector2Array) {
			.items = NULL,
			.count = 0,
			.capacity = 0
	};
	init->dragged_node = -1;

	nob_da_append(&init->nodes, ((Vector2) { 0.0, 0.0 }));
	nob_da_append(&init->nodes, ((Vector2) { AXIS_LENGTH, -AXIS_LENGTH }));
	nob_da_append(&init->nodes, ((Vector2) { AXIS_LENGTH, 0.0 }));
	nob_da_append(&init->nodes, ((Vector2) { 0.0, AXIS_LENGTH }));

	plug = init;
	fprintf(stdout, "INFO: Plug initialized\n");
	BeginDrawing();
	ClearBackground(BLACK);
	EndDrawing();
}

void plug_update() {

	if (IsKeyDown(KEY_W)) plug->camera.offset.y += 10;
	if (IsKeyDown(KEY_S)) plug->camera.offset.y -= 10;
	if (IsKeyDown(KEY_A)) plug->camera.offset.x += 10;
	if (IsKeyDown(KEY_D)) plug->camera.offset.x -= 10;

	if (IsKeyDown(KEY_F)) plug->camera.zoom -= 0.1;
	if (IsKeyDown(KEY_Z)) plug->camera.zoom += 0.1;

	if (IsKeyPressed(KEY_G)) TakeScreenshot("screenshot.png");

	//	DrawDynCubes();

	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		if (GetTime() < 2.0) {
			DrawText("Press Space to add a node", 10, 10, 20, WHITE);
		}

		if (IsKeyPressed(KEY_SPACE)) {
			nob_da_append(&plug->nodes, GetScreenToWorld2D(GetMousePosition(), plug->camera));
		}

		if (IsKeyPressed(KEY_BACKSPACE) && plug->nodes.count > 0) {
			plug->nodes.count--;
		}

		Vector2 *nodes = plug->nodes.items;

		Vector2 mouse = GetScreenToWorld2D(GetMousePosition(), plug->camera);
		size_t nodes_count = plug->nodes.count;
		bool dragging = 0 <= plug->dragged_node && (size_t) plug->dragged_node < nodes_count;

		if (dragging) {
			nodes[plug->dragged_node] = mouse;
		}

		for (size_t i = 0; i < nodes_count; i++) {
			bool hover = CheckCollisionPointCircle(mouse, nodes[i], NODE_RADIUS);
			DrawCircleV(nodes[i], NODE_RADIUS, hover ? NODE_HOVER_COLOR : NODE_COLOR);
			if (dragging && IsMouseButtonReleased(MOUSE_LEFT_BUTTON)) {
				plug->dragged_node = -1;
			} else if (hover && IsMouseButtonPressed(MOUSE_LEFT_BUTTON)) {
				plug->dragged_node = i;
			}
		}

		//for (size_t j = 0; j < nodes_count - 1; ++j) {
		//	for (size_t i = 0, res = 500; i < res; ++i) {
		//		float t = (float) i / res;
		//		float it = 1 - t;
		//		Vector2 p = Vector2Zero();
		//		p = Vector2Add(p, Vector2Scale(nodes[j], it * it * it));
		//		p = Vector2Add(p, Vector2Scale(nodes[j + 1 % nodes_count], 3 * it * it * t));
		//		p = Vector2Add(p, Vector2Scale(nodes[j + 2 % nodes_count], 3 * it * t * t));
		//		p = Vector2Add(p, Vector2Scale(nodes[j + 3 % nodes_count], t * t * t));
		//		DrawPixelV(p, RED);
		//	}
		//}

		DrawSplineBezierCubic(plug->nodes.items, plug->nodes.count, 0.5, RED);

		// CircleAnim(mouse, 100, 2, RED);

	}
	EndMode2D();
	EndDrawing();

}

void *plug_pre_load(void) {
	TraceLog(LOG_INFO, "Plug Pre-Load");
	// some deinitalization
	TraceLog(LOG_INFO, "No. of Nodes: %zu\n", plug->nodes.count);
	return plug;
}

void plug_post_load(void *state) {
	TraceLog(LOG_INFO, "Plug Post-Load");
	// reinitialization
	Plug *cpy = state;
	plug_init();
	if (cpy == NULL) {
		TraceLog(LOG_INFO, "No state to load");
		return;
	}

	TraceLog(LOG_INFO, "Loading state");
	plug->camera = cpy->camera;
	plug->dragged_node = cpy->dragged_node;

	for (size_t i = 0; i < cpy->nodes.count; i++) {
		if (i >= plug->nodes.count) {
			nob_da_append(&plug->nodes, cpy->nodes.items[i]);
		}
		plug->nodes.items[i] = cpy->nodes.items[i];
	}

	nob_da_free(cpy->nodes);
	free(cpy);
}

void plug_free(void) {
	nob_da_free(plug->nodes);
	free(plug);
	TraceLog(LOG_INFO, "Plug Freed");
}
