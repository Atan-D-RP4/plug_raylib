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
#define STB_PERLIN_IMPLEMENTATION
#include "include/stb_perlin.h"

#define POINTS_X 100
#define POINTS_Y 100
#define PADDING 0
#define SCALE 50
#define SCALE_FACTOR 0.15f

#define RADIUS 3
#define FIELD_COLOR BLUE

#define PARTICLE_COUNT 5000

typedef struct {
	Vector2 position;
	Vector2 velocity;
} Particle;

typedef struct {
	Camera2D camera;
	Vector2 GLOBAL_FLOW;
	Vector2 top_left;
	Vector2 bottom_right;
	Particle particles[PARTICLE_COUNT];
} Plug;

static Plug *plug = NULL;


void DrawParticles(Particle *particles, size_t count, Vector2 top_left, Vector2 bottom_right, size_t scale, Color color);
void DrawFlowField(size_t pointsX, size_t pointsY, size_t scale, Color color);
Vector2 getNoiseGradient(Vector2 pos, float offset);


Vector2 getNoiseGradient(Vector2 pos, float offset) {
	Vector2 gradient;
	float angle = 0.0020f;

	float noise = stb_perlin_noise3(pos.x * angle + offset, pos.y * angle, 1.0f, 0, 0, 0);
	noise = noise * PI * 2.0f;

	gradient.x = cos(noise) * 8.0f;
	gradient.y = sin(noise) * 5.0f;

	gradient = Vector2Add(gradient, plug->GLOBAL_FLOW);
	gradient = Vector2Normalize(gradient);

	return gradient;
}

void DrawFlowField(size_t pointsX, size_t pointsY, size_t scale, Color color) {
	Vector2 pos = { 0.0f, 0.0f };
	float offset = GetFrameTime() * 0.5f;

	for (size_t x = 0; x < pointsX; x++) {
		for (size_t y = 0; y < pointsY; y++) {
			pos.x = x * SCALE; pos.y = y * SCALE;
			Vector2 gradient = Vector2Normalize(getNoiseGradient(pos, offset));
			gradient = Vector2Scale(gradient, scale);

			DrawLineEx(pos, Vector2Add(pos, gradient), 2.0f, color);
		}
	}
}

void DrawParticles(Particle *particles, size_t count, Vector2 top_left, Vector2 bottom_right, size_t scale, Color color) {
	// Spawn a particle every quarter second
	// Get a random point between 0,0 and 4950, 4950

	static int initialized = 0;
	if (!initialized) {
		for (size_t i = 0; i < count; ++i) {
			Vector2 rand = (Vector2) { GetRandomValue(top_left.x, bottom_right.x), GetRandomValue(top_left.y, bottom_right.y) };
			particles[i].position = rand;
			particles[i].velocity = getNoiseGradient(particles[i].position, 0.0f);
			particles[i].velocity = Vector2Scale(particles[i].velocity, scale);
			particles[i].velocity = Vector2Add(particles[i].velocity,
					(Vector2){ GetRandomValue(-1000.0f, 1000.0f), GetRandomValue(-1000.0f, 1000.0f) } );
		}
		initialized = 1;
	}

	// Update and render particles
	for (size_t i = 0; i < count; ++i) {
		Particle *particle = &particles[i];
		color = ColorFromHSV(rand() % 255, rand() % 100, rand() % 100);
		DrawCircleV(particle->position, RADIUS, color);
		particle->position = Vector2Add(particle->position, particle->velocity);
		particle->velocity = getNoiseGradient(particle->position, 0.0f);
		particle->velocity = Vector2Scale(particle->velocity, scale);
	}
	// Reset particles if they go out of bounds
	for (size_t i = 0; i < count; ++i) {
		Particle *particle = &particles[i];
		if (particle->position.x < top_left.x || particle->position.x > bottom_right.x ||
				particle->position.y < top_left.y || particle->position.y > bottom_right.y) {
			Vector2 rand = (Vector2) { GetRandomValue(top_left.x, bottom_right.x), GetRandomValue(top_left.y, bottom_right.y) };
			particles[i].position = rand;
			particle->velocity = getNoiseGradient(particle->position, 0.0f);
			particle->velocity = Vector2Scale(particle->velocity, scale);
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

	if (IsKeyDown(KEY_Q)) plug->GLOBAL_FLOW.x -= 0.05;
	if (IsKeyDown(KEY_E)) plug->GLOBAL_FLOW.x += 0.05;
	if (IsKeyDown(KEY_O)) plug->GLOBAL_FLOW.y -= 0.05;
	if (IsKeyDown(KEY_P)) plug->GLOBAL_FLOW.y += 0.05;

	if (IsMouseButtonPressed( MOUSE_LEFT_BUTTON)) {
		Vector2 mouse = GetScreenToWorld2D(GetMousePosition(), plug->camera);
		TraceLog(LOG_INFO, "Mouse Position: %f, %f", mouse.x, mouse.y);
		TraceLog(LOG_INFO, "Top Left: %f, %f :: Bottom Right: %f, %f", plug->top_left.x, plug->top_left.y, plug->bottom_right.x, plug->bottom_right.y);
	}

	BeginDrawing();
	BeginMode2D(plug->camera);
	{
		float t = GetTime();
		if ((int) t % 20 == 0) {}

		// Semi-transparent background
		DrawRectangle(0, 0, GetScreenWidth(), GetScreenHeight(), Fade(BLACK, 0.05f));

		DrawParticles(plug->particles, PARTICLE_COUNT, plug->top_left, plug->bottom_right, SCALE * 0.1f, BLUE);
		//DrawFlowField(POINTS_X, POINTS_Y, SCALE, FIELD_COLOR);
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
