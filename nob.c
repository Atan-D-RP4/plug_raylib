#include <stdbool.h>
#include <stdlib.h>
#include <string.h>

#define NOB_IMPLEMENTATION
#include "include/nob.h"

void build_plug(Nob_Cmd *cmd);
void build_game(Nob_Cmd *cmd);

bool hot_reloadable = true;

const char *compile_cmd = "gcc";
const char *source_file = "main.c";
const char *out_file = "main";
const char *plug_file = "plug.c";
const char *plug_out_file = "libplug.so";

Nob_String_View CFLAGS_ARR[] = {
	(Nob_String_View) { .data = "-Wall", .count = 5 },
	(Nob_String_View) { .data = "-std=c2x", .count = 8 },
	(Nob_String_View) { .data = "-ggdb", .count = 5 },
	(Nob_String_View) { .data = "-Wextra", .count = 7 },
	(Nob_String_View) { .data = "-Wno-unused-parameter", .count = 20 },
};

Nob_String_View LDFLAGS_ARR[] = {
	(Nob_String_View) { .data = "-I./raylib/include/", .count = 18 },
	(Nob_String_View) { .data = "./raylib/lib/libraylib.so.5.0.0", .count = 30 },
	(Nob_String_View) { .data = "-lm", .count = 3 },
	(Nob_String_View) { .data = "-Wl,-rpath=./raylib/lib", .count = 21 },
};

Nob_String_View PLUGFLAGS_ARR[] = {
	(Nob_String_View) { .data = "-fPIC", .count = 5 },
	(Nob_String_View) { .data = "-shared", .count = 8 },
};

int main(int argc, char **argv) {
	NOB_GO_REBUILD_URSELF(argc, argv);

	const char *program = nob_shift_args(&argc, &argv);
	const char *subcmd = NULL;
	if (argc <= 0) {
		subcmd = "build";
	} else {
		subcmd = nob_shift_args(&argc, &argv);
	}

	nob_log(NOB_INFO, "--------------------------------------------------");
	if (hot_reloadable) {
		nob_log(NOB_INFO, "Hot reloadable");
	} else {
		nob_log(NOB_INFO, "Not hot reloadable");
	}
	nob_log(NOB_INFO, "--------------------------------------------------");

	Nob_Cmd cmd = { 0 };

	if (strcmp(subcmd, "build") == 0) {

		build_plug(&cmd);
		build_game(&cmd);
		nob_log(NOB_INFO, "Built plug and game");

		return 0;
	} else if (strcmp(subcmd, "run") == 0) {

		build_plug(&cmd);
		build_game(&cmd);

		cmd.count = 0;
		Nob_String_Builder run_cmd = { 0 };
		nob_sb_append_cstr(&run_cmd, "./");
		nob_sb_append_cstr(&run_cmd, out_file);
		nob_cmd_append(&cmd, run_cmd.items);
		nob_da_append_many(&cmd, argv, argc);
		if (!nob_cmd_run_sync(cmd)) return 1;
		nob_sb_free(run_cmd);

		cmd.count = 0;
		nob_cmd_append(&cmd, "rm", out_file);

		if (!nob_cmd_run_sync(cmd)) return 1;

		return 0;

	} else if (strcmp(subcmd, "reload") == 0) {
		if (hot_reloadable) {
			build_plug(&cmd);
			nob_log(NOB_INFO, "Rebuilt plug");
		} else {
			nob_log(NOB_ERROR, "Not HOT_RELOADABLE");
			return 1;
		}

	} else if (strcmp(subcmd, "clean") == 0) {

		cmd.count = 0;
		nob_cmd_append(&cmd, "rm");
		if (nob_file_exists("nob.old"))
			nob_cmd_append(&cmd, "nob.old");
		if (nob_file_exists("nob"))
			nob_cmd_append(&cmd, "nob");
		if (nob_file_exists(plug_out_file))
			nob_cmd_append(&cmd, plug_out_file);
		if (nob_file_exists(out_file))
			nob_cmd_append(&cmd, out_file);

		if (!nob_cmd_run_sync(cmd)) return 1;
		return 0;

	} else {
		nob_log(NOB_ERROR, "Unknown subcommand: %s\n", subcmd);
		return 1;
	}

	return 0;
}

void build_game(Nob_Cmd *cmd) {

	cmd->count = 0;
	nob_cmd_append(cmd, compile_cmd);

	for (int i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
		nob_cmd_append(cmd, CFLAGS_ARR[i].data);
	}

	if (hot_reloadable) {
		nob_cmd_append(cmd, "-DHOT_RELOADABLE");
	} else {
		nob_cmd_append(cmd, plug_file);
	}
	nob_cmd_append(cmd, source_file);

	nob_cmd_append(cmd, "-o", out_file);


	for (int i = 0; i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
		nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
	}

	if (!nob_cmd_run_sync(*cmd)) exit(1);

}

void build_plug(Nob_Cmd *cmd) {

	cmd->count = 0;
	nob_cmd_append(cmd, "clang");

	for (int i = 0; i < NOB_ARRAY_LEN(CFLAGS_ARR); i++) {
		nob_cmd_append(cmd, CFLAGS_ARR[i].data);
	}

	nob_cmd_append(cmd, "-o", plug_out_file);

	for (int i = 0; i < NOB_ARRAY_LEN(PLUGFLAGS_ARR); i++) {
		nob_cmd_append(cmd, PLUGFLAGS_ARR[i].data);
	}

	nob_cmd_append(cmd, plug_file);

	for (int i = 0; i < NOB_ARRAY_LEN(LDFLAGS_ARR); i++) {
		nob_cmd_append(cmd, LDFLAGS_ARR[i].data);
	}

	if (!nob_cmd_run_sync(*cmd)) exit(1);
}
