// src/routes/reserve.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { motion, AnimatePresence } from "motion/react";

export const Route = createFileRoute("/reserve")({
  head: () => ({
    meta: [{ title: "Reserve Your Stay · The Aambal Retreat" }],
  }),
  component: ReservePage,
});

// ── Shared Theme Colors ──
const G = {
  bg: "#111111",
  bgTexture: "rgba(15, 15, 15, 0.95)",
  text: "#f0ede6",
  muted: "rgba(240,237,230,0.5)",
  gold: "#c8a84a",
  white: "#ffffff",
  black: "#000000",
};

// ── Room/Ticket Data ──
const ROOMS = [
  { 
    id: "lotus", 
    label: "LOTUS SUITE", 
    price: 8500, 
    img: "https://images.unsplash.com/photo-1590490359683-658d3d23f972?q=80&w=800&auto=format&fit=crop",
    desc: "Pond-facing access to all retreat amenities",
    bullets: ["king size bed", "private balcony"]
  },
  { 
    id: "temple", 
    label: "TEMPLE VIEW", 
    price: 6500, 
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
    desc: "Floor-to-ceiling temple views with aarti access",
    bullets: ["queen bed", "evening lamp ritual"]
  },
  { 
    id: "studio", 
    label: "PHOTO STUDIO", 
    price: 7200, 
    img: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop",
    desc: "North-light suite with complete editing station",
    bullets: ["4k monitors", "not for resale"]
  },
];

// ── Barcode Generator Component ──
function Barcode({ className = "" }: { className?: string }) {
  const bars = [2, 4, 1, 3, 1, 2, 4, 1, 2, 3, 1, 4, 2];
  return (
    <div className={`flex gap-[2px] ${className}`}>
      {bars.map((w, i) => (
        <div key={i} style={{ width: w, backgroundColor: '#000', height: '100%' }} />
      ))}
    </div>
  );
}

