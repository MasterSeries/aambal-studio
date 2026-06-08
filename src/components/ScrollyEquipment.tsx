import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const EQUIPMENT_DATA = [
  {
    id: "cam", name: "Cinema Bodies", category: "01 // CAPTURE",
    color: "#f3e8ff", accent: "#a855f7", image: "📷",
    desc: "Full-frame mirrorless and cinema cameras shooting 6K RAW. We freeze a lamp's flicker and a dancer's blur with equal ease — every frame archival-sharp.",
    specs: [{ label: "Video", val: "6K RAW" }, { label: "Sensor", val: "Full Frame" }]
  },
  {
    id: "drone", name: "Hasselblad Optics", category: "02 // AERIAL",
    color: "#e0f2fe", accent: "#0ea5e9", image: "🚁",
    desc: "The Mavic 3 Pro allows us to capture sprawling lotus ponds and massive temple processions from angles previously impossible, with medium-format color science.",
    specs: [{ label: "Format", val: "5.1K ProRes" }, { label: "Flight", val: "43 Mins" }]
  },
  {
    id: "light", name: "Profoto Strobes", category: "03 // ILLUMINATION",
    color: "#fef3c7", accent: "#f59e0b", image: "💡",
    desc: "When the festival lamps aren't enough, we bring our own sun. Our Profoto strobes overpower the harsh Kerala sun or softly fill the darkest temple corridors.",
    specs: [{ label: "Power", val: "500Ws" }, { label: "Recycle", val: "0.05s" }]
  },
  {
    id: "lens", name: "Prime Lenses", category: "04 // OPTICS",
    color: "#d1fae5", accent: "#10b981", image: "👁️",
    desc: "At f/1.2, our primary portrait lenses turn distant festival crowds into liquid bokeh. Faces emerge from the shadows as if lit from within by something divine.",
    specs: [{ label: "Aperture", val: "f/1.2" }, { label: "Glass", val: "L-Series" }]
  }
];

// Ultra-smooth spring physics (Apple-style)
const spring = { type: "spring" as const, bounce: 0.15, duration: 0.8 };

export function ScrollyEquipment() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = EQUIPMENT_DATA.find(e => e.id === selectedId);

  return (
    <div className="relative w-full max-w-[1400px] mx-auto py-24 px-4 md:px-8 font-sans">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col items-center text-center mb-24">
        <span className="text-purple-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">
          The Arsenal
        </span>
        <h2 className="font-display text-5xl md:text-7xl text-gray-900 tracking-tight">
          Obsessively <span className="italic text-purple-500">chosen.</span>
        </h2>
      </div>

      {/* ── CAROUSEL GRID (Default View) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6 mt-16">
        {EQUIPMENT_DATA.map((item) => (
          <div key={item.id} className="relative h-[380px] w-full flex items-end">
            
            {/* The Clickable Card */}
            <motion.div
              layoutId={`card-${item.id}`}
              onClick={() => setSelectedId(item.id)}
              className="relative w-full h-[320px] rounded-[3rem] cursor-pointer group shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-shadow"
              style={{ backgroundColor: item.color }}
            >
              
              {/* The "Breakout" Image (Overlaps the top of the card) */}
              <motion.div 
                layoutId={`image-${item.id}`}
                className="absolute -top-16 left-0 right-0 flex justify-center pointer-events-none"
              >
                {/* REPLACE THIS SPAN WITH YOUR TRANSPARENT PNG 
                  Example: <img src="/camera.png" className="w-48 h-48 drop-shadow-2xl object-contain" />
                */}
                <span 
                  className="text-[140px] leading-none drop-shadow-2xl group-hover:-translate-y-4 transition-transform duration-500 ease-out"
                  style={{ filter: 'drop-shadow(0 30px 30px rgba(0,0,0,0.15))' }}
                >
                  {item.image}
                </span>
              </motion.div>

              {/* Card Text Content */}
              <motion.div 
                layoutId={`content-${item.id}`}
                className="absolute bottom-0 left-0 right-0 p-8 text-center"
              >
                <motion.h3 
                  layoutId={`title-${item.id}`} 
                  className="text-gray-900 font-display text-2xl font-bold mb-1"
                >
                  {item.name}
                </motion.h3>
                <motion.p 
                  layoutId={`subtitle-${item.id}`} 
                  className="text-xs font-bold tracking-widest uppercase opacity-60"
                  style={{ color: item.accent }}
                >
                  {item.category}
                </motion.p>
              </motion.div>

            </motion.div>
          </div>
        ))}
      </div>

      {/* ── EXPANDED VIEW (Modal) ── */}
      <AnimatePresence>
        {selectedId && selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            
            {/* Frosted Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              onClick={() => setSelectedId(null)}
              className="absolute inset-0 bg-white/40 backdrop-blur-2xl"
            />

            {/* The Expanded Premium Card */}
            <motion.div 
              layoutId={`card-${selectedItem.id}`}
              transition={spring}
              className="relative w-full max-w-5xl h-[600px] rounded-[3rem] shadow-2xl flex flex-col md:flex-row overflow-hidden border border-white/50"
              style={{ backgroundColor: selectedItem.color }}
            >
              
              {/* Close Button */}
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: 0.2 }}
                onClick={() => setSelectedId(null)}
                className="absolute top-8 right-8 z-50 w-12 h-12 bg-white/50 hover:bg-white backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 transition-all shadow-sm"
              >
                ✕
              </motion.button>

              {/* Left Side: Massive Image */}
              <div className="w-full md:w-1/2 h-1/2 md:h-full flex items-center justify-center relative">
                {/* Ambient Glow behind the image */}
                <div className="absolute inset-0 opacity-20 blur-[60px]" style={{ backgroundColor: selectedItem.accent }}></div>
                
                <motion.div 
                  layoutId={`image-${selectedItem.id}`} 
                  transition={spring}
                  className="relative z-10 scale-150 md:scale-[2]"
                  style={{ filter: 'drop-shadow(0 40px 40px rgba(0,0,0,0.2))' }}
                >
                  {selectedItem.image}
                </motion.div>
              </div>

              {/* Right Side: Elegant Text Details */}
              <motion.div 
                layoutId={`content-${selectedItem.id}`}
                transition={spring}
                className="w-full md:w-1/2 h-1/2 md:h-full p-10 md:p-16 flex flex-col justify-center bg-white/80 backdrop-blur-md relative z-20 border-l border-white/50"
              >
                <motion.p 
                  layoutId={`subtitle-${selectedItem.id}`} 
                  className="text-xs font-bold tracking-[0.2em] uppercase mb-4"
                  style={{ color: selectedItem.accent }}
                >
                  {selectedItem.category}
                </motion.p>
                
                <motion.h3 
                  layoutId={`title-${selectedItem.id}`} 
                  className="text-gray-900 font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-[1.1]"
                >
                  {selectedItem.name}
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.15, ...spring }}
                  className="text-gray-600 text-base md:text-lg leading-relaxed font-medium mb-10"
                >
                  {selectedItem.desc}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.25, ...spring }}
                  className="flex gap-4 w-full"
                >
                  {selectedItem.specs.map((spec, i) => (
                    <div key={i} className="bg-white/60 border border-white rounded-[20px] p-5 flex-1 shadow-sm">
                      <p className="text-gray-400 text-[10px] uppercase tracking-widest font-bold mb-1">{spec.label}</p>
                      <p className="text-gray-900 font-bold text-lg">{spec.val}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}