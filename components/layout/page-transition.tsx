"use client";
import * as React from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EASE } from "@/lib/animations";

/** Animate enter + exit on every route change (keyed on the path). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.995 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.995 }}
        transition={{ duration: reduce ? 0 : 0.3, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
