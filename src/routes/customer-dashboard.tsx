import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  collection, query, where, onSnapshot,
  deleteDoc, doc, updateDoc, getDocs 
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import jsPDF from "jspdf";
import { motion, AnimatePresence } from "motion/react";
import hero from "@/assets/hero-festival.jpg"; // Using for the aesthetic card headers

export const Route = createFileRoute("/customer-dashboard")({
  component: CustomerDashboard,
});

// ── "Dormy" Inspired Aesthetic Tokens ─────────────────────────────────────────
const D = {
  bg: "#000000",
  card: "#18181b", // Dark grey
  cardLight: "#27272a",
  pink: "#f2a7db",
  green: "#bdf0cc",
  peach: "#ffb38a",
  textMain: "#ffffff",
  textMuted: "#8e8e93",
};

const STATUS_THEME: Record<string, { color: string; label: string }> = {
  pending:              { color: D.peach, label: "Pending" },
  approved:             { color: D.green, label: "Approved" },
  completed:            { color: D.pink,  label: "Completed" },
  rejected:             { color: "#ff6b6b", label: "Rejected" },
  reschedule_requested: { color: "#a78bfa", label: "Reschedule Req." },
};

// ── Icons ───────────────────────────────────────────────────────────────────
const Icons = {
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  LogOut: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  Calendar: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
  Clock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  QrCode: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  More: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
};

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function CustomerDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [viewQrBooking, setViewQrBooking] = useState<any>(null);
  const [newDate, setNewDate] = useState("");
  const [newSlots, setNewSlots] = useState("");

  // ── FIREBASE FETCH LOGIC ──
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) { window.location.href = "/customer-login"; return; }
      setUserName(user.displayName || "Guest");
      setUserEmail(user.email || "");
      
      const q = query(collection(db, "bookings"), where("clientEmail", "==", user.email));
      
      const unsubBookings = onSnapshot(q, (snap) => {
        const data: any[] = [];
        snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
        
        if(data.length === 0) {
           const legacyQ = query(collection(db, "bookings"), where("email", "==", user.email));
           getDocs(legacyQ).then((legacySnap: any) => {
              const legacyData: any[] = [];
              legacySnap.forEach((ld: any) => legacyData.push({ id: ld.id, ...ld.data() }));
              
              // Sort by date (newest first)
              legacyData.sort((a,b) => new Date(b.createdAt?.toDate() || 0).getTime() - new Date(a.createdAt?.toDate() || 0).getTime());
              setBookings(legacyData);
              setLoading(false);
           });
        } else {
           data.sort((a,b) => new Date(b.createdTimestamp?.toDate() || b.createdAt?.toDate() || 0).getTime() - new Date(a.createdTimestamp?.toDate() || a.createdAt?.toDate() || 0).getTime());
           setBookings(data);
           setLoading(false);
        }
      });
      return () => unsubBookings();
    });
    return () => unsubAuth();
  }, []);

  async function cancelBooking(id: string) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try { await deleteDoc(doc(db, "bookings", id)); }
    catch (err) { console.error(err); alert("Cancellation failed"); }
  }

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/customer-login";
  }

  function openReschedule(booking: any) {
    setRescheduleBooking(booking);
    setNewDate(booking.date || "");
    setNewSlots(booking.timeSlots?.join(", ") || booking.time || "");
  }

  async function submitReschedule() {
    try {
      await updateDoc(doc(db, "bookings", rescheduleBooking.id), {
        date: newDate,
        timeSlots: newSlots.split(",").map(s => s.trim()),
        status: "reschedule_requested",
      });
      setRescheduleBooking(null);
    } catch (err) { console.error(err); alert("Failed to reschedule"); }
  }

  function downloadInvoice(booking: any) {
    const pdf = new jsPDF();
    pdf.setFillColor(24, 24, 27); // Dark grey matching UI
    pdf.rect(0, 0, 210, 297, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.setFont("helvetica", "bold");
    pdf.text("STUDIO HUT", 20, 28);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(189, 240, 204); // Mint green
    pdf.text("DIGITAL BOOKING INVOICE", 20, 36);
    
    pdf.setDrawColor(255, 255, 255, 0.1);
    pdf.line(20, 45, 190, 45);
    
    const rows = [
      ["Reference ID", booking.referenceId || booking.reference || "N/A"],
      ["Primary Guest", booking.clientName || booking.name],
      ["Partner / Plus One", booking.partnerName || "—"],
      ["Contact Email", booking.clientEmail || booking.email],
      ["Contact Phone", booking.clientPhone || booking.phone],
      ["Package", booking.packageName || booking.package || "Festival Package"],
      ["Date", booking.date],
      ["Timeline", booking.timeSlots?.join(", ") || booking.time],
      ["Status", (booking.status || "Pending").toUpperCase()],
    ];

    rows.forEach(([k, v], i) => {
      pdf.setTextColor(142, 142, 147); // Muted text
      pdf.text(k, 20, 60 + i * 12);
      pdf.setTextColor(255, 255, 255); // White text
      pdf.text(String(v ?? "—"), 80, 60 + i * 12);
    });

    pdf.setTextColor(189, 240, 204);
    pdf.text("Thank you for choosing Studio Hut.", 20, 240);
    pdf.save(`${booking.clientName || booking.name}-invoice.pdf`);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#bdf0cc] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status === "approved" || b.status === "completed");
  const pendingBookings = bookings.filter(b => b.status === "pending" || !b.status || b.status === "reschedule_requested");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        /* Custom chunky font for the logo to mimic 'Dormy' */
        @font-face {
          font-family: 'DormyCustom';
          src: url('https://fonts.gstatic.com/s/syne/v18/8vIX7w4MziK8_y-aOwc.woff2') format('woff2');
        }

        body { background: ${D.bg}; color: ${D.textMain}; font-family: 'Plus Jakarta Sans', sans-serif; }
        ::-webkit-scrollbar { width: 0px; }
      `}</style>

      <div className="min-h-screen bg-black p-4 sm:p-6 md:p-8">
        <div className="max-w-[1000px] mx-auto">
          
          {/* ── HEADER ── */}
          <div className="flex justify-between items-center mb-8">
            <h1 style={{ fontFamily: 'DormyCustom', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>
              STUDIO HUT
            </h1>
            <button onClick={handleLogout} className="w-12 h-12 bg-[#18181b] rounded-full flex items-center justify-center text-orange-400 hover:bg-[#27272a] transition-colors">
              <Icons.LogOut />
            </button>
          </div>

          {/* ── TOP STATS ROW (Dormy Pastel Blocks) ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#18181b] rounded-[32px] p-6 flex flex-col justify-between aspect-square md:aspect-auto">
              <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white mb-4"><Icons.User /></div>
              <div>
                <p className="text-white font-bold text-lg leading-tight truncate">{userName}</p>
                <p className="text-[#8e8e93] text-xs font-medium mt-1 truncate">{userEmail}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#bdf0cc] rounded-[32px] p-6 flex flex-col justify-between aspect-square md:aspect-auto">
              <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black mb-4">
                <span className="font-bold">{activeBookings.length}</span>
              </div>
              <p className="text-black font-bold text-lg leading-tight">Active<br/>Passes</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#ffb38a] rounded-[32px] p-6 flex flex-col justify-between aspect-square md:aspect-auto">
              <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black mb-4">
                <span className="font-bold">{pendingBookings.length}</span>
              </div>
              <p className="text-black font-bold text-lg leading-tight">Pending<br/>Review</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[#f2a7db] rounded-[32px] p-6 flex flex-col justify-between aspect-square md:aspect-auto">
               <div className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center text-black mb-4">
                <span className="font-bold">{bookings.length}</span>
              </div>
              <p className="text-black font-bold text-lg leading-tight">Total<br/>History</p>
            </motion.div>
          </div>

          {/* ── BOOKINGS LIST ── */}
          <h2 className="text-white font-bold text-2xl mb-6">Your Sessions</h2>
          
          {bookings.length === 0 ? (
            <div className="bg-[#18181b] rounded-[32px] p-12 text-center">
              <p className="text-[#8e8e93] font-medium">No active sessions found.</p>
              <a href="/#packages" className="inline-block mt-4 bg-white text-black font-bold px-6 py-3 rounded-full text-sm">Explore Packages</a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking, i) => {
                const theme = STATUS_THEME[booking.status] || STATUS_THEME.pending;
                const primaryName = booking.clientName || booking.name || "Guest";
                const partnerName = booking.partnerName;
                const dateDisplay = booking.date?.includes("-") ? new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : booking.date;

                return (
                  <motion.div 
                    key={booking.id} 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                    className="bg-[#18181b] rounded-[32px] overflow-hidden flex flex-col"
                  >
                    {/* Visual Header (Like the 'Mates' image card) */}
                    <div className="h-40 w-full relative">
                      <img src={hero} alt="Session Cover" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] to-transparent"></div>
                      
                      <div className="absolute top-4 left-4">
                         <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full" style={{ backgroundColor: theme.color }}></div>
                           <span className="text-white text-[10px] font-bold tracking-widest uppercase">{theme.label}</span>
                         </div>
                      </div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-bold text-2xl leading-tight truncate">{booking.packageName || booking.package || "Premium Session"}</h3>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      
                      {/* Date & Time Blocks */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="bg-[#27272a] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                          <Icons.Calendar />
                          <span className="text-white font-bold text-sm mt-2">{dateDisplay}</span>
                        </div>
                        <div className="bg-[#27272a] rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                          <Icons.Clock />
                          <span className="text-white font-bold text-sm mt-2">{booking.time || booking.timeSlots?.join(", ") || "TBD"}</span>
                        </div>
                      </div>

                      {/* Guest Info */}
                      <div className="bg-[#27272a] rounded-2xl p-4 mb-6">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                          <span className="text-[#8e8e93] text-xs font-medium">Primary</span>
                          <span className="text-white text-sm font-bold truncate max-w-[150px]">{primaryName}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#8e8e93] text-xs font-medium">Partner</span>
                          <span className="text-white text-sm font-bold truncate max-w-[150px]">{partnerName || "—"}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-auto grid grid-cols-4 gap-2">
                        <button 
                          onClick={() => setViewQrBooking(booking)}
                          className="col-span-2 bg-white text-black rounded-2xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                        >
                          <Icons.QrCode /> Pass
                        </button>
                        <button 
                          onClick={() => downloadInvoice(booking)}
                          className="col-span-1 bg-[#27272a] text-white rounded-2xl py-3.5 flex items-center justify-center hover:bg-[#3f3f46] transition-colors"
                          title="Download Invoice"
                        >
                          <Icons.FileText />
                        </button>
                        {booking.status !== "completed" && booking.status !== "approved" ? (
                          <button 
                            onClick={() => openReschedule(booking)}
                            className="col-span-1 bg-[#27272a] text-white rounded-2xl py-3.5 flex items-center justify-center hover:bg-[#3f3f46] transition-colors"
                            title="Reschedule"
                          >
                            <Icons.Calendar />
                          </button>
                        ) : (
                          <a 
                            href="/customer-gallery"
                            className="col-span-1 bg-[#f2a7db] text-black rounded-2xl py-3.5 flex items-center justify-center hover:brightness-110 transition-colors"
                            title="View Gallery"
                          >
                            <Icons.More />
                          </a>
                        )}
                      </div>
                      
                      {booking.status === "pending" && (
                        <button onClick={() => cancelBooking(booking.id)} className="w-full text-center text-[#ff6b6b] text-xs font-bold mt-4 hover:underline">
                          Cancel Booking
                        </button>
                      )}

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── DIGITAL PASS QR MODAL ── */}
        <AnimatePresence>
          {viewQrBooking && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="bg-[#18181b] border border-[#27272a] rounded-[40px] w-full max-w-md p-8 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#bdf0cc]/20 to-transparent pointer-events-none" />
                
                <button 
                  onClick={() => setViewQrBooking(null)}
                  className="absolute top-6 right-6 w-8 h-8 bg-[#27272a] rounded-full flex items-center justify-center text-white/50 hover:text-white transition-colors"
                >✕</button>

                <div className="text-center mt-4">
                  <div className="inline-block px-3 py-1 bg-[#bdf0cc]/10 text-[#bdf0cc] text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">
                    Access Pass
                  </div>
                  <h2 className="text-white font-bold text-2xl mb-1 leading-tight">
                    {viewQrBooking.packageName || viewQrBooking.package || "Premium Session"}
                  </h2>
                  <p className="text-[#8e8e93] text-xs font-medium mb-8">Ref: {viewQrBooking.referenceId || viewQrBooking.reference || "N/A"}</p>
                  
                  <div className="bg-white p-4 rounded-3xl inline-block mb-8 shadow-[0_0_40px_rgba(189,240,204,0.15)]">
                    <img 
                      src={viewQrBooking.qrUrl || `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(window.location.origin + '/verify-booking?ref=' + (viewQrBooking.referenceId || viewQrBooking.reference))}`} 
                      alt="QR Code" 
                      className={`w-48 h-48 ${viewQrBooking.status === 'approved' || viewQrBooking.status === 'completed' ? '' : 'blur-sm opacity-50'}`} 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-left">
                     <div className="bg-[#27272a] p-4 rounded-2xl">
                       <p className="text-[#8e8e93] text-[10px] uppercase font-bold tracking-wider mb-1">Primary</p>
                       <p className="text-white text-sm font-bold truncate">{viewQrBooking.clientName || viewQrBooking.name}</p>
                     </div>
                     <div className="bg-[#27272a] p-4 rounded-2xl">
                       <p className="text-[#8e8e93] text-[10px] uppercase font-bold tracking-wider mb-1">Partner</p>
                       <p className="text-white text-sm font-bold truncate">{viewQrBooking.partnerName || "—"}</p>
                     </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESCHEDULE MODAL ── */}
        <AnimatePresence>
          {rescheduleBooking && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4 pb-0 sm:pb-4"
            >
              <motion.div
                initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="bg-[#18181b] border border-[#27272a] rounded-t-[40px] sm:rounded-[40px] w-full max-w-md p-8"
              >
                <h2 className="text-white font-bold text-2xl mb-2">Reschedule Session</h2>
                <p className="text-[#8e8e93] text-sm mb-8">Choose a new date and time for your booking.</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#8e8e93] text-xs font-bold uppercase tracking-wider mb-2 ml-1">New Date</label>
                    <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full bg-[#27272a] border-none text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#ffb38a] transition-all color-scheme-dark" style={{ colorScheme: 'dark' }} />
                  </div>
                  <div>
                    <label className="block text-[#8e8e93] text-xs font-bold uppercase tracking-wider mb-2 ml-1">New Time Slot</label>
                    <input type="text" placeholder="e.g. 08:30 AM" value={newSlots} onChange={(e) => setNewSlots(e.target.value)} className="w-full bg-[#27272a] border-none text-white rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#ffb38a] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-8">
                  <button onClick={() => setRescheduleBooking(null)} className="bg-[#27272a] text-white font-bold py-4 rounded-2xl">Cancel</button>
                  <button onClick={submitReschedule} className="bg-[#ffb38a] text-black font-bold py-4 rounded-2xl">Confirm</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}