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

typedef struct {
	void *data;
	Camera3D camera;
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

	init->camera = (Camera3D) {
		.position = (Vector3) { 0.0f, 10.0f, 10.0f },
		.target = (Vector3) { 0.0f, 0.0f, 0.0f },
		.up = (Vector3) { 0.0f, 1.0f, 0.0f },
		.fovy = 45.0f,
		.projection = CAMERA_PERSPECTIVE
	};

	plug = init;
	TraceLog(LOG_INFO, "Plug Initialized");
	BeginDrawing();
	ClearBackground(BLACK);
	EndDrawing();
}

void plug_update (void) {

	UpdateCameraPro(&plug->camera,
		(Vector3) {
			(IsKeyDown(KEY_W) || IsKeyDown(KEY_UP))*0.1f -      // Move forward-backward
			(IsKeyDown(KEY_S) || IsKeyDown(KEY_DOWN))*0.1f,
			(IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT))*0.1f -   // Move right-left
			(IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT))*0.1f,
			0.0f                                                // Move up-down
		},
		(Vector3) {
			GetMouseDelta().y*0.1f,                             // Rotate yaw
			GetMouseDelta().x*0.1f, 						    // Rotate pitch
			0.0f
		},
		// Zoom in-out
		IsKeyDown(KEY_Z)*0.1f - IsKeyDown(KEY_X)*0.1f
	);

	BeginDrawing();
	{
		ClearBackground(BLACK);
		BeginMode3D(plug->camera);
			DrawCube((Vector3) { 0.0f, 0.0f, 0.0f }, 2.0f, 2.0f, 2.0f, RED);
			DrawCube((Vector3) { 0.0f, 4.0f, 0.0f }, 2.0f, 2.0f, 2.0f, BLUE);
			DrawCube((Vector3) { 0.0f, 8.0f, 0.0f }, 2.0f, 2.0f, 2.0f, GREEN);
			DrawCube((Vector3) { 0.0f, 12.0f, 0.0f }, 2.0f, 2.0f, 2.0f, YELLOW);
			DrawCube((Vector3) { 0.0f, 16.0f, 0.0f }, 2.0f, 2.0f, 2.0f, ORANGE);
			DrawCube((Vector3) { 0.0f, 20.0f, 0.0f }, 2.0f, 2.0f, 2.0f, PINK);
			DrawCube((Vector3) { 0.0f, 24.0f, 0.0f }, 2.0f, 2.0f, 2.0f, PURPLE);
			DrawCube((Vector3) { 0.0f, 28.0f, 0.0f }, 2.0f, 2.0f, 2.0f, BROWN);

		EndMode3D();
		DrawText("Use Mouse to Move and Rotate Camera", 10, 10, 10, GRAY);
	}
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
	if (cpy == NULL) {
		TraceLog(LOG_INFO, "No state to load");
		return;
	}

	size_t state_size = sizeof(*cpy);
	memcpy(plug, cpy, sizeof(state_size));

	fprintf(stdout, "INFO: Camera Position: %f %f %f\n", plug->camera.position.x, plug->camera.position.y, plug->camera.position.z);
	fprintf(stdout, "INFO: Camera Target: %f %f %f\n", plug->camera.target.x, plug->camera.target.y, plug->camera.target.z);

	free(cpy);
}

void plug_free(void) {
	free(plug);
	TraceLog(LOG_INFO, "--------------------------------------------------");
	TraceLog(LOG_INFO, "Plug Freed");
	TraceLog(LOG_INFO, "--------------------------------------------------");
}
