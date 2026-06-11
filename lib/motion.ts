/**
 * Single source of truth for "should we animate?" — used by the JS-driven
 * canvases (the WebGL plasma + the constellation field). CSS-driven animation
 * is gated separately in globals.css via the `data-force-motion` attribute.
 *
 * Motion is considered reduced when the visitor has explicitly turned it off
 * with the in-app toggle (`data-force-motion="false"`) OR — absent an explicit
 * choice — when the operating system asks for reduced motion. An explicit
 * `data-force-motion="true"` always wins (full motion), even if the OS prefers
 * reduced.
 */
export function prefersReducedMotion(): boolean {
  if (typeof document === "undefined") return false;
  const force = document.documentElement.getAttribute("data-force-motion");
  if (force === "false") return true;
  if (force === "true") return false;
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Subscribe to changes in the effective motion preference. Fires when the user
 * flips the in-app toggle (which mutates `data-force-motion` on <html>) or when
 * the OS-level setting changes. Returns an unsubscribe function.
 */
export function onMotionPreferenceChange(cb: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(cb);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-force-motion"],
  });
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => {
    observer.disconnect();
    mq.removeEventListener("change", cb);
  };
}
