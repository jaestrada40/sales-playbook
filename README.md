# Sales Playbook

Asistente de llamadas que guía al vendedor durante cada conversación y conserva el conocimiento comercial en playbooks reutilizables.

## Stack actual

- Frontend: React + Vite + TypeScript + TailwindCSS.
- Backend: NestJS + Prisma + PostgreSQL + JWT.
- Infraestructura local: Docker Compose.

## Componentes

- `apps/web`: interfaz React del Dashboard, Call Assistant, Playbooks y Knowledge Base.
- `apps/api`: API NestJS para autenticación, playbooks, llamadas y conocimiento.
- `CRM y Operaciones`: prospectos importados por CSV, campañas outbound, equipos, asignación, pipeline, tareas, DNC, consentimiento, auditoría y métricas reales.
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

Si el puerto 5432 ya está ocupado, inicia PostgreSQL con `POSTGRES_PORT=5433 docker compose up -d postgres` y ajusta `DATABASE_URL` al mismo puerto.

En macOS o Linux, copia la configuración con `cp .env.example .env`.

En otra terminal:

```powershell
cd apps/web
pnpm install
pnpm start
```

- Frontend: `http://localhost:4200`
- API: `http://localhost:3000/api`

## Configuración

- `apps/api/.env`: conexión PostgreSQL, secreto JWT, orígenes CORS y puerto.
- `apps/web/.env`: URL pública de la API y acceso opcional al modo demostración.
- `JWT_SECRET` es obligatorio cuando `NODE_ENV=production`.
- El acceso rápido con usuarios ficticios solo aparece con `VITE_ENABLE_DEMO=true`.
- No existe integración telefónica: el sistema guía y registra una llamada realizada por un medio externo.

## Importación de prospectos

Desde **CRM y Operaciones** un gerente puede importar CSV. Las columnas mínimas son `businessName`, `contactName` y `phone`; también se reconocen `negocio`, `contacto` y `telefono`. Campos opcionales: email, cargo, tipo, proveedor, volumen, terminales, objetivo, problema, dirección y tags separados por `|`.

La campaña inicial es explícitamente `OUTBOUND`. Los números presentes en la lista DNC se bloquean durante la importación y antes de registrar una llamada.

## Verificación

```bash
cd apps/api && pnpm lint && pnpm test -- --runInBand && pnpm build
cd apps/web && pnpm lint && pnpm build
```

## Despliegue en Coolify

El archivo `docker-compose.coolify.yml` despliega PostgreSQL, la API y el frontend en una sola aplicación. La API ejecuta las migraciones y el seed idempotente antes de iniciar; el frontend sirve la SPA y redirige `/api` al backend dentro de la red privada.

1. En Coolify crea un recurso desde el repositorio GitHub y selecciona **Docker Compose**.
2. Usa la rama `main`, directorio base `/` y Compose `docker-compose.coolify.yml`.
3. Asigna el dominio público únicamente al servicio `web`, puerto `80`.
4. Coolify generará `SERVICE_PASSWORD_POSTGRES`, `SERVICE_PASSWORD_JWT` y `SERVICE_URL_WEB`. Confirma que las tres variables tengan valor antes de desplegar.
5. Conserva el volumen `postgres-data` para no perder prospectos, llamadas ni configuraciones entre despliegues.

No expongas el servicio PostgreSQL ni la API directamente a Internet; el frontend accede a la API mediante `/api`.
