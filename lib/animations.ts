import type { Variants } from "motion/react";

/** Signature easing for a smooth, premium feel (cubic-bezier ease-out-quint). */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Parent container that staggers its `fadeUp`/`fadeIn` children. */
export const containerStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.28, ease: EASE } },
};
