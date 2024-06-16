#include <stddef.h>
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
#include "perlin.h"

typedef struct {
	Camera2D camera;
	Vector2 GLOBAL_FLOW;
	Vector2 top_left;
	Vector2 bottom_right;
	Particle particles[PARTICLE_COUNT];
} Plug;

static Plug *plug = NULL;

void plug_init(void) {
	srand(time(NULL));
	TraceLog(LOG_INFO, "Plug Init");
	Plug *init = (Plug *) malloc(sizeof(Plug));
	if (init == NULL) {
		TraceLog(LOG_ERROR, "Failed to allocate memory for plug");
		exit(1);
	}

	init->GLOBAL_FLOW = (Vector2) { 0.5f, 0.5f };

	init->camera = (Camera2D) {
		.zoom = 0.15,
			.offset = {
				.x = 130,
				.y = 140
			},
	};

	init->top_left = (Vector2) { 0.0f, 0.0f };
	init->bottom_right = (Vector2) { (POINTS_X - 1) * SCALE, (POINTS_Y - 1) * SCALE };

	for (size_t i = 0; i < PARTICLE_COUNT; ++i) {
		init->particles[i].velocity = (Vector2) { 100.0f, 100.0f };
	}

	plug = init;
	TraceLog(LOG_INFO, "Plug Initialized");
	BeginDrawing();
	ClearBackground(BLACK);
	EndDrawing();
}

void plug_update (void) {

	if (IsKeyDown(KEY_W)) plug->camera.offset.y += 10;
	if (IsKeyDown(KEY_S)) plug->camera.offset.y -= 10;
	if (IsKeyDown(KEY_A)) plug->camera.offset.x += 10;
	if (IsKeyDown(KEY_D)) plug->camera.offset.x -= 10;

	if (IsKeyDown(KEY_F)) plug->camera.zoom -= 0.05;
	if (IsKeyDown(KEY_Z)) plug->camera.zoom += 0.05;

	if (IsKeyDown(KEY_Q)) plug->GLOBAL_FLOW.x -= 0.005;
	if (IsKeyDown(KEY_E)) plug->GLOBAL_FLOW.x += 0.005;
	if (IsKeyDown(KEY_O)) plug->GLOBAL_FLOW.y -= 0.005;
	if (IsKeyDown(KEY_P)) plug->GLOBAL_FLOW.y += 0.005;

	if (IsKeyPressed(KEY_G)) TakeScreenshot("screenshot.png");
	if (IsKeyPressed(KEY_C)) ClearBackground(BLACK);

	if (IsMouseButtonPressed( MOUSE_LEFT_BUTTON)) {
		Vector2 mouse = GetScreenToWorld2D(GetMousePosition(), plug->camera);
		TraceLog(LOG_INFO, "Mouse Position: %f, %f", mouse.x, mouse.y);
		TraceLog(LOG_INFO, "Top Left: %f, %f :: Bottom Right: %f, %f", plug->top_left.x, plug->top_left.y, plug->bottom_right.x, plug->bottom_right.y);
	}

	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		// Semi-transparent background
		/*
		   DrawRectangleV(plug->top_left, (Vector2) { POINTS_X * SCALE, POINTS_Y * SCALE }, Fade(BLACK, 0.05f));
		   DrawFlowField(plug->GLOBAL_FLOW, POINTS_X, POINTS_Y, SCALE, WHITE);
		   ClearBackground(BLACK);
		   */
		DrawParticles(plug->GLOBAL_FLOW,
				plug->particles, PARTICLE_COUNT,
				plug->top_left, plug->bottom_right,
				SCALE, BLUE
			);
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
	memcpy(plug, cpy, sizeof(*cpy));

	TraceLog(LOG_INFO, "Global Flow: %f, %f", plug->GLOBAL_FLOW.x, plug->GLOBAL_FLOW.y);
	TraceLog(LOG_INFO, "Camera Offset: %f, %f", plug->camera.offset.x, plug->camera.offset.y);
	TraceLog(LOG_INFO, "Camera Zoom: %f", plug->camera.zoom);

	free(cpy);
}

void plug_free(void) {
	free(plug);
	TraceLog(LOG_INFO, "--------------------------------------------------");
	TraceLog(LOG_INFO, "Plug Freed");
	TraceLog(LOG_INFO, "--------------------------------------------------");
}

