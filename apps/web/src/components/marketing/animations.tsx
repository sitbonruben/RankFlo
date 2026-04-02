"use client";

import { useRef, useEffect, useState, type ReactNode } from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variant,
} from "framer-motion";

/* ── Fade Up ─────────────────────────────────────────────────────────────────
   Fade in + slide up from below. Most common entrance animation. */

export function FadeUp({
  children,
  delay = 0,
  duration = 0.6,
  y = 40,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Fade In ─────────────────────────────────────────────────────────────────
   Opacity only — no movement. Good for badges, labels. */

export function FadeIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Scale In ────────────────────────────────────────────────────────────────
   Scale from 0.95 + fade. Good for cards, pricing. */

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration, delay, ease: [0.25, 0.4, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Stagger Children ────────────────────────────────────────────────────────
   Wrapper that staggers its direct children entrances. */

const containerVariants = {
  hidden: {},
  visible: (stagger: number) => ({
    transition: { staggerChildren: stagger },
  }),
};

const childVariants = {
  hidden: { opacity: 0, y: 30 } as Variant,
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.4, 0.25, 1] },
  } as Variant,
};

export function StaggerChildren({
  children,
  stagger = 0.08,
  className,
}: {
  children: ReactNode;
  stagger?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  return (
    <motion.div
      ref={ref}
      variants={containerVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      custom={stagger}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* Export the child variant so items can use it */
export { childVariants as staggerChildVariants };
export { motion };

/* ── Parallax Float ──────────────────────────────────────────────────────────
   3D perspective tilt that flattens as element scrolls into center. */

export function ParallaxFloat({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [12, 0, 0, -4]);
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -30]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 1], [0.96, 1, 0.98]);

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        y,
        scale,
        transformPerspective: 1200,
        transformOrigin: "center bottom",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── Count Up ────────────────────────────────────────────────────────────────
   Animates a number from 0 to target when scrolled into view. */

export function CountUp({
  target,
  duration = 1.5,
  prefix = "",
  suffix = "",
  className,
}: {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const step = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, target, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}{value.toLocaleString()}{suffix}
    </span>
  );
}

/* ── Re-export AnimatePresence for ThreeModes ────────────────────────────── */
export { AnimatePresence };
