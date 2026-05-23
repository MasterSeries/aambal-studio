import { motion } from "motion/react";
import { useState } from "react";
import hero from "@/assets/hero-festival.jpg";
import aerial from "@/assets/drone-aerial.jpg";
import portrait from "@/assets/portrait-festival.jpg";
import lily from "@/assets/hero-festival.jpg";

type Post = {
  type: "image" | "video";
  src: string;
  poster?: string;
  caption: string;
  likes: string;
};

const posts: Post[] = [
  { type: "image", src: hero, caption: "Lamp-lit temple corridors ✨", likes: "2.4k" },
  {
    type: "video",
    src: "https://cdn.pixabay.com/video/2022/10/04/133561-756635470_large.mp4",
    poster: lily,
    caption: "Water lilies opening at dawn 🌸",
    likes: "5.1k",
  },
  { type: "image", src: aerial, caption: "Drone above the procession 🚁", likes: "3.8k" },
  { type: "image", src: portrait, caption: "Family portraits, festival night", likes: "1.9k" },
  {
    type: "video",
    src: "https://cdn.pixabay.com/video/2020/06/02/40769-427958698_large.mp4",
    poster: aerial,
    caption: "Cinematic reel · 60s teaser 🎬",
    likes: "7.2k",
  },
  { type: "image", src: lily, caption: "The lily field at golden hour", likes: "4.0k" },
];

export function InstagramFeed() {
  const [active, setActive] = useState<Post | null>(null);

  return (
    <section id="instagram" className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
      <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary mb-4">@aambalstudio</p>
          <h2 className="font-display text-5xl md:text-6xl max-w-2xl">
            Live from our <span className="italic text-gradient-gold">Instagram.</span>
          </h2>
        </div>
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-primary/40 px-6 py-3 text-sm hover:bg-primary hover:text-primary-foreground transition"
        >
          Follow on Instagram →
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
        {posts.map((p, i) => (
          <motion.button
            key={i}
            onClick={() => setActive(p)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-card/40"
          >
            {p.type === "image" ? (
              <img
                src={p.src}
                alt={p.caption}
                loading="lazy"
                className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
              />
            ) : (
              <>
                <img
                  src={p.poster}
                  alt={p.caption}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute top-3 right-3 rounded-full bg-background/70 backdrop-blur p-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/0 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex items-end p-4">
              <div className="text-left">
                <div className="text-xs text-primary mb-1">♥ {p.likes}</div>
                <div className="text-sm text-foreground line-clamp-2">{p.caption}</div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {active && (
        <div
          onClick={() => setActive(null)}
          className="fixed inset-0 z-50 bg-background/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full rounded-3xl overflow-hidden border border-primary/30 bg-card"
          >
            {active.type === "image" ? (
              <img src={active.src} alt={active.caption} className="w-full max-h-[70vh] object-contain bg-black" />
            ) : (
              <video
                src={active.src}
                poster={active.poster}
                controls
                autoPlay
                className="w-full max-h-[70vh] bg-black"
              />
            )}
            <div className="p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-primary">♥ {active.likes} likes</div>
                <div className="text-sm text-muted-foreground mt-1">{active.caption}</div>
              </div>
              <button
                onClick={() => setActive(null)}
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-primary"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
