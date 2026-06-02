const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M20.52 3.48A12 12 0 0 0 3.48 20.52 12 12 0 0 0 20.52 3.48zM12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z" fill="currentColor" opacity=".3"/>
        <path d="M17.47 6.18C15.77 4.48 13.5 3.5 11.1 3.5c-5.24 0-9.5 4.26-9.5 9.5 0 1.67.44 3.3 1.27 4.76L2 21l3.24-1.87A9.46 9.46 0 0 0 11.1 20.6c5.24 0 9.5-4.26 9.5-9.5 0-2.4-.98-4.77-2.63-6.42zM11.1 19.1a7.98 7.98 0 0 1-4.06-1.1l-.29-.17-3 .79.8-2.93-.19-.3a7.97 7.97 0 0 1-1.26-4.29c0-4.41 3.59-8 8-8 2.14 0 4.15.83 5.66 2.34a7.96 7.96 0 0 1 2.34 5.66c0 4.41-3.59 8-8 8zm4.39-5.99c-.24-.12-1.41-.7-1.63-.77-.22-.08-.38-.12-.54.12-.16.24-.62.77-.76.93-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.92-1.19-.71-.63-1.19-1.41-1.33-1.65-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.3-.74-1.78-.19-.47-.39-.4-.54-.41-.14-.01-.3-.01-.46-.01s-.42.06-.64.3c-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.59 4.11 3.63.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.41-.58 1.61-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28z" fill="#25D366"/>
      </svg>
    ),
    color: "#25D366",
    colorSoft: "rgba(37,211,102,0.08)",
    title: "WhatsApp Business",
    description:
      "Responde automáticamente, gestiona pedidos y convierte conversaciones en ventas. Tu agente de IA trabaja mientras tú descansas.",
    tag: "Activo 24/7",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <defs>
          <linearGradient id="ig-grad" x1="0" y1="24" x2="24" y2="0">
            <stop offset="0%" stopColor="#FD5949"/>
            <stop offset="50%" stopColor="#D6249F"/>
            <stop offset="100%" stopColor="#285AEB"/>
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig-grad)"/>
        <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.5" fill="none"/>
        <circle cx="17.5" cy="6.5" r="1.2" fill="white"/>
      </svg>
    ),
    color: "#D6249F",
    colorSoft: "rgba(214,36,159,0.08)",
    title: "Instagram",
    description:
      "Gestiona DMs y comentarios con IA. Nunca pierdas un cliente potencial que llega por tu perfil.",
    tag: "DMs automáticos",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="#1877F2"/>
        <path d="M13.5 21v-7.5H16l.5-3H13.5V8.5c0-.83.41-1.5 1.5-1.5H17V4s-1.3-.25-2.5-.25C11.5 3.75 10 5.5 10 8v2.5H7.5v3H10V21h3.5z" fill="white"/>
      </svg>
    ),
    color: "#1877F2",
    colorSoft: "rgba(24,119,242,0.08)",
    title: "Facebook",
    description:
      "Atiende mensajes de Messenger y comentarios en publicaciones. Mantén tu comunidad activa sin esfuerzo.",
    tag: "Mensajería y posts",
  },
];

export function LandingFeatures() {
  return (
    <section className="goup-features" id="features">
      <div className="goup-features-container">
        <div className="goup-section-header">
          <span className="goup-section-eyebrow">Plataforma omnicanal</span>
          <h2 className="goup-section-title">
            Todos tus canales,<br />un solo lugar
          </h2>
          <p className="goup-section-description">
            Integra WhatsApp, Instagram y Facebook con un agente de IA entrenado
            específicamente para tu negocio.
          </p>
        </div>

        <div className="goup-features-grid">
          {features.map((f) => (
            <div
              key={f.title}
              className="goup-feature-card"
              style={{ "--card-accent": f.color, "--card-soft": f.colorSoft } as React.CSSProperties}
            >
              <div className="goup-feature-icon">{f.icon}</div>
              <div className="goup-feature-tag">{f.tag}</div>
              <h3 className="goup-feature-title">{f.title}</h3>
              <p className="goup-feature-description">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
