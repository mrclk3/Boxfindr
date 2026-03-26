# Boxfindr Backend (NestJS)

NestJS-Backend fuer Boxfindr.

Hinweis: Im aktuellen Standard-Setup des Projekts wird primaer das Python-Backend (`python-backend`) genutzt. Dieses NestJS-Backend bleibt als Alternative/Legacy erhalten.

## Voraussetzungen

- Node.js 20+
- npm
- PostgreSQL

## Installation

```bash
npm install
```

## Entwicklung

```bash
npm run start:dev
```

## Build und Produktion

```bash
npm run build
npm run start:prod
```

## Tests

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Prisma

Prisma Schema und Migrationen liegen unter `prisma/`.

Seed ausfuehren:

```bash
npx prisma db seed
```

## Nuetzliche Skripte

- `npm run lint`
- `npm run format`
- `npm run start:debug`

## Module (Auszug)

- `auth`
- `cabinets`
- `crates`
- `items`
- `categories`
- `audit-logs`
- `prisma`

## License

UNLICENSED
