#ifndef PERLIN_H_
#define PERLIN_H_

#include <stddef.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#define POINTS_X 100
#define POINTS_Y 100
#define PADDING 0
#define SCALE 40
#define SCALE_FACTOR 0.15f

#define RADIUS 3
#define FIELD_COLOR BLUE

#define PARTICLE_COUNT 2500

#define IMAGE_DIR "images/"

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

void DrawParticles(Vector2 global_flow, Particle *particles, size_t count, Vector2 top_left, Vector2 bottom_right, size_t scale, Color color);
void DrawFlowField(Vector2 global_flow, size_t pointsX, size_t pointsY, size_t scale, Color color);
Vector2 getNoiseGradient(Vector2 pos, Vector2 global_flow, float offset);

#endif // PERLIN_H_
