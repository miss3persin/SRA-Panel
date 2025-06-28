"use client"

import type { ProcessedStudentResult, CourseAverageScore } from "@/types";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AverageScorePerCourseChartProps {
  data: ProcessedStudentResult[];
}

const chartConfig = {
  averageScore: {
    label: "Avg. Score",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export default function AverageScorePerCourseChart({ data }: AverageScorePerCourseChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    const courseScores: { [course: string]: { totalScore: number; count: number } } = {};
    data.forEach(item => {
      if (!courseScores[item.Course]) {
        courseScores[item.Course] = { totalScore: 0, count: 0 };
      }
      courseScores[item.Course].totalScore += item.Score;
      courseScores[item.Course].count += 1;
    });
    return Object.entries(courseScores).map(([course, scores]) => ({
      course,
      averageScore: parseFloat((scores.totalScore / scores.count).toFixed(2)),
    })).sort((a,b) => b.averageScore - a.averageScore);
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Average Score per Course</CardTitle>
          <CardDescription>No data available to display chart.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">Upload data to see this chart.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Score per Course</CardTitle>
        <CardDescription>Visual representation of average scores achieved in each course.</CardDescription>
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
              <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="averageScore" fill="var(--color-averageScore)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
