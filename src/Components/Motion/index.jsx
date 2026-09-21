/**
 * Reusable motion primitives.
 *
 * Each one collapses to a plain, static render when the viewer has
 * asked for reduced motion, so no surface depends on movement to be
 * readable or usable.
 */
import { motion as Motion, useReducedMotion, useInView, useSpring, useMotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { fadeUp, stagger as staggerVariants, SPRING, EASE } from './variants';

/* ------------------------------------------------------------------
   Reveal — animates its children in the first time they scroll into
   view. `once` keeps it from re-firing as the user scrolls back up.
   ------------------------------------------------------------------ */
export function Reveal({
  children,
  delay = 0,
  y = 20,
  duration = 0.6,
  once = true,
  amount = 0.2,
  className,
  as = 'div',
  ...rest
}) {
  const reduce = useReducedMotion();
  const MotionTag = Motion[as] || Motion.div;

  if (reduce) {
    const Tag = as;
    return <Tag className={className} {...rest}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/* ------------------------------------------------------------------
   Stagger / StaggerItem — a parent cascade for grids and lists.
   ------------------------------------------------------------------ */
export function Stagger({
  children,
  className,
  delayChildren = 0,
  staggerChildren = 0.06,
  once = true,
  amount = 0.15,
  ...rest
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} {...rest}>{children}</div>;

  return (
    <Motion.div
      className={className}
      variants={staggerVariants(staggerChildren, delayChildren)}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      {...rest}
    >
      {children}
    </Motion.div>
  );
}

export function StaggerItem({ children, className, variants = fadeUp, ...rest }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} {...rest}>{children}</div>;
  return (
    <Motion.div className={className} variants={variants} {...rest}>
      {children}
    </Motion.div>
  );
}

/* ------------------------------------------------------------------
   AnimatedCounter — counts a number up when it scrolls into view.
   Uses a spring so the last digits ease in rather than stopping dead.
   ------------------------------------------------------------------ */
export function AnimatedCounter({
  value,
  duration = 1.6,
  prefix = '',
  suffix = '',
  decimals = 0,
  className,
}) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    // With reduced motion the final value is derived below, so there is
    // nothing to animate and no state to set here.
    if (reduce || !inView) return;

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / (duration * 1000), 1);
      // easeOutExpo — fast out of the gate, long gentle tail
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(value * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setDisplay(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  const shown = reduce ? value : display;

  return (
    <span ref={ref} className={className}>
      {prefix}
      {shown.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}

/* ------------------------------------------------------------------
   Magnetic — the element leans toward the cursor, then springs back.
   Pointer-driven only, and disabled on touch and reduced motion.
   ------------------------------------------------------------------ */
export function Magnetic({ children, strength = 0.25, className, ...rest }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);

  if (reduce) return <div className={className} {...rest}>{children}</div>;

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => { x.set(0); y.set(0); };

  return (
    <Motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: 'inline-block' }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      {...rest}
    >
      {children}
    </Motion.div>
  );
}

/* ------------------------------------------------------------------
   Skeleton — shaped placeholder for content that is still loading.
   ------------------------------------------------------------------ */
export function Skeleton({ width = '100%', height = 16, radius, style, className }) {
  return (
    <div
      className={`pl-skeleton ${className || ''}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}
