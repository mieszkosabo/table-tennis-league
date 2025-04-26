# Mutations

## Status

Work in progress

## Context

I'm thinking about expressing the mutations to the app as synchronous and transactional event sourcing.
Basically each mutation would have a corresponding "command":

```
Command = inputData -> state -> Either<Error, List<Event>>
```

A command would validate the input data given the current state of the app and either return an error or a list of events.
These events would be then piped through `event listeners`: each event listener can update the state given the event and return a new list of events (that could be empty).

`Event processor` would be processing these events in a loop until there are no more events to process.
The whole process would take place in a single transaction.
