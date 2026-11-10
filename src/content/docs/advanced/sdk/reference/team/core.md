---
title: "Team Core Reference"
---

# Team Core Reference

Python Module: `chaos.lib.team`

Module for managing team structures, including initialization, activation, deactivation, listing, cloning, and pruning.

## Functions and Operations

### `checkDep()`

```python
checkDep(bin: 'str') -> 'bool'
```

Checks if a shell command exists in the system PATH.

**Parameters:**

- **`bin`** (*`str`*): The name of the binary/executable to look for.

**Returns:**

- `bool`: True if the binary is accessible in the PATH, False otherwise.

---

### `gatherApproveTeam()`

```python
gatherApproveTeam(payload: 'TeamApprovePayload') -> 'DataGatherRequest | None'
```

Gathers data needed to approve a team member.

**Parameters:**

- **`payload`** (*`TeamApprovePayload`*): The initial payload detailing the person to approve.

**Returns:**

- `DataGatherRequest | None`: A request containing prompts to clarify options from the user, or None if no extra inputs are needed.

---

### `gatherDeactivateTeam()`

```python
gatherDeactivateTeam(payload: 'TeamDeactivatePayload') -> 'DataGatherRequest | None'
```

Gathers confirmation for a comprehensive deactivation.

**Parameters:**

- **`payload`** (*`TeamDeactivatePayload`*): Instructions targeting a specific company setup to sever.

**Returns:**

- `DataGatherRequest | None`: User confirmation request if required, or None.

---

### `gatherInitTeam()`

```python
gatherInitTeam(payload: 'TeamInitPayload') -> 'DataGatherRequest | None'
```

Gathers data needed to initialize a team structure.

**Parameters:**

- **`payload`** (*`TeamInitPayload`*): The initial payload detailing the team configuration and requirements.

**Returns:**

- `DataGatherRequest | None`: A request containing prompts to clarify options from the user, or None if no extra inputs are needed.

---

### `gatherJoinTeam()`

```python
gatherJoinTeam(payload: 'TeamJoinPayload') -> 'DataGatherRequest | None'
```

Gathers data needed to join a team structure.

**Parameters:**

- **`payload`** (*`TeamJoinPayload`*): The initial payload detailing the team configuration and requirements.

**Returns:**

- `DataGatherRequest | None`: A request containing prompts to clarify options from the user, or None if no extra inputs are needed.

---

### `gatherPermitTeam()`

```python
gatherPermitTeam(payload: 'TeamPermitPayload') -> 'DataGatherRequest | None'
```

Gathers data needed to permit a team member to an environment.

**Parameters:**

- **`payload`** (*`TeamPermitPayload`*): The initial payload detailing the permission.

**Returns:**

- `DataGatherRequest | None`

---

### `gatherPruneTeams()`

```python
gatherPruneTeams(payload: 'TeamPrunePayload') -> 'DataGatherRequest | None'
```

Prompts the user before pruning stale records.

**Parameters:**

- **`payload`** (*`TeamPrunePayload`*): Context wrapping parameters and `i_know_what_im_doing` flag.

**Returns:**

- `DataGatherRequest | None`: Confirmation requirement prompt, if lacking the automated override flag.

---

### `gatherRemoveTeam()`

```python
gatherRemoveTeam(payload: 'TeamRemovePayload') -> 'DataGatherRequest | None'
```

---

### `getBackendChoices()`

```python
getBackendChoices(hasAge: 'bool', hasPgp: 'bool') -> 'list[str]'
```

Generates the list of choices for encryption key backends based on available dependencies.

---

### `handleActivateTeam()`

```python
handleActivateTeam(payload: 'TeamActivatePayload') -> 'ResultPayload[None]'
```

Activates a team by reading the .chaos.yml file and creating necessary symlinks.

**Parameters:**

- **`payload`** (*`TeamActivatePayload`*): Payload containing the target path context to read the configuration from.

**Returns:**

- `ResultPayload[None]`: Status representation of symlink deployments and setup validations.

---

### `handleApproveTeam()`

```python
handleApproveTeam(payload: 'TeamApprovePayload') -> 'ResultPayload[None]'
```

Handles the approval of a person within a team.

**Parameters:**

- **`payload`** (*`TeamApprovePayload`*): The fully resolved payload containing the person and approver details.

**Returns:**

- `ResultPayload[None]`: Status payload indicating the result of the approval.

---

### `handleCloneGitTeam()`

```python
handleCloneGitTeam(payload: 'TeamClonePayload') -> 'ResultPayload[None]'
```

Clones a git repository and activates the team if valid.

**Parameters:**

- **`payload`** (*`TeamClonePayload`*): Payload supplying git repository details and target local path.

**Returns:**

- `ResultPayload[None]`: Results containing operations metadata or rollback trace logs on failure.

!!! note
    Validity relies on the presence of a properly configured `.chaos.yml`.

---

### `handleDeactivateTeam()`

```python
handleDeactivateTeam(payload: 'TeamDeactivatePayload') -> 'ResultPayload[None]'
```

Deactivates specified teams or all teams for a company.

**Parameters:**

- **`payload`** (*`TeamDeactivatePayload`*): Details specifying the subset of teams to purge or if a complete teardown is targeted.

**Returns:**

- `ResultPayload[None]`: Feedback referencing all unlinked setups.

---

### `handleInitTeam()`

```python
handleInitTeam(payload: 'TeamInitPayload') -> 'ResultPayload[None]'
```

Handles the initialization of the directory structure and required configurations for a team.

**Parameters:**

- **`payload`** (*`TeamInitPayload`*): The fully resolved payload (post-gathering) necessary for setup.

**Returns:**

- `ResultPayload[None]`: Status payload indicating the result and reporting any issues.

---

### `handleJoinTeam()`

```python
handleJoinTeam(payload: 'TeamJoinPayload') -> 'ResultPayload[None]'
```

---

### `handlePermitTeam()`

```python
handlePermitTeam(payload: 'TeamPermitPayload') -> 'ResultPayload[None]'
```

Handles granting access to a specific environment in SOPS.

---

### `handlePruneTeams()`

```python
handlePruneTeams(payload: 'TeamPrunePayload') -> 'ResultPayload[None]'
```

Prunes stale team symlinks that point to non-existent directories.

**Parameters:**

- **`payload`** (*`TeamPrunePayload`*): Defines the scope (all companies or specific targets) to run the pruning script against.

**Returns:**

- `ResultPayload[None]`: Metrics encapsulating the total number of pruned paths.

---

### `handleRemoveTeam()`

```python
handleRemoveTeam(payload: 'TeamRemovePayload') -> 'ResultPayload[None]'
```

---

### `listTeams()`

```python
listTeams(payload: 'TeamListPayload') -> 'ResultPayload[dict[str, list[str]]]'
```

Lists all activated teams, optionally filtered by company.

**Parameters:**

- **`payload`** (*`TeamListPayload`*): Constraints mapping the query filters (e.g. company name).

**Returns:**

- `ResultPayload[dict[str, list[str]]]`: Found directories matching specified target query.

---

### `validate_path()`

```python
validate_path(path: 'str') -> 'None'
```

Validates given file system path.

**Parameters:**

- **`path`** (*`str`*): The file system path to check.

**Raises:**

- **`ValueError`**: If the path contains relative directory jumping commands or invalid multiple slashes.

---
