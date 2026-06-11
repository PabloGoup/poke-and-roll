ALTER TABLE "sesiones_pedido"
ADD COLUMN IF NOT EXISTS "estado_conversacional" JSONB NOT NULL DEFAULT '{}';
