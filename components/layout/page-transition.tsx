"use client";
import * as React from "react";
import { usePathname } from "next/navigation";

/** Re-mounts children on every route change to replay the fade-up entrance. */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="animate-fade-up">
      {children}
    </div>
  );
}
