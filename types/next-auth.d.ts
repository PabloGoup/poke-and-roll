import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:           string;
      email:        string;
      name:         string;
      rol:          string;          // "super_admin" | "admin_local" | "operador"
      localId:      string | null;
      localSlug:    string | null;
      localNombre:  string | null;
    };
  }
}
