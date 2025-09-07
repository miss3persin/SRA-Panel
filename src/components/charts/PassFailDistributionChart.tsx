
"use client"

import type { ProcessedStudentResult } from "@/types";
import { useMemo } from "react";
import { Pie, PieChart, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { ChartConfig, ChartContainer, ChartLegend, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PassFailDistributionChartProps {
  data: ProcessedStudentResult[];
}

const chartConfig = {
  entries: {
    label: "Course Entries",
  },
  pass: {
    label: "Pass",
    color: "hsl(var(--chart-2))", // Teal-like
  },
  fail: {
    label: "Fail",
    color: "hsl(var(--chart-5))", // Red/Orange-like for fail
  },
} satisfies ChartConfig

export default function PassFailDistributionChart({ data }: PassFailDistributionChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    let passCount = 0;
    let failCount = 0;
    data.forEach(item => {
      // A Grade Point (GP) of 0 is a fail.
      if (item.GP > 0) {
        passCount++;
      } else {
        failCount++;
      }
    });
    return [
      { status: "Pass", count: passCount, fill: "var(--color-pass)" },
      { status: "Fail", count: failCount, fill: "var(--color-fail)" },
    ].filter(d => d.count > 0);
  }, [data]);

  const totalEntries = useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.count, 0);
  }, [chartData]);

  if (chartData.length === 0) {
     return (
      <Card>
        <CardHeader>
          <CardTitle>Pass/Fail Distribution</CardTitle>
          <CardDescription>No data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Upload data to see this chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  const CustomLegend = (props: any) => {
    const { payload } = props;
    if (!payload || payload.length === 0 || totalEntries === 0) {
      return null;
    }

    return (
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 mt-3 text-sm">
        {payload.map((entry: any, index: number) => {
          const statusKey = entry.value.toLowerCase() as keyof typeof chartConfig;
          const label = chartConfig[statusKey]?.label || entry.value;
          const count = entry.payload.count;
          const percentage = (count / totalEntries) * 100;

          return (
            <div key={`item-${index}`} className="flex items-center space-x-1.5">
              <span style={{ backgroundColor: entry.color, width: '10px', height: '10px', display: 'inline-block', borderRadius: '3px' }} />
              <span className="text-muted-foreground">{`${label}:`}</span>
              <span className="font-medium text-foreground">{`${count} (${percentage.toFixed(0)}%)`}</span>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pass/Fail Distribution</CardTitle>
        <CardDescription>
          Overall distribution for {totalEntries} course entries analyzed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel nameKey="status" />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="status"
                innerRadius={60}
                strokeWidth={5}
              >
                {chartData.map((entry) => (
                  <Cell key={`cell-${entry.status}`} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<CustomLegend />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
