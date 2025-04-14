# Table Tennis League project

## Local Setup

### Prerequisites

- Node (I recommend https://volta.sh)
- pnpm
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
- [ ] "lock" more specific versions of dependencies
- [ ] setup CI/CD pipeline
- [x] setup for local development with docker

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
  - [ ] pagination for matches and players
- owner
  - [x] edit league (name, starting elo, description, etc)
  - [ ] delete league (for now, only if there are no matches in it) 🐙
  - [ ] remove player from league (???) 🐙
  - [x] add match to league
  - [ ] remove or edit match from league #EditingMatches 🐙
  - [ ] transfer ownership
- [ ] claim league ownership if owner is deleted
- [x] add matches 🐙
  - [x] Player1 is prefilled with the user that is logged in
  - [ ] update checkpoint
- [ ] leave league if no matches with other players, and if not a owner 🐙
- [ ] edit matches #EditingMatches 🐙
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
- [ ] schedule a match with another player from player ranking via action 🐙
  - [x] above all matches there's a list of scheduled matches with dates of course
  - [ ] if a match is overdue the date is red
  - [ ] if a match is scheduled for today the date is green
  - [ ] there's a button to input the result of the match
  - [ ] if someone adds a new match with players that have a scheduled match (on the same day), the scheduled match is removed
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
- [ ] When two leagues have the same name the league selector acts weird 🐙
- [ ] Event sourcing for mutations
  - [ ] permissions
  - [ ] activity feed
- [ ] Tests
  - [ ] testcontainers
- [ ] add avatars to tables
  - [ ] ranking
  - [ ] matches
- [x] works on mobile
