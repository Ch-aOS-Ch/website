---
title: "Explain Core Reference"
---

# Explain Core Reference

Python Module: `chaos.lib.explain`

## Functions and Operations

### `handleExplain()`

```python
handleExplain(payload: 'ExplainPayload', EXPLAIN_DISPATCHER: 'dict[str, str]') -> 'ResultPayload[dict[str, ExplainResult]]'
```

Handles the resolution and fetching of explanations for provided topics.

**Parameters:**

- **`payload`** (*`ExplainPayload`*): The payload containing the requested topics and desired complexity level.
- **`EXPLAIN_DISPATCHER`** (*`dict`*): A mapping of available roles to their specific explanation modules.

**Returns:**

- `ResultPayload[]`: The result payload containing a dictionary of fetched explanations or list of subtopics on success, and any errors encountered during resolution.

!!! note
    Topics should be passed as either "role" or "role.sub_topic". If "role.list" is requested, it will list all available subtopics for that role.

---
