#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <time.h>
#include <unistd.h>

#include "raylib.h"
#include "raymath.h"
#include "rlgl.h"

#define NOB_IMPLEMENTATION
#include "../include/nob.h"

int main(int argc, char *argv[])
{
	if (argc != 2) {
		printf("Usage: %s <filename>\n", argv[0]);
		return 1;
	}

	const int screenWidth = 800;
	const int screenHeight = 450;

	const char* filename = argv[1];
	nob_log(NOB_INFO, "Playing %s", filename);

	Nob_Cmd cmd = { 0 };
	if (nob_file_exists("./out.wav")) {
		nob_cmd_append(&cmd, "rm", "./out.wav");
		if (!nob_cmd_run_async(cmd)) return 1;
		nob_log(NOB_INFO, "Removed old out.wav");
	}
	cmd.count = 0;
	nob_cmd_append(&cmd, "ffmpeg", "-i", filename, "-vn", "./out.wav");
	if (!nob_cmd_run_async(cmd)) return 1;
	nob_log(NOB_INFO, "Converted %s to out.wav", filename);

	sleep(1);

	InitWindow(screenWidth, screenHeight, "raylib [audio] example - music playing (streaming)");
	InitAudioDevice();

	Music song = LoadMusicStream("./out.wav");
	PlayMusicStream(song);

	float timePlayed = 0.0f;		// Time played normalized [0.0f..1.0f]
	bool pause = false;				// Music playing paused
	while(!WindowShouldClose()) {
		if (timePlayed >= GetMusicTimeLength(song)) {
			StopMusicStream(song);
			break;
		}
		UpdateMusicStream(song);

		// Restart music playing (stop and play)
		if (IsKeyPressed(KEY_SPACE)) {
			StopMusicStream(song);
			PlayMusicStream(song);
		}

		// Pause/Resume music playing
		if (IsKeyPressed(KEY_P)) {
			pause = !pause;

			if (pause) PauseMusicStream(song);
			else ResumeMusicStream(song);
		}

		// Seek music back
		if (IsKeyPressed(KEY_A)) {
			// Rewind 5 seconds (seek)
			// NOTE: Some music streams don't allow looping and they will stop after
			// reaching the end, we need to start playing again
			PauseMusicStream(song);
			float currentTime = GetMusicTimePlayed(song);
			currentTime -= 5.0f;
			if (currentTime < 0.0f) currentTime = 0.0f;
			SeekMusicStream(song, currentTime);
			ResumeMusicStream(song);
		}

		// Seek music ahead
		if (IsKeyPressed(KEY_D)) {
			// Fast forward 5 seconds (seek)
			// NOTE: Some music streams don't allow looping and they will stop after
			// reaching the end, we need to start playing again
			PauseMusicStream(song);
			float currentTime = GetMusicTimePlayed(song);
			currentTime += 5.0f;
			if (currentTime > GetMusicTimeLength(song)) currentTime = GetMusicTimeLength(song);
			SeekMusicStream(song, currentTime);
			ResumeMusicStream(song);
		}

		timePlayed = GetMusicTimePlayed(song) / GetMusicTimeLength(song);

		if (timePlayed > 1.0f) timePlayed = 1.0f;   // Make sure time played is no longer than music

		BeginDrawing(); {

			ClearBackground(RAYWHITE);

			DrawText("MUSIC SHOULD BE PLAYING!", 255, 150, 20, LIGHTGRAY);
			float currentTime = GetMusicTimePlayed(song);
			float totalTime = GetMusicTimeLength(song);
			const char* text = TextFormat("%02i:%02i/%02i:%02i", (int) currentTime / 60, (int) currentTime % 60, (int) totalTime / 60, (int) totalTime % 60);

			DrawText(text, 340, 100, 20, LIGHTGRAY);

			DrawRectangle(200, 200, 400, 12, LIGHTGRAY);
			DrawRectangle(200, 200, (int)(timePlayed*400.0f), 12, MAROON);
			DrawRectangleLines(200, 200, 400, 12, GRAY);

			DrawText("PRESS SPACE TO RESTART MUSIC", 215, 250, 20, LIGHTGRAY);
			DrawText("PRESS P TO PAUSE/RESUME MUSIC", 208, 280, 20, LIGHTGRAY);

		} EndDrawing();
	}

	// De-Initialization
	UnloadMusicStream(song);   // Unload music stream buffers from RAM
	CloseAudioDevice();		 // Close audio device (music streaming is automatically stopped)
	CloseWindow();			  // Close window and OpenGL context
}
