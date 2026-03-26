# Boxfindr

![Boxfindr Logo](./boxfindr_logo.png)

Boxfindr is a mobile-friendly inventory application for cabinet, crate, and item management with QR-based workflows.

## Current Stack

- Frontend: Next.js (App Router) in `frontend`
- API: FastAPI + Prisma Client Python in `python-backend`
- Database: PostgreSQL
- Reverse proxy: Nginx (`proxy/nginx.conf`)
- Alternative/legacy API: NestJS in `backend`

## Features

- Manage cabinets, crates, categories, and items
- QR-based navigation for cabinet and crate views
- Adjust item stock (+/-), transfer items, and copy item templates
- Dashboard metrics (Total Items, Quantity, Low Stock, Category Stats)
- Audit log view
- Admin and guest login

## Project Structure

- `frontend`: Next.js UI
- `python-backend`: primary FastAPI backend
- `backend`: NestJS alternative (not the default flow)
- `proxy`: Nginx for unified access via port 80
- `docker-compose.yml`: orchestrates DB, API, frontend, and proxy

## Quick Start (Recommended)

Start everything (DB + API + frontend + proxy):

```bash
docker compose up -d --build
```

Then open:

- App: http://localhost
- API via Proxy: http://localhost/api
- API docs (direct): http://localhost:8200/docs
- Health (direct): http://localhost:8200/health

Stop:

```bash
docker compose down
```

## Local Development Without Full Docker

### 1) Start PostgreSQL

```bash
docker compose up -d db
```

### 2) Start FastAPI

```bash
cd python-backend
pip install -r requirements.txt
prisma generate
uvicorn main:app --reload --host 0.0.0.0 --port 8200
```

### 3) Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend local URL: http://localhost:3001

## Environment Variables

### Frontend

- Uses `NEXT_PUBLIC_API_URL` if set
- Otherwise tries sensible API base candidates (`/api`, host:8200, localhost)

Example for `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8200
```

### Python-Backend

- `DATABASE_URL` must point to PostgreSQL
- `JWT_SECRET` is optional for token signing

## Auth

FastAPI endpoints:

- `POST /auth/login`
- `POST /auth/guest`

Default admin (current flow):

- Email: `admin@codelab.eu`
- Password: `admin123`

## Important API Endpoints

Core:

- `/cabinets`
- `/crates`
- `/items`
- `/categories`
- `/audit-logs`

Extended:

- `GET /crates/by-qr/{qr_code}`
- `GET /cabinets/by-qr/{qr_code}`
- `PATCH /items/{id}/quantity`
- `POST /items/{id}/transfer`
- `GET /items/stats`
- `GET /items/search?q=...`
- `GET /items/export/shopping-list`

## Mobile QR Scan Notes

1. Open the frontend via your LAN IP (if using the local dev server on port 3001).
2. Run the API on 0.0.0.0:8200.
3. The QR value must match `crate.qrCode` or `cabinet.qrCode`.

## Troubleshooting

### Modules Are Red in VS Code, But the App Runs

Usually local frontend dependencies are missing for the TypeScript server:

```bash
cd frontend
npm install
```

Then restart the TypeScript server in VS Code.

### Container-Logs

```bash
docker compose logs -f api
docker compose logs -f frontend
docker compose logs -f db
docker compose logs -f proxy
```

### Hydration-Mismatch

If you see `dark_reader_root` issues, disable Dark Reader for localhost.

## Optional: Run NestJS Backend

```bash
cd backend
npm install
npm run start:dev
```

Note: The current frontend flow is built around the FastAPI backend.

## License

MIT
