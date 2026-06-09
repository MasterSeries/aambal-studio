import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export const Route = createFileRoute("/booking-confirmed")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: (search.plan as string) || undefined,
  }),
  component: MainBookingApp,
});

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  Calendar: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Clock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  CheckShield: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>,
  Close: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>,
  ChevronLeft: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>,
  Plane: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-3 3-3-1-2 2 4 4 4-2-1-3 3-3 4 6l1.2-.7c.4-.2.7-.6.6-1.1z"></path></svg>,
  Barcode: () => <svg width="100%" height="35" viewBox="0 0 200 40" fill="currentColor" preserveAspectRatio="none"><path d="M0 0h6v40H0zM10 0h2v40h-2zM16 0h8v40h-8zM28 0h4v40h-4zM36 0h2v40h-2zM42 0h12v40H42zM58 0h4v40h-4zM66 0h2v40h-2zM72 0h6v40h-6zM82 0h8v40h-8zM94 0h2v40h-2zM100 0h10v40h-10zM114 0h4v40h-4zM122 0h2v40h-2zM128 0h8v40h-8zM140 0h4v40h-4zM148 0h2v40h-2zM154 0h12v40h-12zM170 0h6v40h-6zM180 0h4v40h-4zM188 0h2v40h-2zM194 0h6v40h-6z"></path></svg>
};

const AVAILABLE_SLOTS = ["06:00 AM", "08:30 AM", "11:00 AM", "03:30 PM", "05:30 PM"];

