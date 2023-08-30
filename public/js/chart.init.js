import { MONTHS, TODAY } from './constants.js';

const select = document.querySelector('.filter > select');
const forwardBtn = document.querySelector('.filter > .forward > .next');
const backwardBtn = document.querySelector('.filter > .forward > .back');

let currSelection = {
  type: 'year',
  startDate: TODAY,
};
let chartStrategy = {};
let graph;

export function initChart(element, strategy) {
  const { startDate, chart } = strategy[currSelection.type](element);

  currSelection = { ...currSelection, startDate, chart };
  chartStrategy = strategy;
  graph = element;
}

select.addEventListener('change', (evt) => {
  currSelection.chart.destroy();
  const { startDate, chart } = chartStrategy[evt.target.value](graph);

  selectionLabel.innerHTML = getLabelContent(evt.target.value, startDate);

  currSelection = { type: evt.target.value, startDate, chart };
});

const selectionLabel = document.querySelector('.filter > .forward > .selection');

forwardBtn.addEventListener('click', (evt) => {
  const { type, startDate: date } = currSelection;
  currSelection.chart.destroy();

  const day = date.getDate() + (type === 'week' ? 7 : 0);
  const month = date.getMonth() + (type === 'month' ? 1 : 0);
  const year = date.getFullYear() + (type === 'year' ? 1 : 0);

  const { startDate, chart } = chartStrategy[type](graph, { day, month, year });

  selectionLabel.innerHTML = getLabelContent(type, startDate);

  currSelection = { ...currSelection, startDate, chart };
});

backwardBtn.addEventListener('click', (evt) => {
  const { type, startDate: date } = currSelection;
  currSelection.chart.destroy();

  const day = date.getDate() - (type === 'week' ? 7 : 0);
  const month = date.getMonth() - (type === 'month' ? 1 : 0);
  const year = date.getFullYear() - (type === 'year' ? 1 : 0);

  const { startDate, chart } = chartStrategy[type](graph, { day, month, year });

  selectionLabel.innerHTML = getLabelContent(type, startDate);

  currSelection = { ...currSelection, startDate, chart };
});

const getLabelContent = (type, date) =>
  type === 'year'
    ? date.getFullYear()
    : type === 'month'
    ? MONTHS[date.getMonth()]
    : date.toLocaleDateString();
