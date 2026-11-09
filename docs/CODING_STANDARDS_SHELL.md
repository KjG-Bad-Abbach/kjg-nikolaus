### Shell scripts

#### Shell scripts must work with GNU and BSD utilities

- Keep Bash scripts compatible with supported Linux/WSL, macOS, and Windows Git Bash environments.
  Prefer `#!/usr/bin/env bash` for Bash scripts and stubs so they use the Bash on `PATH`.
  macOS `/bin/bash` may lack newer features such as `mapfile`.
- Use portable syntax and flags for external utilities.
  Do not assume GNU tools are installed on macOS.
  In `sed` and `grep` patterns, use [POSIX character classes](https://pubs.opengroup.org/onlinepubs/9799919799/basedefs/V1_chap09.html#tag_09_03_05), such as `[[:space:]]`, instead of GNU-specific escapes such as `\s`.
