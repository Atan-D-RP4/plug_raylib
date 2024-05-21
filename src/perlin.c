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

#define PARTICLE_COUNT 100
#define SPAWN_POSITION_X 700
#define SPAWN_POSITION_Y 300

void DrawParticles(void);

typedef struct {
	Vector2 position;
	Vector2 velocity;
} Particle;

typedef struct {
	Vector2 *items;
	size_t count;
	size_t capacity;
} Pixels;

typedef struct {
	Camera2D camera;
	Vector2 GLOBAL_FLOW;
	Vector2 top_left;
	Vector2 bottom_right;
	Particle particles[PARTICLE_COUNT];
} Plug;

static Plug *plug = NULL;


Vector2 getNoiseGradient(Vector2 pos, float offset) {
	Vector2 gradient;
	float eps = 0.01f;

	float noise = stb_perlin_noise3(pos.x + offset, pos.y, 0.0f, 0, 0, 0);
	float x_plus_noise = stb_perlin_noise3(pos.x + offset + eps, pos.y, 0.0f, 0, 0, 0);
	float y_plus_noise = stb_perlin_noise3(pos.x + offset, pos.y + eps, 0.0f, 0, 0, 0);

	gradient.x = cos((x_plus_noise - noise) / eps) * 20.0f;
	gradient.y = sin((y_plus_noise - noise) / eps) * 20.0f;

	float length = sqrt(gradient.x * gradient.x + gradient.y * gradient.y);
	if (length != 0) {
		gradient.x /= length;
		gradient.y /= length;
	}

	gradient = Vector2Multiply(gradient, plug->GLOBAL_FLOW); // Apply global flow
	gradient = Vector2Add(gradient, (Vector2) { 0.5f, 0.5f }); // Adjust global flow strength

	length = sqrt(gradient.x * gradient.x + gradient.y * gradient.y);
	if (length != 0) {
		gradient.x /= length;
		gradient.y /= length;
	}

	return gradient;
}

void DrawFlowField() {
	Vector2 pos = { 0.0f, 0.0f };
	float offset = GetFrameTime() * 0.5f;

	for (int y = 0; y < POINTS_X; y++) {
		for (int x = 0; x < POINTS_Y; x++) {
			pos.x = x * SCALE; pos.y = y * SCALE;
			if (x == 0 && y == 0) plug->top_left = pos;
			if (x == POINTS_X - 1 && y == POINTS_Y - 1) plug->bottom_right = pos;
			Vector2 gradient = Vector2Normalize(getNoiseGradient(pos, offset));
			gradient = Vector2Scale(gradient, 40.0f);

			DrawLineEx(pos, Vector2Add(pos, gradient), 2.0f, RED);
		}
	}
	DrawRectangleV(plug->top_left, (Vector2) { 10, 10 }, RAYWHITE);
	DrawRectangleV(plug->bottom_right, (Vector2) { 10, 10 }, RAYWHITE);
}

void DrawParticles(void) {
	// Spawn a particle every quarter second
	static int initialized = 0;
	if (!initialized) {
		for (size_t i = 0; i < PARTICLE_COUNT; i++) {
			plug->particles[i].position = (Vector2){ SPAWN_POSITION_X, SPAWN_POSITION_Y };
			plug->particles[i].velocity = getNoiseGradient(plug->particles[i].position, 0.0f);
			plug->particles[i].velocity = Vector2Scale(plug->particles[i].velocity, 5.0f);
			plug->particles[i].velocity = Vector2Add(plug->particles[i].velocity,
					(Vector2){ GetRandomValue(-1000.0f, 1000.0f), GetRandomValue(-1000.0f, 1000.0f) } );
		}
		initialized = 1;
	}

	// Update and render particles
	for (size_t i = 0; i < PARTICLE_COUNT; i++) {
		Particle *particle = &plug->particles[i];
		DrawCircleV(particle->position, RADIUS, WHITE);
		particle->position = Vector2Add(particle->position, particle->velocity);
		particle->velocity = getNoiseGradient(particle->position, 0.0f);
		particle->velocity = Vector2Scale(particle->velocity, 5.0f);
	}
	// Reset particles if they go out of bounds
	for (size_t i = 0; i < PARTICLE_COUNT; i++) {
		Particle *particle = &plug->particles[i];
		if (particle->position.x < plug->top_left.x || particle->position.x > plug->bottom_right.x ||
				particle->position.y < plug->top_left.y || particle->position.y > plug->bottom_right.y) {
			particle->position = (Vector2){ SPAWN_POSITION_X, SPAWN_POSITION_Y };
			particle->velocity = getNoiseGradient(particle->position, 0.0f);
			particle->velocity = Vector2Scale(particle->velocity, 5.0f);
			particle->velocity = Vector2Add(particle->velocity,
					(Vector2) { GetRandomValue(-1000.0f, 1000.0f), GetRandomValue(-1000.0f, 1000.0f) } );
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

	init->GLOBAL_FLOW = (Vector2) { 0.5f, 0.5f };

	init->camera = (Camera2D) {
		.zoom = 0.15,
			.offset = {
				.x = 130,
				.y = 140
			},
	};

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

	if (IsKeyDown(KEY_Q)) plug->GLOBAL_FLOW.x -= 0.05;
	if (IsKeyDown(KEY_E)) plug->GLOBAL_FLOW.x += 0.05;
	if (IsKeyDown(KEY_O)) plug->GLOBAL_FLOW.y -= 0.05;
	if (IsKeyDown(KEY_P)) plug->GLOBAL_FLOW.y += 0.05;

	BeginDrawing();
	BeginMode2D(plug->camera);
	{
        DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), Fade(BLACK, 0.05f));  // Semi-transparent background

		DrawFlowField();
		DrawParticles();
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

	free(cpy);
}

void plug_free(void) {
	free(plug);
	TraceLog(LOG_INFO, "--------------------------------------------------");
	TraceLog(LOG_INFO, "Plug Freed");
	TraceLog(LOG_INFO, "--------------------------------------------------");
}
