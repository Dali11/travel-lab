"use client";

import { useEffect } from "react";
import { LoginForm } from "@/components/admin/LoginForm";

/**
 * Login page.
 *
 * Unauthenticated visitors see this. After a successful POST /api/admin/login
 * the server sets an HttpOnly session cookie, and we redirect to /admin.
 */
export default function LoginPage() {
  useEffect(() => {
    // Redirect away if a valid session is somehow already present.
    fetch("/api/admin/me").then(async (res) => {
      const body = await res.json().catch(() => ({}));
      if (body.authenticated) {
        window.location.href = "/admin";
      }
    });
  }, []);

  return <LoginForm />;
}
