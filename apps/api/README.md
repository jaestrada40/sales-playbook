# Sales Playbook API

API NestJS para autenticación y playbooks guiados. La persistencia usa PostgreSQL y Prisma.

## Desarrollo local

1. Copia `.env.example` a `.env`.
2. Inicia PostgreSQL desde la raíz del proyecto:

```powershell
docker compose up -d postgres
```

3. Instala dependencias y aplica la primera migración:

```powershell
pnpm install
pnpm prisma:migrate --name init
pnpm start:dev
```

La API queda en `http://localhost:3000/api`.

## Endpoints iniciales

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/playbooks` (Bearer token)
- `GET /api/playbooks/:id` (Bearer token)
- `POST /api/playbooks` (Bearer token)
- `POST /api/playbooks/:id/sections` (Bearer token)
