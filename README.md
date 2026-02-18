# Altered TCG CLI

This is a CLI tool to search for cards, or do some automated actions on the [Altered TCG](https://www.altered.gg/) marketplace and collection.

## Usage

### Requirements

- Node.js 18+
- npm 10+

### Installation

Clone the repository:

```bash
git clone https://github.com/Gmousse/altered-tcg-cli.git
```

Install dependencies and build the project:

```bash
npm install
npm run build
```

### CLI

From local with built package:

```bash
npx . --help
```

From local with source code (for development purpose):

```bash
npm run dev -- --help
```

### Auth

There are two ways to provide authentication:

- Use the `ALTERED_AUTH` environment variable
- Use the `--auth` option

The authentication use the altered API access token.
The access token expires after around 1 hour.

Examples:

```bash
export ALTERED_AUTH=your_token
npx . list-traded-cards
```

```bash
npx . --auth your_token list-traded-cards
```

If a 401 error occured while using the script, renew the authentication.

#### Get an authentication token

Go to https://www.altered.gg/ and log in.
Then go to https://www.altered.gg/api/auth/session.
You can also get the access token from http response JSON body.

### List traded cards

If you want to get all the cards that you bought or you sold, you can use the `list-traded-cards` command.

You can choose the type of reports you want.

```bash
npx . list-traded-cards --report-type html # by default
npx . list-traded-cards --report-type jsonl
```

You can also choose the oldest date of the transactions you want in order to reduce the report size.

```bash
npx . list-traded-cards --oldest-date 2026-02-01
```
