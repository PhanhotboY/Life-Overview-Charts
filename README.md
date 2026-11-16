# Life Overview Charts

A Remix app that turns dated Notion entries into cumulative point charts. View
data by week, month, or year, navigate between periods, and jump back to today.

## Requirements

- Node.js 20 or newer
- A Notion integration token with access to the database used by the app

## Getting started

Install dependencies and provide the Notion token to the server process:

```sh
npm ci
# update NOTION_INTEGRATION_TOKEN="your-notion-integration-token" in your shell environment or .env file
npm run dev
```

The app reads `NOTION_INTEGRATION_TOKEN` from the process environment. The
Notion database ID and expected properties (`Name`, `Date`, `Tags`, and
`Summary`) are configured in `app/services/notion.server.js`; make sure the
integration has access to that database.

## Scripts

| Command         | Description                        |
| --------------- | ---------------------------------- |
| `npm run dev`   | Start the local development server |
| `npm run build` | Create the production build        |
| `npm start`     | Serve the production build         |
| `npm run lint`  | Run ESLint                         |

For production, build the app and start it with the same
`NOTION_INTEGRATION_TOKEN` environment variable set:

```sh
npm run build
npm start
```
