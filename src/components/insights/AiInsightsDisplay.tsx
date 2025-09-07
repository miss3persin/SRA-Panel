
"use client";

import type { AiInsights } from '@/types';
import InsightCard from './InsightCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, Loader2, Info as InfoIcon, Award, BookOpen, Percent, GraduationCap, Target, ListOrdered, Activity, Book, Focus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AiInsightsDisplayProps {
  insights: AiInsights | null; // Can be null if not yet generated
  isLoading: boolean;
}

export default function AiInsightsDisplay({ insights, isLoading }: AiInsightsDisplayProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 rounded-lg bg-card shadow">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-4 text-lg">Generating AI insights...</p>
      </div>
    );
  }

  if (!insights || 
      (insights.topPerformingStudents.length === 0 &&
      insights.highFailureCourses.length === 0 &&
      insights.courseGradeDistributions.length === 0 &&
      insights.academicStandingDistribution.length === 0 &&
      insights.keyPerformanceIndicators.length === 0 &&
      insights.courseDifficultyRanking.length === 0 &&
      insights.mostAndLeastConsistentStudents.length === 0 &&
      insights.foundationalCourseImpact.length === 0 &&
      insights.gradePointCorrelation.length === 0)) {
    
    if (!insights && !isLoading) { 
        return (
          <Alert>
            <InfoIcon className="h-4 w-4"/>
            <AlertTitle>No AI Insights Available</AlertTitle>
            <AlertDescription>
              Click "Generate AI Insights" to analyze the student data using the official GPA and CGPA from your file.
            </AlertDescription>
          </Alert>
        );
    }
    return (
       <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-300">All Clear!</AlertTitle>
          <AlertDescription>
            The AI analysis did not detect any significant areas of concern based on the GPA-related criteria. This could indicate stable performance across the dataset.
          </AlertDescription>
        </Alert>
    );
  }

  const { 
    topPerformingStudents = [],
    highFailureCourses = [], 
    courseGradeDistributions = [],
    academicStandingDistribution = [], 
    keyPerformanceIndicators = [],
    courseDifficultyRanking = [],
    mostAndLeastConsistentStudents = [],
    foundationalCourseImpact = [],
    gradePointCorrelation = []
  } = insights;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">AI-Powered Insights (4.0 CGPA Scale)</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <InsightCard
          title="Top Performing Students"
          icon="custom"
          CustomIcon={<Award className="h-6 w-6 text-yellow-500" />}
          variant={topPerformingStudents.length > 0 ? "highlight" : "neutral"}
          value={topPerformingStudents.length}
          description={topPerformingStudents.length > 0 ? "Top 3 students by official CGPA." : "No top performers identified."}
        >
          {topPerformingStudents.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {topPerformingStudents.map((student, index) => (
                  <li key={index} className="p-2 rounded-md bg-muted/50">
                    <strong>{student.name}</strong> ({student.matricNo}): Official CGPA: {student.cgpa.toFixed(2)}. {student.reason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Courses with High Failure Rates"
          icon="custom"
          CustomIcon={<BookOpen className="h-6 w-6 text-red-500" />}
          variant={highFailureCourses.length > 0 ? "danger" : "success"}
          value={highFailureCourses.length}
          description={highFailureCourses.length > 0 ? "Courses with a Grade Point (GP) failure rate over 40%." : "No courses with high failure rates detected."}
        >
          {highFailureCourses.length > 0 && (
             <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {highFailureCourses.map((course, index) => (
                  <li key={index} className="p-2 rounded-md bg-muted/50">
                    <strong>{course.course}</strong> ({(course.failureRate * 100).toFixed(1)}% failure rate): {course.reason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>
        
        <InsightCard
          title="Course Grade Distributions"
          icon="custom"
          CustomIcon={<Percent className="h-6 w-6 text-purple-500" />} 
          variant={courseGradeDistributions.length > 0 ? "purple" : "neutral"}
          description="How grades (A, B, C, F etc.) are distributed within courses."
        >
          {courseGradeDistributions.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {courseGradeDistributions.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.course}</strong>: {s.distribution.map(d => `${d.grade}: ${d.count}`).join(', ')}. <br/><em>{s.observation}</em>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Academic Standing Distribution"
          icon="custom"
          CustomIcon={<GraduationCap className="h-6 w-6 text-blue-500" />}
          variant={academicStandingDistribution.length > 0 ? "info" : "neutral"}
          description="Distribution of unique students by final CGPA."
        >
          {academicStandingDistribution.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {academicStandingDistribution.map((s, index) => (
                  <li key={index} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.standing}</strong> ({s.cgpaRange}): {s.count} students ({(s.percentage * 100).toFixed(1)}%)
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Key Performance Indicators"
          icon="custom"
          CustomIcon={<Target className="h-6 w-6 text-green-500" />}
          variant="success"
          description="Overall dataset performance metrics."
        >
          {keyPerformanceIndicators.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {keyPerformanceIndicators.map((kpi, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{kpi.metric}</strong>: {kpi.value} <br/><em>{kpi.observation}</em>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Course Difficulty Ranking"
          icon="custom"
          CustomIcon={<ListOrdered className="h-6 w-6 text-orange-500" />}
          variant={"warning"}
          description="Top 5 hardest courses by average Grade Point."
        >
          {courseDifficultyRanking.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {courseDifficultyRanking.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{i + 1}. {s.course}</strong> (Avg. GP: {s.averageGp.toFixed(2)}) - {s.studentCount} students.
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

         <InsightCard
          title="Student Consistency"
          icon="custom"
          CustomIcon={<Activity className="h-6 w-6 text-indigo-500" />}
          variant={"indigo"}
          description="Most and least consistent students by GPA variance."
        >
          {mostAndLeastConsistentStudents.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {mostAndLeastConsistentStudents.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.type}</strong>: {s.studentName} ({s.matricNo}) <br/>
                    GPA Std. Dev: {s.gpaStandardDeviation.toFixed(2)}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Foundational Course Impact"
          icon="custom"
          CustomIcon={<Book className="h-6 w-6 text-cyan-500" />}
          variant={"cyan"}
          description="The 100-Level course most critical for success."
        >
          {foundationalCourseImpact.length > 0 && (
             <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {foundationalCourseImpact.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.course}</strong> is key. <br/><em>{s.observation}</em>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Grade Point Correlation"
          icon="custom"
          CustomIcon={<Focus className="h-6 w-6 text-teal-500" />}
          variant={gradePointCorrelation.length > 0 ? "teal" : "neutral"}
          description="A key data-driven correlation found in the dataset."
        >
          {gradePointCorrelation.length > 0 && (
            <div className="mt-2 text-sm p-2 rounded-md bg-muted/50 h-[200px] flex items-center">
              <p>{gradePointCorrelation[0].finding}</p>
            </div>
          )}
        </InsightCard>

      </div>
    </div>
  );
}
