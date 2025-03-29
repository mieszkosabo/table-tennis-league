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
- [ ] setup shadcn/ui
- [x] eslint absolute paths rule
- [x] eslint typescript rules
- [x] formatting with Biome

## project work

- [ ] models
  - [ ] User
  - [ ] League
  - [ ] Match
  - [ ] Player
