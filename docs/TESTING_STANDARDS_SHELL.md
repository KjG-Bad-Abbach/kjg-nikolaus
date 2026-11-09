### Shell scripts

#### Shell stubs must honor piped-input contracts

- When a stub replaces a command that consumes piped input, read stdin to EOF before returning a canned result, even when the input is unused.
  Use `cat >/dev/null` to discard it, or delegate to the real command when its parsing behavior matters.
  Otherwise, the producer can fail with SIGPIPE when the stub exits early, making a `pipefail` pipeline fail intermittently under parallel execution.
- Drain only commands or branches whose contract consumes stdin; do not drain interactive prompts, argument/file-only commands, or scenarios that deliberately test an early pipe closure.
  Preserve the intended output and exit status, including failure and cancellation cases.
- Regressions for ignored piped input must exercise the actual stub with `pipefail` and input larger than a pipe buffer, so success does not depend on process scheduling.
  Do not hide the failure by disabling `pipefail`, adding sleeps, or ignoring producer errors.
