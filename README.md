# Table Tennis League project

## Local Setup

### Prerequisites

- Node (I recommend https://volta.sh)
- pnpm (v10.8.1)
- Docker Desktop

### Installation

Install the dependencies:

```bash
pnpm install
```

### Development

#### Create a .env file in the project root

```bash
cp .env.example .env
```

#### Add the database URL to the .env file

Update the `.env` file with your database connection string:

```txt
# The connection string has the format `postgres://user:pass@host/db`
DATABASE_URL=<your-string-here>
```

#### Start the development server

```bash
pnpm dev
```

### Generate migrations

```bash
npx drizzle-kit generate

# or
pnpm db:generate
```

### Run migrations

```bash
# It will use "DATABASE_URL" env variable
pnpm db:migrate
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# TODOS

## setup

- [x] setup drizzle ORM
- [x] setup NextAuth with Github OAuth
- [x] setup shadcn/ui
- [x] eslint absolute paths rule
- [x] eslint typescript rules
- [x] formatting with Biome
- [x] "lock" more specific versions of dependencies
- [ ] setup CI for PRs (github actions running lint, type check, tests, etc)
  - [x] prod db migration
- [x] setup for local development with docker
- [x] open source

## project work

- models
  - [x] User
  - [x] League
  - [x] Match
- league page
  - [x] show league name
  - [x] show league description
  - [x] show players in league with their stats
  - [x] show matches in league
  - [x] pagination for matches and players
- owner
  - [x] edit league (name, starting elo, description, etc)
  - [x] delete league (for now, only if there are no matches in it)
  - [x] remove player from league (for now, only if they didn't play any matches)
  - [x] add match to league
  - [x] remove or edit match from league #EditingMatches
  - [ ] transfer ownership [just ui is needed, backend is done]
- [ ] claim league ownership if owner is deleted
- [x] add matches
  - [x] Player1 is prefilled with the user that is logged in
  - [x] update checkpoint
- [x] leave league if no matches with other players, and if not a owner
- [x] edit matches #EditingMatches
- [x] redirect to home page if user tries to open a league that doesn't exist or they don't have access to
- [x] join league button in selector
- [x] create league button in selector
- [x] dark mode
- [x] create a max-width container for the app content and center it
- [x] /join?joinCode=... page
- [x] Feedback link (env var)
  - [x] GitHub issues
- [x] account button popup
  - [x] avatar
  - [x] name
  - [x] logout
- [x] schedule a match with another player from player ranking via action
  - [x] above all matches there's a list of scheduled matches with dates of course
  - [x] if a match is overdue the date is red
  - [x] if a match is scheduled for today the date is green
  - [x] there's a button to input the result of the match
  - [x] if someone adds a new match with players that have a scheduled match (on the same day), the scheduled match is removed
- League creation
  - [x] starting elo in league creation (default to 1000)
  - [x] description (150 chars)
- [ ] Add all indexes based on queries 🐙
- [ ] Show status emojis next to player names
  - [ ] 🔥 if on winning streak
  - [ ] 🥵 if on losing streak
  - [ ] 😴 if haven't played in 2 weeks
  - [ ] 💪 if broke someone's winning streak
  - [ ] separate table for statuses and update on read
- [ ] Handle case where two players have the same name 🐙
- [x] Event sourcing for mutations
  - Commands:
    - League
      - [x] `createLeague`
      - [x] `deleteLeague`
      - [x] `updateLeagueProperties`
      - [x] `joinLeague`
      - [x] `removePlayerFromLeague`
      - [x] `transferLeagueOwnership`
    - Match
      - [x] `recordMatch`
      - [x] `scheduleMatch`
      - [x] `editMatch`
      - [x] `deleteMatch`
      - [x] `setMatchWinner` 🐙
    - Player
      - [ ] `updatePlayerDisplayName` 🐙
    - User
      - [ ] `updateUserDefaultDisplayName` 🐙
  - Other
    - [x] save events to database
    - [ ] activity feed
    - [ ] use dataloader/cache in event processing
- [ ] Tests
  - [ ] testcontainers
- [x] add avatars to tables
  - [x] ranking
  - [x] matches
- [x] works on mobile
- [ ] show "odds" column
- [x] login with google
- [x] make sure the /join page works for non-logged in users (i.e. they get redirected to the login page and then to the join page after and just not the home page)
- [x] "Today" works both as a past date and a future date depending whether the match has set winner or not
- [ ] server-side sorting
- [ ] show pagination controls only if there is something to paginate
- [ ] come up with a way so that no two matches in a league have the same date (for example add 1 millisecond to the date if there is already a match with that date, and for the current day records the match with the current time) 🐙

## Bugs

- [x] We should be able to add a new match for dates falling within GRACE_PERIOD and we need to recalculate stats after such match is inserted
- [ ] When two leagues have the same name the league selector acts weird 🐙
- [x] explicitly setting the match date for today doesn't work since the form thinks it in the future
