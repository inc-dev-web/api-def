# @api-def/core

This package exposes core types for @api-def infrastructure, though it could contain some logic in the future (not sure what it could be as for now).

## Typings

The exposed typings are:

1. `EndpointDefinition<TInput, TOutput, TError>` - definition of a single endpoint of request-response communication.
2. `EndpointExecuteResult<TOutput, TError>` - defintion of a result of endpoint execution

## Roadmap

- [x] - Definition for request-response communication endpoints
- [ ] - Definition for event-based communication
- [ ] - Definition for read-only stream communication
- [ ] - Definition for read-write stream communication

## License

[MIT](/LICENSE)

Copyright (c) 2024-present, Artem Tarasenko
