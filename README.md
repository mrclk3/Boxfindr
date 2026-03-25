# Boxfindr

Boxfindr is a mobile-friendly inventory app for cabinets, crates, and items.

Current active runtime in this workspace:
- Frontend: Next.js (App Router) in frontend
- Backend: FastAPI + Prisma Client Python in python-backend
- Database: PostgreSQL (via docker-compose)

There is also a NestJS backend in backend, but the currently integrated frontend flow is set up for the FastAPI backend.

## Features

- Cabinet and crate management with QR code values
- Item management with quantities and minimum stock
- Quick stock change (+/-) from item detail page
- Move item between crates
- Copy item template to another crate
- Dashboard stats:
    - Total Items
    - Total Quantity
    - Low Stock
    - Items per Category
- QR scan page with direct resolution:
    - Crate QR -> opens crate page
    - Cabinet QR fallback -> opens cabinet page
- Audit log list endpoint and UI page
- Admin and guest login endpoints

## Project Structure

- frontend: Next.js app (port 3001)
- python-backend: FastAPI API (port 8200)
- backend: NestJS API (legacy/alternative backend)
- docker-compose.yml: local PostgreSQL

## Prerequisites

- Node.js 20+
- Python 3.11+
- Docker Desktop (for PostgreSQL)

## Quick Start (Recommended: FastAPI + Frontend)

### 1. Start PostgreSQL

From repository root:

```bash
docker-compose up -d
```

### 2. Start FastAPI backend

From repository root:

```bash
cd python-backend
pip install -r requirements.txt
prisma generate
uvicorn main:app --reload --host 0.0.0.0 --port 8200
```

Backend URLs:
- API: http://127.0.0.1:8200
- OpenAPI docs: http://127.0.0.1:8200/docs
- Health: http://127.0.0.1:8200/health

### 3. Start Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:
- http://127.0.0.1:3001

## Environment Notes

Frontend API target:
- Uses NEXT_PUBLIC_API_URL if set
- Otherwise defaults to current hostname on port 8200

Example frontend env file (optional):

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8200
```

Backend env (python-backend):
- DATABASE_URL must point to PostgreSQL
- Optional: JWT_SECRET for auth token signing

## Auth

FastAPI auth endpoints:
- POST /auth/login
- POST /auth/guest

Default admin credentials in current flow:
- admin@codelab.eu
- admin123

## Main FastAPI Endpoints

Core:
- /cabinets
- /crates
- /items
- /categories
- /audit-logs

Important additions:
- GET /crates/by-qr/{qr_code}
- GET /cabinets/by-qr/{qr_code}
- PATCH /items/{id}/quantity
- POST /items/{id}/transfer
- GET /items/stats
- GET /items/search?q=...
- GET /items/export/shopping-list

## QR Scanning (Phone)

To scan from a phone in the same Wi-Fi:

1. Start frontend on 0.0.0.0 (already configured in npm run dev)
2. Start FastAPI on 0.0.0.0:8200
3. Open frontend using your PC LAN IP on your phone
4. Ensure your QR value matches stored crate.qrCode or cabinet.qrCode

## Known Limitations

- Item create currently sends JSON; image upload is not active in python-backend item creation yet.
- Audit log listing endpoint exists; automatic write events may need further expansion depending on workflow.

## Troubleshooting

### Windows socket/port errors

If you get WinError 10013 or port bind errors:

- Try a non-reserved port (for API, prefer 8200+)
- Check exclusions:

```bash
netsh interface ipv4 show excludedportrange protocol=tcp
```

- Check usage:

```bash
netstat -ano | findstr :8200
```

### Hydration mismatch in browser

If you see hydration mismatch with dark_reader_root, disable the Dark Reader extension for localhost.

## Optional: Run NestJS Backend

If you want the TypeScript backend instead:

```bash
cd backend
npm install
npm run start:dev
```

Default NestJS API port is typically 3000.

## License

MIT
