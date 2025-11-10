import { DateTime } from "luxon";
import type { FuzzyDate } from "../api/queries/list";

export type NonFuzzyDate = {
  day: number;
  month: number;
  year: number;
};

export function isNonFuzzy(d: FuzzyDate): d is NonFuzzyDate {
  if (!d.year || !d.month || !d.day) {
    return false;
  }
  return true;
}

export function isFuzzy(d: FuzzyDate): boolean {
  return !isNonFuzzy(d);
}

export function isFuzzyNotBlank(d: FuzzyDate): boolean {
  return !!(d.year || d.month || d.day);
}

export function fuzzyDateToDate(d: NonFuzzyDate): DateTime;
export function fuzzyDateToDate(d: FuzzyDate): DateTime | null;
export function fuzzyDateToDate(d: FuzzyDate): DateTime | null {
  return isNonFuzzy(d) ? DateTime.fromObject(d).endOf("day") : null;
}

export function dateToFuzzyDate(d: DateTime): NonFuzzyDate {
  return { year: d.year, month: d.month, day: d.day };
}

export function fuzzyDateToString(d: FuzzyDate) {
  return isNonFuzzy(d) ? dateToString(DateTime.fromObject(d)) : "∅";
}

export function dateToString(d: DateTime) {
  return d.toLocaleString(DateTime.DATE_SHORT);
}

export function isEqualDateWithFuzzyDate(d1: DateTime | null, d2: FuzzyDate) {
  if (d1 != null && isNonFuzzy(d2)) {
    return +d1.endOf("day") === +DateTime.fromObject(d2).endOf("day");
  }
  return (d1 == null) === isFuzzy(d2);
}
