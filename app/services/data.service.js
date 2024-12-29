import { MONTHS, TODAY, WEEKDAY } from '../constants/date.constant.js';
import {
  getFullYearDates,
  getFullMonthDates,
  getFullWeekDates,
} from './date.service.js';

const buildData = (dates, recMap) => {
  let totalPoint = 0;
  const data = dates.reduce((arr, date, i) => {
    const currDate = new Date(date);
    const { point = -0.5, data = {} } =
      recMap.get(currDate.toLocaleDateString()) || {};
    const val = point + (arr[i - 1]?.y || 0);

    totalPoint += point;
    arr.push({ x: currDate.getTime(), y: val, data, totalPoint });

    return arr;
  }, []);

  return { data, totalPoint };
};

export function createYearData(year = TODAY.getFullYear(), recMap) {
  const fullYearDates = getFullYearDates(year);
  const { data, totalPoint } = buildData(fullYearDates, recMap);

  const datasets = {
    datasets: [
      {
        label: year,
        data,
      },
    ],
    totalPoint,
  };
  const options = {
    scales: {
      x: {
        min: fullYearDates[0],
        max: fullYearDates[fullYearDates.length - 1],
        type: 'timeseries',
        ticks: {
          callback(value, index) {
            const currDate = new Date(value);
            return currDate.getDate() === 1
              ? MONTHS[currDate.getMonth()]
              : null;
          },
        },
      },
    },
  };

  return { data: datasets, options };
}

export function createMonthData(
  month = TODAY.getMonth(),
  year = TODAY.getFullYear(),
  recMap
) {
  const fullMonthDates = getFullMonthDates(month, year);
  const { data, totalPoint } = buildData(fullMonthDates, recMap);

  const datasets = {
    datasets: [
      {
        label: MONTHS[month],
        data,
      },
    ],
    totalPoint,
  };
  const options = {
    scales: {
      x: {
        min: fullMonthDates[0],
        max: fullMonthDates[fullMonthDates.length - 1],
        type: 'timeseries',
        ticks: {
          callback(value, index) {
            const currDate = new Date(value);
            return `${currDate.getDate()}(${currDate.getWeek()})`;
          },
        },
      },
    },
  };

  return { data: datasets, options };
}

export function createWeekData(
  day = TODAY.getDate(),
  month = TODAY.getMonth(),
  year = TODAY.getFullYear(),
  recMap
) {
  const fullWeekDates = getFullWeekDates(day, month, year);
  const { data, totalPoint } = buildData(fullWeekDates, recMap);

  const datasets = {
    datasets: [
      {
        label: `Week ${new Date(fullWeekDates[0]).getDate()}-${new Date(
          fullWeekDates[fullWeekDates.length - 1]
        ).getDate()}/${
          new Date(fullWeekDates[fullWeekDates.length - 1]).getMonth() + 1
        }`,
        data,
      },
    ],
    totalPoint,
  };
  const options = {
    scales: {
      x: {
        min: fullWeekDates[0],
        max: fullWeekDates[fullWeekDates.length - 1],
        type: 'timeseries',
        ticks: {
          callback(value, index) {
            const currDate = new Date(value);
            return `${WEEKDAY[currDate.getDay()]}(${currDate.getDate()})`;
          },
        },
      },
    },
  };

  return { data: datasets, options };
}
