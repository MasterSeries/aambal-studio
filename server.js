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

  const {
    state,
    saveCreds,
  } =
    await useMultiFileAuthState(
      "auth"
    );

  sock = makeWASocket({
    auth: state,
  });

  sock.ev.on(
    "creds.update",
    saveCreds
  );

  sock.ev.on(
  "connection.update",
  async ({
    connection,
    qr,
    lastDisconnect,
  }) => {

    if (qr) {

      qrcode.generate(qr, {
        small: true,
      });

    }

    if (
      connection ===
      "open"
    ) {

      console.log(
        "✅ WhatsApp Connected"
      );

    }

    if (
      connection ===
      "close"
    ) {

      console.log(
        "⚠️ Connection closed"
      );

      connectWhatsApp();
    }
  }
);
}

connectWhatsApp();

app.post(
  "/send-message",
  async (req, res) => {

    try {

      const {
        phone,
        message,
      } = req.body;

      await sock.sendMessage(
        `${phone}@s.whatsapp.net`,
        {
          text: message,
        }
      );

      res.json({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).json({
        success: false,
      });

    }
  }
);

app.listen(5000, () => {

  console.log(
    "🚀 Server running on port 5000"
  );

});