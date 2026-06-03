import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
          localId:      usuario.localId      ?? null,
          localSlug:    usuario.local?.slug  ?? null,
          localNombre:  usuario.local?.nombre ?? null,
        };
      },
    }),
  ],

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
      }
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
});
