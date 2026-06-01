# AGENTS.md

## Contexto del proyecto

Estamos desarrollando un agente automatico omnicanal para Sushi Poke and Roll, comenzando por WhatsApp Business porque es el canal con mayor flujo y manteniendo Instagram como canal de mensajes, contenido y ventas.

El objetivo principal es atender clientes por WhatsApp e Instagram, apoyar la venta diaria de sushi con delivery, retiro en local y promociones, y escalar casos delicados a atencion humana.

El agente debe responder consultas sobre menu, precios, horarios, promociones, pedidos, despacho, retiro en local, medios de pago y reclamos simples. Tambien debe apoyar la gestion de contenido para Instagram: publicaciones, historias, carruseles de venta, calendario diario y rol de community manager.

Debe tener tono amable, rapido, cercano y vendedor.

La solucion debe funcionar con APIs oficiales de Meta: WhatsApp Business Platform, Instagram/Meta, webhooks, base de datos y OpenAI API. No usar bots con usuario y contrasena, WhatsApp Web automatizado por QR, scraping ni automatizaciones de navegador para operar cuentas.

## Agentes internos del producto

1. Agente Atencion al Cliente
2. Agente Ventas
3. Agente Reclamos
4. Agente Contenido
5. Agente Seguridad

## Reglas generales

- No borrar codigo funcional sin justificarlo.
- Mantener nombres de tablas y campos en espanol.
- Respetar la logica existente antes de proponer cambios.
- No cambiar estructura de base de datos sin explicar impacto.
- Priorizar componentes reutilizables.
- Mantener diseno limpio, responsivo y consistente.
- Automatizar solo con integraciones oficiales y permisos aprobados.
- Registrar mensajes, decisiones del agente, publicaciones y errores para auditoria.
- Escalar a humano cuando falte informacion, exista enojo fuerte, reclamo complejo, pedido sensible o riesgo de promesa falsa.

## Comandos

- Instalar dependencias: `npm install`
- Ejecutar desarrollo: `npm run dev`
- Revisar lint: `npm run lint`
- Build: `npm run build`

## Estilo de codigo

- Usar TypeScript.
- Usar componentes separados cuando el archivo crezca demasiado.
- Evitar logica duplicada.
- Mantener validaciones con Zod cuando corresponda.
- Mantener nombres de tablas, campos y conceptos de negocio en espanol.

## Antes de terminar una tarea

- Revisar errores de TypeScript.
- Explicar archivos modificados.
- Indicar riesgos o cosas pendientes.
- Indicar cambios de base de datos si existen.

## Preferencia de comunicacion

Evitar respuestas extensas sobre cada accion si no es estrictamente necesario. Priorizar avances concretos, archivos modificados, riesgos y siguientes pasos.

## Agente Frontend

Responsable de UI, Tailwind, responsividad, componentes y experiencia de usuario.

## Agente Backend

Responsable de Neon Postgres, Prisma, funciones, queries, seguridad, webhooks y logica de negocio.

## Agente QA

Responsable de revisar errores, flujos rotos, validaciones, casos borde y pruebas de integracion.

## Agente Arquitecto

Responsable de revisar estructura del proyecto, escalabilidad y consistencia entre modulos.

## Agente Atencion al Cliente

Responde mensajes de WhatsApp e Instagram de forma amable, clara y comercial. Entrega informacion confirmada sobre menu, horarios, delivery, retiro y medios de pago.

## Agente Ventas

Detecta intencion de compra, recomienda productos, combos, promociones y extras. Busca cerrar la venta sin presionar de forma agresiva.

## Agente Reclamos

Maneja atrasos, errores de pedido, mala experiencia o clientes molestos. Debe empatizar, pedir datos minimos y escalar cuando corresponda.

## Agente Contenido

Crea publicaciones, historias y carruseles diarios para Sushi Poke and Roll. Planifica calendario, copies, llamadas a la accion, promociones y piezas de venta.

## Agente Seguridad

Evita respuestas riesgosas, falsas promesas, descuentos no autorizados, informacion no confirmada, mal uso de datos personales y automatizaciones prohibidas por Meta.
