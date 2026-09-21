/**
 * Shared motion vocabulary.
 *
 * Every surface pulls its timing from here so the whole product
 * accelerates and settles the same way. The curves mirror the CSS
 * custom properties in styles/tokens.css — keep the two in step.
 */

export const EASE = [0.16, 1, 0.3, 1];        // signature settle
export const EASE_OUT = [0.22, 1, 0.36, 1];
export const EASE_BACK = [0.34, 1.56, 0.64, 1];

/** Spring used for anything the pointer drives directly. */
export const SPRING = { type: 'spring', stiffness: 400, damping: 30, mass: 0.6 };
export const SPRING_SOFT = { type: 'spring', stiffness: 260, damping: 26 };

/** Rise-and-fade. The workhorse entrance. */
export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: EASE } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: EASE } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Parent for lists and grids. Children inherit the cascade, which is
 * what makes a table or card grid feel composed rather than dumped.
 */
export const stagger = (staggerChildren = 0.06, delayChildren = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren, delayChildren } },
});

/** Route-level transition. Deliberately understated. */
export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

/** Standard interactive feedback for buttons and cards. */
export const tap = { scale: 0.97 };
export const liftHover = { y: -4, transition: SPRING };
