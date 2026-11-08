import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function LandingScrollProvider({ children, lenisRef, velocityRef }) {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: false });
    const update = (time) => lenis.raf(time * 1000);

    if (lenisRef) lenisRef.current = lenis;

    const onScroll = (event) => {
      if (velocityRef) velocityRef.current = event.velocity || 0;
      ScrollTrigger.update();
    };

    lenis.on("scroll", onScroll);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(update);
      lenis.destroy();
      if (lenisRef) lenisRef.current = null;
      if (velocityRef) velocityRef.current = 0;
    };
  }, [lenisRef, velocityRef]);

  return children;
}
