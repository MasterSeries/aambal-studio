import axios from "axios";

export async function sendWhatsAppMessage(
  phone: string,
  bookingData: {
    name: string;
    packageName: string;
    price: string;
    date: string;
    time: string;
    reference: string;
  }
) {

  const message = `
╔══════════════════╗
   ✨ AAMBAL VASANTHAM
      STUDIO BOOKING
╚══════════════════╝

Hello ${bookingData.name},

Your booking has been successfully confirmed 🎉

━━━━━━━━━━━━━━━
📦 PACKAGE
${bookingData.packageName}

💰 PRICE
${bookingData.price}

📅 DATE
${bookingData.date}

⏰ TIME SLOT
${bookingData.time}

🆔 BOOKING ID
${bookingData.reference}

━━━━━━━━━━━━━━━

🔘 QUICK ACTIONS

📅 Reschedule:
https://yourdomain.com/reschedule/${bookingData.reference}

❌ Cancel Booking:
https://yourdomain.com/cancel/${bookingData.reference}

💬 Contact Support:
https://wa.me/917994680265

📸 Instagram:
https://instagram.com/YOURPAGE

━━━━━━━━━━━━━━━
⚠️ IMPORTANT

• Please arrive 15 mins early
• Carry your booking ID
• Drone shoots depend on weather
• Advance payment is non-refundable

━━━━━━━━━━━━━━━

✨ Thank you for choosing
Aambal Vasantham Studio
`;

  try {

    await axios.post(
      "http://localhost:5000/send-message",
      {
        phone,
        message,
      }
    );

  } catch (err) {

    console.error(err);

  }
}