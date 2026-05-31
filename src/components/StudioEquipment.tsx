import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import gearCamera from "@/assets/camera.jpeg";
import gearLenses from "@/assets/lens.jpeg";
import gearDrone from "@/assets/drone.jpeg";
import gearLighting from "@/assets/filtre.jpeg";
const gear = [
  {
    img: gearCamera,
    tag: "01 · Capture",
    title: "Cinema-grade bodies",
    text: "Full-frame mirrorless and cinema cameras shooting 6K RAW. We freeze a lamp's flicker and a dancer's blur with equal ease — every frame archival-sharp.",
    specs: ["6K RAW video", "Dual native ISO", "15-stop dynamic range"],
  },
  {
    img: gearLenses,
    tag: "02 · Glass",
    title: "A wall of prime lenses",
    text: "From a creamy 85mm portrait to a sweeping 14mm temple-wide, our prime kit renders the festival's colour and bokeh exactly as the eye remembers it.",
    specs: ["14mm – 200mm range", "f/1.2 fast primes", "Cine de-clicked aperture"],
  },
  {
    img: gearDrone,
    tag: "03 · Sky",
    title: "Cinematic drones",
    text: "DGCA-licensed, crowd-safe flight platforms with Hasselblad sensors. The procession from 80 metres up — the shot that simply doesn't exist from the ground.",
    specs: ["5.1K ProRes", "Obstacle avoidance", "46-min flight time"],
  },
  {
    img: gearLighting,
    tag: "04 · Light",
    title: "Studio & on-location light",
    text: "Battery softboxes, RGB tubes and reflectors that sculpt warm South-Indian skin tones long after the temple lamps fade. We carry the sun with us.",
    specs: ["Bi-colour 2700–6500K", "Battery powered", "Soft + hard modifiers"],
  },
];
function GearPanel({
  item,
  index,
}: {
  item: (typeof gear)[number];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const imgScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.05, 1.25]);
  const reversed = index % 2 === 1;
  return (
    <div
      ref={ref}
      className="relative grid items-center gap-10 md:grid-cols-2 md:gap-16"
    >
      {/* Image */}
      <motion.div
        style={{ y }}
        className={`relative overflow-hidden rounded-3xl border border-border shadow-2xl ${
          reversed ? "md:order-2" : ""
        }`}
      >
        <motion.img
          src={item.img}
          alt={item.title}
          loading="lazy"
          width={1280}
          height={1280}
          style={{ scale: imgScale }}
          className="aspect-[4/3] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
        <div className="absolute left-5 top-5 rounded-full border border-primary/40 bg-background/50 px-4 py-1.5 text-[10px] uppercase tracking-[0.3em] text-primary backdrop-blur">
          {item.tag}
        </div>
      </motion.div>
      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className={reversed ? "md:order-1" : ""}
      >
        <h3 className="font-display text-4xl md:text-5xl mb-5">
          {item.title.split(" ").slice(0, -1).join(" ")}{" "}
          <span className="italic text-gradient-gold">
            {item.title.split(" ").slice(-1)}
          </span>
        </h3>
        <p className="text-lg text-muted-foreground mb-8 max-w-md">{item.text}</p>
        <ul className="space-y-3">
          {item.specs.map((s, i) => (
            <motion.li
              key={s}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
              className="flex items-center gap-3 text-sm text-foreground"
            >
              <span className="h-px w-8 bg-primary" />
              <span className="uppercase tracking-[0.15em]">{s}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
}
export function StudioEquipment() {
  return (
    <section
      id="equipment"
      className="relative overflow-hidden border-y border-border/40 bg-background py-24 md:py-32"
    >
      {/* ambient glows */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-24 max-w-3xl"
        >
          <p className="mb-4 text-xs uppercase tracking-[0.35em] text-primary">
            The Studio · Behind the lens
          </p>
          <h2 className="font-display text-5xl leading-[1.05] md:text-7xl">
            Three decades of gear,
            <br />
            <span className="italic text-gradient-gold">obsessively chosen.</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Since 1996 we've upgraded relentlessly — from film bodies to 6K cinema
            rigs and licensed drones. Scroll through the toolkit that captures every
            frame of Aambal Vasantham.
          </p>
        </motion.div>
        {/* Gear panels */}
        <div className="space-y-32 md:space-y-44">
          {gear.map((item, i) => (
            <GearPanel key={item.title} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}