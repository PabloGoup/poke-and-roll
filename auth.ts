/**
 * Configuración completa de NextAuth — Node.js runtime únicamente.
 * Incluye bcryptjs y prisma. NO importar desde middleware.
 */
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",      type: "email"    },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const usuario = await prisma.usuario.findUnique({
          where:   { email: credentials.email as string },
          include: { local: { select: { id: true, nombre: true, slug: true } } },
        });

        if (!usuario || !usuario.activo) return null;

        const ok = await compare(credentials.password as string, usuario.passwordHash);
        if (!ok) return null;

        return {
          id:           usuario.id,
          email:        usuario.email,
          name:         usuario.nombre,
          rol:          usuario.rol,
          localId:      usuario.localId       ?? null,
          localSlug:    usuario.local?.slug   ?? null,
          localNombre:  usuario.local?.nombre ?? null,
        };
      },
    }),
  ],
});
