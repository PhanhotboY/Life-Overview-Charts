import { MONTHS, TODAY } from '../constants/date.constant';

function initChart(element, strategy, currentSelection) {
  currentSelection.chart?.destroy();
  const { startDate, chart, totalPoint } =
    strategy[currentSelection.type](element);

  return { type: currentSelection.type, startDate, chart, totalPoint };
}

function getLabelContent(type, date) {
  return type === 'year'
    ? date.getFullYear()
    : type === 'month'
    ? MONTHS[date.getMonth()]
    : date.toLocaleDateString();
}

export { initChart, getLabelContent };
