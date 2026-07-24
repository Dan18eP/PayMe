export function generateWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

export function buildReminderMessage(
  debtorName: string,
  amount: string,
  daysOverdue?: number
): string {
  let message = `Hola ${debtorName}, este es un recordatorio sobre tu deuda de $${amount}.`;

  if (daysOverdue && daysOverdue > 0) {
    message += ` Llevas ${daysOverdue} día(s) de vencido.`;
  }

  message += " Por favor, ponte al día. Gracias.";
  return message;
}
