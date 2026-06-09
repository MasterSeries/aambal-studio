import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Define Optional Search Parameters to Clear TS Errors ─────────────────────
type EnquirySearch = {
  service?: string;
};

export const Route = createFileRoute("/enquiry")({
  validateSearch: (search: Record<string, unknown>): EnquirySearch => ({
    service: (search.service as string) || undefined,
  }),
  component: EnquiryPage,
});

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Back: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Check: () => <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
};

const SERVICE_OPTIONS = [
  { id: "portrait", label: "Portrait Sessions" },
  { id: "bridal", label: "Bridal & Wedding" },
  { id: "graduation", label: "Graduation & Events" },
  { id: "newborn", label: "Newborn & Kids" },
  { id: "reels", label: "Reels & Short Films" },
  { id: "corporate", label: "Corporate & Brand" },
  { id: "festival", label: "Aambal Vasantham Festival Cover" },
  { id: "custom", label: "Custom Commission / Other" }
];

export default function EnquiryPage() {
  const { service: initialService } = Route.useSearch();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "custom",
    date: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Pre-fill the service dropdown if they clicked a specific link on the home page
  useEffect(() => {
    if (initialService && SERVICE_OPTIONS.find(s => s.id === initialService)) {
      setFormData(prev => ({ ...prev, service: initialService }));
    }
  }, [initialService]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) {
      alert("Please fill in your name, phone number, and a message.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "enquiries"), {
        ...formData,
        status: "new",
        createdAt: serverTimestamp(),
      });
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      alert("Something went wrong. Please try again or contact us via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans overflow-hidden relative flex flex-col selection:bg-purple-500/30">
      
      {/* ── CINEMATIC BACKGROUND ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-600/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>
      </div>

      {/* ── TOP NAV ── */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 py-8 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group">
          <div className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors backdrop-blur-md">
            <Icons.Back />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Return Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold font-display shadow-[0_0_15px_rgba(168,85,247,0.5)]">S</div>
          <span className="font-bold tracking-widest text-sm">STUDIO HUT</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-20 items-center">
          
          {/* LEFT: COPY & INFO */}
          <div className="lg:col-span-2 flex flex-col text-center lg:text-left">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block py-1.5 px-4 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] uppercase tracking-widest font-bold mb-6">
                Exclusive Commissions
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-light leading-[1.1] mb-6">
                Tell us your <br />
                <span className="font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-orange-400">vision.</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-10 max-w-md mx-auto lg:mx-0 font-medium">
                Whether you're planning an intricate festival shoot, a grand wedding, or a highly stylized studio portrait, our team is ready to bring it to life. Fill out the details, and our lead director will be in touch within 24 hours.
              </p>
              
              <div className="hidden lg:flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-purple-400">📍</div>
                  <div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Studio Base</p><p className="text-sm font-semibold">Kottayam, Kerala</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-orange-400">💬</div>
                  <div><p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-0.5">Direct Line</p><p className="text-sm font-semibold">+91 99999 99999</p></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: THE GLASS FORM */}
          <div className="lg:col-span-3">
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full bg-[#111114]/80 backdrop-blur-3xl rounded-[32px] md:rounded-[40px] border border-white/10 p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Form Inner Highlight */}
              <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>

              <AnimatePresence mode="wait">
                {!isSuccess ? (
                  <motion.form 
                    key="form"
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col gap-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Full Name *</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.User /></div>
                          <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-purple-500 focus:bg-white/5 transition-all" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">WhatsApp Number *</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Phone /></div>
                          <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-purple-500 focus:bg-white/5 transition-all" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Email Address</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Mail /></div>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-purple-500 focus:bg-white/5 transition-all" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Event/Shoot Date</label>
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"><Icons.Calendar /></div>
                          <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm outline-none focus:border-purple-500 focus:bg-white/5 transition-all text-gray-300" style={{ colorScheme: 'dark' }} />
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Service Required</label>
                      <select name="service" value={formData.service} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-purple-500 focus:bg-white/5 transition-all appearance-none text-gray-300 cursor-pointer">
                        {SERVICE_OPTIONS.map(opt => (
                          <option key={opt.id} value={opt.id} className="bg-[#111114] text-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold ml-2">Your Vision / Message *</label>
                      <textarea required name="message" value={formData.message} onChange={handleChange} placeholder="Tell us about the location, the vibe, or the memory you want to capture..." rows={4} className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-purple-500 focus:bg-white/5 transition-all resize-none custom-scrollbar"></textarea>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="mt-4 w-full h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-orange-500 text-white font-bold tracking-widest uppercase text-xs md:text-sm hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.4)] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {isSubmitting ? (
                         <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        "Submit Enquiry"
                      )}
                    </button>
                  </motion.form>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-16"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-black mb-8 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                      <Icons.Check />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-3 text-white">Request Received</h2>
                    <p className="text-gray-400 text-sm max-w-sm font-medium leading-relaxed mb-10">
                      Thank you, <span className="text-white">{formData.name}</span>. Your vision is safe with us. Our director will review your details and connect with you on WhatsApp shortly.
                    </p>
                    <Link to="/" className="px-8 py-3.5 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 transition-colors text-xs font-bold uppercase tracking-widest text-white">
                      Return Home
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}