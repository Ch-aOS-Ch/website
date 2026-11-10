---
title: "Contributing to Ch-aOS"
description: "Guidelines, coding standards, docstring requirements, and philosophy for contributing to the Ch-aOS project."
---

Welcome to the Ch-aOS project suite! We appreciate any help, whether in the form of issues, documentation improvements, architectural critiques, or code contributions.

Before contributing, please read our coding philosophy and best practices carefully.

---

## 1. Philosophy & Core Principles

### Locality of Behavior (LoB) over Deep Abstraction
We prefer a mix of LoB with pragmatic OOP. You should be able to read code from top to bottom and understand the execution flow without jumping between multiple files, classes, and indirection layers.

Although we use LoB, please do avoid pasta-esque code. If a function or class does more than one main conceptual task or two small conceptual tasks, break it down. The objective is to keep our McCabe complexity under 5 (outside of the args/commands module, which is the only exception due to its nature as a Lazy Loaded CLI argument parser).

### Clear Code > Clean Code
Code should be **clear in intent and functionality**, not blindly following Uncle Bob principles. If adhering strictly to standard rules hurts clarity or startup performance, prioritize clarity and performance.

For example, if you have a function that reads like:
```python
def func(arg1):
    if arg1:
        do_smth()
    else:
        do_smth_else()
```

You should probably bring the contents of either `do_smth()`, `do_smth_else()`, or both into the function itself, so that the reader doesn't have to jump around to understand the flow.

All private functions are marked with a leading `_` and come at the END of every file. If you have way too many private funcitons, create an module_name_utils.py file and move them there.

### Code First, Then Optimize
Build the feature and make it work first before attempting premature optimizations.

---

## 2. Coding Standards & Best Practices

### Lazy Imports (Inside Functions)
To ensure near-instant CLI startup (~0.06s to 0.1s) and avoid circular dependencies:
- **Third-party and internal module imports MUST be placed inside the functions that use them. Always using `from ... import ...`, and never importing \***

- Only standard library modules (`os`, `sys`, `json`, `pathlib`) and data contracts/types (for LSP support under `if TYPE_CHECKING:`) belong at the module top level.

### Error Handling with ResultPayload (No Exceptions)
Avoid raising or catching exceptions for application control flow.

- Handle and return errors using `ResultPayload`:

  - `success: bool`: Whether the operation succeeded.

  - `data: Any`: Strongly typed result payload or dictionary.

  - `message: list[str]`: User-facing informational messages.

  - `error: list[str]`: User-facing error messages.

- Treat returns similarly to Go's explicit error handling pattern.

### Strict Typing & Docstring Specifications

Full type hints are mandatory. Use modern Python typing features to take full advantage of LSPs and static analysis.

Every function, method, and class must include a comprehensive docstring following the Google Python Style Guide conventions:

1. **Short Summary:** A concise one-line description of the function's responsibility.

2. **Detailed Description (Optional):** Broader context or operational nuances if necessary.

3. **Args / Arguments:** Every parameter must be documented with its type in parentheses and a clear description of its purpose and constraints.

4. **Returns / Output:** Explicitly document the return type and what data or status it produces.

5. **Attributes (for Classes / Dataclasses):** Document all attributes with their types and descriptions.

6. **Notes (Optional):** Any additional information, warnings, or caveats.

#### Example Function Docstring

```python
def execute_step(payload: StepPayload, dry_run: bool = False) -> ResultPayload[str]:
    """Executes a deployment step against the target host.

    Args:
        payload (StepPayload): The step configuration and host context.
        dry_run (bool): If True, simulates the execution without applying changes.

    Returns:
        ResultPayload: Result object with a str in .data.

    Notes:
        This function does not raise exceptions; all errors are captured in the ResultPayload.
    """
    ...
```

#### Example Class / Dataclass Docstring

```python
class StepPayload(BasePayload):
    """Payload representing a single deployment action.

    Attributes:
        step_name (str): Unique identifier for the step.
        timeout_seconds (int): Maximum execution time allowed before aborting.
        context (dict[str, Any] | None): Optional runtime execution context.
    """

    __slots__ = ("step_name", "timeout_seconds", "context")

    __init__(
        self,
        step_name: str,
        timeout_seconds: int,
        context: dict[str, Any] | None = None
    ) -> None:
        self.step_name = step_name
        self.timeout_seconds = timeout_seconds
        self.context = context
    ...
```

### Classes & Decorators
- **Classes:** Create classes only when there is a clear, pluggable contract (e.g., Limani storage plugins, Pelago Isles, or external library requirements like pyinfra Facts). Do not create classes for speculative future use cases.

- **Decorators:** Avoid creating decorators unless strictly necessary. They obscure control flow and often take control away from the developer. Any custom decorator must be explicitly documented with clear intent.

### Function Length & Refactoring
- **Rule of 3:** If you repeat yourself 3 or more times, refactor it into a shared function or contract.

- **Two-concept limit:** If a function performs more than two distinct conceptual tasks (rule of thumb: ~100 lines), break it down into focused, well-named helper functions.

### Formatting & Strings
- Always use `f-strings` (avoid `%` formatting or `.format()`).

- Format and lint your code using `ruff` or `flake8` conforming to PEP 8.

- Output formatting: Make output human-friendly first, and machine-parseable (e.g. JSON/YAML) when the data needs to be piped to tools like `jq`.

