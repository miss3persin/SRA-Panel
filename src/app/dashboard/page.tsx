
"use client";

import { useEffect, useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { useRouter } from 'next/navigation';
import AverageScorePerCourseChart from '@/components/charts/AverageScorePerCourseChart';
import PassFailDistributionChart from '@/components/charts/PassFailDistributionChart';
import AiInsightsDisplay from '@/components/insights/AiInsightsDisplay';
import OverallPerformanceCard from '@/components/insights/OverallPerformanceCard';
import PDFExportButton from '@/components/core/PDFExportButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { generateInsights } from '@/ai/flows/generate-insights';
import type { GenerateInsightsInput } from '@/ai/flows/generate-insights';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Brain, FilterX, Loader2 } from "lucide-react";
import DataTable from '@/components/core/DataTable';

export default function DashboardPage() {
  const { 
    rawStudentData,
    processedStudentData,
    aiInsights, 
    setAiInsights, 
    filters, 
    setFilters, 
    availableSemesters, 
    availableLevels, 
    availableCourses,
    filteredData,
    overallPerformance,
    isLoadingInsights,
    setIsLoadingInsights,
  } = useData();
  const router = useRouter();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (rawStudentData.length === 0 && processedStudentData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload student data first.",
        variant: "destructive",
        action: <Button onClick={() => router.push('/upload')}>Go to Upload</Button>
      });
    }
  }, [rawStudentData, processedStudentData, router, toast]);

  const handleGenerateInsights = async () => {
    if (rawStudentData.length === 0) {
      toast({
        title: "No Data for AI",
        description: "Upload student data to generate insights.",
        variant: "destructive"
      });
      return;
    }
    setIsLoadingInsights(true);
    try {
      const aiInput: GenerateInsightsInput = {
        studentResults: rawStudentData.map(item => ({
          Name: String(item.Name),
          'Matric No': String(item['Matric No']),
          Course: String(item.Course),
          Score: Number(item.Score),
          Semester: String(item.Semester),
          Level: String(item.Level),
        }))
      };
      const insights = await generateInsights(aiInput);
      setAiInsights(insights);
      toast({
        title: "AI Insights Generated",
        description: "Successfully analyzed student data.",
      });
    } catch (error) {
      console.error("Error generating AI insights:", error);
      toast({
        title: "AI Insight Generation Failed",
        description: "An error occurred. Please check the console.",
        variant: "destructive",
      });
      setAiInsights(null);
    } finally {
      setIsLoadingInsights(false);
    }
  };

  const handleFilterChange = (type: 'semester' | 'level' | 'course', value: string) => {
    setFilters({ ...filters, [type]: value === 'all' ? null : value });
  };

  const clearFilters = () => {
    setFilters({ semester: null, level: null, course: null });
  };

  if (!isClient) { // Prevent hydration mismatch by not rendering data-dependent UI on server
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (rawStudentData.length === 0 && processedStudentData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] p-4">
        <Card className="w-full max-w-md text-center p-8">
          <CardHeader>
            <CardTitle className="text-2xl">No Data Loaded</CardTitle>
            <CardDescription>
              It looks like there's no student data to display. Please upload a CSV file to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/upload')} size="lg">
              <Info className="mr-2 h-5 w-5" /> Upload Data
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const activeFilterCount = Object.values(filters).filter(f => f !== null).length;

  return (
    <div className="space-y-8" id="dashboard-content">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Data Filters</CardTitle>
                <CardDescription>Refine the data displayed in charts and tables below.</CardDescription>
            </div>
             <PDFExportButton elementIdToPrint="dashboard-content" fileName="SRA_Panel_Dashboard_Report" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="semester-filter">Semester</Label>
            <Select value={filters.semester || 'all'} onValueChange={(value) => handleFilterChange('semester', value)}>
              <SelectTrigger id="semester-filter"><SelectValue placeholder="Filter by Semester" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {availableSemesters.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="level-filter">Level</Label>
            <Select value={filters.level || 'all'} onValueChange={(value) => handleFilterChange('level', value)}>
              <SelectTrigger id="level-filter"><SelectValue placeholder="Filter by Level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {availableLevels.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="course-filter">Course</Label>
            <Select value={filters.course || 'all'} onValueChange={(value) => handleFilterChange('course', value)}>
              <SelectTrigger id="course-filter"><SelectValue placeholder="Filter by Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={clearFilters} variant="outline" disabled={activeFilterCount === 0}>
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters ({activeFilterCount})
          </Button>
        </CardContent>
      </Card>

      <OverallPerformanceCard metrics={overallPerformance} isLoading={processedStudentData.length === 0 && rawStudentData.length > 0} />

      <div id="charts-grid-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AverageScorePerCourseChart data={filteredData} />
        <PassFailDistributionChart data={filteredData} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Filtered Data Table</CardTitle>
          <CardDescription>
            Displaying {filteredData.length} of {processedStudentData.length} records based on current filters.
            Sorting by a column header effectively ranks students/data for that criterion.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={filteredData} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">AI Insights Engine</CardTitle>
            <CardDescription>Identify at-risk students, top performers, and challenging courses using AI analysis.</CardDescription>
          </div>
          <Button onClick={handleGenerateInsights} disabled={isLoadingInsights || rawStudentData.length === 0}>
            {isLoadingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
            {aiInsights ? 'Regenerate AI Insights' : 'Generate AI Insights'}
          </Button>
        </CardHeader>
        {aiInsights && ( // Conditionally render CardContent
          <CardContent>
            <AiInsightsDisplay insights={aiInsights} isLoading={isLoadingInsights} />
          </CardContent>
        )}
      </Card>
    </div>
  );
}
