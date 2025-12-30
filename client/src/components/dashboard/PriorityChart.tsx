import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { useTaskContext } from "../../stores/TaskContext";

const PriorityChart: React.FC = () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const { tasks, loading } = useTaskContext();

  useEffect(() => {
    if (!chartRef.current || tasks.length === 0) return;

    // it means to store the key-value pairs inside a blank object for
    const priorityCounts: Record<number, number> = {};

    tasks.forEach((task) => {
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;
    });

    const priorityLabels: Record<number, string> = {
      1: "Low",
      2: "Normal",
      3: "High",
    };

    const priorityColors: Record<number, string> = {
      1: "#ED7F95",
      2: "#D9D1FF",
      3: "#FC9B71",
    };

    const labels = Object.keys(priorityCounts).map(
      (k) => priorityLabels[+k] || k
    );

    const seriesData = Object.keys(priorityCounts).map((k: any) => ({
      value: priorityCounts[+k],
      itemStyle: { color: priorityColors[+k] },
    }));

    // const values = Object.values(priorityCounts);

    if (chartRef.current) {
      let chart = echarts.getInstanceByDom(chartRef.current);

      if (!chart) {
        chart = echarts.init(chartRef.current);
      }

      const option = {
        title: { text: "Priority of Tasks" },
        tooltip: { trigger: "item" },
        xAxis: { type: "value" },
        yAxis: { type: "category", data: labels },
        series: [{ type: "bar", data: seriesData }],
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

export default PriorityChart;
