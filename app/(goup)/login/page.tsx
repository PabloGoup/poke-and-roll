import { Suspense } from "react";
import { LoginForm } from "../_components/login-form";

export const metadata = {
  title: "Iniciar sesión — Goup Soluciones",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