---

## 3. Adding New CLI Commands

When adding a new command to the `chaos` CLI:
1. Create the command handler in `cli/src/chaos/lib/args/commands/`.

2. Define the argument structures and data payloads in `cli/src/chaos/lib/args/dataclasses.py` and `cli/src/chaos/lib/args/types.py`.

3. Register the command parser in `cli/src/chaos/lib/args/args.py` and add its case to the `match args.command:` block in `cli/src/chaos/cli.py`.

4. Include corresponding test coverage under `cli/tests/`.

---

## 4. Testing Standards & Best Practices

Most contributions should include unit tests placed under `cli/tests/`. We prioritize tests that are **fast, deterministic, strictly asserted, and completely isolated from the host operating system**.

### Test Naming Convention
Test function names must follow the **Action-Scenario-Outcome** pattern:
`test_<function_or_unit>_<scenario_or_input>_<expected_outcome>`

- **Good:**
  - `test_handleApproveTeam_missing_file_returns_failure`

  - `test_handle_explain_valid_main_topic_returns_success_and_proper_data`

  - `test_gatherApproveTeam_missing_field_combinations_request_input`

  - `test_execute_plans_dry_run_skips_run_ops`
- **Bad:**
  - `test_file_does_not_exist` (vague: what function is being tested?)

  - `test_approval` (vague: what scenario and what outcome?)

  - `test_func1`

### Strict Assertions (No False Positives)
Since Ch-aOS works on a lot of data transfer objects, most of the tests should assert the **exact structure and content of the returned data** rather than just checking for the presence of a single key or value. This ensures that any changes in the data structure or content will be caught by the tests.

1. **Never use conditional assertions:**
   ```python
   # Anti-pattern: If "content" is dropped by a bug, this test passes silently!
   if "content" in result.data:
       assert result.data["content"]["concept"] == "Main Concept"

   # Correct: Validate the exact dictionary structure unconditionally
   assert result.data == {
       "main": {
           "type": "explanation",
           "role": "main",
           "sub_topic": None,
           "content": {"concept": "Main Concept", "what": "Main explanation."},
       }
   }
   ```

2. **Never use broad substring checks with `any(...)` for errors:**
   ```python
   # Anti-pattern: Accepts any unrelated error containing "not found"
   assert any("not found" in error for error in result.error)

   # Correct: Assert the exact error list
   assert result.error == ["User 'X' not found in team 'Y'."]
   ```

3. **Verify all mock side effects and disk writes:**
   If the function under test performs side effects (e.g., `OmegaConf.save`, `disconnect_all`, `run_ops`), you MUST assert that the mock was invoked with the exact expected arguments:
   ```python
   save_mock.assert_called_once_with(chaos_file, ".chaos.yml")
   ```

### Zero Real System Changes (Safety First & Total Isolation)
Unit tests must **never execute destructive system commands or modify the host OS**:
- **Mock Facts (`FactBase`):** Inherit from `pyinfra.api.facts.FactBase` (following the pattern in `chaos.lib.facts`) and mock `host.get_fact` rather than querying real system hardware or packages.

- **Mock Operations (`@operation`):** Use custom mock operations decorated with `@operation()` from `pyinfra.api.operation` that yield harmless mock strings rather than real shell commands like `pacman` or `systemctl`.

- **Mock Dispatchers:** Always mock execution functions such as `pyinfra.api.operations.run_ops`, `connect_all`, and `disconnect_all`.

### Parametrization & Fixtures over Duplication
- **Use `@pytest.mark.parametrize`:** When testing multiple inputs, complexity levels, or combinations of missing fields, avoid copying and pasting entire test functions. Use `@pytest.mark.parametrize` with explicit `id` values:
  ```python
  @pytest.mark.parametrize(
      ("team", "name", "expected_fields"),
      [
          pytest.param("Team A", "John", [], id="all_fields_provided"),
          pytest.param("", "John", ["team"], id="missing_team"),
          pytest.param("Team A", "", ["name"], id="missing_name"),
      ],
  )
  def test_gatherApproveTeam_missing_fields_request_input(team, name, expected_fields):
      ...
  ```

- **Use Pytest Fixtures:** Centralize common environment setups, stubs, and mock dispatchers into `@pytest.fixture` functions instead of manual helper calls.

### Running Tests & Checking Coverage
Run tests using the project virtual environment:

```bash
# Run the entire CLI test suite
./.venv/bin/pytest cli/tests/

# Run a specific test file with line and branch coverage
./.venv/bin/pytest --cov=chaos.lib.<module> cli/tests/test_<module>.py --cov-report=term-missing

# Ensure type checking passes with 0 errors
./.venv/bin/basedpyright cli/tests/
```

Aim for 100% coverage.

---

## 5. Policy on AI Tools

AI assistance is welcome under strict boundaries:
- **Mandatory Human Review:** Every line of code submitted in a PR must be reviewed and understood by a human.

- **No Unreviewed Code ("Slop"):** AI may be used for autocompletion, scaffolding, or refactoring assistance, but the final architectural and design decisions must be made by the contributor.

- **Tools, Not Autonomous Agents:** Interactive CLI assistance tools are acceptable, but autonomous agents generating unverified PRs are prohibited.

- **Attribution & Recognition:** Contributions must represent real human contributors on GitHub to give proper credit to the community.
