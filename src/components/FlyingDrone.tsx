import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useSpring, useMotionValue, useTransform } from "motion/react";
import droneImg from "@/assets/drone.png";

/**
 * Drone appears INSIDE the festival hero ("remembered in light") section.
 * As the user scrolls past the hero, the drone flies down and lands on
 * #drone-landing-pad placed in the section just below the hero.
 *
 * Requirements:
 *  - #festival-hero wraps the festival hero section
 *  - #drone-landing-pad is placed just below the festival hero
 */
export function FlyingDrone() {
  const { scrollY } = useScroll();

  const droneY = useMotionValue(200);
  const droneX = useMotionValue(100);
  const droneRot = useMotionValue(-6);
  const landed = useMotionValue(0);
  const visible = useMotionValue(0);

  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

  const heroTopRef = useRef(0);
  const heroBottomRef = useRef(1000);
  const padXRef = useRef(400);
  const padYRef = useRef(1200);

  const measure = () => {
    const newVw = window.innerWidth;
    setVw(newVw);

    const heroEl = document.getElementById("festival-hero");
    const padEl = document.getElementById("drone-landing-pad");

    if (heroEl) {
      const r = heroEl.getBoundingClientRect();
      heroTopRef.current = r.top + window.scrollY;
      heroBottomRef.current = r.bottom + window.scrollY;
    }

    if (padEl) {
      const r = padEl.getBoundingClientRect();
      padXRef.current = r.left + r.width / 2 - 75;
      padYRef.current = r.top + window.scrollY + r.height / 2 - 60;
    }
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    const t1 = setTimeout(measure, 300);
    const t2 = setTimeout(measure, 1000);
    const t3 = setTimeout(measure, 2500);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  useEffect(() => {
    const update = (sy: number) => {
      const heroTop = heroTopRef.current;
      const padX = padXRef.current;
      const padY = padYRef.current;
      const startX = vw * 0.08;

      const showFrom = heroTop - 100;
      const hideAfter = padY + 300;
      const vis = sy >= showFrom && sy <= hideAfter ? 1 : 0;
      visible.set(vis);

      if (sy < showFrom) {
        droneX.set(startX);
        droneY.set(heroTop + 160);
        droneRot.set(-6);
        landed.set(0);
        return;
      }

      const flightStart = heroTop;
      const flightEnd = Math.max(padY - 150, heroTop + 200);
      const t = Math.max(0, Math.min(1, (sy - flightStart) / (flightEnd - flightStart)));

      const yFlying = sy + 160;
      const y = t < 1 ? Math.min(yFlying, padY) : padY;

      const swoop =
        startX +
        (padX - startX) * t +
        Math.sin(t * Math.PI * 1.4) * vw * 0.1 * (1 - t);
      const x = t < 1 ? swoop : padX;

      const rot = t < 1 ? Math.sin(t * Math.PI * 2) * 8 - 3 * (1 - t) : 0;

      droneY.set(y);
      droneX.set(x);
      droneRot.set(rot);
      landed.set(t >= 1 ? 1 : 0);
    };

    update(window.scrollY);

    const unsub = scrollY.on("change", update);
    const onResize = () => update(window.scrollY);
    window.addEventListener("resize", onResize);
    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
    };
  }, [vw, scrollY, droneY, droneX, droneRot, landed, visible]);

  const smoothY = useSpring(droneY, { stiffness: 100, damping: 24, mass: 0.5 });
  const smoothX = useSpring(droneX, { stiffness: 80, damping: 22, mass: 0.6 });
  const smoothRot = useSpring(droneRot, { stiffness: 90, damping: 20 });

  const flyingOpacity = useTransform([landed, visible], ([l, v]: number[]) => (1 - l) * v);
  const landedOpacity = useTransform([landed, visible], ([l, v]: number[]) => l * v);

  return (
    <motion.div
      aria-hidden
      style={{ x: smoothX, y: smoothY, rotate: smoothRot }}
      className="pointer-events-none absolute left-0 top-0 z-40 hidden md:block"
    >
      {/* Flying state — bobs gently */}
      <motion.div style={{ opacity: flyingOpacity }} className="animate-drift relative">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/25 blur-3xl" />
        <img
          src={droneImg}
          alt=""
          width={180}
          height={120}
          className="h-auto w-[140px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] lg:w-[170px]"
        />
        <span className="absolute -bottom-2 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_20px_hsl(20,90%,60%)] animate-ping" />
      </motion.div>

      {/* Landed state — static */}
      <motion.div style={{ opacity: landedOpacity }} className="absolute inset-0">
        <div className="absolute inset-0 -z-10 rounded-full bg-primary/20 blur-2xl" />
        <img
          src={droneImg}
          alt=""
          width={180}
          height={120}
          className="h-auto w-[140px] drop-shadow-[0_15px_25px_rgba(0,0,0,0.5)] lg:w-[170px]"
        />
      </motion.div>
    </motion.div>
  );
}
