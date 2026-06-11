---
name: director-integracion
description: >
  Director técnico para rescatar, revisar, implementar y validar la integración
  entre Poke and roll (Next.js, Prisma, Neon, WhatsApp/Meta) y Pizza_and_roll
  (Vite, React, Supabase POS/cocina/pedidos). Úsalo cuando se trabaje en el
  flujo WhatsApp → agente modular → orden Supabase → POS/cocina → notificación.
---

# Director de Integración

## Propósito

Coordinar la integración end-to-end entre:

- **Poke and roll**: `/Users/ptoledos/Documents/Poke and roll`
- **Pizza_and_roll**: `/Users/ptoledos/Pizza_and_roll`

El flujo objetivo es:

```text
WhatsApp -> agente modular -> orden en Supabase -> POS/cocina -> pedido listo -> notificación WhatsApp
```

## Uso

1. Lee primero `references/progress.md` para conocer el estado real.
2. Si tocas la frontera entre proyectos, lee `references/api-contracts.md`.
3. Si tocas módulos del agente, lee `references/shared-types.md` y `references/module-flow.md`.
4. Si hay dudas de despliegue, webhooks o variables, lee `references/infrastructure.md`.
5. Si aparece un bloqueo nuevo, actualiza `references/bloqueantes.md` antes de seguir.

## Reglas Arquitectónicas

- WhatsApp es el canal operativo para pedidos.
- Instagram y Facebook no gestionan pedidos; derivan a WhatsApp/sitio y responden dudas generales.
- `despacharModulo()` en `lib/modulos/dispatcher.ts` es la API pública del agente modular.
- Los módulos M01-M13 deben registrar sus decisiones en `LogModulo`.
- Las órdenes se crean en Supabase con `source = 'whatsapp'` y productos resueltos por UUID real.
- El POS/cocina vive en `Pizza_and_roll`; Poke and roll no debe duplicar ese módulo.
- No documentar tokens, service role keys ni webhook secrets reales en el skill.

## Specs De Agentes

Hay 25 specs operativas en `agents/`, numeradas `00` a `24`. Son guías de trabajo, no metadata de UI.

- `00-02`: auditoría, arquitectura y operación restaurante.
- `03-09`: Prisma/Neon, Supabase RPC, productos, zonas, WhatsApp multi-tenant, seguridad y DevOps.
- `10-12`: dispatcher, prompts y estado del agente modular.
- `13-19`: handlers M01-M13, horarios, API, notificaciones y resiliencia.
- `20-23`: cocina, realtime, POS/caja y cliente frecuente.
- `24`: pruebas E2E.

## Validación Mínima

Antes de dar por cerrada una intervención:

- `npm run build` en Poke and roll.
- `npm run build` en Pizza_and_roll si se tocó POS/cocina/SQL.
- Revisar que `progress.md` no contradiga los archivos existentes.
- Confirmar que no se agregaron secretos reales a documentación.
