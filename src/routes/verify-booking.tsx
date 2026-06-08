import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const Route = createFileRoute("/verify-booking")({
  validateSearch: (search: Record<string, unknown>) => ({
    ref: (search.ref as string) || undefined,
  }),
  component: VerifyBookingPage,
});

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  CheckShield: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Phone: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>,
  Mail: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Barcode: () => <svg width="100%" height="40" viewBox="0 0 200 40" fill="currentColor" preserveAspectRatio="none"><path d="M0 0h6v40H0zM10 0h2v40h-2zM16 0h8v40h-8zM28 0h4v40h-4zM36 0h2v40h-2zM42 0h12v40H42zM58 0h4v40h-4zM66 0h2v40h-2zM72 0h6v40h-6zM82 0h8v40h-8zM94 0h2v40h-2zM100 0h10v40h-10zM114 0h4v40h-4zM122 0h2v40h-2zM128 0h8v40h-8zM140 0h4v40h-4zM148 0h2v40h-2zM154 0h12v40h-12zM170 0h6v40h-6zM180 0h4v40h-4zM188 0h2v40h-2zM194 0h6v40h-6z"></path></svg>,
  Plane: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.2-1.1.6L3 8l6 4-3 3-3-1-2 2 4 4 4-2-1-3 3-3 4 6l1.2-.7c.4-.2.7-.6.6-1.1z"></path></svg>
};

