import axios from "axios";

const PHONE_ID =
  "YOUR_PHONE_NUMBER_ID";

const TOKEN =
  "YOUR_META_TOKEN";

export async function sendWhatsApp(
  phone: string,
  message: string
) {
  try {
    await axios.post(
      `https://graph.facebook.com/v20.0/${PHONE_ID}/messages`,
      {
        messaging_product:
          "whatsapp",

        to: phone,

        type: "text",

        text: {
          body: message,
        },
      },

      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,

          "Content-Type":
            "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);
  }
}