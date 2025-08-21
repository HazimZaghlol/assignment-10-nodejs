import { createTransport } from "nodemailer";
import EventEmitter from "events";

export const emailEmitter = new EventEmitter();

emailEmitter.on("sendEmail", async ({ to, subject, html }) => {
  try {
    const transporter = createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Our App Team" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent successfully to", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
});

export const sendEmailEvent = async ({ to, subject, html }) => {
  emailEmitter.emit("sendEmail", { to, subject, html });
};
