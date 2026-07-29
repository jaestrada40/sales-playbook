# Arquitectura inicial

```text
React + Vite (apps/web)
        |
        | HTTPS / REST
        v
NestJS API (apps/api)
        |
        v
PostgreSQL
```

## Decisiones

- Un monorepo con dos aplicaciones independientes.
- API REST con contratos validados mediante DTOs de NestJS.
- PostgreSQL no se expone a internet; solo la API accede a ella por la red privada de Docker.
- El modelo se diseña para múltiples playbooks, pero la primera implementación carga únicamente NRS.
- La IA será una función opcional posterior; los flujos aprobados funcionan sin ella.
- La edición de un playbook reemplaza sus secciones y nodos dentro de una transacción para evitar actualizaciones parciales.
- La operación comercial incluye `Team`, `Campaign`, `Prospect`, `Opportunity`, `CrmTask`, `DncEntry`, `ComplianceSettings` y `AuditLog`.
- La telefonía permanece fuera de alcance; una llamada representa una sesión registrada manualmente desde el CRM.

## Entidades iniciales

- `User`
- `Workspace`
- `Playbook`
- `Flow`
- `FlowNode`
- `FlowTransition`
- `KnowledgeItem`
- `CallSession`
- `CallNote`
- `CallOutcome`

## Motor de flujo

Cada `FlowNode` representa una instrucción, pregunta, contenido o cierre. Una `FlowTransition` conecta un nodo con el siguiente según la respuesta elegida. Esto permite que el Call Assistant muestre siempre el siguiente paso, en lugar de presentar un documento largo.
