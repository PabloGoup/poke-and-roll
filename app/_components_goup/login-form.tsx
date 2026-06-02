"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";

  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email") as string;
    const password = data.get("password") as string;
    setError("");
    setIsPending(true);
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (!result || result.error || result.ok === false) {
        setError("Credenciales incorrectas. Intenta de nuevo.");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Error al conectar. Intenta de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="goup-login-wrapper">
      <div className="goup-login-card">
        <div className="goup-login-logo">
          <Image src="/images/goup.png" alt="Goup Soluciones" width={140} height={48} style={{ objectFit: "contain" }} />
        </div>

        <div className="goup-login-header">
          <h1 className="goup-login-title">Bienvenido de vuelta</h1>
          <p className="goup-login-subtitle">Inicia sesión para acceder a tu plataforma</p>
        </div>

        <form className="goup-login-form" onSubmit={handleSubmit}>
          <div className="goup-field">
            <label className="goup-label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              className="goup-input"
              placeholder="admin@goup.cl"
              required
              autoComplete="email"
            />
          </div>

          <div className="goup-field">
            <label className="goup-label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              name="password"
              type="password"
              className="goup-input"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="goup-login-error" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="goup-btn-primary" disabled={isPending}>
            {isPending ? "Ingresando…" : "Ingresar →"}
          </button>
        </form>

        <p className="goup-login-footer">
          ¿Problemas para acceder?{" "}
          <a href="mailto:soporte@goup.cl" className="goup-link">
            Contacta soporte
          </a>
        </p>
      </div>
    </div>
  );
}
