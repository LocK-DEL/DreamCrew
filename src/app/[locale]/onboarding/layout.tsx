import type { ReactNode } from "react";

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-[calc(100vh-4.5rem)]">{children}</div>;
}
