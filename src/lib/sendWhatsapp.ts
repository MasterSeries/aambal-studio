import axios from "axios";

export async function sendWhatsAppMessage(
  phone: string,
  message: string
) {
  try {

    await axios.post(
      "https://aambal-backend.onrender.com/send-whatsapp",
      {
        phone,
        message,
      }
    );

  } catch (err) {
    console.error(err);
  }
}