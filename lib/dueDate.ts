// Loans are always due on the last day of a month at 23:59:59 Philippine time (UTC+8, no DST).
const PH_OFFSET_MS = 8 * 60 * 60 * 1000;

/** Last day of the month containing `date` (in PH time), shifted by `monthsAhead`, at 23:59:59 PH. */
export function endOfMonthPH(date: Date = new Date(), monthsAhead = 0): Date {
  const ph = new Date(date.getTime() + PH_OFFSET_MS); // PH wall clock, read via UTC getters
  return new Date(Date.UTC(ph.getUTCFullYear(), ph.getUTCMonth() + monthsAhead + 1, 0, 23, 59, 59) - PH_OFFSET_MS);
}

/** Due date after a rollover: end of the month following the current due date. */
export function nextDueDate(currentDue: Date): Date {
  return endOfMonthPH(currentDue, 1);
}
