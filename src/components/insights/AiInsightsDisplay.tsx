
"use client";

import type { AiInsights } from '@/types';
import InsightCard from './InsightCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, CheckCircle, Loader2, Info as InfoIcon, Users, BookOpen, Award, Activity, UsersRound, Sigma, Sparkle, Repeat, Focus } from 'lucide-react';
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
      (insights.atRiskStudents.length === 0 &&
      insights.highFailureCourses.length === 0 &&
      insights.topPerformingStudents.length === 0 &&
      insights.performanceStability.length === 0 &&
      insights.peerPerformanceBands.length === 0 &&
      insights.cohortPerformanceVariations.length === 0 &&
      insights.scoreClusters.length === 0 &&
      insights.academicResilience.length === 0 &&
      insights.courseImpactInsights.length === 0)) {
    
    if (!insights && !isLoading) { 
        return (
          <Alert>
            <InfoIcon className="h-4 w-4"/>
            <AlertTitle>No AI Insights Available</AlertTitle>
            <AlertDescription>
              Click "Generate AI Insights" to analyze the student data.
            </AlertDescription>
          </Alert>
        );
    }
    return (
       <Alert className="border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-400">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 dark:text-green-300">All Clear or More Data Needed!</AlertTitle>
          <AlertDescription>
            Based on the current data and criteria, no specific insights were prominently detected by the AI across all categories. This could mean everything is stable, or more diverse data might reveal deeper patterns.
          </AlertDescription>
        </Alert>
    );
  }

  const { 
    atRiskStudents = [], 
    highFailureCourses = [], 
    topPerformingStudents = [],
    performanceStability = [],
    peerPerformanceBands = [],
    cohortPerformanceVariations = [],
    scoreClusters = [],
    academicResilience = [],
    courseImpactInsights = []
  } = insights;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">AI-Powered Insights</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InsightCard
          title="At-Risk Students"
          CustomIcon={<Users className="h-6 w-6 text-red-500" />}
          variant={atRiskStudents.length > 0 ? "danger" : "success"}
          value={atRiskStudents.length}
          description={atRiskStudents.length > 0 ? "Students identified as potentially needing support." : "No students identified as at-risk."}
        >
          {atRiskStudents.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {atRiskStudents.map((student, index) => (
                  <li key={index} className="p-2 rounded-md bg-muted/50">
                    <strong>{student.name}</strong> ({student.matricNo}): Avg Score: {student.averageScore.toFixed(1)}. {student.reason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Top Performing Students"
          CustomIcon={<Award className="h-6 w-6 text-yellow-500" />}
          variant={topPerformingStudents.length > 0 ? "highlight" : "neutral"}
          value={topPerformingStudents.length}
          description={topPerformingStudents.length > 0 ? "Students demonstrating excellent performance." : "No top performers identified by AI yet."}
        >
          {topPerformingStudents.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {topPerformingStudents.map((student, index) => (
                  <li key={index} className="p-2 rounded-md bg-muted/50">
                    <strong>{student.name}</strong> ({student.matricNo}): Avg Score: {student.averageScore.toFixed(1)}. {student.reason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>
        
        <InsightCard
          title="Courses with High Failure Rates"
          CustomIcon={<BookOpen className="h-6 w-6 text-red-500" />}
          variant={highFailureCourses.length > 0 ? "danger" : "success"}
          value={highFailureCourses.length}
          description={highFailureCourses.length > 0 ? "Courses where a significant number of students are struggling." : "No courses identified with high failure rates."}
        >
          {highFailureCourses.length > 0 && (
             <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {highFailureCourses.map((course, index) => (
                  <li key={index} className="p-2 rounded-md bg-muted/50">
                    <strong>{course.course}</strong> ({(course.failureRate * 100).toFixed(1)}% failure): {course.reason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Performance Stability"
          CustomIcon={<Activity className="h-6 w-6 text-blue-500" />}
          variant={performanceStability.length > 0 ? "info" : "neutral"}
          value={performanceStability.length}
          description={performanceStability.length > 0 ? "Students with notable score variations." : "Performance appears generally stable or insufficient data."}
        >
          {performanceStability.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {performanceStability.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.studentName}</strong> ({s.matricNo}): Range {s.scoreRange.toFixed(1)} pts ({s.minScore.toFixed(1)}-{s.maxScore.toFixed(1)}) over {s.coursesEvaluated} courses. {s.note}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Peer Performance Bands"
          CustomIcon={<UsersRound className="h-6 w-6 text-teal-500" />}
          variant={peerPerformanceBands.length > 0 ? "teal" : "neutral"}
          value={peerPerformanceBands.length}
          description={peerPerformanceBands.length > 0 ? "Illustrative examples of student performance relative to course medians." : "No specific peer banding examples highlighted."}
        >
          {peerPerformanceBands.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {peerPerformanceBands.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.studentName}</strong> ({s.matricNo}) in <strong>{s.course}</strong>: Score {s.score.toFixed(1)}, Median {s.courseMedian.toFixed(1)} - {s.band}. {s.reason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Cohort Performance Variation"
          CustomIcon={<Repeat className="h-6 w-6 text-indigo-500" />}
          variant={cohortPerformanceVariations.length > 0 ? "indigo" : "neutral"}
          value={cohortPerformanceVariations.length}
          description={cohortPerformanceVariations.length > 0 ? "Courses showing significant performance differences between cohorts." : "No significant cohort variations detected."}
        >
          {cohortPerformanceVariations.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {cohortPerformanceVariations.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.course}</strong>: {s.cohort1Description} ({s.cohort1Metric}) vs {s.cohort2Description} ({s.cohort2Metric}). Reason: {s.variationReason}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Score Cluster Detection"
          CustomIcon={<Sigma className="h-6 w-6 text-purple-500" />} 
          variant={scoreClusters.length > 0 ? "purple" : "neutral"}
          value={scoreClusters.length}
          description={scoreClusters.length > 0 ? "Courses with notable score concentrations." : "No significant score clusters detected."}
        >
          {scoreClusters.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {scoreClusters.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.course}</strong>: {s.studentCount} students in range {s.scoreRange} {s.percentageOfClass ? `(${(s.percentageOfClass * 100).toFixed(1)}% of class)` : ''}. {s.observation}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Academic Resilience"
          CustomIcon={<Sparkle className="h-6 w-6 text-green-500" />}
          variant={academicResilience.length > 0 ? "success" : "neutral"}
          value={academicResilience.length}
          description={academicResilience.length > 0 ? "Students showing strong recovery after setbacks." : "No specific academic resilience examples highlighted."}
        >
          {academicResilience.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {academicResilience.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.studentName}</strong> ({s.matricNo}): Failed {s.failedCourseCount} course(s) in {s.failingSemester}, recovered in {s.recoverySemester} (Avg: {s.recoveryAverageScore.toFixed(1)}). {s.note}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>

        <InsightCard
          title="Course Impact Insights"
          CustomIcon={<Focus className="h-6 w-6 text-cyan-500" />}
          variant={courseImpactInsights.length > 0 ? "cyan" : "neutral"}
          value={courseImpactInsights.length}
          description={courseImpactInsights.length > 0 ? "Courses significantly influencing overall student standing." : "No specific course impact insights highlighted."}
        >
          {courseImpactInsights.length > 0 && (
            <ScrollArea className="h-[200px] mt-2">
              <ul className="space-y-1 text-sm">
                {courseImpactInsights.map((s, i) => (
                  <li key={i} className="p-2 rounded-md bg-muted/50">
                    <strong>{s.course}</strong>: {s.impactDescription}. <br /><em>Observation:</em> {s.observation}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </InsightCard>
      </div>
    </div>
  );
}
