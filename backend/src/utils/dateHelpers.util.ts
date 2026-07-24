export function daysSince(date: Date): number {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function isOverdue(dueDate: string | Date | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  return due < new Date();
}
