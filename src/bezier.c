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
	Vector2Array nodes;
	int dragged_node;
} Plug;

Plug *plug = NULL;

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
	Plug *state = malloc(sizeof(Plug));
	if (!state) {
		fprintf(stderr, "ERROR: Plug initialization failed\n");
	}
	state->camera = (Camera2D) {
		.zoom = 1.0,
			.offset = {
				.x = (float) GetScreenWidth() / 2,
				.y = (float) GetScreenHeight() / 2
			},
	};

	state->nodes = (Vector2Array) {
		.items = NULL,
			.count = 0,
			.capacity = 0
	};
	state->dragged_node = -1;

	nob_da_append(&state->nodes, ((Vector2) { 0.0, 0.0 }));
	nob_da_append(&state->nodes, ((Vector2) { AXIS_LENGTH, -AXIS_LENGTH }));
	nob_da_append(&state->nodes, ((Vector2) { AXIS_LENGTH, 0.0 }));
	nob_da_append(&state->nodes, ((Vector2) { 0.0, AXIS_LENGTH }));

	plug = state;
	fprintf(stdout, "INFO: Plug initialized\n");
}

void plug_update() {

	if (IsKeyDown(KEY_W)) plug->camera.offset.y += 10;
	if (IsKeyDown(KEY_S)) plug->camera.offset.y -= 10;
	if (IsKeyDown(KEY_A)) plug->camera.offset.x += 10;
	if (IsKeyDown(KEY_D)) plug->camera.offset.x -= 10;

	if (IsKeyDown(KEY_LEFT_CONTROL) && IsKeyDown(KEY_Z)) plug->camera.zoom -= 0.1;
	if (IsKeyDown(KEY_Z)) plug->camera.zoom += 0.1;

	//	DrawDynCubes();

	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		ClearBackground(BLACK);
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

		for (size_t j = 0; j < nodes_count - 1; ++j) {
			for (size_t i = 0, res = 100; i < res; ++i) {
				float t = (float) i / res;
				float it = 1 - t;
				Vector2 p = Vector2Zero();
				p = Vector2Add(p, Vector2Scale(nodes[j], it * it * it));
				p = Vector2Add(p, Vector2Scale(nodes[j + 1 % nodes_count], 3 * it * it * t));
				p = Vector2Add(p, Vector2Scale(nodes[j + 2 % nodes_count], 3 * it * t * t));
				p = Vector2Add(p, Vector2Scale(nodes[j + 3 % nodes_count], t * t * t));
				DrawCircleV(p, 2, RED);
			}
		}

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
	plug_init();

	if (state == NULL) {
		TraceLog(LOG_INFO, "State is NULL");
	} else {
		TraceLog(LOG_INFO, "State is not NULL");
		plug->camera = ((Plug *) state)->camera;
		plug->nodes = ((Plug *) state)->nodes;
		plug->dragged_node = ((Plug *) state)->dragged_node;

		nob_da_free(((Plug *) state)->nodes);
		free(state);
	}
}

