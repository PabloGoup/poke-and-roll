"use client";

import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

type Props = {
  backToAdmin?: boolean;
  dark?: boolean;
};

export function SessionActions({ backToAdmin = false, dark = false }: Props) {
  return (
    <div className={`session-actions${dark ? " dark" : ""}`}>
      {backToAdmin && (
        <Link className="session-action" href="/admin">
          <ArrowLeft size={15} />
          Locales
        </Link>
      )}
      <button
        className="session-action"
        onClick={() => signOut({ callbackUrl: "/login" })}
        type="button"
      >
        <LogOut size={15} />
        Cerrar sesión
      </button>
    </div>
  );
}
