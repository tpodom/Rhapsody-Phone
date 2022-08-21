import dayjs from "dayjs";

/**
 * Formats an E.164 phone number format into a more common display.
 * Currently, this format only recognizes US/CA formats to avoid
 * pulling in large phone library dependency.
 *
 * @param number E.164 formatted phone number
 */
export function formatPhoneNumber(number: string): string {
  const USCA_FORMAT = /^\+1(\d{3})(\d{3})(\d{4})$/;
  const matches = number?.match(USCA_FORMAT);

  if (matches && matches.length === 4) {
    return `(${matches[1]}) ${matches[2]}-${matches[3]}`;
  }
  return number;
}

/**
 * Formats a date to a friendlier relative format. Falls back to full date string if it was longer than 7 days ago.
 *
 * @param date The date to format
 * @param options Override options for formatting
 * @returns
 */
export function formatRelativeAppointmentTime(
  date: Date,
  options: Intl.RelativeTimeFormatOptions = {},
): string {
  const now = dayjs();
  const appointmentDay = dayjs(date);
  const timeFormatter = new Intl.DateTimeFormat("default", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const appointmentFormattedTime = timeFormatter.format(date);

  if (appointmentDay.isSame(now, "day")) {
    return `today at ${appointmentFormattedTime}`;
  } else if (appointmentDay.isSame(now.subtract(1, "day"), "day")) {
    return `yesterday at ${appointmentFormattedTime}`;
  } else if (appointmentDay.isSame(now.add(1, "day"), "day")) {
    return `tomorrow at ${appointmentFormattedTime}`;
  }

  const formatter = new Intl.DateTimeFormat("default", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return formatter.format(date);
}

export function formatFilenameDate(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD");
}
