
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, Percent, Activity, Sliders, BarChartHorizontal } from "lucide-react";
import type { OverallPerformanceMetrics } from "@/types";

interface OverallPerformanceCardProps {
  metrics: OverallPerformanceMetrics | null;
  isLoading: boolean; // To show loading state if metrics are being calculated
}

const StatCard = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string | number, unit?: string }) => (
    <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border shadow-sm">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold">{String(value)}{unit}</p>
        </div>
    </div>
);


export default function OverallPerformanceCard({ metrics, isLoading }: OverallPerformanceCardProps) {
  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Snapshot</CardTitle>
          <CardDescription>Aggregated statistics from the loaded student data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
              <div className="h-6 w-1/2 bg-muted-foreground/20 rounded mb-2"></div>
              <div className="h-8 w-1/3 bg-muted-foreground/20 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const { 
      totalUniqueStudents, 
      overallAverageScore, 
      overallPassRate,
      medianScore,
      modeScore,
      standardDeviation
  } = metrics;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Overall Performance Snapshot</CardTitle>
        <CardDescription>Key metrics and statistical analysis from the current dataset.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard icon={<Users className="h-6 w-6" />} label="Total Students" value={totalUniqueStudents} />
        <StatCard icon={<TrendingUp className="h-6 w-6" />} label="Average Score (Mean)" value={overallAverageScore} unit="%" />
        <StatCard icon={<Sliders className="h-6 w-6" />} label="Median Score" value={medianScore} unit="%" />
        <StatCard icon={<BarChartHorizontal className="h-6 w-6" />} label="Mode Score" value={modeScore} unit={typeof modeScore === 'number' ? '%' : ''} />
        <StatCard icon={<Activity className="h-6 w-6" />} label="Std. Deviation" value={standardDeviation.toFixed(2)} />
        <StatCard icon={<Percent className="h-6 w-6" />} label="Overall Pass Rate" value={overallPassRate} unit="%" />
      </CardContent>
    </Card>
  );
}
