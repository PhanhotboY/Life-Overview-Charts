import { useEffect, useRef, useState } from 'react';
import { useLoaderData, useNavigate, useRevalidator } from '@remix-run/react';

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
import { getDateObject, getFirstYearDate } from '../services/date.service';

const getFirstDateOf = (type, date) => {
  switch (type) {
    case 'year':
      return new Date(date.getFullYear(), 0, 1);
    case 'month':
      return new Date(date.getFullYear(), date.getMonth(), 1);
    case 'week':
      return subDays(date, date.getDay());
    default:
      return date;
  }
};

const getLastDateOf = (type, date) => {
  switch (type) {
    case 'year':
      return new Date(date.getFullYear(), 11, 31);
    case 'month':
      return new Date(date.getFullYear(), date.getMonth() + 1, 0);
    case 'week':
      return addDays(date, 6 - date.getDay());
    default:
      return date;
  }
};

const getNextDate = (type, date) => {
  switch (type) {
    case 'year':
      return addYears(date, 1);
    case 'month':
      return addMonths(date, 1);
    case 'week':
      return addDays(date, 7);
    default:
      return date;
  }
};

const getPrevDate = (type, date) => {
  switch (type) {
    case 'year':
      return subYears(date, 1);
    case 'month':
      return subMonths(date, 1);
    case 'week':
      return subDays(date, 7);
    default:
      return date;
  }
};

export const loader = ({ request }) => {
  const url = new URL(request.url);
  const type = url.searchParams.get('type') || 'month';
  const date = url.searchParams.get('date') || new Date().toISOString();

  try {
    // cannot get all items at once
    const items = NotionService.getItems({
      date: {
        from: getFirstDateOf(type, new Date(date)),
        to: getLastDateOf(type, new Date(date)),
      },
    });

    return { items, type, date };
  } catch (error) {
    console.error(error);
    return {
      items: {
        results: [],
        has_more: false,
        next_cursor: null,
      },
      type,
      date,
    };
  }
  // const res = await fetch('http://localhost:5173/notion.sample.json');
  // const items = await res.json();
};

export default function Index() {
  const chartRef = useRef();
  const { items, type, date } = useLoaderData();
  const navigate = useNavigate();
  const validator = useRevalidator();

  const [totalPoint, setTotalPoint] = useState(0);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const recMap = new Map();

    (async () => {
      if (chartRef.current) chartRef.current.destroy();
      setLoading(true);

      const records = (await items).reduce((result, item) => {
        if (item.title !== 'Morning') result.push(item);

        return result;
      }, []);
      setLoading(false);

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

      if (chartRef.current) chartRef.current.destroy();
      const newSelection = chartStrategy[type](graph, getDateObject(date));
      chartRef.current = newSelection.chart;
      setTotalPoint(newSelection.totalPoint);

      return () => {
        chartRef.current?.destroy();
      };
    })();
  }, [items]);

  return (
    <div className='main'>
      <h1 id='header' className='headclass'>
        {new Date().getFullYear()} Overview
      </h1>

      <div className='body'>
        <div className='graph_container' style={{ position: 'relative' }}>
          {loading ? (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <img
                src='./cat-loading.gif'
                style={{
                  width: '200px',
                  height: '200px',
                  objectFit: 'contain',
                }}
              />
            </div>
          ) : (
            <div className='filter'>
              <select
                style={{ padding: '0.25rem' }}
                defaultValue={type}
                onChange={(e) => {
                  navigate(`/?type=${e.target.value}`);
                  validator.revalidate();
                }}
              >
                <option value='year'>year</option>
                <option value='month'>month</option>
                <option value='week'>week</option>
              </select>

              <div className='total_point'>
                Total point:
                <span style={{ marginLeft: '8px' }}>{totalPoint}</span>
              </div>

              <div className='forward'>
                <div
                  className='back'
                  onClick={() => {
                    navigate(
                      `/?type=${type}&date=${getPrevDate(
                        type,
                        new Date(date)
                      ).toISOString()}`
                    );
                    validator.revalidate();
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

                <span className='selection'>
                  {getLabelContent(type, new Date(date))}
                </span>

                <div
                  className='next'
                  onClick={() => {
                    navigate(
                      `/?type=${type}&date=${getNextDate(
                        type,
                        new Date(date)
                      ).toISOString()}`
                    );
                    validator.revalidate();
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
          )}

          <canvas id='graph'></canvas>
        </div>

        <GithubProfile />
      </div>
    </div>
  );
}
