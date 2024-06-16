#include <stddef.h>
#include "perlin.h"
#include "raylib.h"
#include "raymath.h"

#define STB_PERLIN_IMPLEMENTATION
#include "include/stb_perlin.h"

Vector2 getNoiseGradient(Vector2 pos, Vector2 global_flow, float offset) {
	Vector2 gradient;
	float angle = 0.0006f;
	offset = GetFrameTime() * 0.5f;

	float noise = stb_perlin_noise3(pos.x * angle + offset, pos.y * angle, 1.0f, 0, 0, 0);
	noise = noise * PI * 2.0f;

	gradient.x = cos(noise) * 2.0f;
	gradient.y = sin(noise) * 2.0f;

	gradient = Vector2Add(gradient, global_flow);
	gradient = Vector2Normalize(gradient);

	return gradient;
}

void DrawFlowField(Vector2 global_flow, size_t pointsX, size_t pointsY, size_t scale, Color color) {
	Vector2 pos = { 0.0f, 0.0f };

	for (size_t x = 0; x < pointsX; x++) {
		for (size_t y = 0; y < pointsY; y++) {
			pos.x = x * SCALE; pos.y = y * SCALE;
			Vector2 gradient = Vector2Normalize(getNoiseGradient(pos, global_flow, 0.0f));
			gradient = Vector2Scale(gradient, scale);

			DrawLineEx(pos, Vector2Add(pos, gradient), 2.0f, color);
		}
	}
}

void DrawParticles(Vector2 global_flow, Particle *particles, size_t count, Vector2 top_left, Vector2 bottom_right, size_t scale, Color color) {
	// Spawn a particle every quarter second
	// Get a random point between 0,0 and 4950, 4950
	scale = scale * 0.15f; // Speed of particles

	static int initialized = 0;
	if (!initialized) {
		for (size_t i = 0; i < count; ++i) {
			Vector2 rand = (Vector2) {
				GetRandomValue(top_left.x, bottom_right.x),
					GetRandomValue(top_left.y, bottom_right.y)
			};
			particles[i].position = rand;
			float noiseScale = 0.0150f;
			particles[i].position.x = particles[i].position.x * noiseScale;
			particles[i].position.y = particles[i].position.y * noiseScale;
			particles[i].velocity = getNoiseGradient(particles[i].position, global_flow, 0.0f);
			particles[i].velocity = Vector2Scale(particles[i].velocity, scale);
			particles[i].velocity = Vector2Add(particles[i].velocity,
									(Vector2) {
										GetRandomValue(-1000.0f, 1000.0f),
										GetRandomValue(-1000.0f, 1000.0f)
									});
		}
		initialized = 1;
	}

	// Update and render particles
	for (size_t i = 0; i < count; ++i) {
		Particle *particle = &particles[i];
		Vector2 gradient = getNoiseGradient(particle->position, global_flow, 0.0f);
		float angle = Vector2Angle(gradient, particle->velocity);
		color = ColorFromNormalized(
				(Vector4) {
					gradient.x,
					gradient.y,
					angle,
					1.1f
				});
		DrawCircleV(particle->position, RADIUS, color);
		particle->position = Vector2Add(particle->position, particle->velocity);
		particle->velocity = Vector2Scale(gradient, scale);
	}

	// Reset particles if they go out of bounds
	for (size_t i = 0; i < count; ++i) {
		Particle *particle = &particles[i];
		if (particle->position.x < top_left.x || particle->position.x > bottom_right.x ||
				particle->position.y < top_left.y || particle->position.y > bottom_right.y) {
			/*
			   Vector2 rand = GetMousePosition();
			   */
			Vector2 rand = (Vector2) {
				GetRandomValue(top_left.x, bottom_right.x),
					GetRandomValue(top_left.y, bottom_right.y)
			};
			particles[i].position = rand;
			particle->velocity = getNoiseGradient(particle->position, global_flow, 0.0f);
			particle->velocity = Vector2Scale(particle->velocity, scale);
			particle->velocity = Vector2Add(particle->velocity,
								(Vector2) {
										GetRandomValue(-1000.0f, 1000.0f),
										GetRandomValue(-1000.0f, 1000.0f)
								 });
		}
	}
}

