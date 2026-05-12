import nodemailer from "nodemailer";
import { env } from "../config/env.js";
export const sendEmail = async ({ to, subject, text }) => {
    // nodemailer.createTransport(...) создаёт объект transporter
    const transporter = nodemailer.createTransport({
        host: env.emailHost,
        port: env.emailPort,
        auth: {
            user: env.emailUser,
            pass: env.emailPass,
        },
    });
    // sendMail - метод принимает объект письма:
    await transporter.sendMail({
        from: env.emailFrom,
        to,
        subject,
        text,
    });
};
