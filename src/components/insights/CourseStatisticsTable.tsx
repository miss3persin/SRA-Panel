
"use client";

import type { CourseStats } from '@/types';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Info, BarChartHorizontal } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface CourseStatisticsTableProps {
  stats: CourseStats[];
  isLoading: boolean;
}

const StatTooltip = ({ children, content }: { children: React.ReactNode, content: string }) => (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>{children}</TooltipTrigger>
            <TooltipContent><p>{content}</p></TooltipContent>
        </Tooltip>
    </TooltipProvider>
)

export default function CourseStatisticsTable({ stats, isLoading }: CourseStatisticsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course-Level Statistics</CardTitle>
          <CardDescription>Calculating key metrics for each course from the dataset...</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="h-40 w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (stats.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Course-Level Statistics</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center h-40 text-center">
                <BarChartHorizontal className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-semibold">No Statistics to Display</h3>
                <p className="text-sm text-muted-foreground">Upload data or clear filters to view detailed statistics for each course.</p>
            </CardContent>
        </Card>
      )
  }

  const headers = [
    { key: 'course', label: 'Course Name', tooltip: 'The name of the course.' },
    { key: 'studentCount', label: 'Students', tooltip: 'The number of unique students who took this course.' },
    { key: 'passRate', label: 'Pass Rate', tooltip: 'The percentage of entries for this course with a passing grade (GPA > 0.0).' },
    { key: 'meanGpa', label: 'Mean GPA', tooltip: 'The average (mean) GPA for this course.' },
    { key: 'medianGpa', label: 'Median GPA', tooltip: 'The middle GPA value for this course, representing the 50th percentile.' },
    { key: 'modeGpa', label: 'Mode GPA', tooltip: 'The most frequently occurring GPA(s) in this course.' },
    { key: 'stdDevGpa', label: 'Std. Dev.', tooltip: 'The standard deviation of GPAs. A lower value means scores are close to the average; a higher value indicates they are more spread out.' },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Course Performance Statistics</CardTitle>
        <CardDescription>
          Detailed statistical breakdown for each course in the current dataset, based on a 4.0 GPA scale.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="rounded-md border shadow-md overflow-auto" style={{ maxHeight: '600px' }}>
          <Table>
            <TableCaption>Statistical overview of course performance.</TableCaption>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                {headers.map(header => (
                  <TableHead key={header.key}>
                    <StatTooltip content={header.tooltip}>
                        <div className="flex items-center gap-1 cursor-help">
                            {header.label}
                            <Info className="h-3 w-3 text-muted-foreground" />
                        </div>
                    </StatTooltip>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((stat) => (
                <TableRow key={stat.course}>
                  <TableCell className="font-semibold">{stat.course}</TableCell>
                  <TableCell>{stat.studentCount}</TableCell>
                  <TableCell>{stat.passRate.toFixed(2)}%</TableCell>
                  <TableCell>{stat.meanGpa.toFixed(2)}</TableCell>
                  <TableCell>{stat.medianGpa.toFixed(2)}</TableCell>
                  <TableCell>{stat.modeGpa}</TableCell>
                  <TableCell>{stat.stdDevGpa.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
