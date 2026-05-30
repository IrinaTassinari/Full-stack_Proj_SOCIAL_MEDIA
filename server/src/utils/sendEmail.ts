import nodemailer from "nodemailer";
import { env } from "../config/env.js";

type SendEmailOptions = {
  to: string;
  subject: string;
  text: string;
};

export const sendEmail = async ({ to, subject, text }: SendEmailOptions) => {
    const transporter = nodemailer.createTransport({
    host: env.emailHost,
    port: env.emailPort,
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
  });
};
