import express from "express";

import cors from "cors";

import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());

app.use(express.json());
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);


app.post(
  "/send-whatsapp",

  async (req, res) => {

    try {

      const {
        phone,
        message,
      } = req.body;

      await client.messages.create({

        from:
          "whatsapp:+14155238886",

        to:
          `whatsapp:${phone}`,

        body: message,
      });

      res.send({
        success: true,
      });

    } catch (err) {

      console.error(err);

      res.status(500).send(err);
    }
  }
);

app.listen(5000, () => {

  console.log(
    "WhatsApp server running on port 5000"
  );
});
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});