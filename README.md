# Sales Playbook

Asistente de llamadas que guía al vendedor durante cada conversación y conserva el conocimiento comercial en playbooks reutilizables.

## Stack actual

- Frontend: React + Vite + TypeScript + TailwindCSS.
- Backend: NestJS + Prisma + PostgreSQL + JWT.
- Infraestructura local: Docker Compose.

## Componentes

- `apps/web`: interfaz React del Dashboard, Call Assistant, Playbooks y Knowledge Base.
- `apps/api`: API NestJS para autenticación y playbooks.
- `docs`: arquitectura y definición del playbook inicial.

## Desarrollo

```powershell
docker compose up -d postgres

cd apps/api
Copy-Item .env.example .env
pnpm install
pnpm prisma:migrate --name init
pnpm start:dev
```

En otra terminal:

```powershell
cd apps/web
pnpm install
pnpm start
```

- Frontend: `http://localhost:4200`
- API: `http://localhost:3000/api`
