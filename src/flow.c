#include "raylib.h"
#include "math.h"
#include "raymath.h"

#define STB_PERLIN_IMPLEMENTATION
#include "include/stb_perlin.h"

#define WINDOW_WIDTH 800
#define WINDOW_HEIGHT 600
#define GRID_SIZE 100
#define TRAIL_LENGTH 30

Vector2 global_flow = {0.5f, 0.5f};

// Noise function (replace with your desired algorithm)
Vector2 noise(float x, float y) {
	Vector2 v;
	float noise = stb_perlin_noise3(x / 100.0f, y / 100.0f, 0.0f, 0, 0, 0);
	v.x = cos(noise * 1 * PI);
	v.y = sin(noise * 1 * PI);

	// Add global flow
	v = Vector2Add(v, global_flow);

	return v;
}

int main() {
	// Initialize Raylib
	InitWindow(WINDOW_WIDTH, WINDOW_HEIGHT, "Flow Field Visualization");
	SetTargetFPS(60);

	// Create a grid to store the vector field
	Vector2 grid[GRID_SIZE][GRID_SIZE];
	float cellSize = (float)WINDOW_WIDTH / GRID_SIZE;


	// Initialize the vector field
	for (int i = 0; i < GRID_SIZE; i++) {
		for (int j = 0; j < GRID_SIZE; j++) {
			float x = i * cellSize;
			float y = j * cellSize;
			float noiseScale = 0.1f;
			grid[i][j] = noise(x * noiseScale, y * noiseScale);
		}
	}

	while (!WindowShouldClose()) {
		BeginDrawing();
		ClearBackground(RAYWHITE);

		// Render the flow field
		for (int i = 0; i < GRID_SIZE; i++) {
			for (int j = 0; j < GRID_SIZE; j++) {
				Vector2 v = grid[i][j];
				float x = i * cellSize;
				float y = j * cellSize;

				// Draw a line segment representing the vector
				//DrawLineEx(Vector2ToVector3((Vector2){x, y}, 0.0f),
				//           Vector2ToVector3((Vector2){x + v.x * 10.0f, y + v.y * 10.0f}, 0.0f),
				//           2.0f, BLACK);
				for (int k = 0; k < TRAIL_LENGTH; k++) {
					float alpha = (float)k / TRAIL_LENGTH;
					Vector2 offset = {v.x * alpha * 10.0f, v.y * alpha * 10.0f};
					Color color = ColorFromHSV(GetRandomValue(0, 360), 4.0f, 1.0f - alpha);

					DrawLineEx((Vector2){x + offset.x, y + offset.y},
							(Vector2){x + offset.x + v.x * 5.0f, y + offset.y + v.y * 5.0f},
							2.0f, color);
				}
			}
		}
		if (IsKeyDown(KEY_SPACE)) {
			TakeScreenshot("screenshot.png");
		}

		EndDrawing();
	}

	CloseWindow();
	return 0;
}
