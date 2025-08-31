# Mastra Storage Bug Repro

This repository is a repro of a bug in Mastra Storage related to vNext stream feature.

See [https://github.com/mastra-ai/mastra/issues/7050](https://github.com/mastra-ai/mastra/issues/7050) for more details.

## Getting Started
Install dependencies with:
```bash
bun install
```

Copy `.env.example` to `.env` and fill in the values in `/apps/api` and `/apps/ui` folders.

Start the project with:
```bash
bun run dev
```

## Usage

Open [http://localhost:5173/](http://localhost:5173/) with your browser to see the assistant-ui. You can use this UI to send messages to server. Thread list adapter of assistant-ui is not integrated in this repo, but you can see thread list and saved messages in Swagger UI.

To see thread list and saved messages, open [http://localhost:3000/swagger](http://localhost:3000/swagger) with your browser to see the built-in Swagger UI. There, you can see bugged thread messages.
