import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
import React, { use, useEffect, useState } from 'react';
const DynamicApexCharts = dynamic(() => import('react-apexcharts'), {
  ssr: false, // Disable SSR for ApexCharts
});

interface PieChartState {
  series: number[];
}

const options: ApexOptions = {
  chart: {
    fontFamily: 'Satoshi, sans-serif',
    type: 'donut',
  },
  colors: ['#3C50E0', '#6577F3', '#8FD0EF', '#0FADCF', '#1F8AAB', '#266D8F'],
  labels: ['Desktop', 'Tablet', 'Mobile', 'Unknown'],
  legend: {
    show: false,
    position: 'bottom',
  },

  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        background: 'transparent',
      },
    },
  },
  dataLabels: {
    enabled: false,
  },
  responsive: [
    {
      breakpoint: 2600,
      options: {
        chart: {
          width: 380,
        },
      },
    },
    {
      breakpoint: 640,
      options: {
        chart: {
          width: 200,
        },
      },
    },
  ],
};

interface PieChartProps {
  skills?: Skill[];
}

const PieChart: React.FC<PieChartProps> = ({ skills }) => {
  const [state, setState] = useState<PieChartState>({
    series: [65, 34, 45, 12],
  });

  useEffect(() => {
    if (!skills) return;
    const series = skills.slice(0, 6).map((skill) => skill.amount);
    options.labels = skills.slice(0, 6).map((skill) => skill.type);
    setState({ series });
  }, [skills]);

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-8 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-3 pb-5 justify-between gap-5 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Best Skills
          </h5>
        </div>
      </div>

      <div className="mb-2">
        <div id="PieChart" className="mx-auto flex justify-center pb-5">
          {skills && (
            <DynamicApexCharts
              options={options}
              series={state.series}
              type="donut"
            />
          )}
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {skills &&
          skills.slice(0, 6).map((skill, index) => (
            <div key={index} className="w-full px-8 sm:w-1/2">
              <div className="flex w-full items-center">
                <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                  <span>{skill.type}</span>
                  <span>{skill.amount}</span>
                </p>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PieChart;
