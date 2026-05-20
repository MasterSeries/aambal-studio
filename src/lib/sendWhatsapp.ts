import axios from "axios";

export async function sendWhatsAppMessage(
  phone: string,
  message: string
) {
  try {

    await axios.post(
      "http://localhost:5000/send-whatsapp",
      {
        phone,
        message,
      }
    );

  } catch (err) {
    console.error(err);
  }
}