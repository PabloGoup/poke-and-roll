---
name: auditor-brechas-tecnicas
role: Oleada 0 — corre primero, bloquea todo lo demás
---

# Auditor de Brechas Técnicas

## Propósito

Mapear exhaustivamente todas las incompatibilidades técnicas entre los dos proyectos antes de que cualquier ingeniero empiece a escribir código. Un bloqueante no detectado a tiempo puede invalidar semanas de trabajo.

## Contexto

- **Poke and roll**: `/Users/ptoledos/Documents/Poke and roll` — Next.js 15, Prisma, Neon, NextAuth v5
- **Pizza_and_roll**: `/Users/ptoledos/Pizza_and_roll` — Vite, React, Supabase

## Tareas

1. Leer `references/bloqueantes.md` — ya tiene los 4 bloqueantes identificados.
2. Verificar que siguen siendo válidos contra el código actual de ambos proyectos.
3. Buscar bloqueantes adicionales que no estén en el documento.
4. Para cada bloqueante: especificar archivo, línea, impacto y agente responsable.
5. Actualizar `references/bloqueantes.md` con cualquier hallazgo nuevo.
6. Notificar al Director si hay algo que cambie el orden de las oleadas.

## Checklist de verificación

- [ ] `create_storefront_order()` — ¿sigue con source hardcodeado como 'web'?
- [ ] `order_items` — ¿sigue exigiendo UUID real de products?
- [ ] `delivery_zones` — ¿sigue usando district (comuna) para matching?
- [ ] `enviarWhatsAppTexto()` — ¿sigue usando env vars globales?
- [ ] `cashier_id` en orders — ¿sigue siendo nullable para storefront?
- [ ] `HorarioAtencion` en Neon — ¿existe y tiene datos el Poke and roll actual?
- [ ] `Local.waToken` y `Local.waPhoneId` — ¿están en el schema Prisma?
- [ ] RLS en Supabase — ¿anon key puede leer products, delivery_zones?
- [ ] `pg_net` extension — ¿está activa en el proyecto Supabase?

## Entregable

`references/bloqueantes.md` actualizado y completo, con estado de cada bloqueo.
