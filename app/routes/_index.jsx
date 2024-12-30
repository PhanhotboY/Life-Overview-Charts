import { useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';

import GithubProfile from '../components/GithubProfile';
import NotionService from '../services/notion.server';
import { getLabelContent, initChart } from '../services/chart.init';
import { createChart } from '../services/chart.client';
import {
  createMonthData,
  createWeekData,
  createYearData,
} from '../services/data.service';
import {
  addDays,
  addMonths,
  addYears,
  format,
  subDays,
  subMonths,
  subYears,
} from 'date-fns';

export const loader = async () => {
  try {
    let items = [];
    let next_cursor = '9add82c7-5f07-4595-a936-2a080cd4cc12';
    let has_more = true;

    while (has_more) {
      const res = await NotionService.getItems({
        start_cursor: next_cursor,
      });

      items = [
        ...items,
        ...res.results.map((item) => ({
          id: item.id,
          title: item.properties.Name.title[0]?.plain_text,
          tags: item.properties.Tags.multi_select,
          date: item.properties.Date.date.start,
          summary: item.properties.Summary.rich_text[0]?.plain_text,
          icon: item.icon?.emoji,
        })),
      ];
      next_cursor = res.next_cursor;
      has_more = res.has_more;
    }

    items.sort((a, b) => new Date(b.date) - new Date(a.date));
    return { items };
  } catch (error) {
    console.error(error);
    return {
      items: {
        results: [],
        has_more: false,
        next_cursor: null,
      },
    };
  }
  // const res = await fetch('http://localhost:5173/notion.sample.json');
  // const items = await res.json();
};

export default function Index() {
  let chart;
  const { items } = useLoaderData();

  const [currSelection, setCurrSelection] = useState({
    type: 'month',
    startDate: new Date(),
    chart: null,
    totalPoint: 0,
  });
  const [chartStrategy, setChartStrategy] = useState({});
  const [filterLabel, setFilterLabel] = useState(
    getLabelContent('month', new Date())
  );

  useEffect(() => {
    const recMap = new Map();

    const records = items.reduce((result, page) => {
      if (page.title !== 'Morning') result.push(page);

      return result;
    }, []);

    records.forEach((rec) => {
      const { date, tags, ...data } = rec;
      recMap.set(new Date(date).toLocaleDateString(), {
        point: +tags[0]?.name || 0,
        data,
      });
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

    if (chart) chart.destroy();
    const newSelection = initChart(graph, chartStrategy, currSelection);
    chart = newSelection.chart;
    setCurrSelection(newSelection);
    setChartStrategy(chartStrategy);

    return () => {
      currSelection.chart?.destroy();
    };
  }, []);

  return (
    <div className='main'>
      <h1 id='header' className='headclass'>
        {new Date().getFullYear()} Overview
      </h1>

      <div className='body'>
        <div className='graph_container'>
          <div className='filter'>
            <select
              style={{ padding: '0.25rem' }}
              defaultValue={currSelection.type}
              onChange={(e) => {
                currSelection.chart?.destroy();
                const {
                  startDate,
                  chart: newChart,
                  totalPoint,
                } = chartStrategy[e.target.value](graph);
                setCurrSelection({
                  type: e.target.value,
                  startDate,
                  chart: newChart,
                  totalPoint,
                });
                setFilterLabel(getLabelContent(e.target.value, startDate));
              }}
            >
              <option value='year'>year</option>
              <option value='month'>month</option>
              <option value='week'>week</option>
            </select>

            <div className='total_point'>
              Total point:
              <span style={{ marginLeft: '8px' }}>
                {currSelection.totalPoint}
              </span>
            </div>

            <div className='forward'>
              <div
                className='back'
                onClick={() => {
                  const { type, startDate: date } = currSelection;
                  currSelection.chart?.destroy();

                  let newDate = date;
                  switch (type) {
                    case 'week':
                      newDate = subDays(date, 7);
                      break;
                    case 'month':
                      newDate = subMonths(date, 1);
                      break;
                    case 'year':
                      newDate = subYears(date, 1);
                      break;
                    default:
                      break;
                  }
                  const day = newDate.getDate();
                  const month = newDate.getMonth();
                  const year = newDate.getFullYear();

                  const { startDate, chart, totalPoint } = chartStrategy[type](
                    graph,
                    {
                      day,
                      month,
                      year,
                    }
                  );

                  setFilterLabel(getLabelContent(type, startDate));
                  setCurrSelection({
                    ...currSelection,
                    startDate,
                    chart,
                    totalPoint,
                  });
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  height='1em'
                  viewBox='0 0 320 512'
                >
                  <path d='M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l192 192c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 246.6 86.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192z' />
                </svg>
              </div>

              <span className='selection'>{filterLabel}</span>

              <div
                className='next'
                onClick={() => {
                  const { type, startDate: date } = currSelection;
                  currSelection.chart?.destroy();

                  let newDate = date;
                  switch (type) {
                    case 'week':
                      newDate = addDays(date, 7);
                      break;
                    case 'month':
                      newDate = addMonths(date, 1);
                      break;
                    case 'year':
                      newDate = addYears(date, 1);
                      break;
                    default:
                      break;
                  }
                  const day = newDate.getDate();
                  const month = newDate.getMonth();
                  const year = newDate.getFullYear();

                  const { startDate, chart, totalPoint } = chartStrategy[type](
                    graph,
                    {
                      day,
                      month,
                      year,
                    }
                  );

                  setFilterLabel(getLabelContent(type, startDate));
                  setCurrSelection({
                    ...currSelection,
                    startDate,
                    chart,
                    totalPoint,
                  });
                }}
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  height='1em'
                  viewBox='0 0 320 512'
                >
                  <path d='M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z' />
                </svg>
              </div>
            </div>
          </div>

          <canvas id='graph'></canvas>
        </div>

        <GithubProfile />
      </div>
    </div>
  );
}
