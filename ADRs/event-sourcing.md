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

Below are a work-in-progress list of events and their arguments.

## player-joined-league

### args:

- leagueId
- playerId (from auth, simile for args in the rest of the mutations)
- joinCode

### permissions:

Anyone with joinCode can join. If that player aleady exists in the league, it's a noop.

## league-created

### args:

- name
- description
- startingElo

### permissions:

Anyone can create a league. The user that creates the league is the owner of the league.

## league-deleted

### args:

- leagueId
- playerId

### permissions:

1. Only the owner can delete the league.
2. Only if there are no matches

## league-properties-updated

### args:

- leagueId
- name?
- description?
- startingElo?
- playerId

### permissions:

1. Only the owner can update the league properties.

## player-removed-from-league

### args:

- leagueId
- playerId
- removedPlayerId

### permissions:

1. Player can be only removed if they haven't played any matches.
2. Player can be only removed by the owner or the player themselves.

## match-created

### args:

- leagueId
- player1Id
- player2Id
- date
- winnerId

### permissions:

1. Only players in the league can create a match.
2. Only players in the league can be added to a match.
3. Only players in the league can be the winner of a match (one of player1 or player2)

## match-edited

### args:

- leagueId
- matchId
- player1Id
- player2Id
- date
- winnerId

### permissions:

See [Editing Matches](./editing-matches.md)

## match-deleted

### args:

- leagueId
- matchId

### permissions:

Same as in `match-edited`.
