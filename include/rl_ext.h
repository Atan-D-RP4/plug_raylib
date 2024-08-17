#ifndef RL_EXT_H
#define RL_EXT_H

#include "../raylib/src/raylib.h"
#include "../raylib/src/rlgl.h"

void DrawPlaneXZ(Vector3 centerPos, Vector2 size, Color color);
void DrawPlaneXY(Vector3 centerPos, Vector2 size, Color color);
void DrawGridXZ(int slices, float spacing);
void DrawGridXY(int slice, float spacing);

#ifdef RL_EXT_IMPLEMENTATION
void DrawCubeRef(Vector3 position, float width, float height, float length, Color color)
{
	float x = 0.0f;
	float y = 0.0f;
	float z = 0.0f;

	rlPushMatrix();
	// NOTE: Transformation is applied in inverse order (scale -> rotate -> translate)
		rlTranslatef(position.x, position.y, position.z);
		//rlRotatef(45, 0, 1, 0);
		//rlScalef(1.0f, 1.0f, 1.0f);   // NOTE: Vertices are directly scaled on definition

		rlBegin(RL_TRIANGLES);
			rlColor4ub(color.r, color.g, color.b, color.a);

			// Front face
			rlNormal3f(0.0f, 0.0f, 1.0f);
			rlVertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Left
			rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Right
			rlVertex3f(x - width/2, y + height/2, z + length/2);  // Top Left

			rlVertex3f(x + width/2, y + height/2, z + length/2);  // Top Right
			rlVertex3f(x - width/2, y + height/2, z + length/2);  // Top Left
			rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Right

			// Back face
			rlNormal3f(0.0f, 0.0f, -1.0f);
			rlVertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Left
			rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Left
			rlVertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Right

			rlVertex3f(x + width/2, y + height/2, z - length/2);  // Top Right
			rlVertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Right
			rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Left

			// Top face
			rlNormal3f(0.0f, 1.0f, 0.0f);
			rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Left
			rlVertex3f(x - width/2, y + height/2, z + length/2);  // Bottom Left
			rlVertex3f(x + width/2, y + height/2, z + length/2);  // Bottom Right

			rlVertex3f(x + width/2, y + height/2, z - length/2);  // Top Right
			rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Left
			rlVertex3f(x + width/2, y + height/2, z + length/2);  // Bottom Right

			// Bottom face
			rlNormal3f(0.0f, -1.0f, 0.0f);
			rlVertex3f(x - width/2, y - height/2, z - length/2);  // Top Left
			rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Right
			rlVertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Left

			rlVertex3f(x + width/2, y - height/2, z - length/2);  // Top Right
			rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Right
			rlVertex3f(x - width/2, y - height/2, z - length/2);  // Top Left

			// Right face
			rlNormal3f(1.0f, 0.0f, 0.0f);
			rlVertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Right
			rlVertex3f(x + width/2, y + height/2, z - length/2);  // Top Right
			rlVertex3f(x + width/2, y + height/2, z + length/2);  // Top Left

			rlVertex3f(x + width/2, y - height/2, z + length/2);  // Bottom Left
			rlVertex3f(x + width/2, y - height/2, z - length/2);  // Bottom Right
			rlVertex3f(x + width/2, y + height/2, z + length/2);  // Top Left

			// Left face
			rlNormal3f(-1.0f, 0.0f, 0.0f);
			rlVertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Right
			rlVertex3f(x - width/2, y + height/2, z + length/2);  // Top Left
			rlVertex3f(x - width/2, y + height/2, z - length/2);  // Top Right

			rlVertex3f(x - width/2, y - height/2, z + length/2);  // Bottom Left
			rlVertex3f(x - width/2, y + height/2, z + length/2);  // Top Left
			rlVertex3f(x - width/2, y - height/2, z - length/2);  // Bottom Right
		rlEnd();
	rlPopMatrix();
}

void DrawPlaneXZ(Vector3 centerPos, Vector2 size, Color color) {
	DrawPlane(centerPos, size, color);
}

// Might want to add this to raylib
void DrawPlaneXY(Vector3 centerPos, Vector2 size, Color color) {
	// Draw rectangle
	rlPushMatrix();
		rlBegin(RL_QUADS);
			rlColor4ub(color.r, color.g, color.b, color.a);
			rlNormal3f(0.0f, 0.0f, 1.0f);

			rlTexCoord2f(0.0f, 0.0f);
			rlVertex3f(centerPos.x - size.x/2, centerPos.y - size.y/2, centerPos.z);

			rlTexCoord2f(1.0f, 0.0f);
			rlVertex3f(centerPos.x + size.x/2, centerPos.y - size.y/2, centerPos.z);

			rlTexCoord2f(1.0f, 1.0f);
			rlVertex3f(centerPos.x + size.x/2, centerPos.y + size.y/2, centerPos.z);

			rlTexCoord2f(0.0f, 1.0f);
			rlVertex3f(centerPos.x - size.x/2, centerPos.y + size.y/2, centerPos.z);
		rlEnd();
	rlPopMatrix();
}

void DrawPlaneYZ(Vector3 centerPos, Vector2 size, Color color) {
	rlPushMatrix();
		rlBegin(RL_QUADS);

			rlColor4ub(color.r, color.g, color.b, color.a);
			rlNormal3f(1.0f, 0.0f, 0.0f);

			rlTexCoord2f(0.0f, 0.0f);
			rlVertex3f(centerPos.x, centerPos.y - size.y/2, centerPos.z - size.x/2);

			rlTexCoord2f(1.0f, 0.0f);
			rlVertex3f(centerPos.x, centerPos.y - size.y/2, centerPos.z + size.x/2);

			rlTexCoord2f(1.0f, 1.0f);
			rlVertex3f(centerPos.x, centerPos.y + size.y/2, centerPos.z + size.x/2);

			rlTexCoord2f(0.0f, 1.0f);
			rlVertex3f(centerPos.x, centerPos.y + size.y/2, centerPos.z - size.x/2);

		rlEnd();
	rlPopMatrix();
}

void DrawGridXZ(int slices, float spacing) {
	DrawGrid(slices, spacing);
}

void DrawGridXY(int slice, float spacing) {
	int halfSlices = slice/2;

	rlPushMatrix();
		rlBegin(RL_LINES);

			for (int i = -halfSlices; i <= halfSlices; ++i)
			{
				if (i == 0) rlColor4ub(255, 255, 255, 255);
				else rlColor4ub(100, 100, 100, 255);

				rlVertex3f(-halfSlices*spacing, i*spacing, 0.0f);
				rlVertex3f(halfSlices*spacing, i*spacing, 0.0f);

				rlVertex3f(i*spacing, -halfSlices*spacing, 0.0f);
				rlVertex3f(i*spacing, halfSlices*spacing, 0.0f);
			}

		rlEnd();
	rlPopMatrix();
}

#endif // RL_EXT_IMPLEMENTATION
#endif // RL_EXT_H
