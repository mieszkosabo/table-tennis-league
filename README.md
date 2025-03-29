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

- [ ] setup drizzle ORM
- [ ] setup NextAuth with Google OAuth
- [ ] setup shadcn/ui
- [ ] eslint absolute paths rule
- [ ] eslint typescript rules
- [x] formatting with Biome

## project work

- [ ] For now logging in is only allowed with a google account that's part of some domain like name@mycorp.com
- [ ] models
  - [ ] User
  - [ ] League
  - [ ] Match
  - [ ] Player
