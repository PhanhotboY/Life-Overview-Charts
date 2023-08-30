import { TODAY, MONTHS } from '../constants.js';

const getDates = (startDate, endDate) => {
  let dateArray = new Array();
  let currentDate = startDate;

  while (currentDate <= endDate) {
    dateArray.push(currentDate.toLocaleDateString());
    currentDate = currentDate.addDays(1);
  }

  return dateArray;
};

export const getFirstYearDate = (year) => new Date(year, 0, 1);
export const getLastYearDate = (year) => new Date(year, 11, 31);

export function getFullYearDates(year = TODAY.getFullYear()) {
  const firstYearDate = getFirstYearDate(year);
  const lastYearDate = getLastYearDate(year);

  return getDates(firstYearDate, lastYearDate);
}

export const getFirstMonthDate = (month, year) => new Date(year, month, 1);
export const getLastMonthDate = (month, year) => new Date(year, month + 1, 0);

export function getFullMonthDates(month = TODAY.getMonth(), year = TODAY.getFullYear()) {
  const firstMonthDate = getFirstMonthDate(month, year);
  const lastMonthDate = getLastMonthDate(month, year);

  return getDates(firstMonthDate, lastMonthDate);
}

const getFirstWeekDay = (day, month, year) =>
  new Date(year, month, day).getDate() - new Date(year, month, day).getDay();
export const getFirstWeekDate = (day, month, year) =>
  new Date(year, month, getFirstWeekDay(day, month, year));
export const getLastWeekDate = (day, month, year) =>
  new Date(year, month, getFirstWeekDay(day, month, year) + 6);

export function getFullWeekDates(
  day = TODAY.getDate(),
  month = TODAY.getMonth(),
  year = TODAY.getFullYear()
) {
  const firstWeekDate = getFirstWeekDate(day, month, year);
  const lastWeekDate = getLastWeekDate(day, month, year);

  return getDates(firstWeekDate, lastWeekDate);
}
