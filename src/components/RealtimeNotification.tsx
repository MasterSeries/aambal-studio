// src/components/RealtimeNotifications.tsx
// Drop-in replacement. Renders a floating bell button in the top-right of the
// admin header. Clicking it opens an elegant dropdown panel with live
// Firebase booking notifications and system alerts.

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  updateDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ── Design tokens (matches admin.tsx) ────────────────────────────────────────
const T = {
  gold: "#c8a84a",
  goldLight: "#e8c97a",
  ink: "#060910",
  ink2: "#0b0f1a",
  ink3: "#111827",
  surface: "rgba(255,255,255,0.03)",
  border: "rgba(255,255,255,0.07)",
  borderGold: "rgba(200,168,74,0.22)",
  text: "#f0ede6",
  muted: "rgba(240,237,230,0.42)",
  green: "#34d399",
  red: "#f87171",
  amber: "#fbbf24",
  blue: "#60a5fa",
  cyan: "#22d3ee",
};

// ── Notification type ─────────────────────────────────────────────────────────
type Notif = {
  id: string;
  type: "booking" | "alert" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: Timestamp | null;
  status?: string; // booking status colour hint
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(ts: Timestamp | null): string {
  if (!ts) return "just now";
  const diff = Date.now() - ts.toMillis();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const TYPE_META: Record<Notif["type"], { icon: string; color: string; label: string }> = {
  booking: { icon: "📸", color: T.gold,  label: "Booking"  },
  alert:   { icon: "⚠️",  color: T.amber, label: "Alert"    },
  system:  { icon: "⚙️",  color: T.cyan,  label: "System"   },
};

const STATUS_DOT: Record<string, string> = {
  pending:     T.amber,
  approved:    T.green,
  completed:   T.blue,
  rejected:    T.red,
  rescheduled: T.cyan,
};

// ── Main component ────────────────────────────────────────────────────────────
export default function RealtimeNotifications() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Live feed from Firestore ──────────────────────────────────────────────
  useEffect(() => {
    // Pull latest 40 bookings and synthesise notification objects.
    // If you have a dedicated `notifications` collection, swap this query.
    const q = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc"),
      limit(40)
    );

    const unsub = onSnapshot(q, (snap) => {
      const items: Notif[] = snap.docs.map((d) => {
        const data = d.data();
        const status: string = data.status ?? "pending";
        return {
          id: d.id,
          type: "booking",
          title: `New booking — ${data.name ?? "Unknown"}`,
          body: `${data.package ?? "Package"} · ${data.date ?? "Date TBD"}`,
          read: data.adminRead ?? false,
          createdAt: data.createdAt ?? null,
          status,
        };
      });

      // Append static system alerts at the end
      const alerts: Notif[] = [
        {
          id: "sys-dgca",
          type: "alert",
          title: "Drone flight clearance",
          body: "Check DGCA NOTAM before tomorrow's shoots.",
          read: false,
          createdAt: null,
        },
        {
          id: "sys-gallery",
          type: "system",
          title: "Gallery storage at 78%",
          body: "Consider archiving older festival galleries.",
          read: false,
          createdAt: null,
        },
      ];

      setNotifs([...items, ...alerts]);
    });

    return () => unsub();
  }, []);

  // ── Close on outside click ────────────────────────────────────────────────
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Mark single as read ───────────────────────────────────────────────────
  async function markRead(notif: Notif) {
    if (notif.read) return;
    // local optimistic update
    setNotifs((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    );
    // persist for booking notifications
    if (notif.type === "booking") {
      try {
        await updateDoc(doc(db, "bookings", notif.id), { adminRead: true });
      } catch (_) {/* silent */}
    }
  }

  async function markAllRead() {
    const promises = notifs
      .filter((n) => !n.read && n.type === "booking")
      .map((n) => updateDoc(doc(db, "bookings", n.id), { adminRead: true }).catch(() => {}));
    await Promise.all(promises);
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  const unread = notifs.filter((n) => !n.read).length;
  const visible = filter === "unread" ? notifs.filter((n) => !n.read) : notifs;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500&family=Raleway:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,400;1,400&display=swap');

        @keyframes bellRing {
          0%,100%{transform:rotate(0deg)}
          15%{transform:rotate(14deg)}
          30%{transform:rotate(-10deg)}
          45%{transform:rotate(7deg)}
          60%{transform:rotate(-4deg)}
          75%{transform:rotate(2deg)}
        }
        @keyframes badgePop {
          0%{transform:scale(0)}
          70%{transform:scale(1.2)}
          100%{transform:scale(1)}
        }
        @keyframes pulseRing {
          0%{transform:scale(1);opacity:.6}
          100%{transform:scale(2.2);opacity:0}
        }
        @keyframes slideDown {
          from{opacity:0;transform:translateY(-8px) scale(.97)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes shimmerLoad {
          0%{background-position:200% 0}
          100%{background-position:-200% 0}
        }

        .notif-bell-btn {
          position: relative;
          width: 44px; height: 44px;
          border-radius: 13px;
          background: rgba(200,168,74,0.1);
          border: 1px solid rgba(200,168,74,0.22);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: background 0.2s, border-color 0.2s;
          flex-shrink: 0;
        }
        .notif-bell-btn:hover {
          background: rgba(200,168,74,0.18);
          border-color: rgba(200,168,74,0.4);
        }
        .notif-bell-btn.ringing .bell-icon {
          animation: bellRing 0.7s ease;
        }
        .notif-panel {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: min(400px, 92vw);
          background: linear-gradient(160deg, #0f1624 0%, #080d18 100%);
          border: 1px solid rgba(200,168,74,0.2);
          border-radius: 22px;
          box-shadow: 0 0 60px rgba(200,168,74,0.08), 0 32px 80px rgba(0,0,0,0.7);
          overflow: hidden;
          z-index: 9999;
          animation: slideDown 0.22s ease both;
          font-family: 'Raleway', sans-serif;
        }
        .notif-item {
          display: flex; gap: 13px; align-items: flex-start;
          padding: 13px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          cursor: pointer;
          transition: background 0.15s;
        }
        .notif-item:last-child { border-bottom: none; }
        .notif-item:hover { background: rgba(255,255,255,0.03); }
        .notif-item.unread { background: rgba(200,168,74,0.04); }
        .filter-pill {
          padding: 5px 14px; border-radius: 100px; font-size: 11px;
          font-weight: 600; letter-spacing: 0.08em; cursor: pointer;
          border: none; transition: all 0.18s;
          font-family: 'Raleway', sans-serif;
        }
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; padding: 3rem 1rem; gap: 10px;
        }
      `}</style>

      {/* ── Wrapper — position relative so panel anchors here ── */}
      <div ref={panelRef} style={{ position: "relative", display: "inline-block" }}>

        {/* ── Bell button ── */}
        <button
          className={`notif-bell-btn ${unread > 0 ? "ringing" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={`Notifications${unread > 0 ? ` — ${unread} unread` : ""}`}
          title="Notifications"
        >
          {/* pulse ring when there are unread */}
          {unread > 0 && (
            <span style={{
              position: "absolute", inset: -4, borderRadius: 17,
              border: `1.5px solid ${T.gold}`,
              animation: "pulseRing 1.8s ease-out infinite",
              pointerEvents: "none",
            }} />
          )}

          {/* bell icon */}
          <span className="bell-icon" style={{ fontSize: 18, lineHeight: 1 }}>🔔</span>

          {/* unread badge */}
          {unread > 0 && (
            <span style={{
              position: "absolute", top: -5, right: -5,
              minWidth: 18, height: 18, borderRadius: 9,
              background: T.red, color: "#fff",
              fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px", border: `2px solid #060910`,
              animation: "badgePop 0.3s ease both",
              fontFamily: "Raleway, sans-serif",
            }}>
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </button>

        {/* ── Dropdown panel ── */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="notif-panel"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ── Panel header ── */}
              <div style={{
                padding: "1.1rem 1.25rem 0.9rem",
                borderBottom: `1px solid rgba(255,255,255,0.06)`,
                background: "rgba(200,168,74,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: "0.65rem", letterSpacing: "0.3em", color: T.gold, textTransform: "uppercase", marginBottom: 3 }}>
                      Notifications
                    </p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", color: T.text, margin: 0, lineHeight: 1 }}>
                      {unread > 0
                        ? <><em style={{ color: T.goldLight }}>{unread}</em> unread</>
                        : "All caught up"}
                    </p>
                  </div>

                  {unread > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: `${T.gold}12`, border: `1px solid ${T.gold}25`,
                        color: T.gold, borderRadius: 9, padding: "5px 12px",
                        fontSize: 11, fontWeight: 600, letterSpacing: "0.07em",
                        cursor: "pointer", fontFamily: "Raleway, sans-serif",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* filter pills */}
                <div style={{ display: "flex", gap: 6 }}>
                  {(["all", "unread"] as const).map((f) => (
                    <button
                      key={f}
                      className="filter-pill"
                      onClick={() => setFilter(f)}
                      style={{
                        background: filter === f ? `${T.gold}20` : "transparent",
                        border: filter === f ? `1px solid ${T.gold}40` : `1px solid rgba(255,255,255,0.1)`,
                        color: filter === f ? T.goldLight : T.muted,
                      }}
                    >
                      {f === "all" ? `All (${notifs.length})` : `Unread (${unread})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Notification list ── */}
              <div style={{ maxHeight: 420, overflowY: "auto" }}>
                {visible.length === 0 ? (
                  <div className="empty-state">
                    <span style={{ fontSize: 32 }}>✨</span>
                    <p style={{ color: T.muted, fontSize: 13, fontFamily: "Cormorant Garamond, serif", fontStyle: "italic" }}>
                      {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                    </p>
                  </div>
                ) : (
                  visible.map((n, i) => {
                    const meta = TYPE_META[n.type];
                    return (
                      <motion.div
                        key={n.id}
                        className={`notif-item${n.read ? "" : " unread"}`}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => markRead(n)}
                      >
                        {/* icon circle */}
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                          background: `${meta.color}15`,
                          border: `1px solid ${meta.color}30`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 16, marginTop: 1,
                        }}>
                          {meta.icon}
                        </div>

                        {/* content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 6 }}>
                            <p style={{
                              fontSize: 13, fontWeight: n.read ? 400 : 600,
                              color: n.read ? T.muted : T.text,
                              margin: 0, lineHeight: 1.35,
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            }}>
                              {n.title}
                            </p>
                            <span style={{ fontSize: 10, color: T.muted, flexShrink: 0, marginTop: 1 }}>
                              {timeAgo(n.createdAt)}
                            </span>
                          </div>

                          <p style={{ fontSize: 11.5, color: T.muted, margin: "3px 0 5px", lineHeight: 1.4 }}>
                            {n.body}
                          </p>

                          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            {/* type label */}
                            <span style={{
                              fontSize: 9, fontWeight: 700, letterSpacing: "0.15em",
                              textTransform: "uppercase", color: meta.color,
                              background: `${meta.color}12`,
                              border: `1px solid ${meta.color}25`,
                              padding: "2px 7px", borderRadius: 6,
                            }}>
                              {meta.label}
                            </span>

                            {/* status dot for bookings */}
                            {n.status && (
                              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: STATUS_DOT[n.status] ?? T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                                <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_DOT[n.status] ?? T.muted }} />
                                {n.status}
                              </span>
                            )}

                            {/* unread dot */}
                            {!n.read && (
                              <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: T.gold, flexShrink: 0, boxShadow: `0 0 6px ${T.gold}` }} />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* ── Footer ── */}
              {visible.length > 0 && (
                <div style={{
                  padding: "10px 16px",
                  borderTop: `1px solid rgba(255,255,255,0.05)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <p style={{ fontSize: 11, color: T.muted, margin: 0, letterSpacing: "0.08em" }}>
                    Live updates from Firestore · {notifs.length} total
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}