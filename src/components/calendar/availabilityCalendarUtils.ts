const pad = (value: number) => String(value).padStart(2, "0");

export const monthKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;

export const dateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function parseCalendarDate(value: string) {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function localDateKeyFromValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateKey(date);
}

export function isSameSlot(selectedValue: string, slotDatetime: string) {
  if (!selectedValue) return false;

  const selectedTime = new Date(selectedValue).getTime();
  const slotTime = new Date(slotDatetime).getTime();
  return Number.isFinite(selectedTime) && Number.isFinite(slotTime)
    ? selectedTime === slotTime
    : selectedValue === slotDatetime;
}

export const addMonths = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export function getCalendarDays(date: Date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const days: (Date | null)[] = [];

  for (let index = 0; index < first.getDay(); index += 1) days.push(null);
  for (let day = 1; day <= total; day += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  return days;
}
