import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTaskContext } from "../../stores/TaskContext";

const StatusChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const { tasks, loading } = useTaskContext();

  useEffect(() => {
    if (!chartRef.current || tasks.length === 0) return;

    const statusCounts: Record<number, number> = {};
    tasks.forEach((task) => {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
    });

    const statusLabels: Record<number, string> = {
      1: "Todo",
      2: "In Progress",
      3: "Done",
    };

    const statusColors: Record<number, string> = {
      1: "#ED7F95",
      2: "#D9D1FF",
      3: "#FC9B71",
    };

    // prepare data for chart
    const pieData = Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[+status] || status,
      value: count,
      itemStyle: { color: statusColors[+status] },
    }));

    if (chartRef.current) {
      let chart = echarts.getInstanceByDom(chartRef.current);
      if (!chart) {
        chart = echarts.init(chartRef.current);
      }
      const option = {
        title: { text: "Status of Tasks" },
        tooltip: { trigger: "item" },
        series: [
          {
            type: "pie",
            data: pieData,
            radius: ["40%", "70%"],
            itemStyle: {
              borderRadius: 10,
            },
            padAngle: 2,
            label: {
              show: false,
              position: "center",
            },
            // on hover
            emphasis: {
              label: {
                show: true,
                fontSize: 18,
                fontWeight: "bold",
              },
            },
          },
        ],
        // color: ["#4CAF50", "#2196F3", ""],
      };
      chart.setOption(option, { notMerge: true });
    }

    return () => {
      if (chartRef.current) {
        const chart = echarts.getInstanceByDom(chartRef.current);
        chart?.dispose();
      }
    };
  }, [tasks]);

  return (
    <>
      {loading && <p>Loading chart...</p>}
      <div ref={chartRef} className="chart" />
    </>
  );
};

export default StatusChart;
