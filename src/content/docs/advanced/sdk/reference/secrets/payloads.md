---
title: "Secrets Payloads"
---

# Secrets Payloads

Python Module: `chaos.lib.secrets`

Module for handling secret management operations such as adding/removing keys, editing secrets, and printing secrets.

Please, note that most of our handlers are made to work with our SOPS engine, but, since that engine is just an
    implementation of the SecretsEngine interface, we can just change it later.

## Classes and Data Structures

### `class DataGatherPayload`

This payload is a data gathering payload, which is meant to gather data BEFORE the execution of the main
    logic, and it is meant to be used in the "pre" phase of the execution.

**Attributes:**

- **`name`**: The name of the data being gathered, e.g. "aws_credentials", "kubeconfig", etc.
- **`prompt`**: The prompt to show to the user when asking for the data, e.g. "Please enter your AWS credentials".
- **`input_type`**: The type of input expected, should be used by the CLI to manage how to gather the data.
  e.g. if input_type is "choice", the interface should show the choices to the user and let them select one, if it's "secret",
  the interface should hide the input, etc.
- **`required`**: A boolean indicating whether the data is required or not, if it's required, the interface should keep asking for the
  data until it is provided, if it's not required, the user should be able to skip it.
- **`default`**: The default value to use if the user decides to skip providing the data, should only be used if required is False.
- **`choices`**: A list of choices to show to the user if the input_type is "choice", should be None otherwise.
- **`metadata`**: A dictionary containing any additional information that might be useful for the interface when gathering the data,
  e.g. if the input_type is "secret", the metadata might contain information about how to validate the secret, etc.

**Methods:**

#### `.__init__()`

```python
DataGatherPayload.__init__(self, prompt: 'str | None' = None, name: 'str | None' = None, input_type: "Literal['string', 'integer', 'boolean', 'choice', 'secret']" = 'string', required: 'bool' = False, default: 'Any' = None, choices: 'list[Any] | None' = None, metadata: 'dict[str, Any] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
DataGatherPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class DataGatherRequest`

This payload is a data gathering request, which is meant to be used as a request to gather data BEFORE the execution of the main
    logic, and it is meant to be used in the "pre" phase of the execution.

**Attributes:**

- **`name`**: The name of the data gathering request, e.g. "aws_credentials", "kubeconfig", etc.
- **`fields`**: A list of DataGatherPayload objects, each representing a piece of data that needs to be gathered for this request.

!!! note
    I KNOW its another layer of indirection. This is necessary for the interfaces to be able to group multiple data gathering fields
        under the same request, and to be able to show them to the user in a more organized way.


    Yes, I know I could just use return[DGP(), DGP(), DGP()] instead of return[DGR("aws_credentials", [DGP(), DGP()])], but this way
        we can have a name for the group of data being gathered, which can be useful for the interfaces to show a more user-friendly message
        to the user.

**Methods:**

#### `.__init__()`

```python
DataGatherRequest.__init__(self, name: 'str', fields: 'list[DataGatherPayload]')
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
DataGatherRequest.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---

### `class ResultPayload`

This payload is meant to be used as a STANDARD RETURN TYPE for all API calls in the library, and it should
    be used as such in the future for all API calls.

**Attributes:**

- **`success`**: A boolean indicating whether the operation was successful or not.
- **`message`**: A list of strings containing any messages that should be returned to the user.
- **`data`**: Any data that should be returned to the user, can be of any type
- **`error`**: A list of strings containing any error messages that should be returned to the user.

**Methods:**

#### `.__init__()`

```python
ResultPayload.__init__(self, success: 'bool', message: 'list[str] | None' = None, data: 'T | None' = None, error: 'list[str] | None' = None)
```

Initialize self.  See help(type(self)) for accurate signature.

#### `.to_dict()`

```python
ResultPayload.to_dict(self) -> 'dict[str, Any]'
```

Convert payload to dictionary, recursively converting nested payloads.

---
