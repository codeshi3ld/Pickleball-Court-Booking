const mail = require("nodemailer");
const fs = require("fs");

const smtp = mail.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4,
});

async function sendMail(to, info) {
  try {
    await smtp.sendMail({
      from: process.env.EMAIL_USER,
      to,
      bcc: process.env.ADMIN_EMAIL,
      subject: "Booking Confirmed",

      html: `
        <h2>Booking Confirmed</h2>
        <p>Name: ${info.name}</p>
        <p>Date: ${info.date}</p>
        <p>Time: ${info.time}</p>
        <p>Court: ${info.court}</p>
      `,

      attachments: info.screenshot
        ? [
            {
              filename: "payment.jpg",
              content: fs.readFileSync(info.screenshot),
            },
          ]
        : [],
    });

    console.log("sent");
  } catch (e) {
    console.error(e);
  }
}

module.exports = sendMail;
