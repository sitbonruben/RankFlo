import { createTransport, type Transporter } from "nodemailer";

type EmailTransport = "mailpanda" | "smtp";

let transporter: Transporter | null = null;

function getEmailTransport(): EmailTransport {
  if (process.env.MAILPANDA_API_URL && process.env.MAILPANDA_API_KEY) {
    return "mailpanda";
  }
  return "smtp";
}

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransport({
      host: process.env.SMTP_HOST ?? "localhost",
      port: Number(process.env.SMTP_PORT ?? 1025),
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          }
        : undefined,
    });
  }
  return transporter;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const transport = getEmailTransport();

  if (transport === "mailpanda") {
    await sendViaMailPanda(options);
  } else {
    await sendViaSMTP(options);
  }
}

async function sendViaMailPanda(options: EmailOptions): Promise<void> {
  const apiUrl = process.env.MAILPANDA_API_URL;
  const apiKey = process.env.MAILPANDA_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error("MailPanda API URL and API Key are required");
  }

  const response = await fetch(`${apiUrl}/api/v1/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`MailPanda API error: ${response.status} ${error}`);
  }
}

async function sendViaSMTP(options: EmailOptions): Promise<void> {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@rankflo.io",
    ...options,
  });
}
