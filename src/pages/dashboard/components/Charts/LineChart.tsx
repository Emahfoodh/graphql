import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
const DynamicApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false, // Disable SSR for ApexCharts
});

const options: ApexOptions = {
  legend: {
    show: false,
    position: 'top',
    horizontalAlign: 'left',
  },
  colors: ['#3C50E0', '#80CAEE'],
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    height: 335,
    type: 'area',
    dropShadow: {
      enabled: true,
      color: '#623CEA14',
      top: 10,
      blur: 4,
      left: 0,
      opacity: 0.1,
    },

    toolbar: {
      show: false,
    },
  },
  responsive: [
    {
      breakpoint: 1024,
      options: {
        chart: {
          height: 300,
        },
      },
    },
    {
      breakpoint: 1366,
      options: {
        chart: {
          height: 350,
        },
      },
    },
  ],
  stroke: {
    width: [2, 2],
    curve: 'straight',
  },
  // labels: {
  //   show: false,
  //   position: "top",
  // },
  grid: {
    xaxis: {
      lines: {
        show: true,
      },
    },
    yaxis: {
      lines: {
        show: true,
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  markers: {
    size: 4,
    colors: '#fff',
    strokeColors: ['#3056D3', '#80CAEE'],
    strokeWidth: 3,
    strokeOpacity: 0.9,
    strokeDashArray: 0,
    fillOpacity: 1,
    discrete: [],
    hover: {
      size: undefined,
      sizeOffset: 5,
    },
  },
  xaxis: {
    type: 'datetime',
    categories: [],
    axisBorder: {
      show: false,
    },
    axisTicks: {
      show: false,
    },
  },
  yaxis: {
    title: {
      style: {
        fontSize: '0px',
      },
    },
    min: 0,
    max: 100,
  },
};

interface LineChartState {
  series: {
    name: string;
    data: number[];
  }[];
}

interface LineChartProps {
  xps?: Transaction[];
}

const LineChart: React.FC<LineChartProps> = ({ xps }) => {
  const [state, setState] = useState<LineChartState>({
    series: [
      {
        name: 'XP',
        data: [],
      },
    ],
  });
  // sort the xps by date
  useEffect(() => {
    if (!xps) return;
    xps = xps.slice().sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    // @ts-ignore
    options.xaxis.categories = xps.map((transaction) => transaction.createdAt);
    // add accumulated amount
    let accumulatedSum = 0;
    xps = xps.map((transaction) => {
      accumulatedSum += transaction.amount;
      return {
        ...transaction,
        accumulated: accumulatedSum,
      };
    });
    // @ts-ignore
    options.yaxis.max = accumulatedSum / 1000;
    accumulatedSum = 0;

    const accumulatedData = xps.map((transaction) => {
      if (!transaction.accumulated) return 0;
      const accumulatedDecimal = transaction.accumulated / 1000;
      return parseFloat(accumulatedDecimal.toFixed(1)) || 0;
    });

    setState({
      series: [{ name: 'XP', data: accumulatedData }],
    });
  }, [xps]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">XP progression</p>
              <p className="text-sm font-medium">
                {' '}
                {xps &&
                  xps?.length > 0 && ( // Check if there are XPS entries
                    <>
                      {
                        // Format last created date
                        new Date(
                          xps?.[xps.length - 1].createdAt,
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          year: 'numeric',
                          month: '2-digit',
                        })
                      }
                      -{' '}
                      {
                        // Format first created date
                        new Date(xps?.[0].createdAt).toLocaleDateString(
                          'en-GB',
                          {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          },
                        )
                      }
                    </>
                  )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div>
        <div id="chartOne" className="-ml-5">
          {xps && (
            <DynamicApexCharts
              options={options}
              series={state.series}
              type="area"
              height={350}
              width={'100%'}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default LineChart;
