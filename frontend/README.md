# Boxfindr Frontend

Next.js App Router Frontend fuer Boxfindr.

## Voraussetzungen

- Node.js 20+
- npm

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run dev
```

Der Dev-Server laeuft auf `0.0.0.0:3001`.

App URL lokal:

- http://localhost:3001

## Produktion (lokal testen)

```bash
npm run build
npm run start
```

## API-Anbindung

Das Frontend verwendet `src/lib/api.ts` und probiert mehrere Basis-URLs in sinnvoller Reihenfolge.

Wenn gesetzt, wird `NEXT_PUBLIC_API_URL` verwendet.

Beispiel `/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8200
```

Im Docker-Compose-Stack wird typischerweise `/api` ueber Nginx genutzt.

## Nuetzliche Skripte

- `npm run dev` startet den Dev-Server
- `npm run build` baut das Projekt
- `npm run start` startet das Build
- `npm run lint` fuehrt ESLint aus

## Hinweis zu roten Imports in VS Code

Wenn Module wie `react` oder `next/link` rot markiert sind, fehlen meist lokale Abhaengigkeiten fuer den TypeScript-Server.

Loesung:

```bash
npm install
```

Danach TypeScript-Server in VS Code neu starten.
