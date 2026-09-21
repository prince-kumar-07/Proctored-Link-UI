import { motion as Motion, useReducedMotion } from 'framer-motion';
import { EASE } from './variants';

/**
 * Route-level entrance.
 *
 * Mount-only by design. An exit animation would have to run inside
 * AnimatePresence with mode="wait", which delays the next route until
 * the old one finishes leaving — that reads as lag on every guarded
 * redirect (PrivateRoute / OpenRoute) and can flash the intermediate
 * route. A short entrance gives the same sense of composure with none
 * of that risk.
 */
export default function PageTransition({ children, className, y = 10, duration = 0.4 }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <Motion.div
      className={className}
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, ease: EASE }}
    >
      {children}
    </Motion.div>
  );
}
