import express from "express";
import cors from "cors";
import qrcode from "qrcode-terminal";
import {
  default as makeWASocket,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

const app = express();

app.use(cors());
app.use(express.json());

let sock;

async function connectWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState("auth");

  sock = makeWASocket({
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {
    if (qr) {
      qrcode.generate(qr, {
        small: true,
      });
    }

    if (connection === "open") {
      console.log("✅ WhatsApp Connected");
    }

    if (connection === "close") {
      console.log("⚠️ Connection closed");
      connectWhatsApp();
    }
  });
}

connectWhatsApp();

// Existing simple message route
app.post("/send-message", async (req, res) => {
  try {
    const { phone, message } = req.body;
    await sock.sendMessage(`${phone}@s.whatsapp.net`, {
      text: message,
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

// ── THE NEW ROUTE YOUR REACT APP IS LOOKING FOR ──
app.post("/api/reservations/confirm", async (req, res) => {
  try {
    const { roomLabel, checkIn, guestName, guestPhone } = req.body;

    // 1. Generate a random ticket Reference ID
    const refId = "TKT-" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 2. Format phone number (remove spaces and plus signs)
    const formattedPhone = guestPhone.replace(/\D/g, "");

    // 3. Create the WhatsApp message
    const message = `Hello ${guestName}! 🪷\n\nYour reservation for the *${roomLabel}* is confirmed.\n\n*Check-in:* ${checkIn}\n*Ticket Ref:* ${refId}\n\nWe look forward to hosting you at the Aambal Retreat.`;

    // 4. Send using your Baileys socket
    await sock.sendMessage(`${formattedPhone}@s.whatsapp.net`, { text: message });

    console.log(`✅ Booking confirmed! WhatsApp sent to ${formattedPhone}`);

    // 5. Send success back to React so it shows the 3D Ticket
    res.json({ status: "success", refId: refId });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ error: "Failed to process booking" });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});