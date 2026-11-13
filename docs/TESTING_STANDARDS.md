## Testing Guidelines

- Place tests alongside source or in the repo's designated test directories
- Prefer fast unit tests; add integration/e2e tests for critical paths
- Every test method has `// Arrange`, `// Act`, `// Assert` comments
- Keep fixtures small and reuse setup helpers where possible
- Use data driven tests where possible
- Use coverage tools to identify untested code
- Test edge cases and error handling explicitly
- Inject the clock instead of reading the current time directly (.NET: `TimeProvider`, tests use `FakeTimeProvider`)
- Test executed behavior and observable outputs; do not use assertions on source-file text as proof that code or CI jobs work.
- Keep application tests focused on failures users would encounter; validate CI scripts and pipeline behavior through actual CI runs, not application test classes.
- **CRITICAL:** Ask before you delete any tests!
- Unit test naming convention:
  - `UnitOfWork_StateUnderTest_Expect_ExpectedBehaviour`
  - `UnitOfWork_StateUnderTest_Expect_ThrowsException`
  - Where `UnitOfWork` normally is the method under test
- [Read when modifying Shell test scripts](TESTING_STANDARDS_SHELL.md)

## Testing work follows behavior and risk

- Start with relevant existing tests to establish the current behavior and baseline.
- For new behavior, changed observable outcomes, or bug fixes, add or extend behavioral tests for the required result; reproduce the bug before fixing it when practical.
- For behavior-preserving refactors, new tests are not required when existing coverage is adequate; run that coverage and adjust existing fixtures or API calls as needed without weakening behavioral assertions.
- If current behavior is uncovered or the refactor is risky, add characterization tests before changing it.
- Do not add tests merely to mirror implementation structure or compiler/type-system guarantees; test structural contracts only when an explicit requirement or supported consumer depends on them.
- A behavior-preserving refactor does not require an artificial failing test; passing characterization checks before and after the change can establish preservation.
