import crypto from "node:crypto";

export function generateSignatureToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function getTokenExpiration(hours = 48): Date {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}
