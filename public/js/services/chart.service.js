const makeupPointLabel = (context) => {
  const { raw, dataIndex, dataset } = context;
  const point = dataset.data[dataIndex].y - (dataset.data[dataIndex - 1]?.y || 0);
  // 01/01/2023: -2
  return `${new Date(raw.x).toLocaleDateString()}: ${(point > 0 ? '+' : '') + point}
${dataset.data[dataIndex].data?.summary || ''}`;
};

export function createChart(element, { data, options }) {
  const chart = new Chart(element, {
    type: 'scatter',
    data: {
      ...data,
      datasets: data.datasets.map((set) => ({
        ...set,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.4,
        showLine: true,
      })),
    },
    options: {
      ...options,
      plugins: {
        tooltip: {
          callbacks: {
            label: makeupPointLabel,
          },
        },
      },
    },
  });

  return { chart, startDate: new Date(data.datasets[0].data[0].x) };
}
