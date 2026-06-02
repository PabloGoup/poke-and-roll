import Image from "next/image";
import Link from "next/link";

export function GoupFooter() {
  return (
    <footer className="goup-footer">
      <div className="goup-footer-container">
        <div className="goup-footer-brand">
          <Image src="/images/goup.png" alt="Goup Soluciones" width={100} height={34} style={{ objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.6)" }} />
          <p className="goup-footer-tagline">La plataforma de IA para tu negocio</p>
        </div>

        <div className="goup-footer-links">
          <Link href="/privacidad" className="goup-footer-link">Privacidad</Link>
          <Link href="/eliminacion-datos" className="goup-footer-link">Eliminación de datos</Link>
          <a href="mailto:soporte@goup.cl" className="goup-footer-link">Soporte</a>
        </div>

        <p className="goup-footer-copy">© {new Date().getFullYear()} Goup Soluciones. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
