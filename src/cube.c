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

#define RL_EXT_IMPLEMENTATION
#include "include/rl_ext.h"

typedef struct {
	void *data;
	Camera3D camera;
} Plug;

static Plug *plug = NULL;

typedef enum {
	FRONT = 0,
	BACK,
	TOP,
	BOTTOM,
	LEFT,
	RIGHT
} CUBE_FACES;

typedef struct CubeSquare {
	Vector3 position;
	Vector2 size;
	Color color;
	CUBE_FACES face;
} CubeSquare;

#define CUBE_SIZE 3.0f
#define FACE_SIZE (CUBE_SIZE / 3.0f)
#define FACE_PADDING 0.1f
Vector3 cubeCenter = { 0.0f, 0.0f, 0.0f };

void DrawRubiksCube(Vector3 center) {
	// Draw Cube frame in BLACK
	DrawCubeWires(center, CUBE_SIZE, CUBE_SIZE, CUBE_SIZE, BLACK);
	Vector2 faceSize = { FACE_SIZE, FACE_SIZE };

	// Include some padding between each drawn plane
	// Front face (Red)
	for (int y = 0; y < 3; y++) {
		for (int x = 0; x < 3; x++) {
			Vector3 pos = {
				// Ensure padding between each face
				center.x - CUBE_SIZE/2 + FACE_SIZE/2 + x*FACE_SIZE,
				center.y - CUBE_SIZE/2 + FACE_SIZE/2 + y*FACE_SIZE,
				center.z + CUBE_SIZE/2
			};
			DrawPlaneXY(pos, faceSize, RED);
		}
	}

	// Back face (Orange)
	for (int y = 0; y < 3; y++) {
		for (int x = 0; x < 3; x++) {
			Vector3 pos = {
				center.x + CUBE_SIZE/2 - FACE_SIZE/2 - x*FACE_SIZE,
				center.y - CUBE_SIZE/2 + FACE_SIZE/2 + y*FACE_SIZE,
				center.z - CUBE_SIZE/2
			};
			DrawPlaneXY(pos, faceSize, ORANGE);
		}
	}

	// Top face (White)
	for (int z = 0; z < 3; z++) {
		for (int x = 0; x < 3; x++) {
			Vector3 pos = {
				center.x - CUBE_SIZE/2 + FACE_SIZE/2 + x*FACE_SIZE,
				center.y + CUBE_SIZE/2,
				center.z + CUBE_SIZE/2 - FACE_SIZE/2 - z*FACE_SIZE
			};
			DrawPlaneXZ(pos, faceSize, WHITE);
		}
	}

	// Bottom face (Yellow)
	for (int z = 0; z < 3; z++) {
		for (int x = 0; x < 3; x++) {
			Vector3 pos = {
				center.x - CUBE_SIZE/2 + FACE_SIZE/2 + x*FACE_SIZE,
				center.y - CUBE_SIZE/2,
				center.z - CUBE_SIZE/2 + FACE_SIZE/2 + z*FACE_SIZE
			};
			DrawPlaneXZ(pos, faceSize, YELLOW);
		}
	}

	// Left face (Green)
	for (int y = 0; y < 3; y++) {
		for (int z = 0; z < 3; z++) {
			Vector3 pos = {
				center.x - CUBE_SIZE/2,
				center.y - CUBE_SIZE/2 + FACE_SIZE/2 + y*FACE_SIZE,
				center.z + CUBE_SIZE/2 - FACE_SIZE/2 - z*FACE_SIZE
			};
			DrawPlaneYZ(pos, faceSize, GREEN);
		}
	}

	// Right face (Blue)
	for (int y = 0; y < 3; y++) {
		for (int z = 0; z < 3; z++) {
			Vector3 pos = {
				center.x + CUBE_SIZE/2,
				center.y - CUBE_SIZE/2 + FACE_SIZE/2 + y*FACE_SIZE,
				center.z - CUBE_SIZE/2 + FACE_SIZE/2 + z*FACE_SIZE
			};
			DrawPlaneYZ(pos, faceSize, BLUE);
		}
	}
}

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

	// TODO: Do something about the shitty camera controls
	// - https://www.reddit.com/r/raylib/comments/109gsqk/custom_3d_camera_system/
	UpdateCameraPro(&plug->camera,
			(Vector3) {
				(IsKeyDown(KEY_W) || IsKeyDown(KEY_UP))*0.1f -      // Move forward-backward
				(IsKeyDown(KEY_S) || IsKeyDown(KEY_DOWN))*0.1f,
				(IsKeyDown(KEY_D) || IsKeyDown(KEY_RIGHT))*0.1f -   // Move right-left
				(IsKeyDown(KEY_A) || IsKeyDown(KEY_LEFT))*0.1f,
				(IsKeyDown(KEY_E) || IsKeyDown(KEY_SPACE))*0.1f -   // Move up-down
				(IsKeyDown(KEY_Q) || IsKeyDown(KEY_LEFT_SHIFT))*0.1f
			},
			(Vector3) {
//				GetMouseDelta().y*0.1f,                             // Rotate yaw
//				GetMouseDelta().x*0.1f, 						    // Rotate pitch
				// Only if left-click is held
				IsMouseButtonDown(MOUSE_LEFT_BUTTON) ? GetMouseDelta().y*0.1f : 0.0f,	// Rotate yaw
				IsMouseButtonDown(MOUSE_LEFT_BUTTON) ? GetMouseDelta().x*0.1f : 0.0f,	// Rotate pitch
				0.0f
			},
			// Zoom in-out with mouse wheel
			GetMouseWheelMove()*0.1f
			);

	BeginDrawing();
	{
		ClearBackground(BLACK);
		BeginMode3D(plug->camera);
		{
			DrawRubiksCube(cubeCenter);
			DrawGridXZ(10, 1.0f);
			DrawGridXY(10, 1.0f);
		}
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
	plug->camera = cpy->camera;

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

