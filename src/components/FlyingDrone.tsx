import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "motion/react";
import droneImg from "@/assets/drone.png";

/**
 * Drone takes off from the hero, flies down as the user scrolls, and lands
 * on the #drone-landing-pad. Once landed it stays put no matter how far
 * the user scrolls. Scrolling back up lifts it off the pad again.
 */
export function FlyingDrone() {
  const { scrollY } = useScroll();
  const droneY = useMotionValue(120);
  const droneX = useMotionValue(80);
  const droneRot = useMotionValue(-6);
  const landed = useMotionValue(0); // 0 = flying, 1 = landed

  const [vw, setVw] = useState(1200);
  const [pad, setPad] = useState({ y: 800, x: 800 });

  useEffect(() => {
    const measure = () => {
      setVw(window.innerWidth);
      const el = document.getElementById("drone-landing-pad");
      if (el) {
        const rect = el.getBoundingClientRect();
        const padCenterY = rect.top + window.scrollY + rect.height / 2;
        const padCenterX = rect.left + rect.width / 2;
        setPad({ y: padCenterY - 60, x: padCenterX - 75 });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    const t1 = setTimeout(measure, 200);
    const t2 = setTimeout(measure, 800);
    return () => {
      window.removeEventListener("resize", measure);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const startY = 140; // hero altitude (viewport units)
    const startX = vw * 0.08;

    const update = () => {
      const sy = window.scrollY;
      // Distance over which the drone "flies" from hero down to the pad.
      // Pad becomes reachable when user has scrolled most of the hero away.
      const flightStart = 0;
      const flightEnd = Math.max(pad.y - 200, 100); // land slightly before pad reaches top
      const t = Math.max(0, Math.min(1, (sy - flightStart) / (flightEnd - flightStart)));

      // Position: interpolate from hero start → pad
      const yFlight = startY + sy; // drone falls with scroll
      const yLanded = pad.y; // absolute Y of pad
      const y = t < 1 ? Math.min(yFlight, yLanded) : yLanded;

      // S-curve X swoop while flying, settles on pad X when landed
      const swoop =
        startX +
        (pad.x - startX) * t +
        Math.sin(t * Math.PI * 1.5) * vw * 0.12 * (1 - t);
      const x = t < 1 ? swoop : pad.x;

      const rot = t < 1 ? Math.sin(t * Math.PI * 2) * 10 - 4 * (1 - t) : 0;

      droneY.set(y);
      droneX.set(x);
      droneRot.set(rot);
      landed.set(t >= 1 ? 1 : 0);
    };

    update();
    const unsub = scrollY.on("change", update);
    window.addEventListener("resize", update);
    return () => {
      unsub();
      window.removeEventListener("resize", update);
    };
  }, [pad, vw, scrollY, droneY, droneX, droneRot, landed]);

  const smoothY = useSpring(droneY, { stiffness: 90, damping: 22, mass: 0.5 });
  const smoothX = useSpring(droneX, { stiffness: 70, damping: 20, mass: 0.6 });
  const smoothRot = useSpring(droneRot, { stiffness: 80, damping: 18 });

  const flyingOpacity = useTransform(landed, [0, 1], [1, 0]);
  const landedOpacity = useTransform(landed, [0, 1], [0, 1]);

  return (
    <motion.div
      aria-hidden
      style={{ x: smoothX, y: smoothY, rotate: smoothRot }}
      className="pointer-events-none absolute left-0 top-0 z-40 hidden md:block"
    >
      {/* flying drone (bobs) */}
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
      {/* landed drone (static, no bobbing) */}
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
