## Coding Style & Naming Conventions

- **CRITICAL:** always execute the projects formatting command before committing
- **CRITICAL:** ensure the projects full test suite is green before committing
- Follow [repository implementation and review guidelines](../AGENTS.md#implementation-and-review)
- Sort functions inside a class by reading order and program flow; helpers are above the function that uses it
- Prefer minimal, readable implementations with low duplication (DRY, KISS)
- Avoid speculative backward compatibility; keep related data members consistent unless a supported consumer or explicit requirement needs a different shape.
- Use established libraries for common formats/parsers (e.g. Markdown) instead of custom parsers, configured safely
- Reduce code size where it does not harm clarity or correctness
- Keep functions small and focused; use explicit return types; split code into functions that each name one responsibility, even when used once; inline only pass-through or trivial functions that add no meaning
- Keep domain logic separate from I/O and framework code
- Write code for the callers that exist today; extract a shared helper when a second caller needs the same logic, and keep it composable, clear, and stable
- Normalize inputs before validation; handle edge cases intentionally
- Follow repo's formatter and lint rules
- **CRITICAL:** never mix indentation; match existing files exactly; new files use project's standard indentation
- Choose consistent naming (camelCase, PascalCase, snake_case) based on existing patterns; examples if you start fresh:
  - Local variables/functions use `camelCase`; class names, components and public members use `PascalCase`; constants use `UPPER_SNAKE_CASE`; private/internal members use a ending underscore (e.g., `myPrivateVar_`, `MyInternalVar_`, `MyProtectedVar_`, `MY_PRIVATE_CONST_`)
- **CRITICAL:** Every numeric value must have an explicit unit unless it represents a count, index, or inherently dimensionless quantity.
  - Make the unit explicit through a unit-aware type or a unit-qualified name for variables, parameters, return values, fields, constants, and configuration values; comments alone are not sufficient.
  - Append units with a separating `_`; separate compound units with `_` (e.g., `timeout_ms`, `distance_cm`, `speed_m_s`, `size_bytes`).
  - For numeric literals, make the unit explicit through a unit-aware constructor, a unit-qualified constant, or the receiving parameter or field name.
- Use explicit types or interfaces where they improve clarity
- Add comments only when non-obvious (Don't delete existing ones, they exist intentionally! When rewriting code around comments try to preserve the comment when it still applies to the new code.) Here are a few examples that should have comments:
  - Some magic numbers
  - `(x.GetBits(value)[3] >> 16) & 0x7F` noone knows what this is doing without a good comment
  - Workarounds, ordering or timing constraints, deliberate deviations from a sibling case, and invariants enforced elsewhere
- Comments explain *why* the code exists or is shaped this way, not *what* each line does; first try to make the code itself clearer through naming or extraction, and comment what still is not self-explanatory
- Suppress lint, analyzer or compiler warnings at the narrowest scope (one line or member, never file- or project-wide) and state why
- Never hand-edit generated or synced files; change the generator or the source definition instead
- Known pitfalls: skipping helper extraction or tests, duplicating patterns, naming: unclear (better: descriptive names `CalculateInvoiceTotal`, not: `CalcTotal`)

## Examples

- [Read when modifying C# code](CODING_STANDARDS_CSHARP.md)
- [Read when modifying Shell scripts](CODING_STANDARDS_SHELL.md)
