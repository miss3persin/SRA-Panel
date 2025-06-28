"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, TrendingUp, Percent, Activity } from "lucide-react";
import type { OverallPerformanceMetrics } from "@/types";

interface OverallPerformanceCardProps {
  metrics: OverallPerformanceMetrics | null;
  isLoading: boolean; // To show loading state if metrics are being calculated
}

export default function OverallPerformanceCard({ metrics, isLoading }: OverallPerformanceCardProps) {
  if (isLoading || !metrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Overall Performance Snapshot</CardTitle>
          <CardDescription>Aggregated statistics from the loaded student data.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 bg-muted rounded-lg animate-pulse">
              <div className="h-6 w-1/2 bg-muted-foreground/20 rounded mb-2"></div>
              <div className="h-8 w-1/3 bg-muted-foreground/20 rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const { totalUniqueStudents, overallAverageScore, overallPassRate } = metrics;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Overall Performance Snapshot</CardTitle>
        <CardDescription>Key metrics from the current dataset.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border shadow-sm">
          <div className="p-3 rounded-full bg-primary/10 text-primary">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Students</p>
            <p className="text-2xl font-semibold">{totalUniqueStudents}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border shadow-sm">
          <div className="p-3 rounded-full bg-secondary/10 text-secondary">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Average Score</p>
            <p className="text-2xl font-semibold">{overallAverageScore.toFixed(2)}%</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 p-4 bg-card rounded-lg border shadow-sm">
          <div className="p-3 rounded-full bg-accent/10 text-accent">
            <Percent className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Overall Pass Rate</p>
            <p className="text-2xl font-semibold">{overallPassRate.toFixed(2)}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
