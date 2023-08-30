import { initChart } from './chart.init.js';
import './register-prototype.js';

import { createChart } from './services/chart.service.js';
import { createMonthData, createWeekData, createYearData } from './services/data.service.js';

const records = JSON.parse(results.replace(/&quot;/g, '"'));
const recMap = new Map();

records.forEach((rec) => {
  recMap.set(new Date(rec.date).toLocaleDateString(), +rec.tags[0]?.name || 0);
});

const graph = document.querySelector('#graph');
const chartStrategy = {
  year: (element, { day, month, year } = {}) => {
    return createChart(element, createYearData(year, recMap));
  },
  month: (element, { day, month, year } = {}) => {
    return createChart(element, createMonthData(month, year, recMap));
  },
  week: (element, { day, month, year } = {}) => {
    return createChart(element, createWeekData(day, month, year, recMap));
  },
};

initChart(graph, chartStrategy);
