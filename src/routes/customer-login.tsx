import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export const Route = createFileRoute("/customer-login")({
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    if (!email || !password) {
      setError("Please fill all fields");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // Direct redirect after successful await
      window.location.href = "/customer-dashboard";
    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#ece8e2] md:p-6 lg:p-10 flex items-center justify-center font-sans">
      <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row h-[100vh] md:h-[800px] md:rounded-[40px] overflow-hidden bg-[#e6ded4] md:bg-transparent shadow-2xl md:shadow-none">
        
        {/* ── MOBILE: Top Image (Hidden on Desktop) ── */}
        <div className="md:hidden w-full h-[40vh] relative">
          <img 
            src="https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80" 
            alt="Festival Portrait" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent h-24"></div>
        </div>

        {/* ── LEFT COLUMN: Login Card ── */}
        <div className="flex-1 flex flex-col relative z-10 -mt-10 md:mt-0 rounded-t-[40px] md:rounded-[40px] bg-gradient-to-br from-[#eadbcc] to-[#dfdec0] p-8 md:p-12 lg:p-16 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-xl border border-white/20">
          
          <div className="flex justify-between items-center mb-16">
            <span className="text-gray-500 font-medium tracking-wide">f.studios_</span>
            <Link to="/customer-signup" className="text-[#1b2028] font-semibold hover:opacity-70 transition-opacity">
              Sign up
            </Link>
          </div>

          <div className="flex items-center justify-between mb-10">
             <h1 className="text-4xl md:text-5xl font-medium text-[#1b2028] tracking-tight">Log in</h1>
          </div>

          {error && (
            <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-8">
            <div className="relative flex items-center">
              <span className="absolute left-5 text-[#1b2028]/40 font-bold">@</span>
              <input
                type="email"
                placeholder="e-mail address"
                className="w-full rounded-full bg-white/40 border border-white/50 px-5 py-4 pl-12 text-[#1b2028] placeholder:text-[#1b2028]/50 outline-none focus:bg-white/70 transition-all shadow-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative flex items-center">
              <span className="absolute left-5 text-[#1b2028]/40">
                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
              </span>
              <input
                type="password"
                placeholder="password"
                className="w-full rounded-full bg-white/40 border border-white/50 px-5 py-4 pl-12 pr-24 text-[#1b2028] placeholder:text-[#1b2028]/50 outline-none focus:bg-white/70 transition-all shadow-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="absolute right-5 text-xs font-bold text-[#1b2028]/60 hover:text-[#1b2028]">I forgot</button>
            </div>
          </div>

          <div className="flex items-center justify-between mb-10 text-xs text-[#1b2028]/60 font-medium leading-relaxed pr-8">
             <p className="max-w-[200px] hidden md:block">Securely log in to manage your festival bookings and view your cinematic gallery.</p>
             <p className="max-w-[200px] md:hidden">Click here for more info.</p>
             <div className="w-12 h-6 bg-[#1b2028] rounded-full relative flex items-center px-1 cursor-pointer ml-auto">
               <div className="w-4 h-4 bg-white rounded-full ml-auto"></div>
             </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full rounded-full bg-[#1b2028] text-white py-4 text-lg font-medium hover:bg-black transition-colors shadow-xl"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          <div className="mt-auto pt-10 flex items-center justify-center gap-4 opacity-60">
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1b2028" strokeWidth="2"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#1b2028" strokeWidth="1.5"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="5" y1="5" x2="19" y2="19"/><line x1="5" y1="19" x2="19" y2="5"/></svg>
             <div className="w-6 h-10 rounded-full bg-[#d3a6a1] border border-[#1b2028] transform -rotate-12"></div>
             <div className="w-4 h-4 bg-[#1b2028] rounded-full"></div>
             <div className="w-10 h-4 border border-[#1b2028] rounded-full"></div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Desktop Minimalist Typography Card ── */}
        <div className="hidden md:flex flex-1 bg-[#faf9f7] rounded-[40px] ml-6 relative overflow-hidden p-12 flex-col justify-between shadow-xl">
           <div className="flex justify-between items-start z-10 relative">
             <h2 className="text-7xl lg:text-8xl font-light text-[#1b2028] leading-[0.9]">
               Jun <br/><span className="text-5xl lg:text-6xl text-gray-400">2026</span>
             </h2>
             <p className="text-right text-sm text-gray-500 font-medium">Aambal Vasantham<br/>Madurai, TN</p>
           </div>

           <div className="absolute top-1/2 left-[60%] -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] lg:w-[450px] lg:h-[450px] bg-[#f2c1c9] rounded-full mix-blend-multiply filter blur-sm"></div>

           <div className="z-10 relative flex flex-col gap-1 text-[#1b2028] font-medium text-lg lg:text-xl">
             <span>Customer Access</span>
             <span>Portal</span>
             <span className="text-gray-500">f.studios booking</span>
           </div>

           <div className="z-10 relative flex justify-between items-end">
             <div className="flex items-center gap-2 font-bold text-[#1b2028] tracking-tight">
               <div className="w-6 h-6 border-2 border-[#1b2028] rounded-full flex items-center justify-center text-[10px]">f</div>
               studios.
             </div>
             <Link to="/" className="flex items-center bg-[#1b2028] text-white rounded-full p-1 pl-4 gap-3 cursor-pointer hover:bg-black transition-colors">
               <span className="text-xs font-bold">Home</span>
               <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
               </div>
             </Link>
           </div>
        </div>

      </div>
    </div>
  );
}