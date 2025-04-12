# Editing matches

## Status

_approved_

## Context

Current elo score is calculated based on all matches played by a player. This means that if a player has played a match and the result is changed, the elo score of that player should be updated.

This in turn means that the elo scores of all players that played against that player should also be updated.

This means that updating a match result is a costly operation, as it requires recalculating the elo scores of all players that played against that player, which in many cases means reading all matches played in the league ever.

A key insight is that usually there shouldn't be a need to ever edit a match. If it happened it happened. The only case where it should be possible to edit a match is when there was a mistake while
inputting the match result. It is reasonable to assume that if there's a mistake, it will be fixed quickly.

## Decision

We will only allow editing a match if the match was played within the last `MATCH_EDITING_GRACE_PERIOD` (defaults to 1 week). This means that if a match was played more than a week ago, it cannot be edited anymore.

The length of the grace period should be configurable by the league admin, but it shouldn't be longer that 2 weeks. It could be as short as 0 though (which would mean that matches cannot be edited at all).

### Algorithm

Here's the algorithm for adding and editing matches:

- All players have their current elo saved in the database.
- When a new match is added, we calculate the new elo scores for all players that played in the match.
  and save them in the database.
- At all times we keep a single "checkpoint" of the elo scores of all players
  in the league after one of the matches that cannot be edited anymore.
- From time to time we will move that checkpoint forward, but always to the last match that cannot be edited anymore.
- When someone wants to edit a match, we check if match.created_at is older than Date.now() - MATCH_EDITING_GRACE_PERIOD.
  - If it is, we cannot edit the match.
  - If it isn't, we edit the match, save it in the database and recalculate elo scores.

### league checkpoint table

```
table league_checkpoints {
  id                  uuid
  league_id           uuid
  created_at_match_id uuid
  data                json // serialized Map<player_id, elo_score>, default: {}
}
- index on `league_id`
- 1:1 relation with `leagues`, cascading delete

```

### Recalculating elo scores

1. Read the checkpoint for that league from the database and retrieve the elo map.
2. Starting from the match after the checkpoint, read all matches in the league.
3. Calculate new elos after each match and update the elo map.
4. (Optional) Update the checkpoint in the database with the elo map of the last non-editable match.
5. Update elo scores in the database for players whose elo scores changed.

### Updating the checkpoint

1. When adding a new match, we check the league checkpoint.
2. if it's outdated (whatever that means), we load the elo map and calculate it from that point until
   the last non-editable match.
3. We update the checkpoint with the new elo map.

## Consequences

Consequences are clear.
