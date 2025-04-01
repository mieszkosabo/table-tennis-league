# Table Tennis League project

## Local Setup

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

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
- [ ] setup for local development with docker

## project work

- models
  - [x] User
  - [x] League
  - [x] Match
- [ ] league page
  - [ ] show league name
  - [ ] show league description
  - [ ] show players in league with their stats
  - [ ] show matches in league
- owner
  - [ ] edit league (name, starting elo, description, etc)
  - [ ] delete league
  - [ ] remove player from league
  - [ ] add match to league
  - [ ] remove match from league
  - [ ] transfer ownership
- [ ] claim league ownership if owner is deleted
- [ ] add matches
- [x] redirect to home page if user tries to open a league that doesn't exist or they don't have access to
- [x] join league button in selector
- [x] create league button in selector
- [x] dark mode
- [x] create a max-width container for the app content and center it
- [ ] /join?joinCode=... page
- [ ] Feedback link (env var)
- [ ] account button popup
  - [ ] avatar
  - [ ] name
  - [ ] logout
