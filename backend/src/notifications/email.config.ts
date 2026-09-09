export interface SmtpCredentials {
  host: string;
  port: number;
  user: string;
  password: string;
  from: string;
}

export function getSmtpCredentials(): SmtpCredentials {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;
  const from = process.env.EMAIL_FROM;
  if (!host || !port || !user || !password || !from) {
    throw new Error(
      'Email is not configured: set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, EMAIL_FROM',
    );
  }
  return { host, port: Number(port), user, password, from };
}
