import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your RentNest account to manage your rental properties.",
  robots: { index: false },
};

export default function LoginPage() {
  return <LoginClient />;
}
