import type { Schedule } from "../../services/types";

const pad = (value: number) => String(value).padStart(2, "0");

export const localDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const shiftMonth = (date: Date, amount: number) =>
  new Date(date.getFullYear(), date.getMonth() + amount, 1);

export function getMonthDays(month: Date) {
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const lastDate = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days: (Date | null)[] = Array.from({ length: firstWeekday }, () => null);

  for (let day = 1; day <= lastDate; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  return days;
}

export function formatScheduleTime(datetime: string) {
  return new Date(datetime).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getScheduleDog(schedule: Schedule) {
  return schedule.cao ?? schedule.animal;
}
