import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

// TODO: Adjust these imports based on where you store your data and illustration components

function CameraIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 320" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="camGlow" cx="50%" cy="55%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="210" cy="195" rx="130" ry="110" fill="url(#camGlow)"/>
      <rect x="55" y="90" width="290" height="185" rx="18" fill="#0a0a14" stroke={color} strokeWidth="2.5"/>
      <rect x="55" y="90" width="66" height="185" rx="16" fill="#0d0d1a"/>
      {[0,1,2,3,4,5].map(i => (
        <line key={i} x1="68" y1={112+i*22} x2="68" y2={125+i*22} stroke={`${color}40`} strokeWidth="2.5" strokeLinecap="round"/>
      ))}
      <path d="M155 90 L155 65 Q155 57 163 57 L215 57 Q223 57 223 65 L223 90 Z" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="306" cy="79" r="19" fill="#0d0d1a" stroke={color} strokeWidth="1.5"/>
      <circle cx="306" cy="79" r="11" fill={`${color}18`}/>
      <text x="306" y="83" textAnchor="middle" fontSize="9" fill={color} fontFamily="monospace" fontWeight="bold">AV</text>
      <circle cx="272" cy="82" r="14" fill="#0d0d1a" stroke={color} strokeWidth="2"/>
      <circle cx="272" cy="82" r="8" fill={color} opacity="0.85">
        <animate attributeName="opacity" values="0.85;0.35;0.85" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <rect x="160" y="61" width="52" height="28" rx="5" fill="#050509" stroke={`${color}50`} strokeWidth="1"/>
      <rect x="164" y="65" width="44" height="20" rx="3" fill={`${color}08`}/>
      <circle cx="210" cy="192" r="82" fill="#040408" stroke={color} strokeWidth="3"/>
      <circle cx="210" cy="192" r="68" fill="#030306" stroke={`${color}55`} strokeWidth="1.5"/>
      <circle cx="210" cy="192" r="52" fill="#020204" stroke={`${color}30`} strokeWidth="1.5"/>
      <g style={{ transformOrigin: "210px 192px", animation: "spin 20s linear infinite" }}>
        {[0,30,60,90,120,150].map((a, i) => (
          <line key={i}
            x1={210 + 50 * Math.cos(a * Math.PI/180)} y1={192 + 50 * Math.sin(a * Math.PI/180)}
            x2={210 - 50 * Math.cos(a * Math.PI/180)} y2={192 - 50 * Math.sin(a * Math.PI/180)}
            stroke={`${color}20`} strokeWidth="1.5"/>
        ))}
      </g>
      <circle cx="210" cy="192" r="32" fill={`${color}08`} stroke={`${color}55`} strokeWidth="1.5"/>
      <ellipse cx="197" cy="180" rx="9" ry="6" fill="white" opacity="0.1" transform="rotate(-30, 197, 180)"/>
      <circle cx="200" cy="178" r="4" fill="white" opacity="0.18"/>
      {Array.from({length: 18}).map((_, i) => {
        const a = i * 20 * Math.PI / 180;
        return <line key={i} x1={210+76*Math.cos(a)} y1={192+76*Math.sin(a)} x2={210+81*Math.cos(a)} y2={192+81*Math.sin(a)} stroke={color} strokeWidth={i%3===0?1.5:0.7} opacity="0.35"/>;
      })}
      <circle cx="330" cy="99" r="5" fill="#ff4444">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <text x="210" y="296" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">EOS R5 · 45MP CMOS</text>
      <style>{"@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </svg>
  );
}

function DroneIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 340" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="droneGlow" cx="50%" cy="45%" r="45%">
          <stop offset="0%" stopColor={color} stopOpacity="0.1"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="155" rx="160" ry="130" fill="url(#droneGlow)"/>
      <circle cx="200" cy="160" r="130" fill="none" stroke={color} strokeWidth="0.5" strokeDasharray="4 6" opacity="0.2">
        <animateTransform attributeName="transform" type="rotate" values="0 200 160;360 200 160" dur="12s" repeatCount="indefinite"/>
      </circle>
      <polygon points="188,210 212,210 240,315 160,315" fill={`${color}05`}/>
      <ellipse cx="200" cy="318" rx="48" ry="7" fill="rgba(0,0,0,0.5)"/>
      <line x1="65" y1="100" x2="192" y2="154" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <line x1="335" y1="100" x2="208" y2="154" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <line x1="65" y1="225" x2="192" y2="158" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <line x1="335" y1="225" x2="208" y2="158" stroke="#14141f" strokeWidth="7" strokeLinecap="round"/>
      <rect x="174" y="140" width="52" height="36" rx="10" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <rect x="180" y="146" width="40" height="24" rx="7" fill="#0d0d1a"/>
      <rect x="185" y="176" width="30" height="26" rx="8" fill="#0a0a14" stroke={color} strokeWidth="1.5"/>
      <circle cx="200" cy="189" r="9" fill="#050509" stroke={`${color}70`} strokeWidth="1.5"/>
      <circle cx="200" cy="189" r="5" fill={color} opacity="0.75"/>
      <circle cx="196" cy="185" r="2" fill="white" opacity="0.3"/>
      {[[65,100],[335,100],[65,225],[335,225]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="13" fill="#0a0a14" stroke={color} strokeWidth="1.5"/>
          <circle cx={cx} cy={cy} r="6" fill={`${color}30`}/>
          <ellipse cx={cx} cy={cy} rx="28" ry="4" fill={color} opacity="0.5" style={{ transformOrigin: `${cx}px ${cy}px`, animation: `spin${i%2===0?"":"Rev"} 0.07s linear infinite` }}/>
          <ellipse cx={cx} cy={cy} rx="28" ry="4" fill={color} opacity="0.3" transform={`rotate(55,${cx},${cy})`} style={{ transformOrigin: `${cx}px ${cy}px`, animation: `spin${i%2===0?"Rev":""} 0.07s linear infinite` }}/>
          <circle cx={cx} cy={cy+14} r="3.5" fill={i<2?"#ff4444":"#44ff88"}>
            <animate attributeName="opacity" values="1;0.15;1" dur={`${0.9+i*0.22}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}
      <rect x="276" y="116" width="82" height="44" rx="8" fill={`${color}10`} stroke={`${color}30`} strokeWidth="1"/>
      <text x="317" y="133" textAnchor="middle" fontSize="9" fill={`${color}60`} fontFamily="monospace" letterSpacing="2">ALTITUDE</text>
      <text x="317" y="151" textAnchor="middle" fontSize="15" fill={color} fontFamily="monospace" fontWeight="bold">78 m</text>
      <circle cx="188" cy="148" r="3.5" fill="white">
        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <text x="200" y="318" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">MAVIC 3 PRO · DCIM</text>
      <style>{"@keyframes spinRev{from{transform:rotate(360deg)}to{transform:rotate(0deg)}}"}</style>
    </svg>
  );
}

function StudioLightIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 360" width="100%" style={{ maxWidth: 460, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="lightBeam" cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.25"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="bulbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.9"/>
          <stop offset="50%" stopColor={color} stopOpacity="0.6"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <polygon points="200,100 60,340 340,340" fill="url(#lightBeam)" opacity="0.7">
        <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite"/>
      </polygon>
      <ellipse cx="200" cy="90" rx="80" ry="60" fill={`${color}15`} style={{ filter: "blur(20px)" }}>
        <animate attributeName="ry" values="60;80;60" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <line x1="200" y1="340" x2="200" y2="200" stroke="rgba(255,255,255,0.2)" strokeWidth="4" strokeLinecap="round"/>
      <line x1="200" y1="340" x2="130" y2="355" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round"/>
      <line x1="200" y1="340" x2="270" y2="355" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round"/>
      <line x1="200" y1="340" x2="200" y2="360" stroke="rgba(255,255,255,0.15)" strokeWidth="3" strokeLinecap="round"/>
      <line x1="200" y1="200" x2="200" y2="135" stroke="rgba(255,255,255,0.25)" strokeWidth="5" strokeLinecap="round"/>
      <ellipse cx="200" cy="100" rx="75" ry="20" fill="#0a0a14" stroke={color} strokeWidth="2.5"/>
      <ellipse cx="200" cy="100" rx="75" ry="20" fill="none" stroke={`${color}60`} strokeWidth="1"/>
      <path d="M125,100 Q150,50 200,45 Q250,50 275,100 Q250,92 200,90 Q150,92 125,100 Z" fill="#18181f" stroke={`${color}40`} strokeWidth="1"/>
      {[0.3,0.5,0.7,0.9].map((r,i) => (
        <ellipse key={i} cx="200" cy="100" rx={75*r} ry={20*r*0.5} fill="none" stroke={`${color}20`} strokeWidth="1"/>
      ))}
      <ellipse cx="200" cy="90" rx="12" ry="5" fill="url(#bulbGlow)">
        <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      {Array.from({length:8}).map((_,i) => {
        const a = i * 45 * Math.PI / 180;
        return <line key={i} x1={200+73*Math.cos(a)} y1={100+19*Math.sin(a)} x2={200+80*Math.cos(a)} y2={100+21*Math.sin(a)} stroke={color} strokeWidth="2.5" opacity="0.7"/>;
      })}
      <rect x="192" y="190" width="16" height="8" rx="3" fill={`${color}30`} stroke={`${color}50`} strokeWidth="1"/>
      <circle cx="200" cy="194" r="2.5" fill={color}>
        <animate attributeName="opacity" values="1;0.3;1" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      {[30,60,120,150,210,240,300,330].map((deg, i) => {
        const a = deg * Math.PI/180;
        return <line key={i} x1={200+78*Math.cos(a)} y1={100+78*Math.sin(a)} x2={200+(78+18+i%2*8)*Math.cos(a)} y2={100+(78+18+i%2*8)*Math.sin(a)} stroke={color} strokeWidth="1.5" opacity="0.35"/>;
      })}
      <text x="200" y="350" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">PROFOTO B10X · 500Ws</text>
    </svg>
  );
}

function LensIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="lensGlass" cx="42%" cy="42%" r="60%">
          <stop offset="0%" stopColor="white" stopOpacity="0.08"/>
          <stop offset="40%" stopColor={color} stopOpacity="0.06"/>
          <stop offset="100%" stopColor="#000010" stopOpacity="0.9"/>
        </radialGradient>
        <radialGradient id="lensGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.15"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="175" fill="url(#lensGlow)"/>
      <circle cx="200" cy="200" r="160" fill="#080810" stroke={color} strokeWidth="3"/>
      <circle cx="200" cy="200" r="152" fill="none" stroke={`${color}30`} strokeWidth="1"/>
      <circle cx="200" cy="200" r="145" fill="#0a0a14" stroke={`${color}40`} strokeWidth="1.5"/>
      {Array.from({length:36}).map((_,i) => {
        const a = i * 10 * Math.PI/180;
        const inner = i%3===0 ? 128 : 133;
        return <line key={i} x1={200+inner*Math.cos(a)} y1={200+inner*Math.sin(a)} x2={200+140*Math.cos(a)} y2={200+140*Math.sin(a)} stroke={color} strokeWidth={i%3===0?2:0.8} opacity={i%3===0?0.6:0.3}/>;
      })}
      <circle cx="200" cy="200" r="120" fill="#06060c" stroke={`${color}50`} strokeWidth="2"/>
      <g style={{ transformOrigin: "200px 200px", animation: "slowSpin 8s linear infinite" }}>
        {Array.from({length:7}).map((_,i) => {
          const a = i * (360/7) * Math.PI/180;
          const bx = 200 + 115*Math.cos(a), by = 200 + 115*Math.sin(a);
          const a2 = (i+1) * (360/7) * Math.PI/180;
          const bx2 = 200 + 115*Math.cos(a2), by2 = 200 + 115*Math.sin(a2);
          return (
            <path key={i}
              d={`M 200 200 L ${bx} ${by} Q ${200+130*Math.cos((a+a2)/2)} ${200+130*Math.sin((a+a2)/2)} ${bx2} ${by2} Z`}
              fill="#0a0a14" stroke={`${color}25`} strokeWidth="1"/>
          );
        })}
      </g>
      <circle cx="200" cy="200" r="75" fill="url(#lensGlass)" stroke={`${color}60`} strokeWidth="2"/>
      {[65,55,45].map((r,i) => (
        <circle key={i} cx="200" cy="200" r={r} fill="none" stroke={color} strokeWidth="0.75" opacity={0.08+i*0.04}/>
      ))}
      <circle cx="200" cy="200" r="35" fill="#030308" stroke={`${color}70`} strokeWidth="1.5"/>
      <circle cx="200" cy="200" r="22" fill="#000005" stroke={`${color}50`} strokeWidth="1"/>
      <circle cx="200" cy="200" r="10" fill="#000002"/>
      <ellipse cx="178" cy="178" rx="14" ry="9" fill="white" opacity="0.07" transform="rotate(-35, 178, 178)"/>
      <circle cx="182" cy="175" r="5" fill="white" opacity="0.12"/>
      <circle cx="188" cy="180" r="2" fill="white" opacity="0.2"/>
      <circle cx="200" cy="200" r="73" fill="none" stroke="#9b59b6" strokeWidth="3" opacity="0.1"/>
      <text x="200" y="376" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">RF 85mm f/1.2 L USM</text>
      <text x="200" y="392" textAnchor="middle" fontSize="9" fill={`${color}30`} fontFamily="monospace" letterSpacing="2">CANON · MADE IN JAPAN</text>
      <style>{"@keyframes slowSpin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}"}</style>
    </svg>
  );
}

function GimbalIllustration({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 400" width="100%" style={{ maxWidth: 420, display: "block", margin: "0 auto" }}>
      <defs>
        <radialGradient id="gimbalGlow" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.12"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      <ellipse cx="200" cy="200" rx="150" ry="180" fill="url(#gimbalGlow)"/>
      <rect x="180" y="290" width="40" height="100" rx="16" fill="#0d0d1a" stroke={color} strokeWidth="2"/>
      <rect x="186" y="300" width="28" height="80" rx="11" fill="#12121f"/>
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="186" y1={308+i*15} x2="186" y2={316+i*15} stroke={`${color}30`} strokeWidth="1.5" strokeLinecap="round"/>
      ))}
      <circle cx="186" cy="298" r="7" fill="#1a1a2a" stroke={`${color}50`} strokeWidth="1"/>
      <circle cx="186" cy="298" r="4" fill={`${color}40`}/>
      <rect x="170" y="268" width="60" height="28" rx="10" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <ellipse cx="200" cy="282" rx="22" ry="10" fill="#0d0d1a" stroke={`${color}50`} strokeWidth="1.5"/>
      <rect x="90" y="205" width="220" height="18" rx="9" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="90" cy="214" r="22" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="90" cy="214" r="13" fill="#0d0d1a" stroke={`${color}50`} strokeWidth="1.5"/>
      <circle cx="90" cy="214" r="6" fill={`${color}30`}>
        <animateTransform attributeName="transform" type="rotate" values="0 90 214;360 90 214" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="310" cy="214" r="22" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="310" cy="214" r="13" fill="#0d0d1a" stroke={`${color}50`} strokeWidth="1.5"/>
      <circle cx="310" cy="214" r="6" fill={`${color}30`}>
        <animateTransform attributeName="transform" type="rotate" values="360 310 214;0 310 214" dur="3s" repeatCount="indefinite"/>
      </circle>
      <rect x="178" y="140" width="44" height="80" rx="8" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="200" cy="148" r="20" fill="#0a0a14" stroke={color} strokeWidth="2"/>
      <circle cx="200" cy="148" r="12" fill="#0d0d1a" stroke={`${color}50`} strokeWidth="1.5"/>
      <circle cx="200" cy="148" r="5" fill={`${color}40`}/>
      <rect x="148" y="65" width="104" height="72" rx="12" fill="#0a0a14" stroke={color} strokeWidth="2.5"/>
      <rect x="154" y="71" width="92" height="60" rx="9" fill="#0d0d1a"/>
      <circle cx="200" cy="101" r="22" fill="#040408" stroke={`${color}60`} strokeWidth="2"/>
      <circle cx="200" cy="101" r="15" fill="#030306" stroke={`${color}35`} strokeWidth="1"/>
      <circle cx="200" cy="101" r="9" fill={`${color}10`} stroke={`${color}55`} strokeWidth="1"/>
      <circle cx="195" cy="96" r="3" fill="white" opacity="0.15"/>
      <circle cx="236" cy="73" r="7" fill="#ff4444" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <rect x="155" y="93" width="24" height="12" rx="3" fill={`${color}15`} stroke={`${color}30`} strokeWidth="1"/>
      <text x="167" y="102" textAnchor="middle" fontSize="6" fill={`${color}80`} fontFamily="monospace">IMU</text>
      <text x="200" y="388" textAnchor="middle" fontSize="10" fill={`${color}45`} fontFamily="monospace" letterSpacing="3">DJI RS3 PRO · 3-AXIS</text>
    </svg>
  );
}

const EQUIPMENT = [
  {
    id: "camera",
    index: "01",
    category: "Primary Camera",
    name: "Canon EOS R5",
    tagline: "45 Megapixels · 8K RAW",
    desc: "Every strand of silk sari, every flame reflected in a water lily — captured in breathtaking resolution. The R5 is our primary workhorse for all portrait and ceremonial work.",
    stats: [{ k: "Sensor", v: "45MP Full-Frame" }, { k: "Dynamic Range", v: "14+ Stops" }, { k: "AF Points", v: "1053 Zones" }],
    color: "#c8a84a",
  },
  {
    id: "drone",
    index: "02",
    category: "Aerial Platform",
    name: "DJI Mavic 3 Pro",
    tagline: "5.1K Hasselblad · Triple Camera",
    desc: "The temple from 80 metres up. The lily pond as a geometric painting. The procession as a river of colour winding through the streets. Aerial storytelling redefined.",
    stats: [{ k: "Resolution", v: "5.1K ProRes" }, { k: "Altitude", v: "120m DGCA" }, { k: "Flight Time", v: "43 Minutes" }],
    color: "#7dd3fc",
  },
  {
    id: "light",
    index: "03",
    category: "Studio Lighting",
    name: "Profoto B10X Plus",
    tagline: "500Ws · TTL · HSS",
    desc: "When the festival light fails, we bring our own sun. 500 watt-seconds of power in a package smaller than your lunch box — precision light, anywhere.",
    stats: [{ k: "Power", v: "500 Ws" }, { k: "Recycle Time", v: "0.05–1.9s" }, { k: "Battery", v: "400+ Shots" }],
    color: "#ffd93d",
  },
  {
    id: "lens",
    index: "04",
    category: "Portrait Lens",
    name: "RF 85mm f/1.2 L",
    tagline: "Portrait Perfection · f/1.2",
    desc: "An aperture so wide it drinks the darkness. At f/1.2, festival lamps become liquid gold bokeh. Faces emerge from shadow as if lit from within by something divine.",
    stats: [{ k: "Aperture", v: "f/1.2 – f/16" }, { k: "Focal Length", v: "85mm" }, { k: "Elements", v: "13 in 9 Groups" }],
    color: "#d4b0ff",
  },
  {
    id: "gimbal",
    index: "05",
    category: "Stabilisation",
    name: "DJI RS 3 Pro",
    tagline: "6.5kg Payload · 3-Axis",
    desc: "Cinema-smooth tracking through temple corridors. The procession filmed as a continuous, flowing poem. No shake. No cuts. Just movement that breathes.",
    stats: [{ k: "Payload", v: "6.5kg" }, { k: "Stabilisation", v: "3-Axis" }, { k: "Runtime", v: "12 Hours" }],
    color: "#6bcb77",
  },
];

export default function EquipmentShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const totalScrollable = el.offsetHeight - window.innerHeight;

      // How far we've scrolled into this element from the top
      const scrolled = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, scrolled / totalScrollable));

      setSmoothProgress(rawProgress);

      const index = Math.min(
        EQUIPMENT.length - 1,
        Math.floor(rawProgress * EQUIPMENT.length)
      );
      setActiveIndex(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // run once on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const item = EQUIPMENT[activeIndex];

  const illustrations = [
    <CameraIllustration key="camera" color={item.color} />,
    <DroneIllustration key="drone" color={item.color} />,
    <StudioLightIllustration key="light" color={item.color} />,
    <LensIllustration key="lens" color={item.color} />,
    <GimbalIllustration key="gimbal" color={item.color} />,
  ];

  // Each equipment item gets 100vh of scroll, so total = EQUIPMENT.length * 100vh
  // The sticky panel stays in place while user scrolls through the full height
  return (
    <div
  ref={containerRef}
  style={{
    height: `${EQUIPMENT.length * 100}vh`,
    position: "relative",
  }}
>
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#060610",
          display: "flex",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* Ambient gradient that shifts with color */}
        <div
          style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            transition: "background 0.8s ease",
            background: `radial-gradient(ellipse 60% 50% at 25% 60%, ${item.color}10 0%, transparent 70%), radial-gradient(ellipse 50% 60% at 75% 40%, ${item.color}06 0%, transparent 70%)`,
          }}
        />

        {/* Grid overlay */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.025,
          backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }} />

        {/* Corner brackets */}
        {[{t:"2%",l:"2%"},{t:"2%",r:"2%"},{b:"2%",l:"2%"},{b:"2%",r:"2%"}].map((pos,i) => (
          <motion.div key={i} style={{ position:"absolute", width:28, height:28, ...pos } as any}
            initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay: 0.3+i*0.08 }}>
            <div style={{
              position:"absolute", top:0, left:0, width:"100%", height:2,
              background: `${item.color}50`,
              transition:"background 0.6s",
              transform: i===1||i===3 ? "scaleX(-1)" : undefined,
            }} />
            <div style={{
              position:"absolute", top:0, left:0, width:2, height:"100%",
              background: `${item.color}50`,
              transition:"background 0.6s",
              transform: i===2||i===3 ? "scaleY(-1)" : undefined,
            }} />
          </motion.div>
        ))}

        {/* Top bar */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"1.5rem 2.5rem", flexShrink:0, position:"relative", zIndex:10 }}>
          <motion.div style={{ display:"flex", alignItems:"center", gap:12 }}
            initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.6 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,#c8a84a,#ffd93d)`, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, fontSize:14, color:"#0a0a14" }}>S</div>
            <div>
              <div style={{ fontWeight:700, fontSize:13, color:"rgba(255,255,255,0.9)", letterSpacing:"0.05em" }}>Studio Hut</div>
              <div style={{ fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:"0.15em", textTransform:"uppercase" }}>Photography · Kottayam</div>
            </div>
          </motion.div>
          <motion.div style={{ display:"flex", alignItems:"center", gap:8 }}
            initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}>
            <div style={{ width:7, height:7, borderRadius:"50%", background:"#3fb950", boxShadow:"0 0 8px #3fb950" }} />
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.2em" }}>Studio Open</span>
          </motion.div>
        </div>

        {/* Main content */}
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gap:0, alignItems:"center", padding:"0 4rem 2rem", position:"relative", zIndex:5, minHeight:0 }}>

          {/* Left: Illustration */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
            <AnimatePresence mode="wait">
              <motion.div key={item.id}
                initial={{ opacity:0, scale:0.88, y:30 }}
                animate={{ opacity:1, scale:1, y:0 }}
                exit={{ opacity:0, scale:1.05, y:-30 }}
                transition={{ duration:0.65, ease:[0.22,1,0.36,1] }}
                style={{ width:"100%", maxWidth:460 }}
              >
                <img
  src={`/equipment/${item.id}.png`}
  alt={item.name}
  style={{
    width: "100%",
    maxWidth: 450,
    objectFit: "contain",
  }}
/>
              </motion.div>
            </AnimatePresence>

            {/* Rotating rings behind illustration */}
            <div style={{
              position:"absolute", width:320, height:320, borderRadius:"50%",
              border: `1px solid ${item.color}15`,
              pointerEvents:"none",
              animation:"slowSpin2 20s linear infinite",
            }} />
            <div style={{
              position:"absolute", width:260, height:260, borderRadius:"50%",
              border: `1px dashed ${item.color}10`,
              pointerEvents:"none",
              animation:"slowSpin2Rev 15s linear infinite",
            }} />
            <style>{`
              @keyframes slowSpin2{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
              @keyframes slowSpin2Rev{from{transform:rotate(0deg)}to{transform:rotate(-360deg)}}
            `}</style>
          </div>

          {/* Right: Text content */}
          <AnimatePresence mode="wait">
            <motion.div key={item.id + "text"}
              initial={{ opacity:0, x:40 }}
              animate={{ opacity:1, x:0 }}
              exit={{ opacity:0, x:-40 }}
              transition={{ duration:0.5, ease:[0.22,1,0.36,1] }}
              style={{ paddingLeft:"2rem" }}
            >
              {/* Index / category */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <span style={{ fontFamily:"monospace", fontSize:11, color:item.color, letterSpacing:"0.3em", opacity:0.7 }}>{item.index}</span>
                <div style={{ height:1, width:30, background:`${item.color}50` }} />
                <span style={{ fontSize:10, textTransform:"uppercase", letterSpacing:"0.25em", color:"rgba(255,255,255,0.4)" }}>{item.category}</span>
              </div>

              {/* Name */}
              <h1 style={{
                fontFamily:"Georgia, 'Times New Roman', serif",
                fontSize:"clamp(2.8rem,4.5vw,4.5rem)",
                fontWeight:400, lineHeight:0.95, marginBottom:12,
                color:"white",
              }}>
                {item.name}
              </h1>

              {/* Tagline */}
              <p style={{
                fontFamily:"monospace", fontSize:12,
                color: item.color, letterSpacing:"0.2em",
                marginBottom:24, opacity:0.85,
                textTransform:"uppercase",
              }}>
                {item.tagline}
              </p>

              {/* Divider */}
              <motion.div style={{ height:1, background:`linear-gradient(90deg,${item.color}60,transparent)`, width:200, marginBottom:24 }}
                initial={{ scaleX:0 }} animate={{ scaleX:1 }} transition={{ duration:0.6, delay:0.2 }}/>

              {/* Description */}
              <p style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.95rem", lineHeight:1.75, marginBottom:32, maxWidth:420 }}>
                {item.desc}
              </p>

              {/* Stats */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:36 }}>
                {item.stats.map((s, i) => (
                  <motion.div key={s.k}
                    initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3+i*0.06 }}
                    style={{
                      background: `${item.color}08`, border: `1px solid ${item.color}20`,
                      borderRadius:12, padding:"14px 12px", textAlign:"center",
                    }}
                  >
                    <div style={{ fontFamily:"monospace", fontSize:10, color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"0.15em", marginBottom:5 }}>{s.k}</div>
                    <div style={{ fontFamily:"Georgia,serif", fontSize:15, color:item.color, fontWeight:600 }}>{s.v}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA buttons */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                <a href="#studio-services"
                  style={{
                    background: `linear-gradient(135deg,${item.color},${item.color}bb)`,
                    color:"#0a0a14", fontWeight:700, fontSize:12, padding:"12px 24px",
                    borderRadius:100, textDecoration:"none", transition:"all 0.2s",
                    letterSpacing:"0.08em",
                  }}>
                  Explore Services
                </a>
                <a href="#book"
                  style={{
                    border: `1px solid ${item.color}30`, color:item.color,
                    fontSize:12, padding:"12px 22px", borderRadius:100,
                    textDecoration:"none", background:`${item.color}08`,
                    transition:"all 0.2s", letterSpacing:"0.08em",
                  }}>
                  Book a Shoot →
                </a>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom: Progress indicator */}
        <div style={{ padding:"1rem 2.5rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"relative", zIndex:10 }}>
          {/* Dots nav — clicking scrolls to that item */}
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {EQUIPMENT.map((eq, i) => (
              <button
                key={eq.id}
                onClick={() => {
                  const el = containerRef.current;
                  if (!el) return;
                  const totalScrollable = el.offsetHeight - window.innerHeight;
                  const targetProgress = i / EQUIPMENT.length + 0.01;
                  const targetScroll = el.offsetTop + targetProgress * totalScrollable;
                  window.scrollTo({ top: targetScroll, behavior: "smooth" });
                }}
                style={{
                  height:6, borderRadius:3,
                  width: i === activeIndex ? 28 : 6,
                  background: i === activeIndex ? eq.color : "rgba(255,255,255,0.15)",
                  transition:"all 0.4s ease",
                  border:"none", cursor:"pointer", padding:0,
                }}
                aria-label={`Go to ${eq.name}`}
              />
            ))}
          </div>

          {/* Scroll hint */}
          <motion.div style={{ display:"flex", alignItems:"center", gap:8 }}
            animate={{ opacity:[0.4,0.8,0.4] }} transition={{ duration:2.5, repeat:Infinity }}>
            <span style={{ fontSize:10, color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"0.25em" }}>Scroll to explore</span>
            <div style={{ width:1, height:20, background:"rgba(255,255,255,0.15)" }} />
            <motion.span style={{ fontSize:14, color:"rgba(255,255,255,0.3)" }}
              animate={{ y:[0,4,0] }} transition={{ duration:1.5, repeat:Infinity }}>↓</motion.span>
          </motion.div>

          {/* Progress bar */}
          <div style={{ width:120, height:2, background:"rgba(255,255,255,0.08)", borderRadius:1, overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:1,
              width:`${smoothProgress * 100}%`,
              background:`linear-gradient(90deg,${item.color},${item.color}80)`,
              transition:"width 0.05s linear",
            }} />
          </div>
        </div>

        {/* HUD readout strip */}
        <div style={{
          position:"absolute", bottom:72, left:"50%", transform:"translateX(-50%)",
          display:"flex", gap:24, fontFamily:"monospace", fontSize:9,
          color:"rgba(255,255,255,0.15)", textTransform:"uppercase", letterSpacing:"0.25em",
          pointerEvents:"none",
        }}>
          {["ISO 400", "1/250s", "f/2.8", "5500K", "RAW+JPEG"].map((v,i) => <span key={i}>{v}</span>)}
        </div>
      </div>
    </div>
  );
}