export default function VerifyBookingPage() {
  const { ref } = Route.useSearch();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!ref) {
      setError("No tracking reference parameter found in the URL.");
      setLoading(false);
      return;
    }

    const fetchBookingDetails = async () => {
      try {
        const bookingsRef = collection(db, "bookings");
        
        // Check for referenceId (new schema)
        let q = query(bookingsRef, where("referenceId", "==", ref));
        let querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          // Fallback check for "reference" (older booking schemas)
          q = query(bookingsRef, where("reference", "==", ref));
          querySnapshot = await getDocs(q);
        }

        if (!querySnapshot.empty) {
          setBooking(querySnapshot.docs[0].data());
        } else {
          setError("This digital pass could not be found or has expired.");
        }
      } catch (err) {
        console.error("Verification fetch error:", err);
        setError("An error occurred while verifying the pass. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [ref]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#a3889f] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-[#a3889f] tracking-widest uppercase">Verifying Pass...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#fcfaf9] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-[32px] p-10 text-center shadow-xl border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
          <p className="text-slate-500 text-sm mb-8">{error}</p>
          <button onClick={() => window.location.href = '/'} className="bg-slate-900 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-slate-800 transition-colors">
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Handle both old and new schema structures
  const displayRef = booking.referenceId || booking.reference || ref;
  const refParts = displayRef.split('-');
  const primaryPrefix = refParts[0] || 'TKT';
  const secondaryId = refParts[1] || Math.floor(1000 + Math.random() * 9000).toString();
  const pkgName = booking.packageName || booking.package || "Premium Session";
  const pkgPrice = booking.packagePrice || booking.price || "Pre-Paid";
  const clientName = booking.clientName || booking.name || "Guest";
  const clientPhone = booking.clientPhone || booking.phone || "N/A";
  const clientEmail = booking.clientEmail || booking.email || "N/A";
  const passTime = booking.time || (booking.timeSlots ? booking.timeSlots.join(", ") : "Any Time");

  return (
    <div className="min-h-screen w-full relative bg-gradient-to-br from-[#f8ecec] via-[#f4f0f0] to-[#e6e9f0] flex items-center justify-center p-4 sm:p-8 font-sans overflow-hidden">
      
      {/* Decorative Floating Elements */}
      <div className="absolute top-[10%] left-[5%] w-32 h-32 bg-white/40 rounded-full blur-2xl"></div>
      <div className="absolute bottom-[20%] right-[10%] w-64 h-64 bg-[#d8c5d6]/30 rounded-full blur-3xl"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[1200px] bg-[#fcfaf9]/80 backdrop-blur-3xl rounded-[40px] border border-white/60 shadow-[0_20px_60px_rgba(163,136,159,0.15)] p-6 sm:p-10 min-h-[750px] flex flex-col xl:flex-row gap-8"
      >
        {/* LEFT COLUMN: Ticket Graphics */}
        <div className="flex-1 flex flex-col relative items-center">
          <motion.div 
            initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="w-full max-w-md bg-[#fffaf5] rounded-[32px] p-6 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-white relative z-20"
          >
            <div className="absolute top-1/2 -left-4 w-8 h-8 bg-[#fcfaf9] rounded-full transform -translate-y-1/2 shadow-inner border-r border-slate-100"></div>
            <div className="absolute top-1/2 -right-4 w-8 h-8 bg-[#fcfaf9] rounded-full transform -translate-y-1/2 shadow-inner border-l border-slate-100"></div>

            <div className="flex justify-between items-center mb-6 px-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{primaryPrefix}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">{pkgName.substring(0, 15)}</span>
              </div>
              <div className="text-[#b09db9]"><Icons.Plane /></div>
              <div className="flex flex-col text-right">
                <span className="text-2xl font-black text-slate-800 tracking-tight">{secondaryId}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">ID NO</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-200 pt-6 px-4">
              <div className="text-slate-800 mb-2"><Icons.Barcode /></div>
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{passTime}</span>
              </div>
            </div>
          </motion.div>

          {/* Central 3D Platform Area */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="flex-1 w-full flex items-center justify-center mt-12 relative">
             <div className="absolute bottom-10 w-3/4 h-12 bg-black/5 rounded-[100%] blur-xl"></div>
             <div className="relative w-full max-w-[400px] aspect-square transform hover:scale-105 transition-transform duration-700 ease-out">
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-[40%] bg-gradient-to-tr from-[#3b2d4a] to-[#5b4a6b] rounded-3xl transform rotate-[-30deg] skew-x-[30deg] shadow-2xl"></div>
                <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[60%] h-[50%] bg-gradient-to-tr from-[#fcfaf9] to-white rounded-2xl transform rotate-[-30deg] skew-x-[30deg] shadow-[20px_20px_40px_rgba(0,0,0,0.15)] flex flex-col items-center justify-center p-6 border border-white/60">
                   <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500 mb-4 shadow-inner"><Icons.CheckShield /></div>
                   <p className="text-lg font-bold text-slate-800">Verified Secure</p>
                   <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Official Digital Pass</p>
                </div>
             </div>
          </motion.div>
        </div>

        {/* RIGHT COLUMN: Side Widgets */}
        <div className="w-full xl:w-[350px] flex flex-col gap-6 relative z-20">
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-[#a3889f] rounded-[32px] p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10"></div>
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"><Icons.CheckShield /></div>
              <div>
                <p className="text-[11px] uppercase tracking-widest font-semibold opacity-80">System Status</p>
                <p className="text-xl font-bold">Valid & Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="bg-[#fffdfb]/80 backdrop-blur-md rounded-[32px] p-6 border border-white/80 shadow-sm flex-1">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Passholder Profile</h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f4f0f0] flex items-center justify-center text-slate-500 shrink-0"><Icons.User /></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Primary Guest</p><p className="text-sm font-bold text-slate-800">{clientName}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f4f0f0] flex items-center justify-center text-slate-500 shrink-0"><Icons.Phone /></div>
                <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contact Line</p><p className="text-sm font-bold text-slate-800">{clientPhone}</p></div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#f4f0f0] flex items-center justify-center text-slate-500 shrink-0"><Icons.Mail /></div>
                <div className="min-w-0"><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Digital Inbox</p><p className="text-sm font-bold text-slate-800 truncate">{clientEmail}</p></div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-[#fcfaf9] border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div><p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Amount Secured</p><p className="text-sm font-bold text-slate-800">{pkgPrice}</p></div>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">Fully Paid</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}