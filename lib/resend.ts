import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

// Proxy for backward compat
export const resend = new Proxy({} as Resend, {
  get(_target, prop) {
    return (getResend() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const FROM = process.env.FROM_EMAIL || "noreply@rentnest.app";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