// ── Main Page Component ──
export default function ReservePage() {
  const [step, setStep] = useState<'select' | 'details' | 'receipt'>('select');
  
  // Selection State
  const [selections, setSelections] = useState<Record<string, { date: string, nights: number }>>({});
  const [selectedTicket, setSelectedTicket] = useState<typeof ROOMS[0] | null>(null);
  
  // Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refId, setRefId] = useState("");

  const updateSelection = (id: string, field: 'date' | 'nights', val: any) => {
    setSelections(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: val }
    }));
  };

  const getSelection = (id: string) => {
    return selections[id] || { date: "", nights: 1 };
  };

  const handleAdd = (room: typeof ROOMS[0]) => {
    const sel = getSelection(room.id);
    if (!sel.date) return alert("Please select a check-in date.");
    setSelectedTicket(room);
    setStep('details');
  };

  const handleConfirm = async () => {
    if (!name || !phone) return alert("Please fill in your name and WhatsApp number.");
    setSubmitting(true);
    
    try {
      const sel = getSelection(selectedTicket!.id);
      
      // UPDATE THIS LINE TO PORT 5000
      const response = await fetch("http://localhost:5000/api/reservations/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomLabel: selectedTicket!.label,
          checkIn: sel.date,
          guestName: name,
          guestPhone: phone,
        }),
      });

      if (!response.ok) throw new Error("Backend error");

      const data = await response.json();
      setRefId(data.refId);
      setStep('receipt');

    } catch (err) {
      console.error("Fetch Error:", err);
      alert("Error confirming ticket. Ensure your Node backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    const sel = getSelection(selectedTicket!.id);
    const msg = `Hello Aambal Retreat! 🪷\n\nI have reserved a ticket for the *${selectedTicket!.label}*.\n\n*Guest:* ${name}\n*Check-in:* ${sel.date}\n*Duration:* ${sel.nights} night(s)\n*Ticket Ref:* ${refId}\n\nPlease confirm my stay!`;
    window.open(`https://wa.me/919800000000?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@400;500;600&display=swap');
        body { background-color: ${G.bg}; margin: 0; font-family: 'Inter', sans-serif; color: ${G.text}; overflow-x: hidden; }
        
        .ticket-input {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          padding: 8px 12px;
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          outline: none;
          color-scheme: dark;
        }
        .ticket-input:focus { border-color: ${G.gold}; }
        
        .ticket-cutout {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 24px; height: 24px; background-color: #1a1a1a; /* Matches container bg */
          border-radius: 50%; z-index: 10;
        }
        
        /* For the 3D ticket effect */
        .perspective-container { perspective: 1000px; }
        /* ── ADD THIS PRINT MEDIA QUERY ── */
        @media print {
          /* Hide everything on the website */
          body * {
            visibility: hidden;
          }
          
          /* Only make the ticket and its contents visible */
          #premium-ticket, #premium-ticket * {
            visibility: visible;
          }
          
          /* Flatten the 3D effect and center it perfectly on the PDF */
          #premium-ticket {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) !important;
            width: 100% !important;
            max-width: 500px !important;
            box-shadow: none !important;
            border: 1px solid #e5e5e5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          /* Remove headers/footers added by the browser */
          @page { margin: 0; }
        }
      `}</style>

      {/* ── Background Mood ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img 
          src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover opacity-20 filter grayscale contrast-125"
          alt="Classical background"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#111111]/80 via-[#111111]/90 to-[#111111]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col pt-24 pb-32 px-6 max-w-6xl mx-auto">
        
        {/* Navigation */}
        <Link to="/homestay" className="absolute top-8 left-6 text-white/50 hover:text-white text-sm uppercase tracking-widest transition-colors">
          ← Back
        </Link>

        <AnimatePresence mode="wait">
          
          {/* ── STEP 1: CHOOSE TICKET ── */}
          {step === 'select' && (
            <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }}>
              <h1 className="font-['Cormorant_Garamond'] text-5xl md:text-7xl font-light tracking-tight mb-16">
                Choose <span className="italic text-gray-400">your ticket</span>
              </h1>

              <div className="flex flex-col gap-10">
                {ROOMS.map((room) => {
                  const sel = getSelection(room.id);
                  return (
                    <div key={room.id} className="flex flex-col xl:flex-row gap-8 items-start xl:items-center">
                      
                      {/* TICKET CARD */}
                      <div className="relative flex w-full xl:w-[600px] h-[180px] bg-white rounded-xl overflow-hidden shadow-2xl shrink-0">
                        {/* Image Side */}
                        <div className="w-[35%] relative">
                          <img src={room.img} className="w-full h-full object-cover" alt={room.label} />
                        </div>
                        
                        {/* Ticket Cutouts (Bites) */}
                        <div className="ticket-cutout left-[35%] -ml-[12px]" />
                        <div className="ticket-cutout right-[-12px]" />

                        {/* White Body */}
                        <div className="flex-1 px-8 py-6 flex flex-col justify-between text-black relative">
                          <div>
                            <h3 className="font-['Inter'] text-2xl font-semibold tracking-tight uppercase">{room.label}</h3>
                            <p className="text-gray-600 text-sm mt-1 max-w-[200px] leading-snug">{room.desc}</p>
                          </div>
                          
                          <div className="flex gap-4 items-center">
                            {room.bullets.map((b, i) => (
                              <div key={i} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 bg-black rounded-full" />
                                <span className="text-[10px] uppercase text-gray-500 font-semibold">{b}</span>
                              </div>
                            ))}
                          </div>

                          {/* Decorative Barcode Right Edge */}
                          <div className="absolute right-6 top-6 bottom-6 flex flex-col justify-between items-end opacity-80">
                            <Barcode className="h-10" />
                            <Barcode className="h-10" />
                          </div>
                        </div>
                      </div>

                      {/* OPTIONS CONTROLS */}
                      <div className="flex flex-col w-full xl:w-auto xl:ml-8 gap-3">
                        <p className="text-sm text-gray-400">Select options:</p>
                        <div className="flex flex-wrap gap-4 items-center">
                          {/* Date Picker */}
                          <div className="relative">
                            <input 
                              type="date" 
                              className="ticket-input w-40" 
                              value={sel.date}
                              onChange={(e) => updateSelection(room.id, 'date', e.target.value)}
                            />
                            {!sel.date && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none bg-[#111]">check-in date ⌄</span>}
                          </div>
                          
                          {/* Nights Counter */}
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => updateSelection(room.id, 'nights', Math.max(1, sel.nights - 1))}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                            >-</button>
                            <span className="w-4 text-center font-['Cormorant_Garamond'] text-xl">{sel.nights}</span>
                            <button 
                              onClick={() => updateSelection(room.id, 'nights', sel.nights + 1)}
                              className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
                            >+</button>
                            <span className="text-xs text-gray-500 uppercase ml-1">Nights</span>
                          </div>
                        </div>
                        
                        {/* Add Button */}
                        <button 
                          onClick={() => handleAdd(room)}
                          className="mt-4 bg-white text-black py-3 px-8 text-sm font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors w-full xl:w-64"
                        >
                          Add to itinerary
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: GUEST DETAILS ── */}
          {step === 'details' && selectedTicket && (
            <motion.div key="details" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: -30 }} className="max-w-xl">
              <button onClick={() => setStep('select')} className="text-gray-500 text-sm hover:text-white mb-8 block border border-gray-700 rounded-full px-4 py-1.5 w-fit">← Change Ticket</button>
              
              <h2 className="font-['Cormorant_Garamond'] text-5xl font-light mb-2">Guest <span className="italic text-gray-400">details</span></h2>
              <p className="text-gray-400 mb-10">You are requesting the {selectedTicket.label} for {getSelection(selectedTicket.id).nights} night(s).</p>
              
              <div className="flex flex-col gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">Full Name</label>
                  <input 
                    type="text" 
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full bg-transparent border-b border-gray-600 pb-3 text-xl text-white outline-none focus:border-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-gray-500 mb-2 block">WhatsApp Number</label>
                  <input 
                    type="tel" 
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full bg-transparent border-b border-gray-600 pb-3 text-xl text-white outline-none focus:border-white transition-colors"
                  />
                </div>
                
                <button 
                  onClick={handleConfirm}
                  disabled={submitting}
                  className="mt-8 bg-white text-black py-4 text-sm font-semibold uppercase tracking-widest hover:bg-gray-200 transition-colors w-full disabled:opacity-50"
                >
                  {submitting ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── STEP 3: CONFIRMATION RECEIPT (OVERLAY) ── */}
      <AnimatePresence>
        {step === 'receipt' && selectedTicket && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col md:flex-row items-center justify-center bg-black/90 backdrop-blur-md px-6 perspective-container gap-12"
          >
           {/* The Tilted 3D Ticket */}
            <motion.div 
              id="premium-ticket" // <-- ADD THIS ID HERE
              initial={{ rotateX: 40, rotateY: -20, rotateZ: 10, y: 100, opacity: 0, scale: 0.8 }}
              animate={{ rotateX: 20, rotateY: -10, rotateZ: 5, y: 0, opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 80, delay: 0.2 }}
              className="w-full max-w-[450px] bg-[#f4f4f4] rounded-xl shadow-[0_40px_80px_rgba(255,255,255,0.1)] flex flex-col overflow-hidden text-black relative"
            >
              {/* Receipt Header */}
              <div className="p-8 pb-6 border-b-2 border-dashed border-gray-300 relative">
                <div className="absolute left-[-12px] bottom-[-12px] w-6 h-6 bg-black rounded-full" />
                <div className="absolute right-[-12px] bottom-[-12px] w-6 h-6 bg-black rounded-full" />
                
                <div className="flex justify-between items-start mb-6">
                  <h2 className="font-['Inter'] text-2xl font-bold tracking-tight leading-none w-2/3">AAMBAL<br/>RETREAT</h2>
                  <Barcode className="h-8 opacity-60" />
                </div>
                
                <p className="text-3xl font-['Cormorant_Garamond'] tracking-tight mb-2">{selectedTicket.label}</p>
                <p className="text-gray-500 text-sm">Valid for {getSelection(selectedTicket.id).nights} night(s) of festival access and premium stay.</p>
              </div>

              {/* Receipt Body */}
              <div className="p-8 flex flex-col gap-5">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Guest</span>
                  <span className="text-sm font-semibold">{name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Check-in</span>
                  <span className="text-sm font-semibold">{getSelection(selectedTicket.id).date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 uppercase font-semibold">Ref Code</span>
                  <span className="text-sm font-mono font-bold tracking-widest">{refId}</span>
                </div>
                
                <div className="mt-4 flex items-center justify-between opacity-50">
                  <span className="text-[10px] uppercase font-bold tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-black rounded-full"></span> Not for resale
                  </span>
                  <Barcode className="h-6" />
                </div>
              </div>
            </motion.div>

            {/* Success Actions */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-col gap-6 max-w-sm"
            >
              <div>
                <h3 className="font-['Cormorant_Garamond'] text-5xl font-light mb-2">Ticket <span className="italic text-gray-400">issued.</span></h3>
                <p className="text-gray-400">Your reservation has been logged. Please send the confirmation to our WhatsApp to secure your slot.</p>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={openWhatsApp} className="w-full bg-[#25D366] text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#1ebc5a] transition shadow-lg flex items-center justify-center gap-3">
                  <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.396 0 .016 5.38.016 12.016c0 2.126.554 4.195 1.604 6.012L0 24l6.13-1.606c1.758.956 3.738 1.46 5.885 1.46 6.634 0 12.016-5.38 12.016-12.016S18.665 0 12.031 0zm.014 21.84c-1.802 0-3.56-.484-5.114-1.406l-.366-.216-3.805.996 1.014-3.71-.237-.378c-1.013-1.616-1.55-3.486-1.55-5.426 0-5.526 4.498-10.024 10.042-10.024 5.526 0 10.025 4.498 10.025 10.024s-4.499 10.024-10.025 10.024zm5.503-7.534c-.302-.152-1.785-.884-2.062-.986-.277-.101-.48-.152-.683.152-.202.304-.78 .986-.957 1.188-.177.202-.355.228-.658.076-.303-.152-1.275-.468-2.428-1.516-.898-.816-1.504-1.824-1.68-2.128-.178-.304-.019-.468.132-.62.136-.136.303-.355.454-.533.152-.178.203-.304.304-.507.101-.203.05-.38-.025-.533-.076-.152-.683-1.646-.935-2.254-.246-.592-.497-.512-.683-.522-.177-.01-.38-.01-.582-.01-.203 0-.532.076-.811.38-.278.304-1.063 1.038-1.063 2.532s1.088 2.938 1.24 3.14c.152.203 2.14 3.268 5.183 4.56.724.307 1.288.491 1.73.629.726.23 1.386.197 1.906.12.584-.087 1.785-.729 2.038-1.432.252-.704.252-1.308.176-1.433-.075-.124-.277-.202-.58-.354z"/></svg>
                  Send to WhatsApp
                </button>
                <button onClick={() => window.print()} className="w-full bg-transparent border border-white/30 text-white py-4 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-white/10 transition">
                  Download Receipt
                </button>
              </div>

              <button onClick={() => { setStep('select'); setRefId(""); }} className="mt-6 text-gray-500 text-xs hover:text-white underline text-center w-full">
                Return to Retreat
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}