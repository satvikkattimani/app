import { useEffect, useRef } from "react";
import Lenis from "lenis";

export const useLenis = (enabled = true) => {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const lenis = new Lenis({ lerp: 0.085, smoothWheel: true, anchors: { offset: -80 } });
    ref.current = lenis;
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); ref.current = null; };
  }, []);
  useEffect(() => {
    if (!ref.current) return;
    if (enabled) ref.current.start(); else ref.current.stop();
  }, [enabled]);
  return ref;
};