function PremiumCalendar({ selectedDate, onSelectDate }: { selectedDate: string, onSelectDate: (d: string) => void }) {
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const prevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renderDays = () => {
    const days = [];
    const offset = startDay === 0 ? 6 : startDay - 1; 
    for (let i = 0; i < offset; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
      currentDate.setHours(0, 0, 0, 0);
      
      const isPast = currentDate < today;
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
      const isSelected = selectedDate === dateString;

      days.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => onSelectDate(dateString)}
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
            ${isPast ? 'text-slate-300 cursor-not-allowed' : 
              isSelected ? 'bg-[#a3889f] text-white shadow-md scale-105' : 
              'text-slate-600 hover:bg-white/80 hover:text-slate-900'
            }`}
        >
          {d}
        </button>
      );
    }
    return days;
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/60 hover:bg-white text-slate-600 transition-colors shadow-sm"><Icons.ChevronLeft /></button>
        <h3 className="text-slate-700 font-bold tracking-wide text-xs uppercase">
          {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
        </h3>
        <button type="button" onClick={nextMonth} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/60 hover:bg-white text-slate-600 transition-colors shadow-sm"><Icons.ChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 justify-items-center">
        {renderDays()}
      </div>
    </div>
  );
}

export default function MainBookingApp() {
  const { plan: planId } = Route.useSearch();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  
  // Primary Client
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  
  // Partner / Plus One
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Auto-fill logged in user
  useEffect(() => {
    if (auth.currentUser) {
      setEmail(auth.currentUser.email || "");
      setName(auth.currentUser.displayName || "");
    }
  }, []);

  useEffect(() => {
    async function fetchPackageContext() {
      try {
        const pkgDoc = await getDoc(doc(db, "siteContent", "packages"));
        if (pkgDoc.exists() && planId) {
          const allPackages = pkgDoc.data();
          if (allPackages[planId]) {
            setSelectedPlan(allPackages[planId]);
          }
        }
      } catch (err) {
        console.error("Error fetching packages content:", err);
      } finally {
        setLoadingPlan(false);
      }
    }
    fetchPackageContext();
  }, [planId]);

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }
    const bookingsRef = collection(db, "bookings");
    const dateQuery = query(bookingsRef, where("date", "==", selectedDate));

    const unsubscribe = onSnapshot(dateQuery, (snapshot) => {
      const taken: string[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.time) taken.push(data.time);
      });
      setBookedSlots(taken);
    }, (error) => console.error("Availability stream error:", error));

    return () => unsubscribe();
  }, [selectedDate]);

  // ── REALTIME LISTENER FOR THE CONFIRMED BOOKING ──
  useEffect(() => {
    if (step === 3 && confirmedBooking?.id) {
      const unsub = onSnapshot(doc(db, "bookings", confirmedBooking.id), (docSnap) => {
        if (docSnap.exists()) {
          setConfirmedBooking((prev: any) => ({ ...prev, ...docSnap.data() }));
        }
      });
      return () => unsub();
    }
  }, [step, confirmedBooking?.id]);

  const handleBookingExecution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime || !name || !phone || !email) {
      alert("Please complete all required details to proceed.");
      return;
    }

    setIsSubmitting(true);
    const bookingReference = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    const pkgName = selectedPlan?.name || planId || "Premium Package";
    const pkgPrice = selectedPlan?.price || "Custom Rate";

    const operationalPayload = {
      referenceId: bookingReference,
      clientName: name,
      clientPhone: phone,
      clientEmail: email,
      packageName: pkgName,
      packagePrice: pkgPrice,
      reference: bookingReference,
      name: name,
      phone: phone,
      email: email,
      package: pkgName,
      price: pkgPrice,
      date: selectedDate,
      time: selectedTime,
      partnerName: partnerName || null,
      partnerPhone: partnerPhone || null,
      status: "pending", 
      createdAt: serverTimestamp(),
    };

    try {
      const docRef = await addDoc(collection(db, "bookings"), operationalPayload);
      const baseUrl = window.location.origin;
      const verificationUrl = `${baseUrl}/verify-booking?ref=${bookingReference}`;
      const qrEndpoint = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(verificationUrl)}`;

      // Attach the real document ID so the real-time listener works!
      setConfirmedBooking({ ...operationalPayload, id: docRef.id, qrUrl: qrEndpoint });
      setStep(3); 
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#a3889f] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Derive Status Variables for Real-Time UI
  const isApproved = confirmedBooking?.status === "approved" || confirmedBooking?.status === "completed";
  const isRejected = confirmedBooking?.status === "rejected";
  const isPending = !isApproved && !isRejected;

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-[#f8ecec] via-[#f4f0f0] to-[#e6e9f0] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      
      <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
      <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-[#d8c5d6]/30 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-[1150px] bg-[#fcfaf9]/80 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-[0_20px_60px_rgba(163,136,159,0.12)] p-5 sm:p-8 flex flex-col min-h-[700px]">
        
        <AnimatePresence mode="wait">
          {step < 3 ? (
            
            <motion.div key="booking-form" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }} className="w-full flex flex-col flex-1">
              
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                 <button onClick={() => navigate({ to: "/" })} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-slate-800 transition-colors group">
                    <span className="transform group-hover:-translate-x-0.5 transition-transform"><Icons.ChevronLeft /></span> Back
                  </button>
                  <div className="flex items-center gap-2 bg-white/60 px-4 py-1.5 rounded-full border border-white/80 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reserve Hub</span>
                  </div>
              </div>

              <div className="lg:hidden flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-2">
                   <div className={`w-8 h-1.5 rounded-full ${step >= 1 ? 'bg-[#a3889f]' : 'bg-slate-200'}`}></div>
                   <div className={`w-8 h-1.5 rounded-full ${step >= 2 ? 'bg-[#a3889f]' : 'bg-slate-200'}`}></div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                   Step {step} of 2
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                
                <div className={`lg:col-span-7 flex-col gap-6 ${step === 1 ? 'flex' : 'hidden lg:flex'}`}>
                  
                  <div className="bg-[#fffdfb]/80 border border-white/80 rounded-[32px] p-6 sm:p-8 shadow-sm">
                    <h2 className="text-xs text-[#a3889f] uppercase tracking-widest font-bold mb-1">Pass Configuration</h2>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800 mb-6">
                      Secure your <span className="text-[#a3889f]">Digital Access</span>
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-4 bg-[#fffaf5] p-4 rounded-2xl border border-slate-100">
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Experience</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{selectedPlan?.name || "Premium Session"}</p>
                      </div>
                      <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Timeline</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{selectedPlan?.duration || "Standard Block"}</p>
                      </div>
                      <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
                      <div className="flex-1 min-w-[120px]">
                        <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Price Value</p>
                        <p className="text-xs font-extrabold text-[#a3889f] truncate">{selectedPlan?.price || "₹14,999"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#fffdfb]/80 border border-white/80 rounded-[32px] p-6 sm:p-8 shadow-sm flex-1">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Icons.User /> Holder Profile
                    </h3>
                    <div className="space-y-3 mb-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-4 top-[15px] text-slate-400"><Icons.User /></span>
                          <input type="text" required placeholder="Full Name *" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/60 border border-white/50 rounded-xl pl-11 pr-4 py-3.5 text-xs font-medium text-slate-800 outline-none focus:border-[#a3889f] focus:bg-white/90 transition-all placeholder-slate-400 shadow-inner" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-[15px] text-slate-400"><Icons.Phone /></span>
                          <input type="tel" required placeholder="WhatsApp Contact *" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white/60 border border-white/50 rounded-xl pl-11 pr-4 py-3.5 text-xs font-medium text-slate-800 outline-none focus:border-[#a3889f] focus:bg-white/90 transition-all placeholder-slate-400 shadow-inner" />
                        </div>
                      </div>
                      <div className="relative">
                        <span className="absolute left-4 top-[15px] text-slate-400"><Icons.Mail /></span>
                        <input type="email" required placeholder="Digital Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/60 border border-white/50 rounded-xl pl-11 pr-4 py-3.5 text-xs font-medium text-slate-800 outline-none focus:border-[#a3889f] focus:bg-white/90 transition-all placeholder-slate-400 shadow-inner" />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Icons.Users /> Partner / Plus One (Optional)
                      </h3>
                      <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">If someone is joining your shoot, add their details so they receive gallery access and a copy of the digital pass when approved.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <span className="absolute left-4 top-[15px] text-slate-300"><Icons.User /></span>
                          <input type="text" placeholder="Partner's Name" value={partnerName} onChange={(e) => setPartnerName(e.target.value)} className="w-full bg-white/40 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-[#a3889f] transition-all placeholder-slate-400" />
                        </div>
                        <div className="relative">
                          <span className="absolute left-4 top-[15px] text-slate-300"><Icons.Phone /></span>
                          <input type="tel" placeholder="Partner's WhatsApp" value={partnerPhone} onChange={(e) => setPartnerPhone(e.target.value)} className="w-full bg-white/40 border border-slate-100 rounded-xl pl-11 pr-4 py-3 text-xs font-medium text-slate-800 outline-none focus:border-[#a3889f] transition-all placeholder-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button type="button" onClick={() => setStep(2)} disabled={!name || !phone || !email} className="lg:hidden w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all mt-4">
                    Continue to Schedule
                  </button>
                </div>

                <div className={`lg:col-span-5 flex-col gap-6 ${step === 2 ? 'flex' : 'hidden lg:flex'}`}>
                  
                  <button type="button" onClick={() => setStep(1)} className="lg:hidden w-full bg-white text-slate-600 border border-slate-200 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                    Back to Details
                  </button>

                  <div className="bg-[#fffdfb]/80 border border-white/80 rounded-[32px] p-6 shadow-sm">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <Icons.Calendar /> Target Date
                    </h3>
                    <PremiumCalendar selectedDate={selectedDate} onSelectDate={(d) => { setSelectedDate(d); setSelectedTime(""); }} />
                  </div>

                  <div className="bg-[#fffdfb]/80 border border-white/80 rounded-[32px] p-6 shadow-sm flex-1 flex flex-col">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Icons.Clock /> Window Allocation
                    </h3>
                    
                    {!selectedDate ? (
                      <div className="flex-1 flex items-center justify-center text-xs font-semibold text-slate-400 text-center px-4 bg-white/40 rounded-2xl border border-slate-100 border-dashed min-h-[140px]">
                        Choose active date coordinates above
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {AVAILABLE_SLOTS.map((time) => {
                          const isBooked = bookedSlots.includes(time);
                          const isSelected = selectedTime === time;

                          return (
                            <button
                              key={time}
                              type="button"
                              disabled={isBooked}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-between border
                                ${isBooked ? 'bg-slate-100/70 border-slate-200 text-slate-300 cursor-not-allowed line-through' : 
                                  isSelected ? 'bg-[#a3889f] border-[#a3889f] text-white shadow-sm' : 
                                  'bg-white border-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                              <span>{time}</span>
                              <div className={`w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center ${isSelected ? 'border-white bg-white' : 'border-slate-200'}`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#a3889f]"></div>}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleBookingExecution}
                    disabled={isSubmitting || !selectedDate || !selectedTime || !name} 
                    className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white disabled:text-slate-500 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
                  >
                    {isSubmitting ? "Generating Credentials..." : "Submit Booking Request"}
                  </button>
                </div>
              </div>
            </motion.div>

          ) : (
            
            // ── PAGE 3: REAL-TIME DYNAMIC APPROVAL SCREEN ──
            <motion.div key="page-3" initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="w-full flex-1 flex flex-col items-center justify-center py-6 sm:py-10">
              
              <div className="text-center mb-8">
                <div className={`w-12 h-12 ${isApproved ? 'bg-emerald-50 text-emerald-500 border-emerald-100' : isRejected ? 'bg-red-50 text-red-500 border-red-100' : 'bg-amber-50 text-amber-500 border-amber-100'} rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner transition-colors duration-500`}>
                  {isApproved ? <Icons.CheckShield /> : isRejected ? <Icons.Close /> : <Icons.Clock />}
                </div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight transition-all duration-500">
                  {isApproved ? "Pass Secured Successfully" : isRejected ? "Booking Declined" : "Booking Request Processing"}
                </h1>
                <p className="text-slate-400 mt-1.5 text-xs font-medium max-w-sm mx-auto transition-all duration-500">
                  {isApproved ? "Your credentials have been verified and your pass is live." : isRejected ? "Unfortunately, this slot could not be secured." : "We have received your details. Your pass will be fully activated upon admin approval."}
                </p>
              </div>

              <div className="w-full max-w-[850px] bg-[#fffdfb]/90 backdrop-blur-2xl rounded-[36px] border border-white/90 shadow-[0_15px_40px_rgba(0,0,0,0.06)] overflow-hidden flex flex-col md:flex-row relative">
                
                <div className="absolute top-1/2 -left-3.5 w-7 h-7 bg-[#f2eeee] rounded-full transform -translate-y-1/2 shadow-inner border-r border-slate-200/40 z-20 hidden md:block"></div>
                <div className="absolute top-1/2 -right-3.5 w-7 h-7 bg-[#f2eeee] rounded-full transform -translate-y-1/2 shadow-inner border-l border-slate-200/40 z-20 hidden md:block"></div>
                
                <div className="flex-1 p-6 sm:p-8 border-b md:border-b-0 md:border-r border-slate-200 border-dashed relative bg-[#fffaf5]/50">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-slate-800 tracking-tight">{confirmedBooking.referenceId.split('-')[0]}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[150px]">{confirmedBooking.packageName}</span>
                    </div>
                    <div className="text-[#b09db9]"><Icons.Plane /></div>
                    <div className="flex flex-col text-right">
                      <span className="text-2xl font-black text-slate-800 tracking-tight">{confirmedBooking.referenceId.split('-')[1]}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID REF</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm flex justify-between items-center">
                       <div>
                         <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Requested Date</p>
                         <p className="text-xs font-bold text-slate-800">{new Date(confirmedBooking.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Timeline Window</p>
                         <p className="text-xs font-bold text-slate-800">{confirmedBooking.time}</p>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm">
                         <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Primary Holder</p>
                         <p className="text-xs font-bold text-slate-800 truncate">{confirmedBooking.clientName}</p>
                         {confirmedBooking.partnerName && (
                           <p className="text-[10px] text-slate-500 mt-1 truncate">+ {confirmedBooking.partnerName}</p>
                         )}
                      </div>
                      <div className="bg-white/80 border border-slate-100 rounded-2xl p-4 shadow-sm">
                         <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-0.5">Operational Status</p>
                         <span className={`inline-flex items-center text-[10px] font-bold ${isApproved ? 'text-emerald-600 bg-emerald-50' : isRejected ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50'} px-2.5 py-0.5 rounded-full uppercase tracking-wider mt-0.5 transition-colors duration-500`}>
                           {isApproved ? "Verified & Active" : isRejected ? "Void" : "Pending Approval"}
                         </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 text-slate-700 opacity-60">
                     <Icons.Barcode />
                  </div>
                </div>

                <div className="w-full md:w-[260px] p-6 sm:p-8 flex flex-col items-center justify-center bg-white/70">
                  <p className="text-[10px] font-bold text-slate-400 mb-4 tracking-widest text-center uppercase">Validation Token</p>
                  <div className={`bg-[#fffdfb] p-3 rounded-2xl shadow-md border border-slate-100 transition-all duration-500 ${isApproved ? 'opacity-100' : 'opacity-50'}`}>
                    <img src={confirmedBooking.qrUrl} alt="QR Secure Code Pass" className={`w-28 h-28 object-contain transition-all duration-500 ${isApproved ? 'blur-0' : 'blur-[2px]'}`} />
                  </div>
                  <p className={`text-[9px] font-bold uppercase tracking-widest mt-4 text-center leading-tight transition-colors duration-500 ${isApproved ? 'text-emerald-500' : isRejected ? 'text-red-500' : 'text-amber-500'}`}>
                    {isApproved ? "Scan to verify booking" : isRejected ? "Pass is Invalid" : "QR activates upon admin approval"}
                  </p>
                </div>
              </div>

              <button onClick={() => navigate({ to: "/" })} className="mt-8 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors bg-white/60 hover:bg-white/90 px-8 py-3 rounded-full border border-white/80 shadow-sm">
                Return to Home
              </button>
            </motion.div>

          )}
        </AnimatePresence>

      </div>
    </div>
  );
}