
"use client"

import type { ProcessedStudentResult } from "@/types";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AverageGpaPerCourseChartProps {
  data: ProcessedStudentResult[];
}

const chartConfig = {
  averageGpa: {
    label: "Avg. GP",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function AverageScorePerCourseChart({ data }: AverageGpaPerCourseChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const courseGPs: { [courseCode: string]: { totalGP: number; count: number, courseTitle: string } } = {};
    
    data.forEach(item => {
      const courseCode = item['Course Code'];
      if (!courseGPs[courseCode]) {
        courseGPs[courseCode] = { totalGP: 0, count: 0, courseTitle: item['Course Title'] || courseCode };
      }
      courseGPs[courseCode].totalGP += item.GP;
      courseGPs[courseCode].count += 1;
    });

    return Object.entries(courseGPs).map(([courseCode, gps]) => ({
      course: gps.courseTitle,
      averageGpa: parseFloat((gps.totalGP / gps.count).toFixed(2)),
    })).sort((a,b) => b.averageGpa - a.averageGpa);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Grade Point per Course</CardTitle>
          <CardDescription>No data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Upload data or clear filters to see this chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Grade Point (GP) per Course</CardTitle>
        <CardDescription>This chart shows the average Grade Point for each course on a 4.0 scale.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="course" 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                interval={0}
                tick={{ fontSize: 10 }} 
              />
              <YAxis domain={[0, 4]} tickFormatter={(value) => value.toFixed(1)} />
              <Tooltip 
                content={<ChartTooltipContent 
                    formatter={(value, name) => {
                       if (name === 'averageGpa' && typeof value === 'number') {
                         return [`${value.toFixed(2)} GP`, 'Average Grade Point'];
                       }
                       return [value, name];
                    }}
                />} 
              />
              <Legend />
              <Bar dataKey="averageGpa" fill="var(--color-averageGpa)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
