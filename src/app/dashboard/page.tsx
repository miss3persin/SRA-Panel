
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useData } from '@/contexts/DataContext';
import { useRouter, useSearchParams } from 'next/navigation';
import AverageScorePerCourseChart from '@/components/charts/AverageScorePerCourseChart';
import PassFailDistributionChart from '@/components/charts/PassFailDistributionChart';
import AiInsightsDisplay from '@/components/insights/AiInsightsDisplay';
import CourseStatisticsTable from '@/components/insights/CourseStatisticsTable';
import PDFExportButton from '@/components/core/PDFExportButton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { generateInsights } from '@/ai/flows/generate-insights';
import type { GenerateInsightsInput } from '@/types/ai-insight-types';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, Brain, FilterX, Loader2 } from "lucide-react";
import DataTable from '@/components/core/DataTable';

function DashboardContent() {
  const { 
    studentData,
    aiInsights, 
    setAiInsights, 
    filters, 
    setFilters, 
    availableCourses,
    filteredData,
    courseStats,
    isLoadingInsights,
    setIsLoadingInsights,
  } = useData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  const view = searchParams.get('view') || 'overview';

  useEffect(() => {
    setIsClient(true);
    if (studentData.length === 0) {
      toast({
        title: "No Data",
        description: "Please upload student data first.",
        variant: "destructive",
        action: <Button onClick={() => router.push('/upload')}>Go to Upload</Button>
      });
    }
  }, [studentData, router, toast]);

  const handleGenerateInsights = async () => {
    if (studentData.length === 0) {
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
        studentResults: studentData.map(item => ({
          'Matric No': item['Matric No'],
          'Student Name': item['Student Name'],
          'Course Code': item['Course Code'],
          'Course Title': item['Course Title'],
          'Credit Units': item['Credit Units'],
          Grade: item.Grade,
          GP: item.GP,
          GPA: item.GPA,
          CGPA: item.CGPA,
          Level: item.Level,
          Semester: item.Semester,
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

  const handleFilterChange = (type: 'course', value: string) => {
    setFilters({ ...filters, [type]: value === 'all' ? null : value });
  };

  const clearFilters = () => {
    setFilters({ course: null });
  };

  if (!isClient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg">Loading Dashboard...</p>
      </div>
    );
  }

  if (studentData.length === 0) {
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

  const renderContent = () => {
    switch(view) {
      case 'performance':
        return <CourseStatisticsTable stats={courseStats} isLoading={studentData.length > 0 && courseStats.length === 0} />;
      case 'charts':
        return (
          <div id="charts-grid-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AverageScorePerCourseChart data={filteredData} />
            <PassFailDistributionChart data={filteredData} />
          </div>
        );
      case 'datatable':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Filtered Data Table</CardTitle>
              <CardDescription>
                Displaying {filteredData.length} of {studentData.length} records based on current filters.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable data={filteredData} />
            </CardContent>
          </Card>
        );
      case 'insights':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl">AI Insights Engine</CardTitle>
                <CardDescription>Generate deep, actionable insights into student performance using a 4.0 CGPA-based analysis.</CardDescription>
              </div>
              <Button onClick={handleGenerateInsights} disabled={isLoadingInsights || studentData.length === 0}>
                {isLoadingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                {aiInsights ? 'Regenerate AI Insights' : 'Generate AI Insights'}
              </Button>
            </CardHeader>
            {aiInsights && (
              <CardContent>
                <AiInsightsDisplay insights={aiInsights} isLoading={isLoadingInsights} />
              </CardContent>
            )}
            {!aiInsights && !isLoadingInsights && (
                <CardContent>
                   <Alert>
                        <Info className="h-4 w-4"/>
                        <AlertTitle>No AI Insights Available</AlertTitle>
                        <AlertDescription>
                          Click "Generate AI Insights" to analyze the student data using the official GPA and CGPA from your file.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}
          </Card>
        );
      case 'overview':
      default:
        return (
          <div className="space-y-6">
            <CourseStatisticsTable stats={courseStats} isLoading={studentData.length > 0 && courseStats.length === 0} />
            <div id="charts-grid-container" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AverageScorePerCourseChart data={filteredData} />
              <PassFailDistributionChart data={filteredData} />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Filtered Data Table</CardTitle>
                <CardDescription>
                  Displaying {filteredData.length} of {studentData.length} records based on current filters.
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
                  <CardDescription>Generate deep, actionable insights into student performance using GPA-based analysis.</CardDescription>
                </div>
                <Button onClick={handleGenerateInsights} disabled={isLoadingInsights || studentData.length === 0}>
                  {isLoadingInsights ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Brain className="mr-2 h-4 w-4" />}
                  {aiInsights ? 'Regenerate AI Insights' : 'Generate AI Insights'}
                </Button>
              </CardHeader>
              {aiInsights && (
                <CardContent>
                  <AiInsightsDisplay insights={aiInsights} isLoading={isLoadingInsights} />
                </CardContent>
              )}
               {!aiInsights && !isLoadingInsights && (
                <CardContent>
                   <Alert>
                        <Info className="h-4 w-4"/>
                        <AlertTitle>No AI Insights Available</AlertTitle>
                        <AlertDescription>
                          Click "Generate AI Insights" to analyze the student data using the official GPA and CGPA from your file.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            )}
            </Card>
          </div>
        );
    }
  }

  return (
    <div className="space-y-8" id="dashboard-content">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-2xl">Data Filters</CardTitle>
                <CardDescription>Refine the data displayed in charts and tables below. Metrics are recalculated for the filtered data.</CardDescription>
            </div>
             <PDFExportButton elementIdToPrint="dashboard-content" fileName="Mapoly_SRA_Report" />
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <Label htmlFor="course-filter">Filter by Course</Label>
            <Select value={filters.course || 'all'} onValueChange={(value) => handleFilterChange('course', value)}>
              <SelectTrigger id="course-filter"><SelectValue placeholder="Filter by Course" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={clearFilters} variant="outline" disabled={activeFilterCount === 0} className="lg:col-start-4">
            <FilterX className="mr-2 h-4 w-4" /> Clear Filters ({activeFilterCount})
          </Button>
        </CardContent>
      </Card>
      
      {renderContent()}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
