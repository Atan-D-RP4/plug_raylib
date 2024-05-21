#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <unistd.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#include "include/plug.h"
#include "include/nob.h"
#define STB_PERLIN_IMPLEMENTATION
#include "include/stb_perlin.h"

#define POINTS_X 100
#define POINTS_Y 100
#define PADDING 0
#define SCALE 50
#define RADIUS 5

void attempt_one(void);
void attempt_two(void);

typedef struct {
	Vector2 curr;
	Vector2 next;
	Vector2 gradient;
} Point;

typedef struct {
	Vector2 *items;
	size_t count;
	size_t capacity;
} Trace;

typedef struct {
	size_t count;
	Camera2D camera;
	Point points[POINTS_X][POINTS_Y];
	Trace trace;
} Plug;

static Plug *plug = NULL;

Vector2 getNoiseGradient(Vector2 pos) {
	Vector2 gradient;
	float eps = 0.01f;

	float noise = stb_perlin_noise3(pos.x, pos.y, 1.0f, 0, 0, 0);
	float x_plus_noise = stb_perlin_noise3(pos.x + eps, pos.y, 0.0f, 0, 0, 0);
	float y_plus_noise = stb_perlin_noise3(pos.x, pos.y + eps, 0.0f, 0, 0, 0);

	gradient.x = (x_plus_noise - noise) / eps;
	gradient.y = (y_plus_noise - noise) / eps;

	return gradient;
}

void plug_init(void) {
	TraceLog(LOG_INFO, "Plug Init");
	Plug *init = (Plug *) malloc(sizeof(Plug));
	if (init == NULL) {
		TraceLog(LOG_ERROR, "Failed to allocate memory for plug");
		exit(1);
	}

	// Initialize points in a 10x10 grid
	Vector2 offset = { 10.0f, 10.0f };
	for (size_t i = 0; i < POINTS_X; i++) {
		for (size_t j = 0; j < POINTS_Y; j++) {
			init->points[i][j] = (Point) {
				.curr = (Vector2) {
						.x = PADDING + (i * SCALE),
						.y = PADDING + (j * SCALE)
					},
					.next = (Vector2) {
						.x = PADDING + (i * SCALE),
						.y = PADDING + (j * SCALE)
					}
			};
			init->points[i][j].gradient =
				Vector2Add(getNoiseGradient(init->points[i][j].curr),
						offset);
		}
	}

	init->count = 100;
	init->camera = (Camera2D) {
		.zoom = 0.25,
			.offset = {
				.x = 0,
				.y = 0
			},
	};

	init->trace = (Trace) {
		.items = NULL,
			.count = 0,
			.capacity = 0
	};

	plug = init;
	TraceLog(LOG_INFO, "Plug Initialized");
}

void plug_update (void) {

	if (IsKeyDown(KEY_W)) plug->camera.offset.y += 10;
	if (IsKeyDown(KEY_S)) plug->camera.offset.y -= 10;
	if (IsKeyDown(KEY_A)) plug->camera.offset.x += 10;
	if (IsKeyDown(KEY_D)) plug->camera.offset.x -= 10;

	if (IsKeyDown(KEY_U)) plug->camera.zoom -= 0.05;
	if (IsKeyDown(KEY_Z)) plug->camera.zoom += 0.05;

	//attempt_one();
	//attempt_two();

	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		ClearBackground(BLACK);
		for (int x = 0; x < POINTS_X; x++) {
			for (int y = 0; y < POINTS_Y; y++) {
				Vector2 pos = plug->points[x][y].curr;
				Vector2 gradient = plug->points[x][y].gradient;

				DrawCircleV(pos, RADIUS, WHITE);

				DrawLineEx(pos,
						Vector2Add(pos, gradient),
						2.0f, RED);

				// Update the next position based on the noise gradient
//				plug->points[x][y].next = Vector2Add(plug->points[x][y].curr, gradient);
//				plug->points[x][y].curr = plug->points[x][y].next;
			}
		}
		for (int y = 0; y < POINTS_X; y++) {
			for (int x = 0; x < POINTS_Y; x++) {
            Vector2 pos = { x * SCALE, y * SCALE };
            Vector2 gradient = getNoiseGradient(pos);

            DrawLineEx(pos, (Vector2){ pos.x + gradient.x * 10.0f, pos.y + gradient.y * 10.0f }, 2.0f, RED);
        }
    }
	}
	EndMode2D();
	EndDrawing();
}

void *plug_pre_load(void) {
	TraceLog(LOG_INFO, "Plug Pre-Load");
	// some deinitalization
	return plug;
}

void plug_post_load(void *state) {
	TraceLog(LOG_INFO, "Plug Post-Load");
	Plug *cpy = (Plug *) state;

	plug_init();
	memcpy(plug, cpy, sizeof(Plug));
	TraceLog(LOG_INFO, "Trace Count: %d", plug->trace.count);

	TraceLog(LOG_INFO, "Camera Zoom: %f", plug->camera.zoom);

	free(cpy);
}













void attempt_one(void) {
	// Draw a circle
	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		// Just a draw 100 points arranged in a grid 10 x 10
		for (size_t x = 0; x < POINTS_X; x++) {
			for (size_t y = 0; y < POINTS_Y; y++) {
				DrawCircleV(plug->points[x][y].next, RADIUS, WHITE);
				Vector2 curr = plug->points[x][y].curr;
				DrawCircleV(plug->points[x][y].next, RADIUS, WHITE);
				float t = stb_perlin_noise3(
						(curr.x + GetTime()) / 100,
						(curr.y + GetTime()) / 100,
						1, 0, 0, 0);
				plug->points[x][y].next = (Vector2) {
					.x = curr.x + t,
						.y = curr.y + t
				};
				plug->points[x][y].next = getNoiseGradient(plug->points[x][y].curr);
				Vector2 pos = plug->points[x][y].curr;
				Vector2 gradient = plug->points[x][y].next;
				plug->points[x][y].curr = plug->points[x][y].next;

				DrawLineEx(pos, (Vector2){ pos.x + gradient.x * 10.0f, pos.y + gradient.y * 10.0f }, 2.0f, RED);
			}
		}
	}
	EndMode2D();
	EndDrawing();
}

void attempt_two(void) {
	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		for (int x = 0; x < POINTS_X; x++) {
			for (int y = 0; y < POINTS_Y; y++) {
				DrawCircleV(plug->points[x][y].curr, RADIUS, WHITE);

				Vector2 gradient = getNoiseGradient(plug->points[x][y].curr);
				DrawLineEx(plug->points[x][y].curr, (Vector2){ plug->points[x][y].curr.x + gradient.x * 10.0f, plug->points[x][y].curr.y + gradient.y * 10.0f }, 2.0f, RED);

				// Update the next position based on the noise gradient
				plug->points[x][y].next.x = plug->points[x][y].curr.x + gradient.x;
				plug->points[x][y].next.y = plug->points[x][y].curr.y + gradient.y;
			}
		}
	}
	EndMode2D();
	EndDrawing();
}

