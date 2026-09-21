import { useEffect, useRef } from "react";

/**
 * Standard modal behaviour: lock background scroll while open, and close
 * on Escape.
 *
 * Each tool previously rolled its own effect that set
 * `document.body.style.overflow` to "auto" on close rather than restoring
 * whatever was there before, which clobbers any page that sets its own
 * overflow. This restores the previous value instead.
 *
 * @param {boolean}  isOpen
 * @param {Function} onDismiss  called when Escape is pressed
 */
export default function useModalDismiss(isOpen, onDismiss) {
  // Held in a ref so a new inline callback each render does not
  // re-subscribe the listener.
  const cb = useRef(onDismiss);
  cb.current = onDismiss;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e) => {
      if (e.key === "Escape") cb.current?.();
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);
}
