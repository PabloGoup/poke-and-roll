/**
 * Configuración Edge-compatible de NextAuth.
 * NO importar bcryptjs, prisma ni ningún módulo Node.js aquí.
 * Este archivo lo usa el middleware (Edge Runtime).
 */
import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id          = user.id;
        token.rol         = (user as { rol: string }).rol;
        token.localId     = (user as { localId: string | null }).localId;
        token.localSlug   = (user as { localSlug: string | null }).localSlug;
        token.localNombre = (user as { localNombre: string | null }).localNombre;
        return token;
      }
      // Invalidar tokens viejos sin rol (pre-migración)
      if (!token.rol || token.id === "1") return null;
      return token;
    },

    async session({ session, token }) {
      session.user.id          = token.id          as string;
      session.user.rol         = token.rol         as string;
      session.user.localId     = token.localId     as string | null;
      session.user.localSlug   = token.localSlug   as string | null;
      session.user.localNombre = token.localNombre as string | null;
      return session;
    },
  },

  providers: [], // los providers reales están en auth.ts (Node.js runtime)
};
