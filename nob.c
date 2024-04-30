#include <stdlib.h>
#include <string.h>
#define NOB_IMPLEMENTATION
#include "include/nob.h"

void build_plug(Nob_Cmd *cmd);
void build_game(Nob_Cmd *cmd);

const char *compile_cmd = "gcc";
const char *source_file = "main.c";
const char *out_file = "main";
const char *plug_file = "plug.c";
const char *plug_out_file = "libplug.so";
const char *CFLAGS = "-Wall -std=c2x -ggdb -Wextra -Wno-missing-braces -Wno-missing-field-initializers -Wno-unused-parameter -Wno-unused-variable -Wno-unused-value -Wno-unused-function -Wno-unused-label -Wno-unused-but-set-variable";
const char *LDFLAGS = "./raylib/lib/libraylib.so.5.0.0 -lm";
const char *PLUGFLAGS = "-fPIC -shared";

bool hot_reloadable = true;

int main(int argc, char **argv) {
	NOB_GO_REBUILD_URSELF(argc, argv);

	setenv("LD_LIBRARY_PATH", "raylib/lib/", 1);

	const char *program = nob_shift_args(&argc, &argv);

	Nob_Cmd cmd = { 0 };


	if (argc > 0) {
		const char* subcmd = nob_shift_args(&argc, &argv);
		if (strcmp(subcmd, "run") == 0) {

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
			build_plug(&cmd);

		} else if (strcmp(subcmd, "clean") == 0) {

			cmd.count = 0;
			nob_cmd_append(&cmd, "rm", out_file, plug_out_file, "nob", "nob.old");
			if (!nob_cmd_run_sync(cmd)) return 1;
			return 0;

		} else {
			nob_log(NOB_ERROR, "Unknown subcommand: %s\n", subcmd);
			return 1;
		}
	} else {
		build_plug(&cmd);
		build_game(&cmd);
	}


	return 0;
}

void build_game(Nob_Cmd *cmd) {

	cmd->count = 0;
	nob_cmd_append(cmd, compile_cmd);

	Nob_String_View CFLAGS_sv = nob_sv_from_cstr(CFLAGS);

	for (int i = 0; i < CFLAGS_sv.count; i++) {
		CFLAGS_sv = nob_sv_trim_left(CFLAGS_sv);
		Nob_String_View flag = nob_sv_chop_by_delim(&CFLAGS_sv, ' ');
		const char *flag_temp = nob_temp_sv_to_cstr(flag);
		nob_cmd_append(cmd, flag_temp);
	}

	if (hot_reloadable) {
		nob_cmd_append(cmd, "-DHOT_RELOADABLE");
	} else {
		nob_cmd_append(cmd, plug_file);
	}
	nob_cmd_append(cmd, source_file);

	nob_cmd_append(cmd, "-o", out_file);

	Nob_String_View LDFLAGS_sv = nob_sv_from_cstr(LDFLAGS);
	for (int i = 0; i < LDFLAGS_sv.count; i++) {
		LDFLAGS_sv = nob_sv_trim_left(LDFLAGS_sv);
		Nob_String_View flag = nob_sv_chop_by_delim(&LDFLAGS_sv, ' ');
		const char *flag_temp = nob_temp_sv_to_cstr(flag);
		nob_cmd_append(cmd, flag_temp);
	}

	if (!nob_cmd_run_sync(*cmd)) exit(1);

}

void build_plug(Nob_Cmd *cmd) {

	cmd->count = 0;
	nob_cmd_append(cmd, "clang");

	Nob_String_View CFLAGS_sv = nob_sv_from_cstr(CFLAGS);
	for (int i = 0; i < CFLAGS_sv.count; i++) {
		CFLAGS_sv = nob_sv_trim_left(CFLAGS_sv);
		Nob_String_View flag = nob_sv_chop_by_delim(&CFLAGS_sv, ' ');
		const char *flag_temp = nob_temp_sv_to_cstr(flag);
		nob_cmd_append(cmd, flag_temp);
	}

	nob_cmd_append(cmd, "-o", plug_out_file);

	Nob_String_View PLUGFLAGS_sv = nob_sv_from_cstr(PLUGFLAGS);
	for (int i = 0; PLUGFLAGS_sv.count; i++) {
		PLUGFLAGS_sv = nob_sv_trim_left(PLUGFLAGS_sv);
		Nob_String_View flag = nob_sv_chop_by_delim(&PLUGFLAGS_sv, ' ');
		const char *flag_temp = nob_temp_sv_to_cstr(flag);
		nob_cmd_append(cmd, flag_temp);
	}

	nob_cmd_append(cmd, plug_file);

	Nob_String_View LDFLAGS_sv = nob_sv_from_cstr(LDFLAGS);
	for (int i = 0; i < LDFLAGS_sv.count; i++) {
		LDFLAGS_sv = nob_sv_trim_left(LDFLAGS_sv);
		Nob_String_View flag = nob_sv_chop_by_delim(&LDFLAGS_sv, ' ');
		const char *flag_temp = nob_temp_sv_to_cstr(flag);
		nob_cmd_append(cmd, flag_temp);
	}

	if (!nob_cmd_run_sync(*cmd)) exit(1);
}
